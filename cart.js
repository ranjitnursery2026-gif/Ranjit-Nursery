// ═══════════════════════════════════════════════════════════════
// RANJIT NURSERY — E-Commerce Cart & Checkout Module
// ═══════════════════════════════════════════════════════════════

import { supabase } from './supabase.js';

// ─── Product Catalog ─────────────────────────────────────────
export let PRODUCTS = [];

// ─── Cart State ──────────────────────────────────────────────
let cart = [];
let appliedCoupon = null;
export let allowedPincodes = [];
export let allowedPincodesData = [];
export let verifiedPincode = null;

// ─── Global Store Settings ───────────────────────────────────
export let orderWhatsapp = '919692905128';
export let inquiryWhatsapp = '917735227575';
export let servicesWhatsapp = '916371900967';

const VALID_COUPONS = {
  'WELCOME10': { type: 'percent', value: 10, minSpend: 0 },
  'SAVE10': { type: 'percent', value: 10, minSpend: 700 },
  'MEGA16': { type: 'percent', value: 16, minSpend: 1000 }
};

export function applyCoupon() {
  const inputEl = document.getElementById('promo-code-input');
  const msgEl = document.getElementById('promo-message');
  if (!inputEl || !msgEl) return;
  
  const code = inputEl.value.trim().toUpperCase();
  const subtotal = getCartTotal();
  
  msgEl.classList.remove('hidden', 'text-emerald-600', 'text-red-500');
  
  if (!code) {
    appliedCoupon = null;
    msgEl.classList.add('hidden');
    renderCheckoutSummary();
    return;
  }
  
  const coupon = VALID_COUPONS[code];
  if (!coupon) {
    appliedCoupon = null;
    msgEl.textContent = 'Invalid promo code.';
    msgEl.classList.add('text-red-500');
  } else if (subtotal < coupon.minSpend) {
    appliedCoupon = null;
    msgEl.textContent = `Minimum spend of ₹${coupon.minSpend} required.`;
    msgEl.classList.add('text-red-500');
  } else {
    appliedCoupon = { code, ...coupon };
    msgEl.textContent = 'Coupon applied successfully!';
    msgEl.classList.add('text-emerald-600');
  }
  
  renderCheckoutSummary();
}

function saveCart() {
  localStorage.setItem('ranjitNurseryCart', JSON.stringify(cart));
}

function loadCart() {
  try {
    const saved = localStorage.getItem('ranjitNurseryCart');
    cart = saved ? JSON.parse(saved) : [];
  } catch { cart = []; }
}

export function getCart() { return cart; }

export function addToCart(productId, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  const stock = product.stock !== undefined && product.stock !== null ? product.stock : 10;
  if (stock <= 0) {
    showToast(`Sorry, ${product.name} is currently out of stock!`);
    return;
  }
  
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    if (existing.qty + qty > stock) {
      showToast(`Cannot add more. Only ${stock} left in stock.`);
      return;
    }
    existing.qty += qty;
  } else {
    if (qty > stock) {
      showToast(`Only ${stock} left in stock.`);
      return;
    }
    cart.push({ ...product, qty });
  }
  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart!`);
}

export function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
}

export function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  const stock = product.stock !== undefined && product.stock !== null ? product.stock : 10;
  if (delta > 0 && item.qty + delta > stock) {
    showToast(`Cannot add more. Only ${stock} left in stock.`);
    return;
  }
  
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
  updateCartUI();
}

export function getCartTotal() {
  return cart.reduce((sum, item) => {
    let itemTotal = item.price * item.qty;
    // B2B Wholesale Discount: 20% off if qty >= 50
    if (item.qty >= 50) {
      itemTotal = itemTotal * 0.8;
    }
    return sum + itemTotal;
  }, 0);
}

export function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

export function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

// ─── Toast Notification ──────────────────────────────────────
function showToast(message) {
  const existing = document.getElementById('cart-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'cart-toast';
  toast.className = 'fixed bottom-6 right-6 z-[200] bg-emerald-800 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transform translate-y-4 opacity-0 transition-all duration-300';
  toast.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5 text-green-300"></i><span class="font-medium text-sm">${message}</span>`;
  document.body.appendChild(toast);
  if (typeof lucide !== 'undefined') lucide.createIcons();
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ─── Render Product Cards ────────────────────────────────────
let currentCategoryFilter = null;
let isViewAll = false;

export function filterProducts(categoryName) {
  currentCategoryFilter = categoryName;
  isViewAll = false; // Reset view all state when filtering
  renderProducts();
  
  // Scroll to products section smoothly
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

export function clearFilter() {
  currentCategoryFilter = null;
  const isProductsPage = window.location.pathname.includes('products');
  if (isProductsPage) {
    isViewAll = true;
    window.history.pushState({}, '', 'products.html');
  } else {
    isViewAll = false;
  }
  renderProducts();
}

export function showAllProducts() {
  isViewAll = true;
  currentCategoryFilter = null;
  renderProducts();
}

export function renderProducts() {
  const grids = document.querySelectorAll('.products-grid-container');
  const emptyState = document.getElementById('products-empty-state');
  const filterStatus = document.getElementById('filter-status-container');
  const filterBadge = document.getElementById('active-filter-badge');
  
  if (grids.length === 0) return;

  // Filter & Slice products
  let displayProducts = PRODUCTS;
  if (currentCategoryFilter) {
    const filterLower = currentCategoryFilter.toLowerCase();
    displayProducts = PRODUCTS.filter(p => {
      if (!p.categories) return false;
      let cats = p.categories;
      if (typeof cats === 'string') {
        try { cats = JSON.parse(cats); } catch(e) { cats = []; }
      }
      if (Array.isArray(cats)) {
        return cats.some(c => c.toLowerCase().includes(filterLower));
      }
      return false;
    });
  } else if (!isViewAll) {
    displayProducts = PRODUCTS.slice(0, 8); // Show only top 8 on default landing view
  }

  // Update View All Button Visibility
  const viewAllContainer = document.getElementById('view-all-container');
  if (viewAllContainer) {
    if (!currentCategoryFilter && !isViewAll && PRODUCTS.length > 8) {
      viewAllContainer.classList.remove('hidden');
    } else {
      viewAllContainer.classList.add('hidden');
    }
  }

  // Update Filter UI
  if (currentCategoryFilter) {
    filterStatus?.classList.remove('hidden');
    filterStatus?.classList.add('flex');
    if (filterBadge) filterBadge.textContent = currentCategoryFilter;
  } else {
    filterStatus?.classList.add('hidden');
    filterStatus?.classList.remove('flex');
  }

  // Update Empty State vs Grid
  if (displayProducts.length === 0) {
    grids.forEach(grid => grid.classList.add('hidden'));
    emptyState?.classList.remove('hidden');
  } else {
    grids.forEach(grid => grid.classList.remove('hidden'));
    emptyState?.classList.add('hidden');
    
    // Render Products
    const productsHTML = displayProducts.map((p, i) => {
      const delayClass = ['delay-100', 'delay-200', 'delay-300'][i % 3];
      const badgeHTML = p.badge
        ? `<div class="absolute top-4 right-4 ${p.badge === 'Specialty' ? 'bg-accent' : p.badge === 'Bestseller' ? 'bg-amber-500' : 'bg-primary'} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
             <i data-lucide="${p.badge === 'Specialty' ? 'star' : p.badge === 'Bestseller' ? 'flame' : 'trending-up'}" class="w-3 h-3"></i> ${p.badge}
           </div>`
        : '';
      
      // Get the primary category to display (just the first one in the array, or a fallback)
      const displayCategory = p.categories && p.categories.length > 0 ? p.categories[0] : 'General';

      // Check for Carpet Grass customization
      const isCarpetGrass = p.name.toLowerCase().includes('carpet grass');

      let priceHTML = `<span class="text-base md:text-xl font-outfit font-extrabold text-primary">₹${p.price}</span>`;
      if (isCarpetGrass) {
        priceHTML = `<span class="text-sm md:text-base font-outfit font-extrabold text-primary mt-0.5 md:mt-1 text-right">₹3-15 <span class="text-[9px] md:text-xs font-semibold text-gray-500 block">/ sq. ft.</span></span>`;
      } else if (p.mrp && p.mrp > p.price) {
        const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
        priceHTML = `
          <div class="flex flex-col items-end">
            <div class="flex items-center gap-1 md:gap-1.5">
              <span class="text-[10px] md:text-xs font-semibold text-gray-400 line-through">₹${p.mrp}</span>
              <span class="text-[9px] md:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded uppercase tracking-wider">${discount}% OFF</span>
            </div>
            <span class="text-base md:text-xl font-outfit font-extrabold text-primary leading-none mt-0.5">₹${p.price}</span>
          </div>
        `;
      }

      const availStatus = p.availability_status || 'In Stock';
      let actionButtonsHTML = '';
      
      if (availStatus === 'Coming Soon') {
          actionButtonsHTML = `<div class="w-full bg-orange-500 text-white font-bold py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-center shadow-md flex items-center justify-center gap-1 md:gap-2 text-[11px] md:text-sm"><i data-lucide="clock" class="w-3 h-3 md:w-4 md:h-4"></i> <span class="hidden sm:inline">Coming Soon</span><span class="sm:hidden">Soon</span></div>`;
      } else if (availStatus === 'Not Available') {
          actionButtonsHTML = `<div class="w-full bg-gray-100 text-gray-500 font-bold py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-center border border-gray-200 flex items-center justify-center gap-1 md:gap-2 text-[11px] md:text-sm shadow-sm"><i data-lucide="slash" class="w-3 h-3 md:w-4 md:h-4"></i> <span class="hidden sm:inline">Not Available</span><span class="sm:hidden">N/A</span></div>`;
      } else if (availStatus === 'Out of Stock' || p.is_available === false || (p.stock !== undefined && p.stock !== null ? p.stock : 10) <= 0) {
          actionButtonsHTML = `<div class="w-full bg-red-50 text-red-600 font-bold py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-center border border-red-100 flex items-center justify-center gap-1 md:gap-2 text-[11px] md:text-sm"><i data-lucide="x-circle" class="w-3 h-3 md:w-4 md:h-4"></i> <span class="hidden sm:inline">Out of Stock</span><span class="sm:hidden">Sold Out</span></div>`;
      } else {
          // IN STOCK
          const primaryButtons = `${isCarpetGrass 
              ? `<div class="flex-1 bg-emerald-50 text-emerald-700 font-semibold py-1.5 md:py-2.5 rounded-lg md:rounded-xl border border-emerald-200 flex items-center justify-center gap-1 md:gap-1.5 text-[11px] md:text-sm shadow-sm">
                  <i data-lucide="check-circle" class="w-3 h-3 md:w-4 md:h-4"></i> <span class="hidden sm:inline">Available</span>
                </div>`
              : `<button onclick="window.RanjitCart.addToCart(${p.id})" class="flex-1 bg-primary hover:bg-emerald-800 text-white font-semibold py-1.5 md:py-2.5 rounded-lg md:rounded-xl transition-all text-[11px] md:text-sm flex items-center justify-center gap-1 md:gap-1.5 shadow-md hover:shadow-lg">
                  <i data-lucide="shopping-cart" class="w-3 h-3 md:w-4 md:h-4"></i> <span class="hidden sm:inline">Add to Cart</span><span class="sm:hidden">Add</span>
                </button>`
            }
            ${isCarpetGrass
              ? `<a href="tel:+917978809687" class="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold py-1.5 md:py-2.5 rounded-lg md:rounded-xl border border-amber-200 flex items-center justify-center gap-1 md:gap-1.5 text-[11px] md:text-sm shadow-sm transition-colors">
                  <i data-lucide="phone-call" class="w-3 h-3 md:w-4 md:h-4"></i> <span class="hidden sm:inline">Contact</span><span class="sm:hidden">Call</span>
                </a>`
              : `<div class="flex-1 bg-amber-50 text-amber-700 font-semibold py-1.5 md:py-2.5 rounded-lg md:rounded-xl border border-amber-200 flex items-center justify-center gap-1 md:gap-1.5 text-[11px] md:text-sm shadow-sm">
                  <i data-lucide="home" class="w-3 h-3 md:w-4 md:h-4"></i> <span class="hidden sm:inline">In Stock: </span><span class="sm:hidden">Left: </span>${p.stock !== undefined && p.stock !== null ? p.stock : 10}
                </div>`
            }`;

          actionButtonsHTML = `
            <div class="flex flex-col gap-1 w-full">
              <div class="flex gap-2 w-full">
                ${primaryButtons}
              </div>
              <a href="https://wa.me/${window.RanjitCart ? window.RanjitCart.inquiryWhatsapp : inquiryWhatsapp}?text=Hi,%20I%20am%20looking%20for%20bulk/wholesale%20rates%20for%20${encodeURIComponent(p.name)}." target="_blank" class="w-full text-center text-blue-600 hover:text-blue-800 font-bold py-1 flex items-center justify-center gap-1 text-[10px] md:text-xs transition-colors mt-0.5">
                <i data-lucide="message-circle" class="w-3 h-3"></i> Request Wholesale Price
              </a>
            </div>
          `;
      }

      return `
        <div class="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group animate-on-scroll opacity-0 translate-y-8 ${delayClass} flex flex-col">
          <div class="relative h-36 md:h-56 overflow-hidden shrink-0">
            <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
            ${badgeHTML}
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          <div class="p-3 md:p-5 flex flex-col flex-grow">
            <div>
              <div class="flex items-start justify-between mb-1 gap-2">
                <span class="text-[9px] md:text-xs font-bold uppercase tracking-wider text-primary/70 mt-1 truncate">${displayCategory}</span>
                ${priceHTML}
              </div>
              <h3 class="text-sm md:text-base font-outfit font-bold text-gray-900 mb-1 leading-snug line-clamp-2">${p.name}</h3>
              <div class="flex items-center gap-1 mb-1.5">
                <i data-lucide="star" class="w-3 h-3 text-amber-500 ${p.avgRating > 0 ? 'fill-amber-500' : ''}"></i>
                <span class="text-[10px] md:text-xs font-bold text-gray-700">${p.avgRating > 0 ? p.avgRating.toFixed(1) : 'New'}</span>
                ${p.reviewCount > 0 ? `<span class="text-[9px] md:text-[10px] text-gray-400 ml-0.5">(${p.reviewCount})</span>` : ''}
              </div>
              <p class="text-gray-500 text-[10px] md:text-xs mb-2 line-clamp-1">${p.description || ''}</p>
            </div>
            <div class="mt-auto pt-3 border-t border-gray-50 w-full">
              ${actionButtonsHTML}
            </div>
          </div>
        </div>`;
    }).join('');

    grids.forEach(grid => grid.innerHTML = productsHTML);

    // Re-init Lucide icons for the new DOM elements
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Observe new elements for scroll animation
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-8');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    grids.forEach(grid => {
      grid.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    });
  }
}

// ─── Cart Badge Update ───────────────────────────────────────
function updateCartUI() {
  // Update all badge elements
  document.querySelectorAll('.cart-badge').forEach(badge => {
    const count = getCartCount();
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
    // Pulse animation
    badge.classList.add('animate-bounce');
    setTimeout(() => badge.classList.remove('animate-bounce'), 500);
  });
  renderCartDrawerItems();
}

// ─── Cart Drawer Rendering ───────────────────────────────────
function renderCartDrawerItems() {
  const list = document.getElementById('cart-items-list');
  const emptyMsg = document.getElementById('cart-empty');
  const subtotalEl = document.getElementById('cart-subtotal');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = '';
    if (emptyMsg) emptyMsg.classList.remove('hidden');
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = '<i data-lucide="credit-card" class="w-5 h-5"></i> Proceed to Checkout';
    }
    return;
  }

  if (emptyMsg) emptyMsg.classList.add('hidden');
  
  if (checkoutBtn) {
    if (!verifiedPincode) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = '<i data-lucide="map-pin" class="w-5 h-5"></i> Verify Pincode to Proceed';
    } else {
      checkoutBtn.disabled = false;
      checkoutBtn.innerHTML = '<i data-lucide="credit-card" class="w-5 h-5"></i> Proceed to Checkout';
    }
  }

  list.innerHTML = cart.map(item => {
    const originalPrice = item.price * item.qty;
    let finalPrice = originalPrice;
    let b2bBadge = '';
    
    if (item.qty >= 50) {
      finalPrice = originalPrice * 0.8;
      b2bBadge = `<span class="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider block mt-1 w-max shadow-sm">B2B Discount (20% Off)</span>`;
    }

    return `
      <div class="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-100 transition-all hover:border-primary/20">
        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm" />
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-gray-900 text-sm truncate">${item.name}</h4>
          <p class="text-primary font-bold text-sm">₹${item.price}</p>
          ${b2bBadge}
          <div class="flex items-center gap-2 mt-1">
            <button onclick="window.RanjitCart.updateQty(${item.id}, -1)" class="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm flex items-center justify-center transition-colors">−</button>
            <span class="font-bold text-sm w-6 text-center">${item.qty}</span>
            <button onclick="window.RanjitCart.updateQty(${item.id}, 1)" class="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm flex items-center justify-center transition-colors">+</button>
          </div>
        </div>
        <div class="text-right flex flex-col items-end gap-1">
          ${item.qty >= 50 ? `<span class="text-xs text-gray-400 line-through font-semibold">₹${originalPrice}</span>` : ''}
          <span class="font-bold text-gray-900 text-sm">₹${finalPrice}</span>
          <button onclick="window.RanjitCart.removeFromCart(${item.id})" class="text-red-400 hover:text-red-600 transition-colors p-1" title="Remove">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = `₹${getCartTotal().toLocaleString('en-IN')}`;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ─── Cart Drawer Toggle ──────────────────────────────────────
export function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (!drawer) return;
  renderCartDrawerItems();
  drawer.classList.remove('translate-x-full');
  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.remove('opacity-0'), 10);
  document.body.style.overflow = 'hidden';
}

export function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (!drawer) return;
  drawer.classList.add('translate-x-full');
  overlay.classList.add('opacity-0');
  setTimeout(() => overlay.classList.add('hidden'), 300);
  document.body.style.overflow = '';
}

// ─── Render Checkout Summary ─────────────────────────────────
function renderCheckoutSummary() {
  const summaryContainer = document.getElementById('checkout-order-summary');
  if (!summaryContainer) return;

  const shippingSelect = document.getElementById('checkout-shipping');
  let shippingCost = 0;
  if (shippingSelect) {
    if (shippingSelect.value.includes('Standard')) shippingCost = 50;
    else if (shippingSelect.value.includes('Express')) shippingCost = 100;
  }

  const subtotal = getCartTotal();
  const dynamicBanner = document.getElementById('dynamic-coupon-banner');
  
  // Smart Coupon Suggestion Engine
  if (dynamicBanner) {
    dynamicBanner.classList.remove('hidden');
    if (subtotal >= 1000) {
      dynamicBanner.innerHTML = `<i data-lucide="party-popper" class="w-4 h-4 text-amber-500 shrink-0"></i> <span>Awesome! Use code <strong class="bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-900">MEGA16</strong> for 16% OFF!</span>`;
      dynamicBanner.className = "mb-3 text-xs sm:text-sm font-bold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-start gap-2";
    } else if (subtotal >= 700) {
      dynamicBanner.innerHTML = `<i data-lucide="gift" class="w-4 h-4 text-emerald-500 shrink-0"></i> <span>Yay! Use code <strong class="bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-900">SAVE10</strong> for 10% OFF! <span class="block mt-1 font-medium opacity-80 text-xs">Add ₹${(1000 - subtotal).toLocaleString('en-IN')} more to unlock 16% OFF</span></span>`;
      dynamicBanner.className = "mb-3 text-xs sm:text-sm font-bold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-start gap-2";
    } else {
      dynamicBanner.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4 text-blue-500 shrink-0"></i> <span>New here? Use <strong class="bg-blue-200 px-1.5 py-0.5 rounded text-blue-900">WELCOME10</strong> for 10% OFF! <span class="block mt-1 font-medium opacity-80 text-xs">Add ₹${(700 - subtotal).toLocaleString('en-IN')} more to unlock better deals</span></span>`;
      dynamicBanner.className = "mb-3 text-xs sm:text-sm font-bold px-3 py-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-start gap-2";
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  let discountAmount = 0;
  
  // Re-verify coupon min-spend
  if (appliedCoupon && subtotal < appliedCoupon.minSpend) {
    appliedCoupon = null;
    const msgEl = document.getElementById('promo-message');
    if (msgEl) {
      msgEl.classList.remove('hidden', 'text-emerald-600');
      msgEl.classList.add('text-red-500');
      msgEl.textContent = 'Coupon removed. Cart total is below minimum spend.';
    }
  }

  let originalShipping = shippingCost;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') discountAmount = (subtotal * appliedCoupon.value) / 100;
    else if (appliedCoupon.type === 'flat') discountAmount = appliedCoupon.value;
    else if (appliedCoupon.type === 'shipping') shippingCost = 0;
  }

  const total = (subtotal + shippingCost) - discountAmount;

  summaryContainer.innerHTML = cart.map(item => `
    <div class="flex justify-between items-center text-sm py-1.5 border-b border-gray-100 last:border-0">
      <span class="text-gray-700">${item.name} × ${item.qty}</span>
      <span class="font-bold text-gray-900">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
    </div>
  `).join('');

  if (appliedCoupon && appliedCoupon.type === 'shipping') {
    summaryContainer.innerHTML += `
    <div class="flex justify-between items-center text-sm py-1.5 border-b border-gray-100 last:border-0">
      <span class="text-gray-600">Delivery Charges</span>
      <span class="font-bold text-emerald-600">Free <span class="text-xs text-emerald-500 opacity-80">(${appliedCoupon.code})</span></span>
    </div>`;
  } else if (shippingCost > 0) {
    summaryContainer.innerHTML += `
    <div class="flex justify-between items-center text-sm py-1.5 border-b border-gray-100 last:border-0">
      <span class="text-gray-600">Delivery Charges</span>
      <span class="font-bold text-gray-900">+₹${shippingCost}</span>
    </div>`;
  } else {
    summaryContainer.innerHTML += `
    <div class="flex justify-between items-center text-sm py-1.5 border-b border-gray-100 last:border-0">
      <span class="text-gray-600">Delivery Charges</span>
      <span class="font-bold text-emerald-600">Free</span>
    </div>`;
  }

  if (discountAmount > 0) {
    summaryContainer.innerHTML += `
    <div class="flex justify-between items-center text-sm py-1.5 border-b border-gray-100 last:border-0">
      <span class="text-emerald-600 flex items-center gap-1"><i data-lucide="tag" class="w-3 h-3"></i> Discount (${appliedCoupon.code})</span>
      <span class="font-bold text-emerald-600">-₹${discountAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
    </div>`;
  }

  summaryContainer.innerHTML += `
    <div class="flex justify-between items-center text-base pt-3 mt-2 border-t-2 border-primary/20">
      <span class="font-bold text-gray-900">Total Amount</span>
      <span class="font-extrabold text-primary text-xl">₹${total.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
    </div>`;
}

// ─── Checkout Modal ──────────────────────────────────────────
export function openCheckoutModal() {
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  const overlay = document.getElementById('checkout-overlay');
  const content = document.getElementById('checkout-content');
  if (!modal) return;

  // Render order summary inside the modal
  renderCheckoutSummary();

  const checkoutPincodeInput = document.getElementById('checkout-pincode');
  if (checkoutPincodeInput && verifiedPincode) {
    checkoutPincodeInput.value = verifiedPincode;
    checkoutPincodeInput.dispatchEvent(new Event('input'));
  }

  generateCaptcha();

  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    if (content) {
      content.classList.remove('scale-95');
      content.classList.add('scale-100');
    }
  }, 10);
  document.body.style.overflow = 'hidden';
}

export function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  const content = document.getElementById('checkout-content');
  if (!modal) return;
  modal.classList.add('opacity-0');
  if (content) {
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
  }
  setTimeout(() => modal.classList.add('hidden'), 300);
  document.body.style.overflow = '';
}

// ─── Place Order via WhatsApp & Supabase ──────────────────────
export async function placeOrder() {
  const custName = document.getElementById('checkout-name')?.value?.trim();
  const custAddr = document.getElementById('checkout-address')?.value?.trim();
  const custPhone = document.getElementById('checkout-phone')?.value?.trim();
  const custPincode = document.getElementById('checkout-pincode')?.value?.trim();
  const shipping = document.getElementById('checkout-shipping')?.value;
  const utr = document.getElementById('checkout-utr')?.value?.trim();

  const pincodeError = document.getElementById('pincode-error');
  if (pincodeError) pincodeError.classList.add('hidden');

  if (!custName || !custAddr || !custPhone || !custPincode) {
    alert('Please fill in your Name, Address, Pincode, and Phone Number.');
    return;
  }

  // Rate Limiting Check (Max 2 orders per 30 mins)
  const rateLimitKey = 'ranjitNursery_orderLogs';
  const logs = JSON.parse(localStorage.getItem(rateLimitKey) || '[]');
  const now = Date.now();
  const recentLogs = logs.filter(time => now - time < 30 * 60 * 1000);
  if (recentLogs.length >= 2) {
    alert('You have reached the maximum order limit for now. Please try again after 30 minutes to prevent spam.');
    return;
  }

  // Captcha Check
  const captchaInput = document.getElementById('captcha-answer');
  const captchaError = document.getElementById('captcha-error');
  if (captchaInput && window.currentCaptchaAnswer) {
    if (parseInt(captchaInput.value) !== window.currentCaptchaAnswer) {
      if (captchaError) captchaError.classList.remove('hidden');
      captchaInput.focus();
      return;
    } else {
      if (captchaError) captchaError.classList.add('hidden');
    }
  }

  const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'upi';
  const utrError = document.getElementById('utr-error');

  if (paymentMethod === 'upi') {
    if (!utr || utr.length !== 12 || !/^\d{12}$/.test(utr)) {
      if (utrError) utrError.classList.remove('hidden');
      document.getElementById('checkout-utr')?.focus();
      return;
    } else {
      if (utrError) utrError.classList.add('hidden');
    }
  }

  // Pincode Validation
  if (allowedPincodes.length > 0 && !allowedPincodes.includes(custPincode)) {
    if (pincodeError) {
      pincodeError.classList.remove('hidden');
      document.getElementById('checkout-pincode').focus();
    } else {
      alert("Sorry, we don't deliver to this area yet.");
    }
    return;
  }

  const btn = document.getElementById('place-order-btn');
  const originalBtnText = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Processing...`;
  btn.disabled = true;

  try {
    // Log order for rate limiting
    logs.push(now);
    localStorage.setItem(rateLimitKey, JSON.stringify(logs));

    // 1. Calculate Costs
    let shippingCost = 0;
    if (shipping && shipping.includes('Standard')) shippingCost = 50;
    else if (shipping && shipping.includes('Express')) shippingCost = 100;

    const subtotal = getCartTotal();
    let discountAmount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percent') discountAmount = (subtotal * appliedCoupon.value) / 100;
      else if (appliedCoupon.type === 'flat') discountAmount = appliedCoupon.value;
      else if (appliedCoupon.type === 'shipping') shippingCost = 0;
    }

    const total = (subtotal + shippingCost) - discountAmount;
    
    // Generate Order ID (Local Time)
    const d = new Date();
    const dateStr = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    const randStr = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${dateStr}-${randStr}`;

    // 2. Insert into Supabase 'orders' table
    if (supabase) {
      const { error } = await supabase.from('orders').insert({
        id: orderId,
        customer_name: custName,
        customer_phone: custPhone,
        customer_address: custAddr,
        pincode: custPincode,
        shipping_method: shipping || 'Standard',
        items: cart,
        total_amount: total,
        payment_method: paymentMethod,
        utr: paymentMethod === 'upi' ? utr : null,
        status: 'Processing'
      });
      if (error) {
        console.error("Supabase order insert error:", error);
        throw new Error("Failed to save order to database.");
      }
    }

    // 3. Build WhatsApp Message
    let msg = `🌿 *NEW ORDER — Ranjit Nursery* 🌿\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `*Order ID:* ${orderId}\n`;
    msg += `*Customer:* ${custName}\n`;
    msg += `*Phone:* ${custPhone}\n`;
    msg += `*Address:* ${custAddr}\n`;
    msg += `*Shipping:* ${shipping || 'Standard'}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `*Order Items:*\n`;
    cart.forEach((item, i) => {
      msg += `${i + 1}. ${item.name} × ${item.qty} = ₹${(item.price * item.qty).toLocaleString('en-IN')}\n`;
    });
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
    if (appliedCoupon && appliedCoupon.type === 'shipping') {
      msg += `*Delivery Fee:* Free (Promo: ${appliedCoupon.code})\n`;
    } else if (shippingCost > 0) {
      msg += `*Delivery Fee:* ₹${shippingCost}\n`;
    } else {
      msg += `*Delivery Fee:* Free\n`;
    }
    
    if (discountAmount > 0) {
      msg += `*Discount (${appliedCoupon.code}):* -₹${discountAmount.toLocaleString('en-IN', {maximumFractionDigits:0})}\n`;
    }
    
    msg += `*Total Amount: ₹${total.toLocaleString('en-IN', {maximumFractionDigits:0})}*\n`;
    msg += `*Payment Method:* ${paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery (COD)'}\n`;
    if (paymentMethod === 'upi' && utr) {
      msg += `*UPI Txn Ref / UTR:* ${utr}\n`;
    }
    if (paymentMethod === 'cod') {
      msg += `\n*Note:* Please call me to verify this COD order.\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `Thank you for ordering from Ranjit Nursery! 🙏`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${orderWhatsapp}?text=${encoded}`, '_blank');

    // 4. Deduct stock in Supabase
    cart.forEach(async (item) => {
      const product = PRODUCTS.find(p => p.id === item.id);
      if (!product) return;
      
      const currentStock = product.stock !== undefined && product.stock !== null ? product.stock : 10;
      const newStock = Math.max(0, currentStock - item.qty);
      if (supabase) {
        try {
          const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
          if (!error) {
            product.stock = newStock;
            renderProducts();
          }
        } catch(err) {
          console.warn("Could not deduct stock", err);
        }
      } else {
        product.stock = newStock;
        renderProducts();
      }
    });

    clearCart();
    closeCheckoutModal();

  } catch (error) {
    alert(error.message);
  } finally {
    btn.innerHTML = originalBtnText;
    btn.disabled = false;
  }
}

// ─── Buy Now (Skip Cart) ────────────────────────────────────
export function buyNow(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  // Clear cart, add only this product, then open checkout
  cart = [{ ...product, qty: 1 }];
  saveCart();
  updateCartUI();
  openCheckoutModal();
}

export async function initProducts() {
  if (!supabase) return;
  try {
    const { data: productsData, error: pError } = await supabase.from('products').select('*').order('name', { ascending: true });
    if (pError) throw pError;
    
    const { data: reviewsData, error: rError } = await supabase.from('reviews').select('*');
    if (rError) throw rError;

    if (productsData && productsData.length > 0) {
      PRODUCTS = productsData.map(p => {
        const pReviews = reviewsData ? reviewsData.filter(r => r.product_id === p.id) : [];
        const reviewCount = pReviews.length;
        const avgRating = reviewCount > 0 
          ? (pReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
          : 0;
          
        return {
          ...p,
          reviews: pReviews,
          reviewCount: reviewCount,
          avgRating: parseFloat(avgRating)
        };
      });
    }
  } catch (err) {
    console.error("Failed to fetch products or reviews from Supabase.", err);
  }
}

// ─── Initialize ──────────────────────────────────────────────
export async function init() {
  await initProducts();
  
  if (supabase) {
    try {
      const { data, error } = await supabase.from('pincodes').select('code, is_cod_available').eq('is_active', true);
      if (!error && data) {
        allowedPincodesData = data;
        allowedPincodes = data.map(p => p.code);
      }

      // Fetch global settings
      const { data: settingsData, error: settingsError } = await supabase.from('store_settings').select('*').eq('id', 1).single();
      if (!settingsError && settingsData) {
        orderWhatsapp = settingsData.order_whatsapp || orderWhatsapp;
        inquiryWhatsapp = settingsData.inquiry_whatsapp || inquiryWhatsapp;
        servicesWhatsapp = settingsData.services_whatsapp || servicesWhatsapp;
        
        // Dynamically update UI links that rely on servicesWhatsapp
        if (window.RanjitCart) window.RanjitCart.servicesWhatsapp = servicesWhatsapp;
        document.querySelectorAll('a[href*="916371900967"]').forEach(link => {
            link.href = link.href.replace('916371900967', servicesWhatsapp);
            if (link.textContent.includes('6371900967')) {
                link.textContent = link.textContent.replace('6371900967', servicesWhatsapp.slice(2)); // assume +91
            }
        });

        // Apply featured section settings if on landing page
        const isProductsPage = window.location.pathname.includes('products');
        if (!isProductsPage) {
            const titleEl = document.getElementById('featured-title');
            const subtitleEl = document.getElementById('featured-subtitle');
            if (titleEl && settingsData.featured_title) titleEl.textContent = settingsData.featured_title;
            if (subtitleEl && settingsData.featured_subtitle) subtitleEl.textContent = settingsData.featured_subtitle;
        }
      }
    } catch (e) { console.error("Error fetching initial data", e); }
  }

  loadCart();

  // Check URL for category filters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  const isProductsPage = window.location.pathname.includes('products');
  
  if (categoryParam) {
    currentCategoryFilter = categoryParam;
    isViewAll = false;
  } else if (isProductsPage) {
    isViewAll = true;
  } else {
    // If we're on the landing page without a URL param, check if admin set a featured category
    if (supabase) {
        try {
            const { data: settingsData } = await supabase.from('store_settings').select('featured_category').eq('id', 1).single();
            if (settingsData && settingsData.featured_category && settingsData.featured_category.trim() !== '') {
                currentCategoryFilter = settingsData.featured_category.trim();
            }
        } catch (e) {}
    }
  }

  renderProducts();
  updateCartUI();

  // Bind cart icon clicks
  document.querySelectorAll('.cart-icon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  });

  // Bind drawer close
  const drawerClose = document.getElementById('cart-drawer-close');
  if (drawerClose) drawerClose.addEventListener('click', closeCartDrawer);
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  // Bind checkout button
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);

  // Bind checkout modal close
  const checkoutClose = document.getElementById('checkout-close');
  if (checkoutClose) checkoutClose.addEventListener('click', closeCheckoutModal);
  const checkoutOverlay = document.getElementById('checkout-overlay');
  if (checkoutOverlay) checkoutOverlay.addEventListener('click', closeCheckoutModal);

  // Bind shipping select to update total
  const shippingSelect = document.getElementById('checkout-shipping');
  if (shippingSelect) {
    shippingSelect.addEventListener('change', renderCheckoutSummary);
  }

  // Bind place order
  const placeOrderBtn = document.getElementById('place-order-btn');
  if (placeOrderBtn) placeOrderBtn.addEventListener('click', placeOrder);

  // Real-time Pincode Validation
  const pincodeInput = document.getElementById('checkout-pincode');
  const pincodeIcon = document.getElementById('pincode-status-icon');
  const pincodeErr = document.getElementById('pincode-error');
  
  if (pincodeInput) {
    pincodeInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val.length === 6) {
        if (allowedPincodes.includes(val)) {
          if(pincodeIcon) pincodeIcon.innerHTML = '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-500"></i>';
          if(pincodeErr) pincodeErr.classList.add('hidden');
          
          // COD Availability Check
          const pinObj = allowedPincodesData.find(p => p.code === val);
          const codBox = document.getElementById('cod-payment-box');
          const codRadio = document.querySelector('input[name="payment-method"][value="cod"]');
          const codLabel = document.getElementById('cod-payment-label');
          const codSubtext = document.getElementById('cod-payment-subtext');
          
          if (codBox && codRadio && pinObj) {
            if (pinObj.is_cod_available) {
              codBox.classList.remove('opacity-50', 'bg-gray-50');
              codRadio.disabled = false;
              if (codLabel) codLabel.classList.remove('cursor-not-allowed');
              if (codSubtext) codSubtext.classList.add('hidden');
            } else {
              codBox.classList.add('opacity-50', 'bg-gray-50');
              codRadio.disabled = true;
              if (codLabel) codLabel.classList.add('cursor-not-allowed');
              if (codSubtext) codSubtext.classList.remove('hidden');
              // Revert to UPI if they had COD selected somehow
              if (codRadio.checked) {
                document.querySelector('input[name="payment-method"][value="upi"]').checked = true;
                if(window.RanjitCart.togglePaymentMethod) window.RanjitCart.togglePaymentMethod();
              }
            }
          }
        } else {
          if(pincodeIcon) pincodeIcon.innerHTML = '<i data-lucide="x-circle" class="w-5 h-5 text-red-500"></i>';
          if(pincodeErr) pincodeErr.classList.remove('hidden');
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
      } else {
        if(pincodeIcon) pincodeIcon.innerHTML = '';
        if(pincodeErr) pincodeErr.classList.add('hidden');
      }
    });
  }

  // Bind Filter UI clear buttons
  const clearFilterBtn = document.getElementById('clear-filter-btn');
  if (clearFilterBtn) clearFilterBtn.addEventListener('click', clearFilter);
  const emptyStateClearBtn = document.getElementById('empty-state-clear-btn');
  if (emptyStateClearBtn) emptyStateClearBtn.addEventListener('click', clearFilter);

  // Bind View All button
  const viewAllBtn = document.getElementById('view-all-btn');
  if (viewAllBtn) viewAllBtn.addEventListener('click', showAllProducts);
}

export function togglePaymentMethod() {
  const method = document.querySelector('input[name="payment-method"]:checked')?.value;
  const upiSec = document.getElementById('upi-payment-section');
  const codSec = document.getElementById('cod-payment-section');
  
  if (!upiSec || !codSec) return;
  
  if (method === 'upi') {
    upiSec.classList.remove('hidden');
    codSec.classList.add('hidden');
  } else if (method === 'cod') {
    upiSec.classList.add('hidden');
    codSec.classList.remove('hidden');
  }
}

export function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  window.currentCaptchaAnswer = num1 + num2;
  
  const qEl = document.getElementById('captcha-question');
  if (qEl) qEl.textContent = `${num1} + ${num2} = `;
  
  const aEl = document.getElementById('captcha-answer');
  if (aEl) aEl.value = '';
  
  const err = document.getElementById('captcha-error');
  if (err) err.classList.add('hidden');
}

export function checkDrawerPincode() {
  const input = document.getElementById('drawer-pincode');
  const msg = document.getElementById('drawer-pincode-msg');
  
  if (!input) {
    alert("Input field not found!");
    return;
  }
  if (!msg) {
    alert("Message element not found!");
    return;
  }

  const val = input.value.trim();
  if (val.length !== 6 || !/^\d{6}$/.test(val)) {
    msg.textContent = "Please enter a valid 6-digit pincode.";
    msg.className = "text-xs mt-2 font-semibold text-amber-500 block";
    return;
  }

  if (typeof allowedPincodes === 'undefined' || !Array.isArray(allowedPincodes)) {
    msg.textContent = "Still loading delivery areas. Please try again in a few seconds.";
    msg.className = "text-xs mt-2 font-semibold text-amber-500 block";
    return;
  }

  if (allowedPincodes.includes(val)) {
    verifiedPincode = val;
    msg.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4 inline mr-1"></i>Great! Delivery is available in your area.';
    msg.className = "text-sm mt-3 font-semibold text-emerald-600 flex items-center bg-emerald-50 p-2 rounded-lg border border-emerald-100";
    renderCartDrawerItems();
  } else {
    verifiedPincode = null;
    msg.innerHTML = '<i data-lucide="x-circle" class="w-4 h-4 inline mr-1"></i>Sorry, we don\'t deliver to this area yet.';
    msg.className = "text-sm mt-3 font-semibold text-red-600 flex items-center bg-red-50 p-2 rounded-lg border border-red-100";
    renderCartDrawerItems();
  }
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ─── TRACK ORDER & REVIEWS ───────────────────────────────────

export async function trackOrder() {
  const orderId = document.getElementById('track-order-id').value.trim().toUpperCase();
  const phone = document.getElementById('track-order-phone').value.trim();
  const btn = document.getElementById('track-order-btn');
  const resultDiv = document.getElementById('track-order-result');

  if (!orderId || !phone) return;

  btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Tracking...`;
  btn.disabled = true;

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('customer_phone', phone)
      .single();

    if (error || !order) {
      resultDiv.innerHTML = `<p class="text-red-500 font-semibold text-center"><i data-lucide="alert-circle" class="w-5 h-5 inline"></i> Order not found. Check your Order ID and Phone Number.</p>`;
      resultDiv.classList.remove('hidden');
      return;
    }

    // Render Order Details
    let statusColor = 'gray';
    if(order.status === 'Processing') statusColor = 'amber';
    if(order.status === 'Shipped') statusColor = 'blue';
    if(order.status === 'Delivered') statusColor = 'emerald';
    if(order.status === 'Cancelled') statusColor = 'red';

    const itemsHTML = order.items.map(item => {
      // Find the product to get the image
      const product = PRODUCTS.find(p => p.id === item.id) || item;
      const productImg = product.image || '';
      
      const reviewBtn = order.status === 'Delivered' 
        ? `<button onclick="window.RanjitCart.openWriteReview(${item.id}, '${item.name.replace(/'/g, "\\'")}', '${(product.categories && product.categories.length > 0 ? product.categories[0] : 'General')}', '${productImg}', '${order.id}', '${order.customer_name.replace(/'/g, "\\'")}')" class="mt-2 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"><i data-lucide="star" class="w-3 h-3 fill-amber-600"></i> Write Review</button>` 
        : '';

      return `
        <div class="flex gap-4 p-3 bg-white rounded-lg border border-gray-100 items-center">
          <img src="${productImg}" class="w-16 h-16 object-cover rounded shadow-sm">
          <div class="flex-1">
            <h4 class="font-bold text-gray-900 text-sm">${item.name}</h4>
            <p class="text-xs text-gray-500">Qty: ${item.qty} × ₹${item.price}</p>
            ${reviewBtn}
          </div>
        </div>
      `;
    }).join('');

    resultDiv.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <p class="text-xs text-gray-500 font-semibold uppercase">Order Status</p>
            <h3 class="text-lg font-outfit font-bold text-${statusColor}-600">${order.status}</h3>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-500 font-semibold uppercase">Total</p>
            <h3 class="text-lg font-outfit font-bold text-gray-900">₹${order.total_amount}</h3>
          </div>
        </div>
        <div class="p-4 space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
          ${itemsHTML}
        </div>
      </div>
    `;
    resultDiv.classList.remove('hidden');

  } catch (err) {
    console.error("Error tracking order", err);
    resultDiv.innerHTML = `<p class="text-red-500 font-semibold text-center">An error occurred.</p>`;
    resultDiv.classList.remove('hidden');
  } finally {
    btn.innerHTML = `<i data-lucide="search" class="w-5 h-5"></i> Track Order`;
    btn.disabled = false;
    if(typeof lucide !== 'undefined') lucide.createIcons();
  }
}

export function openWriteReview(productId, productName, productCat, productImg, orderId, customerName) {
  document.getElementById('review-product-id').value = productId;
  document.getElementById('review-order-id').value = orderId;
  document.getElementById('review-customer-name').value = customerName;
  document.getElementById('review-product-name').textContent = productName;
  document.getElementById('review-product-cat').textContent = productCat;
  document.getElementById('review-product-img').src = productImg;
  
  // Reset stars
  document.getElementById('review-rating').value = '';
  document.querySelectorAll('.star-btn i').forEach(icon => {
    icon.classList.remove('fill-amber-500');
  });
  document.getElementById('review-comment').value = '';
  document.getElementById('review-rating-error').classList.add('hidden');

  if (typeof window.closeModal === 'function') {
    window.closeModal('track-order-modal');
  } else {
    document.getElementById('track-order-modal').classList.add('hidden');
  }
  
  if (typeof window.openModal === 'function') {
    window.openModal('write-review-modal');
  } else {
    document.getElementById('write-review-modal').classList.remove('hidden');
  }
}

export async function submitReview() {
  const productId = document.getElementById('review-product-id').value;
  const orderId = document.getElementById('review-order-id').value;
  const customerName = document.getElementById('review-customer-name').value;
  const rating = document.getElementById('review-rating').value;
  const comment = document.getElementById('review-comment').value.trim();
  
  if (!rating) {
    document.getElementById('review-rating-error').classList.remove('hidden');
    return;
  }

  const btn = document.getElementById('submit-review-btn');
  btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Submitting...`;
  btn.disabled = true;

  try {
    const { error } = await supabase.from('reviews').insert({
      product_id: parseInt(productId),
      order_id: orderId,
      customer_name: customerName,
      rating: parseInt(rating),
      comment: comment
    });

    if (error) throw error;

    if (typeof window.closeModal === 'function') {
      window.closeModal('write-review-modal');
    } else {
      document.getElementById('write-review-modal').classList.add('hidden');
    }
    showToast("Review submitted successfully! Thank you.");
    
    // Refresh products to show updated rating
    initProducts().then(() => renderProducts());
    
  } catch (err) {
    console.error("Error submitting review", err);
    alert("Failed to submit review.");
  } finally {
    btn.innerHTML = `Submit Review`;
    btn.disabled = false;
  }
}

// Attach event listeners for Star Rating in Write Review Modal
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rating = parseInt(e.currentTarget.dataset.rating);
        document.getElementById('review-rating').value = rating;
        document.getElementById('review-rating-error').classList.add('hidden');
        
        document.querySelectorAll('.star-btn i').forEach((icon, index) => {
          if (index < rating) {
            icon.classList.add('fill-amber-500', 'text-amber-500');
            icon.classList.remove('text-gray-300');
          } else {
            icon.classList.remove('fill-amber-500', 'text-amber-500');
            icon.classList.add('text-gray-300');
          }
        });
      });
    });
  });
}
