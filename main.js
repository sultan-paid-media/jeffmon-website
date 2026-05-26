// ── CUSTOM CURSOR ──
const cur  = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
});

function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, .t-card, .art-card, .m-step, .phil-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cur.style.transform = 'translate(-50%,-50%) scale(2.5)';
    ring.style.width    = '60px';
    ring.style.height   = '60px';
  });
  el.addEventListener('mouseleave', () => {
    cur.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.width    = '36px';
    ring.style.height   = '36px';
  });
});

// ── NAV SCROLL + SECTION COUNTER ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('solid', window.scrollY > 80);
  const sections = ['s0','s1','s2','s3','s4','s5','s6','s7','s8'];
  let current = 1;
  sections.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) current = i + 1;
  });
  const scNum = document.getElementById('sc-num');
  if (scNum) scNum.textContent = String(current).padStart(2, '0');
});

// ── REVEAL ON SCROLL ──
const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const revObs  = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
reveals.forEach(el => revObs.observe(el));

// ── LIVE STOCKS ──
const MAG7 = [
  { ticker: 'AAPL',  name: 'Apple Inc.',          sector: 'Consumer Technology' },
  { ticker: 'MSFT',  name: 'Microsoft Corp.',      sector: 'Cloud & Enterprise'  },
  { ticker: 'NVDA',  name: 'NVIDIA Corp.',         sector: 'AI & Semiconductors' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.',        sector: 'Search & AI'         },
  { ticker: 'AMZN',  name: 'Amazon.com Inc.',      sector: 'E-Commerce & Cloud'  },
  { ticker: 'META',  name: 'Meta Platforms Inc.',  sector: 'Social & AR/VR'      },
  { ticker: 'TSLA',  name: 'Tesla Inc.',           sector: 'EV & Energy'         },
];

function fmt(n) {
  return (n && !isNaN(n))
    ? '$' + parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—';
}
function fmtMcap(n) {
  if (!n || isNaN(n)) return '—';
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(1)  + 'B';
  return '$' + n.toLocaleString();
}
function fmtPE(n) {
  return (!n || isNaN(n) || n < 0) ? '—' : parseFloat(n).toFixed(1) + 'x';
}

async function fetchStock(t) {
  try {
    const url   = `https://query1.finance.yahoo.com/v8/finance/chart/${t}?interval=1d&range=1d`;
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const r     = await fetch(proxy);
    const d     = await r.json();
    const m     = JSON.parse(d.contents).chart.result[0].meta;
    return {
      price: m.regularMarketPrice,
      prev:  m.chartPreviousClose || m.previousClose,
      mcap:  m.marketCap,
      pe:    m.trailingPE || null,
    };
  } catch (e) { return null; }
}

async function loadStocks() {
  const tbody = document.getElementById('stock-tbody');
  if (!tbody) return;

  tbody.innerHTML = MAG7.map(s => `
    <tr>
      <td><div class="s-name">${s.name}</div><div class="s-sector">${s.sector}</div></td>
      <td><span class="s-ticker">${s.ticker}</span></td>
      <td id="p-${s.ticker}"  class="s-price">—</td>
      <td id="c-${s.ticker}">—</td>
      <td id="m-${s.ticker}">—</td>
      <td id="pe-${s.ticker}">—</td>
      <td><span class="conv-badge">High</span></td>
    </tr>
  `).join('');

  const results = await Promise.all(MAG7.map(s => fetchStock(s.ticker)));

  MAG7.forEach((s, i) => {
    const d = results[i];
    if (!d) return;
    const chg = d.price - d.prev;
    const pct = (chg / d.prev) * 100;
    const cls = chg >= 0 ? 'up' : 'dn';
    const arr = chg >= 0 ? '▲ ' : '▼ ';
    const p  = document.getElementById('p-'  + s.ticker);
    const c  = document.getElementById('c-'  + s.ticker);
    const m  = document.getElementById('m-'  + s.ticker);
    const pe = document.getElementById('pe-' + s.ticker);
    if (p)  p.textContent  = fmt(d.price);
    if (c)  c.innerHTML    = `<span class="${cls}">${arr}${Math.abs(pct).toFixed(2)}%</span><br>
                               <small style="color:var(--muted);font-size:0.65rem">${chg >= 0 ? '+' : ''}${fmt(chg)}</small>`;
    if (m)  m.textContent  = fmtMcap(d.mcap);
    if (pe) pe.textContent = fmtPE(d.pe);
  });

  const timeEl = document.getElementById('stock-time');
  if (timeEl) timeEl.textContent = 'Updated ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

loadStocks();
setInterval(loadStocks, 60000);

// ══════════════════════════════════════════════════════
//  DAILY BRIEFING — AUTO DATE + CLAUDE API
// ══════════════════════════════════════════════════════

// ── Step 1: Auto update today's date in heading ──
function setTodayDate() {
  const dateEl = document.getElementById('briefing-date');
  if (!dateEl) return;
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  dateEl.textContent = 'Market Briefing — ' + today;
}
setTodayDate();

// ── Step 2: Fetch briefing from Claude API via Netlify Function ──
async function fetchDailyBriefing() {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  // Check cache — only fetch once per day
  const cacheKey   = 'jeffmon_briefing_' + new Date().toISOString().split('T')[0];
  const cached     = sessionStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    renderBriefing(parsed.text, parsed.articles);
    return;
  }

  // Show loading state
  const analysisEl = document.getElementById('analysis-text');
  if (analysisEl) analysisEl.textContent = 'Generating today\'s market briefing...';

  try {
    const response = await fetch('/.netlify/functions/briefing');
    if (!response.ok) throw new Error('Function error');
    const data = await response.json();

    // Cache for this session
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
    renderBriefing(data.text, data.articles);

  } catch (err) {
    console.error('Briefing fetch failed:', err);
    // Fallback — show placeholder
    const analysisEl = document.getElementById('analysis-text');
    if (analysisEl) analysisEl.textContent = 'Market briefing temporarily unavailable. Please check back shortly.';
  }
}

// ── Step 3: Render briefing text + articles ──
function renderBriefing(text, articles) {
  // Typewriter for analysis text
  startTypewriter(text);

  // Render article cards
  const g = document.getElementById('articles-grid');
  if (!g || !articles) return;
  g.innerHTML = '';

  const dotMap = {
    'CNBC':          { cls: 'dot-cnbc', code: 'CNBC' },
    'Yahoo Finance': { cls: 'dot-yf',   code: 'YF'   },
    'Bloomberg':     { cls: 'dot-bb',   code: 'BB'   },
    'Reuters':       { cls: 'dot-bb',   code: 'RT'   },
    'FT':            { cls: 'dot-yf',   code: 'FT'   },
  };
  const tagMap = {
    'Markets':    'tag-markets',
    'Geopolitics':'tag-geo',
    'Macro':      'tag-macro',
    'Tech':       'tag-tech',
    'Energy':     'tag-macro',
    'Rates':      'tag-markets',
  };

  articles.forEach(a => {
    const dot     = dotMap[a.src]  || { cls: 'dot-yf', code: a.src.substring(0,2).toUpperCase() };
    const tagCls  = tagMap[a.tag]  || 'tag-markets';
    const el      = document.createElement('a');
    el.href       = a.url || '#';
    el.target     = '_blank';
    el.rel        = 'noopener noreferrer';
    el.className  = 'art-card';
    el.innerHTML  = `
      <div class="art-src-row">
        <div class="art-dot ${dot.cls}">${dot.code}</div>
        <div class="art-src-name">${a.src}</div>
      </div>
      <div class="art-headline">${a.headline}</div>
      <span class="art-tag ${tagCls}">${a.tag}</span>
      <div class="art-arrow">→</div>
    `;
    g.appendChild(el);
  });
}

// ── Step 4: Typewriter animation ──
function startTypewriter(text) {
  const el = document.getElementById('analysis-text');
  if (!el || !text) return;
  el.innerHTML = '';

  const cursorEl = document.createElement('span');
  cursorEl.className = 'cursor-blink';
  el.appendChild(cursorEl);

  let i = 0;
  function type() {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text[i]), cursorEl);
      i++;
      setTimeout(type, 16);
    } else {
      cursorEl.remove();
    }
  }
  type();
}

// ── INIT: trigger when briefing section is visible ──
const briefBox = document.querySelector('.analysis-box');
if (briefBox) {
  const typingObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        fetchDailyBriefing();
        typingObs.disconnect();
      }
    });
  }, { threshold: 0.2 });
  typingObs.observe(briefBox);
}
