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
    cur.style.transform  = 'translate(-50%,-50%) scale(2.5)';
    ring.style.width     = '60px';
    ring.style.height    = '60px';
  });
  el.addEventListener('mouseleave', () => {
    cur.style.transform  = 'translate(-50%,-50%) scale(1)';
    ring.style.width     = '36px';
    ring.style.height    = '36px';
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
    if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) {
      current = i + 1;
    }
  });
  const scNum = document.getElementById('sc-num');
  if (scNum) scNum.textContent = String(current).padStart(2, '0');
});

// ── REVEAL ON SCROLL ──
const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const revObs  = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
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
  } catch (e) {
    return null;
  }
}

async function loadStocks() {
  const tbody = document.getElementById('stock-tbody');
  if (!tbody) return;

  tbody.innerHTML = MAG7.map(s => `
    <tr>
      <td>
        <div class="s-name">${s.name}</div>
        <div class="s-sector">${s.sector}</div>
      </td>
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
  if (timeEl) {
    timeEl.textContent = 'Updated ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}

loadStocks();
setInterval(loadStocks, 60000);

// ── BRIEFING: ARTICLES ──
const ARTICLES = [
  {
    src: 'CNBC', code: 'CNBC', dot: 'dot-cnbc',
    headline: 'Markets recover from 600-point Dow drop as investors buy the dip after US-Iran strikes — Nvidia up nearly 3%',
    url: 'https://www.cnbc.com/2026/03/01/stock-market-today-live-update.html',
    tag: 'Markets', tagClass: 'tag-markets'
  },
  {
    src: 'Yahoo Finance', code: 'YF', dot: 'dot-yf',
    headline: 'Operation Epic Fury: US and Israel strike Iran, killing Supreme Leader Khamenei — what it means for oil markets',
    url: 'https://finance.yahoo.com/',
    tag: 'Geopolitics', tagClass: 'tag-geo'
  },
  {
    src: 'Bloomberg', code: 'BB', dot: 'dot-bb',
    headline: 'Treasury yields tumble to 18-month lows as gold surges on Middle East escalation — flight-to-quality in full force',
    url: 'https://www.bloomberg.com/news/articles/2026-02-26/asian-stocks-to-ebb-as-nvidia-decline-dulls-mood-markets-wrap',
    tag: 'Macro', tagClass: 'tag-macro'
  },
  {
    src: 'CNBC', code: 'CNBC', dot: 'dot-cnbc',
    headline: 'Iran conflict threatens new price pressures even as Trump declares inflation tamed — Fed path now uncertain',
    url: 'https://www.cnbc.com/',
    tag: 'Macro', tagClass: 'tag-macro'
  },
  {
    src: 'Yahoo Finance', code: 'YF', dot: 'dot-yf',
    headline: 'Mag 7 diverges: Nvidia and Microsoft outperform as software rallies — tech seen as relative safe haven',
    url: 'https://finance.yahoo.com/news/live/stock-market-today-dow-sp-500-nasdaq-fall-to-end-volatile-month-as-ai-worries-buffet-markets-211239963.html',
    tag: 'Tech', tagClass: 'tag-tech'
  },
];

function renderArticles() {
  const g = document.getElementById('articles-grid');
  if (!g) return;
  g.innerHTML = '';
  ARTICLES.forEach(a => {
    const el = document.createElement('a');
    el.href      = a.url;
    el.target    = '_blank';
    el.rel       = 'noopener noreferrer';
    el.className = 'art-card';
    el.innerHTML = `
      <div class="art-src-row">
        <div class="art-dot ${a.dot}">${a.code}</div>
        <div class="art-src-name">${a.src}</div>
      </div>
      <div class="art-headline">${a.headline}</div>
      <span class="art-tag ${a.tagClass}">${a.tag}</span>
      <div class="art-arrow">→</div>
    `;
    g.appendChild(el);
  });
}

// ── BRIEFING: TYPEWRITER ──
const BRIEFING_TEXT = "Markets are navigating a sharp risk-off shift following the weekend US-Israeli strikes on Iran — codenamed Operation Epic Fury — which resulted in the death of Supreme Leader Khamenei, the most seismic geopolitical event in decades. The Dow initially fell over 600 points before recovering, with Nvidia gaining nearly 3% and Microsoft rising, suggesting investors are treating the Magnificent 7 as a relative safe haven. Gold has surged and Treasury yields collapsed to 18-month lows — a classic flight-to-quality rotation that validates JeffMon's existing positioning in precious metals and high-grade fixed income. The critical near-term risk is oil price escalation feeding back into inflation expectations, which could force the Fed to pause its rate-cut cycle; monitoring energy prices and the 10-year yield closely this week is essential.";

function startTypewriter() {
  const el = document.getElementById('analysis-text');
  if (!el) return;
  el.innerHTML = '';

  // Blinking cursor element
  const cursorEl = document.createElement('span');
  cursorEl.className = 'cursor-blink';
  el.appendChild(cursorEl);

  let i = 0;
  const speed = 18; // ms per character

  function type() {
    if (i < BRIEFING_TEXT.length) {
      // Insert character before the cursor
      el.insertBefore(document.createTextNode(BRIEFING_TEXT[i]), cursorEl);
      i++;
      setTimeout(type, speed);
    } else {
      // Remove blinking cursor when done
      cursorEl.remove();
    }
  }
  type();
}

// ── INIT ──
renderArticles();

// Start typewriter when the briefing section enters the viewport
const briefBox = document.querySelector('.analysis-box');
if (briefBox) {
  const typingObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        startTypewriter();
        typingObs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  typingObs.observe(briefBox);
}
