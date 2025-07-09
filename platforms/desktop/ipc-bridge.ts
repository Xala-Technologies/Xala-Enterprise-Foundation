/**
 * Desktop IPC Bridge
 */

export function sendToRenderer(channel: string, data: any): void {
  console.log(`Sending to renderer: ${channel}`, data);
}

export function sendToMain(channel: string, data: any): void {
  console.log(`Sending to main: ${channel}`, data);
}

export class IPCEventBridge {
  static instance: IPCEventBridge;

  static getInstance(): IPCEventBridge {
    if (!IPCEventBridge.instance) {
      IPCEventBridge.instance = new IPCEventBridge();
    }
    return IPCEventBridge.instance;
  }

  sendToRenderer(channel: string, data: any): void {
    sendToRenderer(channel, data);
  }

  sendToMain(channel: string, data: any): void {
    sendToMain(channel, data);
  }
}
