// ============================================================
//  Lokasyon Seçici — İl / İlçe / Mahalle
//  Veri: data/lokasyon.json (il+ilçe) + data/mahalle/{il}.json
// ============================================================

(function () {
  let lokasyonData = null;
  let mahalleCache = {};

  function getBase() {
    const p = window.location.pathname;
    return (p.includes('/makaleler/') || p.includes('/kategoriler/')) ? '../' : '';
  }

  async function loadIlIlce() {
    if (lokasyonData) return lokasyonData;
    const res = await fetch(getBase() + 'data/lokasyon.json');
    lokasyonData = await res.json();
    return lokasyonData;
  }

  async function loadMahalleler(ilAdi) {
    if (mahalleCache[ilAdi]) return mahalleCache[ilAdi];
    const slug = ilAdi
      .toLowerCase()
      .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
      .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
      .replace(/İ/g,'i').replace(/Ğ/g,'g').replace(/Ü/g,'u')
      .replace(/Ş/g,'s').replace(/Ö/g,'o').replace(/Ç/g,'c')
      .replace(/\s+/g,'-');
    try {
      const res = await fetch(getBase() + `data/mahalle/${slug}.json`);
      if (!res.ok) return null;
      const data = await res.json();
      mahalleCache[ilAdi] = data;
      return data;
    } catch { return null; }
  }

  function buildSelector() {
    const wrap = document.getElementById('lokasyonSelector');
    if (!wrap) return;

    wrap.innerHTML = `
      <div class="lok-header">
        <div class="lok-icon">📍</div>
        <div>
          <div class="lok-title">Bölgenizi Seçin, Hemen Yardım Alalım</div>
          <div class="lok-sub">İl, ilçe ve mahallenizi seçin — size en yakın teknik ekip yönlendirilsin</div>
        </div>
      </div>
      <div class="lok-selects">
        <div class="lok-select-wrap">
          <label class="lok-label">İl</label>
          <div class="lok-select-inner">
            <select id="ilSelect" class="lok-select">
              <option value="">İl seçin...</option>
            </select>
          </div>
        </div>
        <div class="lok-select-wrap">
          <label class="lok-label">İlçe</label>
          <div class="lok-select-inner">
            <select id="ilceSelect" class="lok-select" disabled>
              <option value="">Önce il seçin</option>
            </select>
            <span class="lok-spinner hidden" id="ilceSpinner">⏳</span>
          </div>
        </div>
        <div class="lok-select-wrap">
          <label class="lok-label">Mahalle</label>
          <div class="lok-select-inner">
            <select id="mahalleSelect" class="lok-select" disabled>
              <option value="">Önce ilçe seçin</option>
            </select>
            <span class="lok-spinner hidden" id="mahalleSpinner">⏳</span>
          </div>
        </div>
      </div>
      <div id="lokSonuc" class="lok-sonuc hidden"></div>
    `;

    initSelects();
  }

  async function initSelects() {
    const data = await loadIlIlce();
    const ilSelect      = document.getElementById('ilSelect');
    const ilceSelect    = document.getElementById('ilceSelect');
    const mahalleSelect = document.getElementById('mahalleSelect');

    // İlleri doldur (alfabetik)
    [...data.iller]
      .sort((a, b) => a.il.localeCompare(b.il, 'tr'))
      .forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.il;
        opt.textContent = item.il;
        ilSelect.appendChild(opt);
      });

    // İl değişince → ilçeleri doldur + mahalle resetle
    ilSelect.addEventListener('change', async () => {
      const secilen = ilSelect.value;
      resetSelect(ilceSelect, 'İlçe seçin...');
      resetSelect(mahalleSelect, 'Önce ilçe seçin');
      ilceSelect.disabled = true;
      mahalleSelect.disabled = true;
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

    // İlçe değişince → mahalle verisi yükle
    ilceSelect.addEventListener('change', async () => {
      const il    = ilSelect.value;
      const ilce  = ilceSelect.value;
      resetSelect(mahalleSelect, 'Yükleniyor...');
      mahalleSelect.disabled = true;
      hideSonuc();
      if (!ilce) return;

      setSpinner('mahalleSpinner', true);
      const mahData = await loadMahalleler(il);
      setSpinner('mahalleSpinner', false);

      resetSelect(mahalleSelect, 'Mahalle seçin...');

      if (mahData && mahData[ilce] && mahData[ilce].length > 0) {
        mahData[ilce].forEach(mah => {
          const opt = document.createElement('option');
          opt.value = mah;
          opt.textContent = mah;
          mahalleSelect.appendChild(opt);
        });
        mahalleSelect.disabled = false;
      } else {
        // Mahalle verisi yoksa direkt sonucu göster
        mahalleSelect.innerHTML = '<option value="">Mahalle verisi yükleniyor</option>';
        showSonuc(il, ilce, '');
      }
    });

    // Mahalle seçince → sonucu göster
    mahalleSelect.addEventListener('change', () => {
      const il     = ilSelect.value;
      const ilce   = ilceSelect.value;
      const mahalle = mahalleSelect.value;
      if (mahalle) showSonuc(il, ilce, mahalle);
    });
  }

  function resetSelect(el, placeholder) {
    el.innerHTML = `<option value="">${placeholder}</option>`;
  }

  function setSpinner(id, show) {
    const el = document.getElementById(id);
    if (el) el.className = show ? 'lok-spinner' : 'lok-spinner hidden';
  }

  function showSonuc(il, ilce, mahalle) {
    const sonuc = document.getElementById('lokSonuc');
    if (!sonuc) return;
    const adresParts = [mahalle, ilce, il].filter(Boolean);
    const adres = adresParts.join(' / ');

    sonuc.className = 'lok-sonuc';
    sonuc.innerHTML = `
      <div class="lok-sonuc-adres">
        <span class="lok-check">✓</span>
        <strong>${adres}</strong>
      </div>
      <p class="lok-bildirim">Hizmet kalitemizi arttırmak ve müşterilerimize daha iyi bir deneyim yaşatabilmek için, kısa süreli altyapı iyileştirme çalışması planlanmaktadır.</p>
      <a href="${TELEFON_TEL_LINK}" class="lok-ara-btn">
        <span class="lok-ara-icon">📞</span>
        <div>
          <div class="lok-ara-label">Hemen Teknik Destek Alın</div>
          <div class="lok-ara-numara">${TELEFON_NUMARASI}</div>
        </div>
        <div class="lok-ara-ok">›</div>
      </a>
      <p class="lok-not">Aradığınızda ekibimiz bölgenizi otomatik tanımlayacak</p>
    `;

    // Sonuca kaydır
    sonuc.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideSonuc() {
    const s = document.getElementById('lokSonuc');
    if (s) s.className = 'lok-sonuc hidden';
  }

  document.addEventListener('DOMContentLoaded', buildSelector);
})();
