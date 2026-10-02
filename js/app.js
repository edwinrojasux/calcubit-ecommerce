const body = document.body;
const overlay = document.querySelector('#overlay');
const sideMenu = document.querySelector('#sideMenu');
const cart = document.querySelector('#cart');
const menuOpen = document.querySelector('#menuOpen');
const menuClose = document.querySelector('#menuClose');
const cartOpen = document.querySelector('#cartOpen');
const cartClose = document.querySelector('#cartClose');
const cartItems = document.querySelector('#cartItems');
const cartBadge = document.querySelector('#cartBadge');
const cartTotal = document.querySelector('#cartTotal');
const checkoutButton = document.querySelector('#checkoutButton');
const toast = document.querySelector('#toast');
const searchForm = document.querySelector('#searchForm');
const headerSearch = document.querySelector('#headerSearch');
const filterButtons = [...document.querySelectorAll('.filters__button')];
const productCards = [...document.querySelectorAll('.product-card')];
const hoverCards = [...document.querySelectorAll('.product-card, .poster-card')];
const filterLinks = [...document.querySelectorAll('[data-filter-link]')];
const emptyState = document.querySelector('#emptyState');
const platformLinks = [...document.querySelectorAll('[data-platform-link]')];
let activeFilter = 'todos';
let activePlatform = 'todos';
let cartProducts = JSON.parse(localStorage.getItem('calcubit-cart-v2')) || [];
let toastTimer;

// Abre el menú o carrito lateral y bloquea el scroll de la página mientras el panel está visible.
function openPanel(panel){ closePanels(); panel.classList.add('is-open'); panel.setAttribute('aria-hidden','false'); overlay.hidden=false; body.classList.add('is-locked'); }

// Cierra cualquier panel lateral abierto y devuelve el desplazamiento normal a la página.
function closePanels(){ sideMenu.classList.remove('is-open'); cart.classList.remove('is-open'); sideMenu.setAttribute('aria-hidden','true'); cart.setAttribute('aria-hidden','true'); overlay.hidden=true; body.classList.remove('is-locked'); }

// Guarda el contenido del carrito para que los productos permanezcan después de recargar el navegador.
function saveCart(){ localStorage.setItem('calcubit-cart-v2',JSON.stringify(cartProducts)); }

// Formatea los precios del catálogo y del carrito como moneda mexicana.
function money(value){ return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(value); }

// Muestra una confirmación breve cuando el usuario agrega o elimina un producto.
function showToast(message){ toast.textContent=message; toast.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),1800); }

// Reconstruye el carrito desde JavaScript y actualiza automáticamente el badge y el total.
function renderCart(){
  cartBadge.textContent=cartProducts.length;
  cartTotal.textContent=money(cartProducts.reduce((sum,p)=>sum+p.price,0));
  checkoutButton.disabled=cartProducts.length===0;
  if(!cartProducts.length){ cartItems.innerHTML='<p>Tu carrito está vacío.</p>'; return; }
  cartItems.innerHTML=cartProducts.map((p,i)=>`<article class="cart__item"><img src="${p.image}" alt="${p.name}"><div><h3>${p.name}</h3><p>${money(p.price)}</p></div><button class="cart__remove" type="button" data-remove="${i}" aria-label="Eliminar ${p.name}">×</button></article>`).join('');
}

// Crea un objeto de producto a partir del botón seleccionado y lo añade al carrito.
function addProduct(button){
  const product={id:button.dataset.id,name:button.dataset.name,price:Number(button.dataset.price),image:button.dataset.image};
  cartProducts.push(product); saveCart(); renderCart(); showToast(`${product.name} se agregó al carrito.`);
}

// Elimina únicamente el producto seleccionado y vuelve a dibujar el carrito.
function removeProduct(index){ const [removed]=cartProducts.splice(index,1); saveCart(); renderCart(); showToast(`${removed.name} se eliminó del carrito.`); }

// Filtra los productos visibles combinando la categoría activa y el texto escrito en el buscador.
function applyFilters(){
  const query=headerSearch.value.trim().toLowerCase(); let visible=0;
  productCards.forEach(card=>{
    const matchCategory=activeFilter==='todos'||card.dataset.category===activeFilter;
    const matchPlatform=activePlatform==='todos'||card.dataset.platform===activePlatform;
    const matchText=card.dataset.name.toLowerCase().includes(query);
    const show=matchCategory&&matchPlatform&&matchText;
    card.classList.toggle('is-hidden',!show);
    if(show) visible++;
  });
  emptyState.hidden=visible!==0;
}

// Cambia la categoría activa, limpia el filtro por plataforma y sincroniza los botones del catálogo.
function setFilter(filter){
  activeFilter=filter;
  activePlatform='todos';
  filterButtons.forEach(btn=>btn.classList.toggle('is-active',btn.dataset.filter===filter));
  applyFilters();
}

// Filtra el catálogo por PlayStation, Xbox o Nintendo y desplaza la vista hacia los productos.
function setPlatform(platform){
  activePlatform=platform;
  activeFilter='todos';
  headerSearch.value='';
  filterButtons.forEach(btn=>btn.classList.toggle('is-active',btn.dataset.filter==='todos'));
  applyFilters();
  document.querySelector('#productos').scrollIntoView({behavior:'smooth'});
}

menuOpen.addEventListener('click',()=>openPanel(sideMenu));
menuClose.addEventListener('click',closePanels);
cartOpen.addEventListener('click',()=>openPanel(cart));
cartClose.addEventListener('click',closePanels);
overlay.addEventListener('click',closePanels);
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closePanels(); });

document.querySelectorAll('.product-add').forEach(btn=>btn.addEventListener('click',()=>addProduct(btn)));
cartItems.addEventListener('click',e=>{ const button=e.target.closest('[data-remove]'); if(button) removeProduct(Number(button.dataset.remove)); });
filterButtons.forEach(btn=>btn.addEventListener('click',()=>setFilter(btn.dataset.filter)));
filterLinks.forEach(link=>link.addEventListener('click',()=>{ if(link.dataset.filterLink){ setFilter(link.dataset.filterLink); setTimeout(()=>document.querySelector('#productos').scrollIntoView({behavior:'smooth'}),0); } closePanels(); }));
searchForm.addEventListener('submit',e=>{ e.preventDefault(); setFilter('todos'); document.querySelector('#productos').scrollIntoView({behavior:'smooth'}); });
headerSearch.addEventListener('input',()=>{ activePlatform='todos'; applyFilters(); });
checkoutButton.addEventListener('click',()=>showToast('Demo académica: checkout no disponible.'));

// Usa eventos mouseenter y mouseleave para destacar las tarjetas del catálogo y los productos destacados.
hoverCards.forEach(card=>{
  card.addEventListener('mouseenter',()=>card.classList.add('is-hovered'));
  card.addEventListener('mouseleave',()=>card.classList.remove('is-hovered'));
});

// Permite filtrar el catálogo desde las tarjetas de PlayStation, Xbox y Nintendo.
platformLinks.forEach(card=>{
  const activate=()=>setPlatform(card.dataset.platformLink);
  card.addEventListener('click',activate);
  card.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); activate(); } });
});

renderCart();

// Controla el carrusel principal: cambia de banner, actualiza los indicadores y reinicia el cambio automático.
const slides=[...document.querySelectorAll('.hero__slide')];
const dots=document.querySelector('#heroDots');
const prev=document.querySelector('#heroPrev');
const next=document.querySelector('#heroNext');
let currentSlide=0; let sliderTimer;
slides.forEach((_,i)=>{ const dot=document.createElement('button'); dot.type='button'; dot.dataset.slide=i; dot.setAttribute('aria-label',`Ver banner ${i+1}`); dots.appendChild(dot); });
const dotButtons=[...dots.querySelectorAll('button')];
function showSlide(index){ currentSlide=(index+slides.length)%slides.length; slides.forEach((slide,i)=>slide.classList.toggle('is-active',i===currentSlide)); dotButtons.forEach((dot,i)=>dot.classList.toggle('is-active',i===currentSlide)); }
function restartSlider(){ clearInterval(sliderTimer); sliderTimer=setInterval(()=>showSlide(currentSlide+1),5500); }
prev.addEventListener('click',()=>{showSlide(currentSlide-1);restartSlider();});
next.addEventListener('click',()=>{showSlide(currentSlide+1);restartSlider();});
dotButtons.forEach(dot=>dot.addEventListener('click',()=>{showSlide(Number(dot.dataset.slide));restartSlider();}));
showSlide(0); restartSlider();
