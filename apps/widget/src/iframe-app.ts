// iframe-app.ts
type Message =
  | { type: 'askian:ready' }
  | { type: 'askian:init' }
  | { type: 'askian:resize'; height: number }
  | { type: 'askian:push'; text: string }
  | { type: 'askian:answer'; query: string; data: unknown };

export class AskianIframeApp {
  private iframe: HTMLIFrameElement;
  private ready = false;
  private listeners = new Set<(m: Message) => void>();

  constructor(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
    window.addEventListener('message', (e) => this.onMessage(e));
  }

  mount() {
    // Kick off init once the iframe loads
    this.iframe.addEventListener('load', () => {
      this.post({ type: 'askian:init' });
    });
  }

  on(fn: (m: Message) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  push(text: string) {
    this.post({ type: 'askian:push', text });
  }

  private onMessage(e: MessageEvent) {
    const data = e.data as Message;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'askian:ready') {
      this.ready = true;
    }

    if (data.type === 'askian:resize' && typeof data.height === 'number') {
      this.iframe.style.height = Math.max(300, data.height) + 'px';
    }

    for (const fn of this.listeners) fn(data);
  }

  private post(m: Message) {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage(m, '*');
  }
}
