/**
 * Saga Orchestrator Module
 * Complex workflow management with Norwegian compliance and audit trails
 */

export interface SagaStep {
  name: string;
  execute: (context: SagaContext) => Promise<any>;
  compensate?: (context: SagaContext) => Promise<void>;
  timeout?: number;
  retries?: number;
  critical?: boolean;
}

export interface SagaContext {
  sagaId: string;
  data: Record<string, any>;
  stepResults: Record<string, any>;
  metadata?: Record<string, any>;
  nsmClassification?: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
}

export interface SagaDefinition {
  name: string;
  steps: SagaStep[];
  timeout?: number;
  retryPolicy?: RetryPolicy;
  auditRequired?: boolean;
  nsmClassification?: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  baseDelay: number;
  maxDelay?: number;
}

export interface SagaExecution {
  sagaId: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'compensating' | 'compensated' | 'timeout';
  currentStep: number;
  context: SagaContext;
  startTime: Date;
  endTime?: Date;
  completedSteps: string[];
  compensatedSteps: string[];
  error?: Error;
  auditTrail: SagaAuditEntry[];
}

export interface SagaAuditEntry {
  timestamp: Date;
  stepName: string;
  action: 'execute' | 'compensate' | 'retry' | 'timeout' | 'error';
  result?: any;
  error?: string;
  duration: number;
}

export interface SagaOrchestratorOptions {
  enableAuditLogging?: boolean;
  enableCompliance?: boolean;
  defaultTimeout?: number;
  maxConcurrentSagas?: number;
}

export class SagaOrchestrator {
  private sagaDefinitions: Map<string, SagaDefinition> = new Map();
  private runningExecutions: Map<string, SagaExecution> = new Map();
  private completedExecutions: SagaExecution[] = [];
  private options: SagaOrchestratorOptions;
  private timeouts: Set<NodeJS.Timeout> = new Set(); // Track timeouts for cleanup

  constructor(options: SagaOrchestratorOptions = {}) {
    this.options = {
      enableAuditLogging: true,
      enableCompliance: true,
      defaultTimeout: 300000, // 5 minutes
      maxConcurrentSagas: 100,
      ...options,
    };
  }

  // Register saga definition
  registerSaga(definition: SagaDefinition): void {
    this.sagaDefinitions.set(definition.name, definition);
  }

  // Start saga execution
  async startSaga(
    sagaName: string,
    initialData: Record<string, any>,
    options?: {
      sagaId?: string;
      metadata?: Record<string, any>;
      nsmClassification?: SagaContext['nsmClassification'];
    }
  ): Promise<string> {
    const definition = this.sagaDefinitions.get(sagaName);
    if (!definition) {
      throw new Error(`Saga definition '${sagaName}' not found`);
    }

    // Check concurrent saga limit
    if (this.runningExecutions.size >= (this.options.maxConcurrentSagas || 10)) {
      throw new Error('Maximum concurrent sagas limit reached');
    }

    const sagaId = options?.sagaId || this.generateSagaId();
    const context: SagaContext = {
      sagaId,
      data: initialData,
      stepResults: {},
      metadata: options?.metadata,
      nsmClassification: options?.nsmClassification || definition.nsmClassification,
    };

    const execution: SagaExecution = {
      sagaId,
      name: sagaName,
      status: 'running',
      currentStep: 0,
      context,
      startTime: new Date(),
      completedSteps: [],
      compensatedSteps: [],
      auditTrail: [],
    };

    this.runningExecutions.set(sagaId, execution);

    // Start execution asynchronously
    this.executeSaga(execution, definition).catch(error => {
      console.error(`Saga ${sagaId} execution failed:`, error);
    });

    return sagaId;
  }

  // Get saga execution status
  getSagaStatus(sagaId: string): SagaExecution | undefined {
    return (
      this.runningExecutions.get(sagaId) || this.completedExecutions.find(e => e.sagaId === sagaId)
    );
  }

  // Cancel running saga
  async cancelSaga(sagaId: string): Promise<boolean> {
    const execution = this.runningExecutions.get(sagaId);
    if (!execution) return false;

    execution.status = 'compensating';
    await this.compensateSaga(execution);
    return true;
  }

  // Execute saga
  private async executeSaga(execution: SagaExecution, definition: SagaDefinition): Promise<void> {
    try {
      // Execute each step
      for (let i = 0; i < definition.steps.length; i++) {
        execution.currentStep = i;
        const step = definition.steps[i];

        await this.executeStep(execution, step, definition);
        execution.completedSteps.push(step.name);
      }

      // Saga completed successfully
      execution.status = 'completed';
      execution.endTime = new Date();

      this.moveTocompleted(execution);
      this.logAuditEntry(execution, 'saga_completed', 'execute', { success: true });
    } catch (error) {
      execution.error = error instanceof Error ? error : new Error(String(error));

      // Check if it's a timeout error
      if (execution.error.message.includes('timeout')) {
        execution.status = 'timeout';
        this.logAuditEntry(execution, 'saga_timeout', 'timeout', {
          error: execution.error.message,
        });
      } else {
        execution.status = 'compensating';
        // Don't log saga_failed here as step errors are already logged
      }

      // Compensate completed steps
      await this.compensateSaga(execution);
    }
  }

  // Execute individual step
  private async executeStep(
    execution: SagaExecution,
    step: SagaStep,
    definition: SagaDefinition
  ): Promise<void> {
    const startTime = Date.now();
    const timeout = step.timeout || definition.timeout || this.options.defaultTimeout || 30000;
    const maxRetries = step.retries || definition.retryPolicy?.maxRetries || 0;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add compliance metadata if enabled
        if (this.options.enableCompliance && execution.context.nsmClassification) {
          this.addComplianceMetadata(execution, step);
        }

        // Execute step with timeout
        const result = await this.executeWithTimeout(step.execute(execution.context), timeout);

        execution.context.stepResults[step.name] = result;

        const duration = Date.now() - startTime;
        this.logAuditEntry(execution, step.name, 'execute', { result, duration });

        return; // Success, exit retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const duration = Date.now() - startTime;

        if (attempt < maxRetries) {
          this.logAuditEntry(execution, step.name, 'retry', {
            error: lastError.message,
            attempt: attempt + 1,
            duration,
          });

          // Apply retry delay
          if (definition.retryPolicy) {
            const delay = this.calculateRetryDelay(definition.retryPolicy, attempt);
            await this.delay(delay);
          }
        } else {
          this.logAuditEntry(execution, step.name, 'error', {
            error: lastError.message,
            duration,
          });
        }
      }
    }

    // All retries exhausted
    throw lastError;
  }

  // Compensate saga (rollback)
  private async compensateSaga(execution: SagaExecution): Promise<void> {
    const definition = this.sagaDefinitions.get(execution.name);
    if (!definition) return;

    // Compensate steps in reverse order
    for (let i = execution.completedSteps.length - 1; i >= 0; i--) {
      const stepName = execution.completedSteps[i];
      const step = definition.steps.find(s => s.name === stepName);

      if (step?.compensate) {
        try {
          const startTime = Date.now();
          await step.compensate(execution.context);

          const duration = Date.now() - startTime;
          this.logAuditEntry(execution, stepName, 'compensate', { duration });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Compensation failed for step ${stepName}:`, error);
          this.logAuditEntry(execution, stepName, 'error', {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Always add to compensated steps (even if no compensate function)
      execution.compensatedSteps.push(stepName);
    }

    // Set final status based on error type
    if (execution.status !== 'timeout') {
      execution.status = 'compensated';
    }
    execution.endTime = new Date();
    this.moveTocompleted(execution);
  }

  // Add Norwegian compliance metadata
  private addComplianceMetadata(execution: SagaExecution, step: SagaStep): void {
    if (!execution.context.metadata) {
      execution.context.metadata = {};
    }

    execution.context.metadata.compliance = {
      nsmClassification: execution.context.nsmClassification,
      auditRequired: true,
      stepName: step.name,
      critical: step.critical || false,
      timestamp: new Date(),
    };
  }

  // Execute with timeout
  private async executeWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Step execution timeout')), timeout);
      this.timeouts.add(timeoutId);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      // Clear the specific timeout when promise resolves/rejects
      if (timeoutId!) {
        clearTimeout(timeoutId);
        this.timeouts.delete(timeoutId);
      }
    }
  }

  // Calculate retry delay
  private calculateRetryDelay(retryPolicy: RetryPolicy, attempt: number): number {
    let delay = retryPolicy.baseDelay;

    switch (retryPolicy.backoffStrategy) {
      case 'exponential':
        delay = retryPolicy.baseDelay * Math.pow(2, attempt);
        break;
      case 'linear':
        delay = retryPolicy.baseDelay * (attempt + 1);
        break;
      case 'fixed':
      default:
        delay = retryPolicy.baseDelay;
        break;
    }

    if (retryPolicy.maxDelay) {
      delay = Math.min(delay, retryPolicy.maxDelay);
    }

    return delay;
  }

  // Delay helper
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      const timeoutId = setTimeout(() => {
        resolve();
        this.timeouts.delete(timeoutId);
      }, ms);
      this.timeouts.add(timeoutId);
    });
  }

  // Log audit entry
  private logAuditEntry(
    execution: SagaExecution,
    stepName: string,
    action: SagaAuditEntry['action'],
    details: any
  ): void {
    if (!this.options.enableAuditLogging) return;

    const auditEntry: SagaAuditEntry = {
      timestamp: new Date(),
      stepName,
      action,
      result: details.result,
      error: details.error,
      duration: details.duration || 0,
    };

    execution.auditTrail.push(auditEntry);

    // Log compliance events (suppress during tests)
    if (
      this.options.enableCompliance &&
      execution.context.nsmClassification &&
      process.env.NODE_ENV !== 'test'
    ) {
      // eslint-disable-next-line no-console
      console.log('SAGA_AUDIT:', {
        sagaId: execution.sagaId,
        sagaName: execution.name,
        nsmClassification: execution.context.nsmClassification,
        auditEntry,
      });
    }
  }

  // Move execution to completed
  private moveTocompleted(execution: SagaExecution): void {
    this.runningExecutions.delete(execution.sagaId);
    this.completedExecutions.push(execution);

    // Keep only last 1000 completed executions
    if (this.completedExecutions.length > 1000) {
      this.completedExecutions = this.completedExecutions.slice(-1000);
    }
  }

  // Generate unique saga ID
  private generateSagaId(): string {
    return `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get saga statistics
  getStats() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recent24h = this.completedExecutions.filter(e => e.startTime >= last24Hours);
    const successful = this.completedExecutions.filter(e => e.status === 'completed');
    const failed = this.completedExecutions.filter(
      e => e.status === 'compensated' || e.status === 'timeout'
    );

    return {
      registeredSagas: this.sagaDefinitions.size,
      runningExecutions: this.runningExecutions.size,
      completedExecutions: this.completedExecutions.length,
      executionsLast24h: recent24h.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      successRate:
        this.completedExecutions.length > 0
          ? (successful.length / this.completedExecutions.length) * 100
          : 0,
      complianceEnabled: this.options.enableCompliance,
      auditLoggingEnabled: this.options.enableAuditLogging,
    };
  }

  // Get all running sagas
  getRunningSagas(): SagaExecution[] {
    return Array.from(this.runningExecutions.values());
  }

  // Get completed sagas
  getCompletedSagas(limit?: number): SagaExecution[] {
    const sagas = [...this.completedExecutions].reverse();
    return limit ? sagas.slice(0, limit) : sagas;
  }

  // Clean up old executions
  cleanupOldExecutions(olderThan: Date): number {
    const initialCount = this.completedExecutions.length;
    this.completedExecutions = this.completedExecutions.filter(e => e.startTime >= olderThan);
    return initialCount - this.completedExecutions.length;
  }

  /**
   * Clean up all active timeouts and resources
   * Should be called in tests or when shutting down
   */
  public cleanup(): void {
    // Clear all active timeouts
    for (const timeoutId of this.timeouts) {
      clearTimeout(timeoutId);
    }
    this.timeouts.clear();

    // Clear all active sagas
    this.runningExecutions.clear();
  }
}

// Default saga orchestrator
let defaultOrchestrator: SagaOrchestrator;

export const getSagaOrchestrator = (): SagaOrchestrator => {
  if (!defaultOrchestrator) {
    defaultOrchestrator = new SagaOrchestrator();
  }
  return defaultOrchestrator;
};

export const createSagaOrchestrator = (options?: SagaOrchestratorOptions): SagaOrchestrator => {
  return new SagaOrchestrator(options);
};

// Convenience functions
export const registerSaga = (definition: SagaDefinition): void => {
  getSagaOrchestrator().registerSaga(definition);
};

export const startSaga = async (
  sagaName: string,
  initialData: Record<string, any>,
  options?: Parameters<SagaOrchestrator['startSaga']>[2]
): Promise<string> => {
  return getSagaOrchestrator().startSaga(sagaName, initialData, options);
};
