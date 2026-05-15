// Lokasyon seçici — il/ilçe/mahalle
// Veri kaynağı: data/lokasyon.json

(function () {
  let lokasyonData = null;

  async function loadLokasyon() {
    if (lokasyonData) return lokasyonData;
    const base = (window.location.pathname.includes('/makaleler/') || window.location.pathname.includes('/kategoriler/')) ? '../' : '';
    const res = await fetch(base + 'data/lokasyon.json');
    lokasyonData = await res.json();
    return lokasyonData;
  }

  function buildSelector() {
    const wrap = document.getElementById('lokasyonSelector');
    if (!wrap) return;

    wrap.innerHTML = `
      <div class="lok-header">
        <div class="lok-icon">📍</div>
        <div>
          <div class="lok-title">Bölgenizi Seçin</div>
          <div class="lok-sub">Size en yakın teknik ekibimizi yönlendirelim</div>
        </div>
      </div>
      <div class="lok-selects">
        <div class="lok-select-wrap">
          <label class="lok-label">İl</label>
          <select id="ilSelect" class="lok-select">
            <option value="">— İl seçin —</option>
          </select>
        </div>
        <div class="lok-select-wrap">
          <label class="lok-label">İlçe</label>
          <select id="ilceSelect" class="lok-select" disabled>
            <option value="">— Önce il seçin —</option>
          </select>
        </div>
        <div class="lok-select-wrap">
          <label class="lok-label">Mahalle / Semt</label>
          <input id="mahalleInput" class="lok-select" type="text" placeholder="Mahalle veya semt adı (opsiyonel)" disabled>
        </div>
      </div>
      <div id="lokSonuc" class="lok-sonuc hidden"></div>
    `;

    initSelects();
  }

  async function initSelects() {
    const data = await loadLokasyon();
    const ilSelect   = document.getElementById('ilSelect');
    const ilceSelect = document.getElementById('ilceSelect');
    const mahalleInput = document.getElementById('mahalleInput');

    // İlleri doldur
    data.iller.sort((a, b) => a.il.localeCompare(b.il, 'tr')).forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.il;
      opt.textContent = item.il;
      ilSelect.appendChild(opt);
    });

    // İl seçilince ilçeleri doldur
    ilSelect.addEventListener('change', () => {
      const secilen = ilSelect.value;
      ilceSelect.innerHTML = '<option value="">— İlçe seçin —</option>';
      ilceSelect.disabled = true;
      mahalleInput.disabled = true;
      mahalleInput.value = '';
      hideSonuc();

      if (!secilen) return;
      const ilData = data.iller.find(i => i.il === secilen);
      if (!ilData) return;

      ilData.ilceler.forEach(ilce => {
        const opt = document.createElement('option');
        opt.value = ilce;
        opt.textContent = ilce;
        ilceSelect.appendChild(opt);
      });
      ilceSelect.disabled = false;
    });

    // İlçe seçilince mahalle alanını aç ve sonucu göster
    ilceSelect.addEventListener('change', () => {
      if (!ilceSelect.value) { hideSonuc(); return; }
      mahalleInput.disabled = false;
      showSonuc(ilSelect.value, ilceSelect.value, mahalleInput.value);
    });

    mahalleInput.addEventListener('input', () => {
      if (ilceSelect.value) showSonuc(ilSelect.value, ilceSelect.value, mahalleInput.value);
    });
  }

  function showSonuc(il, ilce, mahalle) {
    const sonuc = document.getElementById('lokSonuc');
    if (!sonuc) return;
    const adres = mahalle.trim()
      ? `${mahalle.trim()}, ${ilce} / ${il}`
      : `${ilce} / ${il}`;

    sonuc.className = 'lok-sonuc';
    sonuc.innerHTML = `
      <div class="lok-sonuc-adres">
        <span class="lok-check">✓</span>
        <span><strong>${adres}</strong> bölgesinde hizmet veriyoruz!</span>
      </div>
      <a href="${TELEFON_TEL_LINK}" class="lok-ara-btn">
        <span class="lok-ara-icon">📞</span>
        <div>
          <div class="lok-ara-label">Hemen Teknik Destek Alın</div>
          <div class="lok-ara-numara">${TELEFON_NUMARASI}</div>
        </div>
      </a>
      <p class="lok-not">Arayan: <strong>${adres}</strong> — ekibimiz bölgenizi tanımlayacak</p>
    `;
  }

  function hideSonuc() {
    const sonuc = document.getElementById('lokSonuc');
    if (sonuc) sonuc.className = 'lok-sonuc hidden';
  }

  document.addEventListener('DOMContentLoaded', buildSelector);
})();
