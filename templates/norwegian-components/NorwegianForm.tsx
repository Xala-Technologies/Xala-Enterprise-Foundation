import React, { useCallback, useState } from 'react';

// Norwegian Compliance Types
type NSMLevel = 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
type NorwegianLocale = 'nb' | 'nn';
type GDPRLegalBasis =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'public_task'
  | 'vital_interests'
  | 'legitimate_interests';

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface NorwegianFormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'tel'
    | 'number'
    | 'date'
    | 'select'
    | 'textarea'
    | 'checkbox'
    | 'radio'
    | 'file';
  required?: boolean;
  placeholder?: string;
  validation?: (value: any) => string | null;
  norwegianValidation?: 'personnummer' | 'orgnummer' | 'postnummer' | 'telefon';
  options?: { value: string; label: string }[];
  helpText?: string;
  gdprSensitive?: boolean;
  nsmClassification?: NSMLevel;
  accessibilityLabel?: string;
}

interface NorwegianFormProps {
  title: string;
  description?: string;
  fields: NorwegianFormField[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitButtonText?: string;
  nsmClassification: NSMLevel;
  norwegianLocale: NorwegianLocale;
  municipalityCode?: string;

  // GDPR Compliance
  gdprNotice?: boolean;
  gdprLegalBasis: GDPRLegalBasis;
  dataRetentionPeriod?: string;

  // Accessibility
  accessibilityLevel?: 'AA' | 'AAA';
  screenReaderOptimized?: boolean;

  // Security
  enableAuditLog?: boolean;
  encryptionRequired?: boolean;
}

// Norwegian Field Validation Functions
const norwegianValidators = {
  personnummer: (value: string): string | null => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 11) {
      return 'Personnummer må være 11 siffer';
    }
    // Basic mod-11 validation for Norwegian personal numbers
    const weights = [3, 7, 6, 1, 8, 9, 4, 5, 2, 1];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned[i]) * weights[i];
    }
    const remainder = sum % 11;
    const checkDigit = remainder === 0 ? 0 : 11 - remainder;

    if (checkDigit !== parseInt(cleaned[10])) {
      return 'Ugyldig personnummer';
    }
    return null;
  },

  orgnummer: (value: string): string | null => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 9) {
      return 'Organisasjonsnummer må være 9 siffer';
    }
    // Mod-11 validation for Norwegian organization numbers
    const weights = [3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += parseInt(cleaned[i]) * weights[i];
    }
    const remainder = sum % 11;
    const checkDigit = remainder === 0 ? 0 : 11 - remainder;

    if (checkDigit !== parseInt(cleaned[8])) {
      return 'Ugyldig organisasjonsnummer';
    }
    return null;
  },

  postnummer: (value: string): string | null => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 4) {
      return 'Postnummer må være 4 siffer';
    }
    return null;
  },

  telefon: (value: string): string | null => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 8) {
      return 'Telefonnummer må være 8 siffer';
    }
    return null;
  },
};

// Norwegian Form Field Component
const NorwegianFormField: React.FC<{
  field: NorwegianFormField;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
  locale: NorwegianLocale;
  nsmClassification: NSMLevel;
}> = ({ field, value, onChange, error, locale, nsmClassification }) => {
  const fieldId = `field-${field.name}`;
  const errorId = `error-${field.name}`;
  const helpId = `help-${field.name}`;

  const getSecurityIndicator = () => {
    if (field.nsmClassification && field.nsmClassification !== 'ÅPEN') {
      return (
        <span
          className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded"
          aria-label={`NSM klassifisering: ${field.nsmClassification}`}
        >
          🔒 {field.nsmClassification}
        </span>
      );
    }
    return null;
  };

  const getGDPRIndicator = () => {
    if (field.gdprSensitive) {
      return (
        <span
          className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
          aria-label="GDPR sensitive data"
        >
          🛡️ GDPR
        </span>
      );
    }
    return null;
  };

  const renderInput = () => {
    const baseClasses = `w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
    }`;

    const commonProps = {
      id: fieldId,
      name: field.name,
      value: value || '',
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => onChange(field.name, e.target.value),
      className: baseClasses,
      'aria-describedby': `${field.helpText ? helpId : ''} ${error ? errorId : ''}`.trim(),
      'aria-invalid': !!error,
      'aria-required': field.required,
      'aria-label': field.accessibilityLabel || field.label,
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} placeholder={field.placeholder} rows={4} />;

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{locale === 'nb' ? 'Velg alternativ' : 'Vel alternativ'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={fieldId}
              name={field.name}
              checked={value || false}
              onChange={e => onChange(field.name, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              aria-describedby={`${field.helpText ? helpId : ''} ${error ? errorId : ''}`.trim()}
              aria-invalid={!!error}
              aria-required={field.required}
            />
            <label htmlFor={fieldId} className="ml-2 block text-sm text-gray-900">
              {field.label}
              {field.required && (
                <span className="text-red-500 ml-1" aria-label="required">
                  *
                </span>
              )}
              {getSecurityIndicator()}
              {getGDPRIndicator()}
            </label>
          </div>
        );

      case 'radio':
        return (
          <fieldset>
            <legend className="sr-only">{field.label}</legend>
            <div className="space-y-2">
              {field.options?.map(option => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`${fieldId}-${option.value}`}
                    name={field.name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={e => onChange(field.name, e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    aria-required={field.required}
                  />
                  <label
                    htmlFor={`${fieldId}-${option.value}`}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        );

      default:
        return <input type={field.type} placeholder={field.placeholder} {...commonProps} />;
    }
  };

  if (field.type === 'checkbox' || field.type === 'radio') {
    return (
      <div className="space-y-2">
        {renderInput()}
        {field.helpText && (
          <p id={helpId} className="text-sm text-gray-600">
            {field.helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
        {getSecurityIndicator()}
        {getGDPRIndicator()}
      </label>
      {renderInput()}
      {field.helpText && (
        <p id={helpId} className="text-sm text-gray-600">
          {field.helpText}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Main Norwegian Form Component
export const NorwegianForm: React.FC<NorwegianFormProps> = ({
  title,
  description,
  fields,
  onSubmit,
  submitButtonText,
  nsmClassification,
  norwegianLocale,
  municipalityCode,
  gdprNotice = true,
  gdprLegalBasis,
  dataRetentionPeriod,
  accessibilityLevel = 'AA',
  screenReaderOptimized = true,
  enableAuditLog = true,
  encryptionRequired = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const validateField = useCallback(
    (field: NorwegianFormField, value: any): string | null => {
      // Required field validation
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return norwegianLocale === 'nb' ? `${field.label} er påkrevd` : `${field.label} er påkravd`;
      }

      // Norwegian-specific validation
      if (field.norwegianValidation && value) {
        const validator = norwegianValidators[field.norwegianValidation];
        if (validator) {
          return validator(value);
        }
      }

      // Custom field validation
      if (field.validation && value) {
        return field.validation(value);
      }

      return null;
    },
    [norwegianLocale]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.name];
      const error = validateField(field, value);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, formData, validateField]);

  const handleFieldChange = useCallback(
    (name: string, value: any) => {
      setFormData(prev => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    },
    [errors]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm()) {
      // Focus first error field for accessibility
      const firstErrorField = fields.find(field => errors[field.name]);
      if (firstErrorField) {
        const element = document.getElementById(`field-${firstErrorField.name}`);
        element?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Audit log for NSM compliance
      if (enableAuditLog) {
        console.info('🇳🇴 Norwegian Form Submission Audit:', {
          timestamp: new Date().toISOString(),
          formTitle: title,
          nsmClassification,
          municipalityCode,
          gdprLegalBasis,
          encryptionRequired,
          fieldsSubmitted: fields.map(f => f.name),
          sensitiveFieldsIncluded: fields.filter(f => f.gdprSensitive).map(f => f.name),
        });
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonText = () => {
    if (isSubmitting) {
      return norwegianLocale === 'nb' ? 'Sender...' : 'Sender...';
    }
    return submitButtonText || (norwegianLocale === 'nb' ? 'Send inn' : 'Send inn');
  };

  const hasErrors = Object.keys(errors).length > 0;
  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl mx-auto p-6 bg-white">
      {/* Form Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex space-x-2">
            <span
              className={`px-3 py-1 text-xs rounded ${
                nsmClassification === 'ÅPEN'
                  ? 'bg-green-100 text-green-800'
                  : nsmClassification === 'BEGRENSET'
                    ? 'bg-yellow-100 text-yellow-800'
                    : nsmClassification === 'KONFIDENSIELT'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-red-100 text-red-800'
              }`}
            >
              🇳🇴 NSM: {nsmClassification}
            </span>
            {encryptionRequired && (
              <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                🔒 Kryptert
              </span>
            )}
          </div>
        </div>

        {description && <p className="text-gray-600 mb-4">{description}</p>}

        {/* Error Summary for Screen Readers */}
        {submitAttempted && hasErrors && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded"
          >
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              {norwegianLocale === 'nb'
                ? `Skjemaet inneholder ${errorCount} feil:`
                : `Skjemaet inneheld ${errorCount} feil:`}
            </h2>
            <ul className="list-disc list-inside text-red-700">
              {Object.entries(errors).map(([fieldName, error]) => {
                const field = fields.find(f => f.name === fieldName);
                return (
                  <li key={fieldName}>
                    <a
                      href={`#field-${fieldName}`}
                      className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500"
                      onClick={e => {
                        e.preventDefault();
                        document.getElementById(`field-${fieldName}`)?.focus();
                      }}
                    >
                      {field?.label}: {error}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* GDPR Notice */}
        {gdprNotice && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              🛡️ {norwegianLocale === 'nb' ? 'Personvernsinformasjon' : 'Personvernsinformasjon'}
            </h3>
            <p className="text-sm text-blue-700">
              {norwegianLocale === 'nb'
                ? `Vi behandler dine personopplysninger med hjemmel i ${gdprLegalBasis === 'public_task' ? 'offentlig oppgave' : gdprLegalBasis}.`
                : `Vi behandlar dine personopplysningar med heimel i ${gdprLegalBasis === 'public_task' ? 'offentleg oppgåve' : gdprLegalBasis}.`}
            </p>
            {dataRetentionPeriod && (
              <p className="text-xs text-blue-600 mt-1">
                {norwegianLocale === 'nb'
                  ? `Lagringsperiode: ${dataRetentionPeriod}`
                  : `Lagringsperiode: ${dataRetentionPeriod}`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {fields.map(field => (
          <NorwegianFormField
            key={field.name}
            field={field}
            value={formData[field.name]}
            onChange={handleFieldChange}
            error={errors[field.name]}
            locale={norwegianLocale}
            nsmClassification={nsmClassification}
          />
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          }`}
          aria-describedby={hasErrors && submitAttempted ? 'form-errors' : undefined}
        >
          {getButtonText()}
        </button>
      </div>

      {/* Municipality Footer */}
      {municipalityCode && (
        <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
          🏛️ Kommune: {municipalityCode} | WCAG: {accessibilityLevel} |
          {norwegianLocale === 'nb' ? ' Sikker skjemabehandling' : ' Sikker skjemabehandling'}
        </div>
      )}
    </form>
  );
};

export default NorwegianForm;
