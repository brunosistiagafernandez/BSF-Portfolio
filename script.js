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
      return `<picture><source srcset="${webp}" type="image/webp"><img src="${src}" alt="${title}" loading="lazy"></picture>`;
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
    const jpg480 = `${path}${name}-480.jpg`;
    const jpg900 = `${path}${name}-900.jpg`;
    const jpg1600 = `${path}${name}-1600.jpg`;
    const webp480 = `${path}${name}-480.webp`;
    const webp900 = `${path}${name}-900.webp`;
    const webp1600 = `${path}${name}-1600.webp`;
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
    currentLang = lang;
    localStorage.setItem('site_lang', lang);
    document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active', b.dataset.lang===lang));
  }

  document.querySelectorAll('.lang-btn').forEach(b=> b.addEventListener('click', ()=> applyTranslations(b.dataset.lang)));
  // initial
  applyTranslations(currentLang);
});

// Fake contact submit for demo
function submitContact(e){
  e.preventDefault();
  alert('Gracias — tu mensaje ha sido enviado (demo).')
  e.target.reset();
  return false;
}
