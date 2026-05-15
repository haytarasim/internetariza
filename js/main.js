// =============================================
//  NUMARA — sadece buradan değiştirin
// =============================================
const TELEFON_NUMARASI   = '0850 000 00 00';   // Görünen numara
const TELEFON_TEL_LINK   = 'tel:08500000000';   // tel: linki (boşuksuz)
// =============================================

document.addEventListener('DOMContentLoaded', () => {

  // 1) Aktif nav linkini işaretle
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
