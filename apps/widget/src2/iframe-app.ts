export function initializeIframeApp() {
    const root = document.getElementById('app')!;
root.innerHTML = `
  <style>
    .box { background: Canvas; color: CanvasText; border: 1px solid GrayText; border-radius: 12px; }
    .btn,.select,.input { border:1px solid GrayText; background:Canvas; color:CanvasText; border-radius:8px; padding:.5rem .75rem; }
    .msg-user { background:#0a5; color:#fff; padding:.5rem .75rem; border-radius:10px; max-width:80%; margin-left:auto; }
    .msg-bot { background:#f2f2f2; color:#111; padding:.5rem .75rem; border-radius:10px; max-width:80%; }
    .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); border:0; }
  </style>
  <div class="box" style="padding:12px; width:min(380px,100vw); display:flex; flex-direction:column; gap:.5rem;">
    <div style="display:flex; gap:.5rem; align-items:center;">
      <label for="aud" class="sr-only">Audience</label>
      <select id="aud" class="select" aria-label="Audience">
        <option value="prospective">Prospective</option>
        <option value="undergrad">Undergrad</option>
        <option value="grad">Grad</option>
        <option value="international">International</option>
      </select>
      <div id="status" aria-live="polite" style="font-size:12px;"></div>
    </div>
    <div id="log" style="display:flex; flex-direction:column; gap:.5rem; max-height:50vh; overflow:auto;" aria-live="polite"></div>
    <form id="f" style="display:flex; gap:.5rem;">
      <label for="q" class="sr-only">Ask a question</label>
      <input id="q" class="input" placeholder="Ask about uregina.ca…" maxlength="512" required />
      <button class="btn" type="submit">Send</button>
    </form>
    <div style="font-size:12px;opacity:.8">Askian answers only from uregina.ca and shows sources. No personal information is collected. Anonymous metrics are retained up to 14 days.</div>
  </div>
`;

const els = {
  aud: root.querySelector('#aud') as HTMLSelectElement,
  form: root.querySelector('#f') as HTMLFormElement,
  q: root.querySelector('#q') as HTMLInputElement,
  log: root.querySelector('#log') as HTMLDivElement,
  status: root.querySelector('#status') as HTMLDivElement,
};

function addMsg(text: string, who: 'user'|'bot', html?: string | null) {
  const div = document.createElement('div');
  div.className = who === 'user' ? 'msg-user' : 'msg-bot';
  if (html) {
    const p = document.createElement('p'); p.textContent = text || 'See steps:'; div.appendChild(p);
    const btn = document.createElement('button'); btn.className = 'btn'; btn.type='button'; btn.textContent='View exact steps';
    btn.onclick = () => openModal(html);
    div.appendChild(btn);
  } else { div.textContent = text; }
  els.log.appendChild(div);
  els.log.scrollTop = els.log.scrollHeight;
}

function addCitations(cits: {title:string;url:string;snippet:string}[]) {
  const wrap = document.createElement('div'); wrap.className='msg-bot';
  const ul = document.createElement('ul'); ul.style.paddingLeft='1rem';
  for (const c of cits.slice(0,3)) {
    const li = document.createElement('li');
    const a = document.createElement('a'); a.href = c.url; a.target='_blank'; a.rel='noopener'; a.textContent = c.title || c.url;
    const snip = document.createElement('div'); snip.style.fontSize='12px'; snip.textContent = c.snippet.replace(/^"|"$/g,'');
    li.appendChild(a); li.appendChild(snip); ul.appendChild(li);
  }
  wrap.appendChild(ul); els.log.appendChild(wrap);
}

// modal
const modal = document.createElement('div');
modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:none;z-index:2147483647;align-items:center;justify-content:center;padding:12px;';
const panel = document.createElement('div');
panel.style.cssText = 'background:#fff;color:#111;max-width:min(700px,95vw);max-height:80vh;overflow:auto;border-radius:12px;padding:16px;';
panel.innerHTML = `
  <style>
    table { border-collapse: collapse; width: 100%; margin: .5rem 0; }
    th, td { border: 1px solid #ccc; padding: .4rem .6rem; vertical-align: top; }
    mark { background: #ffec99; }
    a { color: #0645ad; }
  </style>
  <div id="modal-content" aria-live="polite"></div>
  <div style="display:flex;justify-content:flex-end;margin-top:8px;">
    <button id="close-modal" class="btn" type="button">Close</button>
  </div>`;
modal.appendChild(panel); document.body.appendChild(modal);
function openModal(sanitizedHtml: string) { (panel.querySelector('#modal-content') as HTMLDivElement).innerHTML = sanitizedHtml; modal.style.display='flex'; (panel.querySelector('#close-modal') as HTMLButtonElement).onclick = () => modal.style.display='none'; }

async function getConfig(){ const r = await fetch('/api/config',{cache:'no-store'}); return await r.json(); }
(async()=>{ const conf = await getConfig(); if(!conf.enabled){ (root.parentElement as HTMLElement).style.display='none'; } els.status.textContent='Ready'; })();

els.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = els.q.value.trim(); if(!q) return;
  addMsg(q,'user'); els.q.value='';
  els.status.textContent='Answering…';
  try {
    const r = await fetch('/api/ask',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ q, audience: els.aud.value, page_path: location.href }) });
    const j = await r.json();
    addMsg(j.answer || 'Sorry, no answer.', 'bot', j.answer_html || null);
    if (j.citations) addCitations(j.citations);
  } catch { addMsg('Network error.', 'bot'); }
  finally { els.status.textContent='Ready'; }
});
}