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
    modalMedia.innerHTML = images.map(src => `<img src="${src}" alt="${title}" />`).join('');
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
});

// Fake contact submit for demo
function submitContact(e){
  e.preventDefault();
  alert('Gracias — tu mensaje ha sido enviado (demo).')
  e.target.reset();
  return false;
}
