// =============================================
//  NUMARA — sadece buradan değiştirin
// =============================================
const TELEFON_NUMARASI   = '0850 000 00 00';   // Görünen numara
const TELEFON_TEL_LINK   = 'tel:08500000000';   // tel: linki (boşuksuz)
// =============================================

// Logo SVG — internet/WiFi ikonu
const LOGO_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M1.5 8.5a15 15 0 0 1 21 0"/>
  <path d="M5 12.5a11 11 0 0 1 14 0"/>
  <path d="M8.5 16.5a6 6 0 0 1 7 0"/>
  <circle cx="12" cy="20.5" r="1.2" fill="white" stroke="none"/>
</svg>`;

document.addEventListener('DOMContentLoaded', () => {

  // 1) Logo ikonunu WiFi SVG ile değiştir
  document.querySelectorAll('.logo-icon').forEach(el => {
    el.innerHTML = LOGO_SVG;
  });

  // 2) Aktif nav linkini işaretle
  const links = document.querySelectorAll('nav a');
  const path  = window.location.pathname;
  links.forEach(link => {
    if (link.getAttribute('href') && path.includes(link.getAttribute('href').replace('../', '').replace('./', ''))) {
      link.classList.add('active');
    }
  });

  // 2) Header'a numara ekle (nav sağına)
  const headerInner = document.querySelector('.header-inner');
  if (headerInner) {
    const callBtn = document.createElement('a');
    callBtn.href      = TELEFON_TEL_LINK;
    callBtn.className = 'header-call-btn';
    callBtn.innerHTML = `<span class="call-icon">📞</span> ${TELEFON_NUMARASI}`;
    headerInner.appendChild(callBtn);
  }

  // 3) Sayfanın altına sabit "Hemen Ara" çubuğu ekle
  const bar = document.createElement('div');
  bar.className = 'sticky-call-bar';
  bar.innerHTML = `
    <div class="sticky-call-inner">
      <div class="sticky-call-text">
        <span class="sticky-call-title">İnternet Arızası mı yaşıyorsunuz?</span>
        <span class="sticky-call-sub">Uzmanlarımız hemen yardım etsin</span>
      </div>
      <a href="${TELEFON_TEL_LINK}" class="sticky-call-btn">
        <span>📞</span> Hemen Ara
        <span class="sticky-call-number">${TELEFON_NUMARASI}</span>
      </a>
    </div>
  `;
  document.body.appendChild(bar);

  // 4) Sitedeki tüm placeholder numaraları güncelle
  document.querySelectorAll('[data-tel]').forEach(el => {
    el.href        = TELEFON_TEL_LINK;
    el.textContent = TELEFON_NUMARASI;
  });
  document.querySelectorAll('[data-tel-display]').forEach(el => {
    el.textContent = TELEFON_NUMARASI;
  });

});
