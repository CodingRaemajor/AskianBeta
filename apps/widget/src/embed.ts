// embed.ts
import { AskianIframeApp } from './iframe-app';

export type AskianEmbedOptions = {
  apiBase?: string;
  theme?: 'dark' | 'light';
  width?: string;
  height?: string;
  title?: string;
};

export function mount(container: HTMLElement, opts: AskianEmbedOptions = {}) {
  const apiBase = opts.apiBase ?? '/api';
  const src = `widget.html?apiBase=${encodeURIComponent(apiBase)}${opts.theme ? `&theme=${opts.theme}` : ''}`;

  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = opts.title ?? 'Askian';
  iframe.style.width = opts.width ?? '100%';
  iframe.style.height = opts.height ?? '420px';
  iframe.style.border = '0';
  iframe.allow = 'clipboard-write';

  container.replaceChildren(iframe);

  const app = new AskianIframeApp(iframe);
  app.mount();

  return app;
}

// Auto-mount any element with data-askian
function auto() {
  const nodes = document.querySelectorAll<HTMLElement>('[data-askian]');
  nodes.forEach((el) => {
    if ((el as any).__askianMounted) return;
    (el as any).__askianMounted = true;
    const opts: AskianEmbedOptions = {
      apiBase: el.dataset.apiBase,
      theme: (el.dataset.theme as any) || 'dark',
      width: el.dataset.width,
      height: el.dataset.height,
      title: el.dataset.title
    };
    mount(el, opts);
  });
}

if (typeof window !== 'undefined') {
  (window as any).Askian = { mount };
  if (document.readyState === 'complete' || document.readyState === 'interactive') auto();
  else document.addEventListener('DOMContentLoaded', auto);
}
