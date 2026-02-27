// ── NAVBAR SCROLL EFFECT ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── REVEAL ON SCROLL ──
const reveals = document.querySelectorAll('.reveal');
const steps = document.querySelectorAll('.step');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

reveals.forEach(el => observer.observe(el));

// ── STOCKS SECTION ──
(function () {

  const MAG7 = [
    { ticker: 'AAPL',  name: 'Apple Inc.',          sector: 'Consumer Technology' },
    { ticker: 'MSFT',  name: 'Microsoft Corp.',      sector: 'Cloud & Enterprise'  },
    { ticker: 'NVDA',  name: 'NVIDIA Corp.',         sector: 'AI & Semiconductors' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.',        sector: 'Search & AI'         },
    { ticker: 'AMZN',  name: 'Amazon.com Inc.',      sector: 'E-Commerce & Cloud'  },
    { ticker: 'META',  name: 'Meta Platforms Inc.',  sector: 'Social & AR/VR'      },
    { ticker: 'TSLA',  name: 'Tesla Inc.',           sector: 'EV & Energy'         },
  ];

  // ── FORMATTERS ──
  function formatPrice(n) {
    if (!n || isNaN(n)) return '—';
    return '$' + parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatMarketCap(n) {
    if (!n || isNaN(n)) return '—';
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9)  return '$' + (n / 1e9).toFixed(1)  + 'B';
    return '$' + n.toLocaleString();
  }

  function formatPE(n) {
    if (!n || isNaN(n) || n < 0) return '—';
    return parseFloat(n).toFixed(1) + 'x';
  }

  function changeClass(v) {
    if (!v || isNaN(v)) return 'change-neutral';
    return v >= 0 ? 'change-positive' : 'change-negative';
  }

  function changeArrow(v) {
    if (!v || isNaN(v)) return '';
    return v >= 0 ? '▲ ' : '▼ ';
  }

  // ── FETCH ONE STOCK ──
  async function fetchStock(ticker) {
    const url   = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    try {
      const res    = await fetch(proxy);
      const data   = await res.json();
      const parsed = JSON.parse(data.contents);
      const meta   = parsed.chart.result[0].meta;
      return {
        price:     meta.regularMarketPrice,
        prevClose: meta.chartPreviousClose || meta.previousClose,
        marketCap: meta.marketCap,
        pe:        meta.trailingPE || null,
      };
    } catch (e) {
      return null;
    }
  }

  // ── BUILD SKELETON ROWS ──
  function buildRows() {
    const tbody = document.getElementById('stock-tbody');
    tbody.innerHTML = MAG7.map(s => `
      <tr id="row-${s.ticker}">
        <td>
          <span class="company-name">${s.name}</span>
          <span class="company-sector">${s.sector}</span>
        </td>
        <td class="ticker-cell">${s.ticker}</td>
        <td class="price-cell"  id="price-${s.ticker}"><span class="data-empty">—</span></td>
        <td class="change-cell" id="change-${s.ticker}"><span class="data-empty">—</span></td>
        <td class="mcap-cell"   id="mcap-${s.ticker}"><span class="data-empty">—</span></td>
        <td class="pe-cell"     id="pe-${s.ticker}"><span class="data-empty">—</span></td>
        <td class="conviction-cell"><span class="conviction-badge conviction-high">High</span></td>
      </tr>
    `).join('');
  }

  // ── POPULATE ROW WITH LIVE DATA ──
  function populateRow(s, d) {
    if (!d) return;

    const change    = d.price - d.prevClose;
    const changePct = (change / d.prevClose) * 100;
    const cls       = changeClass(change);
    const arrow     = changeArrow(change);

    document.getElementById(`price-${s.ticker}`).innerHTML =
      `<span class="price-value">${formatPrice(d.price)}</span>`;

    document.getElementById(`change-${s.ticker}`).innerHTML =
      `<span class="${cls}">${arrow}${Math.abs(changePct).toFixed(2)}%</span>
       <span class="change-sub">${change >= 0 ? '+' : ''}${formatPrice(change)}</span>`;

    document.getElementById(`mcap-${s.ticker}`).innerHTML =
      `<span>${formatMarketCap(d.marketCap)}</span>`;

    document.getElementById(`pe-${s.ticker}`).innerHTML =
      `<span>${formatPE(d.pe)}</span>`;
  }

  // ── LOAD ALL STOCKS ──
  async function loadAll() {
    buildRows();

    const results = await Promise.all(MAG7.map(s => fetchStock(s.ticker)));

    MAG7.forEach((s, i) => populateRow(s, results[i]));

    const now = new Date();
    document.getElementById('last-updated').textContent =
      'Last updated: ' + now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
  }

  // ── INIT: load immediately, then refresh every 60s ──
  loadAll();
  setInterval(loadAll, 60000);

})();

// ── STEPS STAGGERED ANIMATION ──
const stepObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const allSteps = document.querySelectorAll('.step');
      allSteps.forEach((step, i) => {
        setTimeout(() => step.classList.add('visible'), i * 120);
      });
      stepObserver.disconnect();
    }
  });
}, { threshold: 0.1 });

if (steps.length) stepObserver.observe(steps[0]);
