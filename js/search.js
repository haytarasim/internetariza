// Arama motoru — articles.json üzerinden çalışır
let articlesData = [];

async function loadArticles() {
  if (articlesData.length > 0) return articlesData;
  const base = getBasePath();
  const res = await fetch(base + 'data/articles.json');
  articlesData = await res.json();
  return articlesData;
}

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/makaleler/') || path.includes('/kategoriler/')) return '../';
  return '';
}

function searchArticles(query, articles) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  return articles.filter(a => {
    return (
      a.baslik.toLowerCase().includes(q) ||
      a.ozet.toLowerCase().includes(q) ||
      a.etiketler.some(t => t.toLowerCase().includes(q)) ||
      a.kategoriAd.toLowerCase().includes(q)
    );
  });
}

function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// ---- Ana sayfa arama kutusu ----
function initHeroSearch() {
  const input = document.getElementById('heroSearch');
  const btn = document.getElementById('heroSearchBtn');
  const suggestions = document.getElementById('searchSuggestions');
  if (!input) return;

  let timeout;

  input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const q = input.value.trim();
      if (q.length < 2) { suggestions.classList.remove('show'); return; }
      const articles = await loadArticles();
      const results = searchArticles(q, articles).slice(0, 6);
      renderSuggestions(results, q, suggestions, input);
    }, 200);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch(input.value);
  });

  btn.addEventListener('click', () => doSearch(input.value));

  document.addEventListener('click', (e) => {
    if (!input.closest('.search-box').contains(e.target)) {
      suggestions.classList.remove('show');
    }
  });
}

function renderSuggestions(results, query, container, input) {
  if (results.length === 0) {
    container.classList.remove('show');
    return;
  }
  container.innerHTML = results.map(a => `
    <div class="suggestion-item" onclick="window.location='${getBasePath()}${a.url}'">
      <span class="sug-icon">🔍</span>
      <div>
        <div style="font-weight:500">${highlightText(a.baslik, query)}</div>
        <div style="font-size:12px;color:#5f6368">${a.kategoriAd}</div>
      </div>
    </div>
  `).join('') + `
    <div class="suggestion-item" style="border-top:1px solid #eee" onclick="doSearch('${query.replace(/'/g, "\\'")}')">
      <span class="sug-icon">🔎</span>
      <span>"<strong>${query}</strong>" için tüm sonuçları gör</span>
    </div>
  `;
  container.classList.add('show');
}

function doSearch(query) {
  if (!query.trim()) return;
  window.location = getBasePath() + 'arama.html?q=' + encodeURIComponent(query.trim());
}

// ---- Arama sonuçları sayfası ----
async function initSearchPage() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  const queryDisplay = document.getElementById('queryDisplay');
  const resultsCount = document.getElementById('resultsCount');
  const resultsList = document.getElementById('resultsList');
  if (!resultsList) return;

  if (queryDisplay) queryDisplay.textContent = q;

  const articles = await loadArticles();
  const results = searchArticles(q, articles);

  if (resultsCount) resultsCount.textContent = results.length;

  if (results.length === 0) {
    resultsList.innerHTML = `
      <div class="no-result">
        <h3>Sonuç bulunamadı</h3>
        <p>"${q}" için eşleşen makale yok. Farklı anahtar kelimeler deneyin.</p>
      </div>`;
    return;
  }

  resultsList.innerHTML = results.map(a => `
    <a href="${a.url}" class="article-card">
      <div class="article-meta">
        <span class="article-cat-badge">${a.kategoriAd}</span>
      </div>
      <h3>${highlightText(a.baslik, q)}</h3>
      <p>${highlightText(a.ozet, q)}</p>
      <div class="article-tags">
        ${a.etiketler.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </a>
  `).join('');
}

// ---- Header küçük arama ----
function initHeaderSearch() {
  const input = document.getElementById('headerSearch');
  if (!input) return;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch(input.value);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroSearch();
  initHeaderSearch();
  initSearchPage();
});
