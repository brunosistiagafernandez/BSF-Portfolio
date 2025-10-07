// Pequeñas interacciones: modal project viewer, smooth reveal, form submit
document.addEventListener('DOMContentLoaded', function(){
  // Set current year
  const y = new Date().getFullYear();
  const yEl = document.getElementById('year');
  const yEl2 = document.getElementById('year2');
  if(yEl) yEl.textContent = y;
  if(yEl2) yEl2.textContent = y;

  // Projects modal (works on projects.html)
  const cards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMedia = document.getElementById('modal-media');
  const modalDesc = document.getElementById('modal-desc');
  const closeBtn = document.getElementById('modal-close');

  function openModal(card){
    if(!modal) return;
    const title = card.dataset.title || '';
    const images = (card.dataset.images || '').split(',').map(s=>s.trim()).filter(Boolean);
    const tools = card.dataset.tools || '';
    modalTitle.textContent = title;
    modalMedia.innerHTML = images.map(src => {
      // prefer webp variant if available (same name with .webp)
      const webp = src.replace(/\.[^.]+$/, '.webp');
      const srcEnc = encodeURI(src);
      const webpEnc = encodeURI(webp);
      return `<picture><source srcset="${webpEnc}" type="image/webp"><img src="${srcEnc}" alt="${title}" loading="lazy"></picture>`;
    }).join('');
    modalDesc.innerHTML = `<p><strong>Tools:</strong> ${tools}</p><p class="soft">Descripción breve del proyecto y enfoque artístico.</p>`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
  }
  cards.forEach(c=>c.addEventListener('click',()=>openModal(c)));
  if(closeBtn) closeBtn.addEventListener('click', closeModal);
  if(modal) modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });

  // Simple reveal on scroll
  const reveals = document.querySelectorAll('.container, .project-card, .about, .hero');
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{ if(en.isIntersecting) en.target.classList.add('revealed'); });
  },{threshold:0.08});
  reveals.forEach(r=>io.observe(r));
  
  // Add responsive srcset/sizes for images in assets/ automatically
  function makeSrcsetVariants(srcBase){
    // srcBase: e.g. assets/hero.jpg or assets/project1-1.jpg
    const parts = srcBase.split('/');
    const filename = parts.pop();
    const path = parts.join('/') + (parts.length ? '/' : '');
    const name = filename.replace(/\.[^.]+$/, '');
    // variants: 480, 900, 1600
    // encode URIs to safely handle spaces and special chars
    const enc = s => encodeURI(s);
    const jpg480 = enc(`${path}${name}-480.jpg`);
    const jpg900 = enc(`${path}${name}-900.jpg`);
    const jpg1600 = enc(`${path}${name}-1600.jpg`);
    const webp480 = enc(`${path}${name}-480.webp`);
    const webp900 = enc(`${path}${name}-900.webp`);
    const webp1600 = enc(`${path}${name}-1600.webp`);
    return {
      webp: `${webp480} 480w, ${webp900} 900w, ${webp1600} 1600w`,
      jpg: `${jpg480} 480w, ${jpg900} 900w, ${jpg1600} 1600w`,
      sizes: '(max-width:600px) 100vw, (max-width:900px) 50vw, 33vw'
    };
  }

  function enhanceImages(){
    const imgs = document.querySelectorAll('img[src^="assets/"]');
    imgs.forEach(img => {
      if(img.hasAttribute('srcset')) return; // don't overwrite existing
      const src = img.getAttribute('src');
      const variants = makeSrcsetVariants(src);
      img.setAttribute('srcset', variants.jpg);
      img.setAttribute('sizes', variants.sizes);
    });

    // Enhance pictures: add webp source srcset if source[type=image/webp] exists without srcset
    const pictures = document.querySelectorAll('picture');
    pictures.forEach(pic => {
      const img = pic.querySelector('img');
      if(!img) return;
      const src = img.getAttribute('src');
      const variants = makeSrcsetVariants(src);
      let webpSource = Array.from(pic.querySelectorAll('source')).find(s=>s.getAttribute('type')==='image/webp');
      if(webpSource){
        if(!webpSource.getAttribute('srcset')) webpSource.setAttribute('srcset', variants.webp);
      } else {
        const s = document.createElement('source');
        s.setAttribute('type','image/webp');
        s.setAttribute('srcset', variants.webp);
        pic.insertBefore(s, img);
      }
      if(!img.getAttribute('srcset')) img.setAttribute('srcset', variants.jpg);
      if(!img.getAttribute('sizes')) img.setAttribute('sizes', variants.sizes);
    });
  }

  // Run enhancer once DOM is ready
  enhanceImages();
  
  // --- Simple i18n loader ---
  const defaultLang = 'es';
  let currentLang = localStorage.getItem('site_lang') || defaultLang;

  async function loadTranslations(lang){
    try{
      const res = await fetch(`i18n/${lang}.json`);
      if(!res.ok) throw new Error('no translations');
      return await res.json();
    }catch(e){
      console.warn('i18n load failed for', lang, e);
      return null;
    }
  }

  async function applyTranslations(lang){
    const dict = await loadTranslations(lang);
    if(!dict) return;
    // expose translations for other code
    window.TRANSLATIONS = window.TRANSLATIONS || {};
    window.TRANSLATIONS[lang] = dict;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const parts = key.split('.');
      let val = dict;
      for(const p of parts){ if(val && p in val) val = val[p]; else { val = null; break } }
      if(val) el.textContent = val;
    });
    // placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const key = el.getAttribute('data-i18n-placeholder');
      const parts = key.split('.');
      let val = dict;
      for(const p of parts){ if(val && p in val) val = val[p]; else { val = null; break } }
      if(val) el.setAttribute('placeholder', val);
    });
    // alt attributes
    document.querySelectorAll('[data-i18n-alt]').forEach(el=>{
      const key = el.getAttribute('data-i18n-alt');
      const parts = key.split('.');
      let val = dict;
      for(const p of parts){ if(val && p in val) val = val[p]; else { val = null; break } }
      if(val) el.setAttribute('alt', val);
    });
    currentLang = lang;
    localStorage.setItem('site_lang', lang);
    document.querySelectorAll('.lang-btn').forEach(b=>{ b.classList.toggle('active', b.dataset.lang===lang); b.setAttribute('aria-pressed', b.dataset.lang===lang ? 'true' : 'false') });
  }

  document.querySelectorAll('.lang-btn').forEach(b=> b.addEventListener('click', ()=> applyTranslations(b.dataset.lang)));
  // initial
  applyTranslations(currentLang);
  
  // Use translations in modal if available
  function translateModalForKey(key){
    const dict = window.TRANSLATIONS && window.TRANSLATIONS[currentLang];
    if(!dict) return null;
    const proj = dict.projects && dict.projects.items && dict.projects.items[key];
    return {
      title: proj && proj.title,
      desc: proj && proj.desc,
      toolsLabel: dict.modal && dict.modal.tools_label,
      closeText: dict.modal && dict.modal.close
    };
  }

  // override openModal to prefer translations when data-key exists
  const originalOpenModal = openModal;
  function openModalWithI18n(card){
    if(!modal) return;
    const key = card.dataset.key;
    const images = (card.dataset.images || '').split(',').map(s=>s.trim()).filter(Boolean);
    const tools = card.dataset.tools || '';
    if(key){
      const t = translateModalForKey(key);
      modalTitle.textContent = (t && t.title) ? t.title : (card.dataset.title || '');
      modalMedia.innerHTML = images.map(src => {
        const webp = src.replace(/\.[^.]+$/, '.webp');
        const srcEnc = encodeURI(src);
        const webpEnc = encodeURI(webp);
        return `<picture><source srcset="${webpEnc}" type="image/webp"><img src="${srcEnc}" alt="${t && t.title ? t.title : ''}" loading="lazy"></picture>`;
      }).join('');
      const toolsLabel = (t && t.toolsLabel) ? t.toolsLabel : 'Tools:';
      const desc = (t && t.desc) ? t.desc : (`<strong>Tools:</strong> ${tools}`);
      modalDesc.innerHTML = `<p><strong>${toolsLabel}</strong> ${tools}</p><p class="soft">${ (t && t.desc) ? t.desc : 'Descripción breve del proyecto y enfoque artístico.' }</p>`;
      // close button text
      if(closeBtn){
        const closeText = (t && t.closeText) ? t.closeText : ((window.TRANSLATIONS && window.TRANSLATIONS[currentLang] && window.TRANSLATIONS[currentLang].modal && window.TRANSLATIONS[currentLang].modal.close) || 'Cerrar');
        closeBtn.textContent = closeText;
      }
    } else {
      originalOpenModal(card);
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  }
  // replace event handlers
  cards.forEach(c=>{
    c.removeEventListener('click', ()=>openModal(c));
    c.addEventListener('click', ()=>openModalWithI18n(c));
  });

  // --- Carousel autoplay & controls for category-grid ---
  const carousel = document.querySelector('.projects-category .category-grid');
  if(carousel){
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let autoplayInterval = null;
    const cardWidth = () => {
      const card = carousel.querySelector('.project-card');
      return card ? card.getBoundingClientRect().width + 18 : 380; // gap fallback
    };
    function scrollNext(){
      carousel.scrollBy({ left: cardWidth(), behavior: 'smooth' });
    }
    function scrollPrev(){
      carousel.scrollBy({ left: -cardWidth(), behavior: 'smooth' });
    }
    function startAutoplay(){
      stopAutoplay();
      autoplayInterval = setInterval(()=>{ scrollNext(); }, 3500);
    }
    function stopAutoplay(){ if(autoplayInterval){ clearInterval(autoplayInterval); autoplayInterval=null; } }
    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    // Buttons
    if(prevBtn) prevBtn.addEventListener('click', ()=>{ stopAutoplay(); scrollPrev(); });
    if(nextBtn) nextBtn.addEventListener('click', ()=>{ stopAutoplay(); scrollNext(); });
    // Scale card on hover via class toggle
    carousel.querySelectorAll('.project-card').forEach(card=>{
      card.addEventListener('mouseenter', ()=>{ card.classList.add('focused'); });
      card.addEventListener('mouseleave', ()=>{ card.classList.remove('focused'); });
    });
    // start
    startAutoplay();
  }
});

// Fake contact submit for demo
function submitContact(e){
  e.preventDefault();
  alert('Gracias — tu mensaje ha sido enviado (demo).')
  e.target.reset();
  return false;
}
