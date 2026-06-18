// ═══════════════════════════════════════════════════════════════
// RANJIT NURSERY — E-Commerce Cart & Checkout Module
// ═══════════════════════════════════════════════════════════════

import { supabase } from './supabase.js';

// ─── Product Catalog ─────────────────────────────────────────
export let PRODUCTS = [
  {
    id: 1,
    name: 'Exotic Dendrobium Orchid',
    categories: ['Orchids', 'Trending Plants', 'Flowering Plants', 'Premium Gifts'],
    price: 499,
    image: '/images/about_orchid_1781686291477.png',
    description: 'Stunning Dendrobium orchid in vibrant purple. Long-lasting blooms, perfect for gifting or home décor.',
    badge: 'Specialty'
  },
  {
    id: 2,
    name: 'White Phalaenopsis Orchid',
    categories: ['Orchids', 'Indoor Plants', 'Low Maintenance Plants', 'Gifts Under ₹999'],
    price: 649,
    image: '/images/white_orchid.png',
    description: 'Elegant white Phalaenopsis (Moth Orchid) — the queen of indoor orchids. Low maintenance, high impact.',
    badge: 'Bestseller'
  },
  {
    id: 3,
    name: 'Money Plant (Golden Pothos)',
    categories: ['Indoor Plants', 'Air Purifying Plants', 'Low Maintenance Plants', 'Hanging Baskets', 'Plants For Office'],
    price: 149,
    image: '/images/money_plant.png',
    description: 'Air-purifying golden pothos in a premium ceramic pot. Thrives in low light. Symbol of prosperity.',
    badge: null
  },
  {
    id: 4,
    name: 'Areca Palm',
    categories: ['Indoor Plants', 'Air Purifying Plants', 'Palm Plants', 'Areca Palm Plants', 'Plants for Living Room'],
    price: 399,
    image: '/images/areca_palm.png',
    description: 'Elegant areca palm that acts as a natural air humidifier. Perfect for living rooms and offices.',
    badge: 'Popular'
  },
  {
    id: 5,
    name: 'Mango Sapling (Alphonso)',
    categories: ['Fruit Plants', 'Fruit Plants can be grown in Pots', 'Grafted Fruit Plants', 'Summer Plants'],
    price: 299,
    image: '/images/mango_sapling.png',
    description: 'Grafted Alphonso mango sapling. Starts bearing fruit within 2-3 years. Organically grown.',
    badge: null
  },
  {
    id: 6,
    name: 'Guava Plant (Thai Variety)',
    categories: ['Fruit Plants', 'Grafted Fruit Plants', 'Low Maintenance Plants'],
    price: 199,
    image: '/images/guava_plant.png',
    description: 'High-yield Thai guava plant. Sweet, crispy fruits within the first year. Disease-resistant variety.',
    badge: 'Popular'
  },
  {
    id: 7,
    name: 'Neem Avenue Tree',
    categories: ['Avenue Trees', 'Medicinal Plants', 'Outdoor Plants', 'Tree And Forestry Seeds'],
    price: 549,
    image: '/images/neem_tree.png',
    description: 'Mature neem tree sapling (4ft). Natural pest repellent. Perfect for avenues and large gardens.',
    badge: null
  },
  {
    id: 8,
    name: 'Carpet Grass Roll (10 sq ft)',
    categories: ['Ground Cover Plants', 'Outdoor Plants'],
    price: 799,
    image: '/images/carpet_grass.png',
    description: 'Premium Korean carpet grass roll covering 10 sq ft. Instant green lawn transformation.',
    badge: 'Bestseller'
  },
  {
    id: 9,
    name: 'Premium Plastic Pot (12 inch)',
    categories: ['Plastic Planters', 'Floor Planters', 'Accessories'],
    price: 129,
    image: '/images/ceramic_planter.png',
    description: 'Durable UV-resistant 12-inch plastic pot with drainage tray. Available in multiple colors.',
    badge: null
  },
  {
    id: 10,
    name: 'Organic Vermicompost (5 Kg)',
    categories: ['Organic Fertilizer', 'Best Seller Soil and Fertilizer', 'Soil Additives'],
    price: 249,
    image: '/images/potting_mix.png',
    description: '100% organic vermicompost fertilizer. Enriches soil, boosts plant growth naturally.',
    badge: 'Popular'
  },
  {
    id: 11,
    name: 'Bougainvillea (Pink)',
    categories: ['Flowering Plants', 'Bougainvillea Plants', 'Climber Plants', 'Outdoor Plants', 'All Season Flowering Plants'],
    price: 179,
    image: '/images/bougainvillea.png',
    description: 'Vibrant pink bougainvillea plant. Drought-tolerant, blooms year-round. Perfect for fences and walls.',
    badge: null
  },
  {
    id: 12,
    name: 'Jasmine (Mogra) Plant',
    categories: ['Flowering Plants', 'Aromatic / Fragrant Plants', 'Aromatic Plants', 'Plants\' Packs For Pooja'],
    price: 199,
    image: '/images/jasmine_plant.png',
    description: 'Fragrant Arabian jasmine (Mogra). Heavenly scent, beautiful white flowers. Ideal for pooja gardens.',
    badge: 'Specialty'
  },
  {
    id: 13,
    name: 'Ficus Bonsai (Ginseng)',
    categories: ['Bonsai Plants', 'Indoor Plants', 'Trending Plants', 'Plants for Table Top', 'Ficus Plants'],
    price: 899,
    image: '/images/ficus_bonsai.png',
    description: 'Beautifully shaped Ficus Bonsai. A miniature tree that brings Zen to any indoor space.',
    badge: 'Specialty'
  },
  {
    id: 14,
    name: 'Pink Water Lily',
    categories: ['Aquatic Plants', 'Outdoor Plants', 'Flowering Plants', 'Monsoon Plants', 'Summer Plants'],
    price: 349,
    image: '/images/pink_water_lily.png',
    description: 'Stunning pink water lily tuber. Perfect for small ponds and outdoor water bowls.',
    badge: null
  },
  {
    id: 15,
    name: 'Golden Barrel Cactus',
    categories: ['Cactus Plants', 'Cactus and Succulents', 'Low Maintenance Plants', 'Drought Tolerant Plants', 'Indoor Plants'],
    price: 299,
    image: '/images/barrel_cactus.png',
    description: 'Striking round cactus with golden spines. Needs very little water and bright sunlight.',
    badge: null
  },
  {
    id: 16,
    name: 'Snake Plant (Sansevieria)',
    categories: ['Air Purifying Plants', 'Indoor Plants', 'Oxygen Plants', 'Low Maintenance Plants', 'Plants for Bedroom'],
    price: 199,
    image: '/images/snake_plant.png',
    description: 'One of the best air purifiers. Releases oxygen at night. Extremely hard to kill.',
    badge: 'Bestseller'
  },
  {
    id: 17,
    name: 'Aloe Vera Plant',
    categories: ['Aloe vera Plants', 'Medicinal Plants', 'Air Purifying Plants', 'Low Maintenance Plants', 'Herb Plants'],
    price: 149,
    image: '/images/aloe_vera.png',
    description: 'The wonder plant. Excellent for skin care, minor burns, and purifying indoor air.',
    badge: 'Popular'
  },
  {
    id: 18,
    name: 'Jade Plant (Crassula ovata)',
    categories: ['Jade Plants', 'Lucky Plants', 'Indoor Plants', 'Plants for Office Desk', 'Foliage Plants'],
    price: 179,
    image: '/images/jade_plant.png',
    description: 'Symbol of wealth and prosperity. Fleshy oval leaves, easy to care for.',
    badge: null
  },
  {
    id: 19,
    name: 'Tomato Seeds (Hybrid)',
    categories: ['Vegetable / Herb Seeds', 'Veg / Herb Seeds (Hybrid)', 'Easy to Grow Vegetable Seeds', 'Summer Seeds'],
    price: 49,
    image: '/images/tomato_seeds.png',
    description: 'High-yielding hybrid tomato seeds. Disease resistant, suitable for home gardens and pots.',
    badge: 'Popular'
  },
  {
    id: 20,
    name: 'Marigold Seeds (French)',
    categories: ['Marigold Seeds', 'Flower Seeds', 'Easy to grow Seeds', 'All Seasons Seeds', 'Flower Seeds Can be Grown in Pots'],
    price: 39,
    image: 'https://image.pollinations.ai/prompt/Vibrant%20orange%20marigold%20flowers%20close%20up%20macro%20photography%20garden?width=600&height=600&nologo=true',
    description: 'Vibrant orange and yellow marigold seeds. Easy to grow, repels nematodes in soil.',
    badge: null
  },
  {
    id: 21,
    name: 'Italian Basil Seeds',
    categories: ['Basil Seeds', 'Exotic Herb Seeds', 'Easy to Grow Herb Seeds', 'Herb Seeds Can be Grown in Pots'],
    price: 59,
    image: 'https://image.pollinations.ai/prompt/Fresh%20green%20basil%20leaves%20herb%20plant%20close%20up%20photography?width=600&height=600&nologo=true',
    description: 'Aromatic sweet Italian basil. Perfect for pesto, pastas, and kitchen gardens.',
    badge: null
  },
  {
    id: 22,
    name: 'Premium Potting Mix (10 Kg)',
    categories: ['Potting Soil', 'Best Seller Soil and Fertilizer', 'Soil and Fertilizers\' Packs', 'Soil', 'Fertilizers'],
    price: 399,
    image: '/images/potting_mix.png',
    description: 'Ready-to-use enriched potting mix. Contains cocopeat, perlite, and organic compost.',
    badge: 'Bestseller'
  },
  {
    id: 23,
    name: 'Cocopeat Block (5 Kg)',
    categories: ['Cocopeat', 'Soil Additives', 'Organic Fertilizer', 'Soil', 'Fertilizers'],
    price: 229,
    image: '/images/cocopeat.png',
    description: 'Expands up to 75 liters. Excellent water retention, improves soil aeration.',
    badge: null
  },
  {
    id: 24,
    name: 'Neem Cake Fertilizer (1 Kg)',
    categories: ['Organic Fertilizer', 'Plant Medicines', 'Soil Additives', 'Fertilizers', 'Pesticides'],
    price: 99,
    image: '/images/neem_cake.png',
    description: 'Organic pest repellent and fertilizer. Protects plant roots from nematodes and fungi.',
    badge: null
  },
  {
    id: 25,
    name: 'Ceramic Glazed Planter',
    categories: ['Ceramic Planters', 'Table Top Planters', 'Planters'],
    price: 349,
    image: '/images/ceramic_planter.png',
    description: 'Elegant 6-inch ceramic planter with drip tray. Glossy finish, perfect for indoor tables.',
    badge: 'Popular'
  },
  {
    id: 26,
    name: 'Coir Hanging Basket',
    categories: ['Coir Planters', 'Hanging Planters', 'Eco Friendly'],
    price: 199,
    image: '/images/coir_basket.png',
    description: '10-inch eco-friendly coir hanging basket with metal chain. Excellent drainage.',
    badge: null
  },
  {
    id: 27,
    name: 'Bamboo Plant in Glass Vase',
    categories: ['Lucky Bamboos', 'Corporate Gifts', 'Gifts Under ₹499', 'Plants For Office Desk', 'Indoor Plants'],
    price: 399,
    image: '/images/bamboo_vase.png',
    description: 'Two-layer lucky bamboo in a premium clear glass vase. Requires only water.',
    badge: 'Specialty'
  },
  {
    id: 28,
    name: 'Succulent Gift Box (Set of 3)',
    categories: ['Corporate Gifts', 'Birthday Gifts', 'Gifts Under ₹999', 'Cactus and Succulents'],
    price: 599,
    image: '/images/succulent_box.png',
    description: 'Assorted premium succulents planted in cute ceramic pots, beautifully packaged.',
    badge: null
  },
  {
    id: 29,
    name: 'Balcony Garden Starter Kit',
    categories: ['Balcony and Terrace Garden', 'Garden Kits', 'Value For Money Packs', 'Trending in Gardening'],
    price: 1299,
    image: '/images/about_potted_1781686303406.png',
    description: 'Complete kit: 5 pots, 5 flowering plants, potting soil, and basic tools.',
    badge: 'Bestseller'
  },
  {
    id: 30,
    name: 'Indoor Air Purifier Pack',
    categories: ['Air Purifying Plants\' Packs', 'Top 4 Plants\' Packs', 'Indoor Garden', 'Value For Money Packs'],
    price: 899,
    image: '/images/about_potted_1781686303406.png',
    description: 'Set of 4 best air-purifying plants: Snake Plant, Areca Palm, Money Plant, and Spider Plant.',
    badge: 'Specialty'
  }
];

// ─── Cart State ──────────────────────────────────────────────
let cart = [];
let appliedCoupon = null;

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
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
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
  const grid = document.getElementById('products-grid');
  const emptyState = document.getElementById('products-empty-state');
  const filterStatus = document.getElementById('filter-status-container');
  const filterBadge = document.getElementById('active-filter-badge');
  
  if (!grid) return;

  // Filter & Slice products
  let displayProducts = PRODUCTS;
  if (currentCategoryFilter) {
    displayProducts = PRODUCTS.filter(p => p.categories && p.categories.includes(currentCategoryFilter));
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
    grid.classList.add('hidden');
    emptyState?.classList.remove('hidden');
  } else {
    grid.classList.remove('hidden');
    emptyState?.classList.add('hidden');
    
    // Render Products
    grid.innerHTML = displayProducts.map((p, i) => {
      const delayClass = ['delay-100', 'delay-200', 'delay-300'][i % 3];
      const badgeHTML = p.badge
        ? `<div class="absolute top-4 right-4 ${p.badge === 'Specialty' ? 'bg-accent' : p.badge === 'Bestseller' ? 'bg-amber-500' : 'bg-primary'} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
             <i data-lucide="${p.badge === 'Specialty' ? 'star' : p.badge === 'Bestseller' ? 'flame' : 'trending-up'}" class="w-3 h-3"></i> ${p.badge}
           </div>`
        : '';
      
      // Get the primary category to display (just the first one in the array, or a fallback)
      const displayCategory = p.categories && p.categories.length > 0 ? p.categories[0] : 'General';

      let priceHTML = `<span class="text-xl font-outfit font-extrabold text-primary">₹${p.price}</span>`;
      if (p.mrp && p.mrp > p.price) {
        const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
        priceHTML = `
          <div class="flex flex-col items-end">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-semibold text-gray-400 line-through">₹${p.mrp}</span>
              <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">${discount}% OFF</span>
            </div>
            <span class="text-xl font-outfit font-extrabold text-primary leading-none mt-0.5">₹${p.price}</span>
          </div>
        `;
      }

      return `
        <div class="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group animate-on-scroll opacity-0 translate-y-8 ${delayClass} flex flex-col">
          <div class="relative h-56 overflow-hidden shrink-0">
            <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
            ${badgeHTML}
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          <div class="p-5 flex flex-col flex-grow">
            <div>
              <div class="flex items-start justify-between mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-primary/70 mt-1">${displayCategory}</span>
                ${priceHTML}
              </div>
              <h3 class="text-lg font-outfit font-bold text-gray-900 mb-2 leading-snug">${p.name}</h3>
              <p class="text-gray-500 text-sm mb-4 line-clamp-2">${p.description}</p>
            </div>
            
            <div class="flex gap-2 mt-auto pt-2">
              ${(p.is_available === false || (p.stock !== undefined && p.stock !== null ? p.stock : 10) <= 0)
                ? `<div class="w-full bg-red-50 text-red-600 font-bold py-2.5 rounded-xl text-center border border-red-100 flex items-center justify-center gap-2"><i data-lucide="x-circle" class="w-4 h-4"></i> Out of Stock</div>`
                : `<button onclick="window.RanjitCart.addToCart(${p.id})" class="flex-1 bg-primary hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg">
                    <i data-lucide="shopping-cart" class="w-4 h-4"></i> Add to Cart
                  </button>
                  <button onclick="window.RanjitCart.buyNow(${p.id})" class="flex-1 bg-accent hover:bg-pink-600 text-white font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg">
                    <i data-lucide="zap" class="w-4 h-4"></i> Buy Now
                  </button>`
              }
            </div>
          </div>
        </div>`;
    }).join('');

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

    grid.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
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
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (emptyMsg) emptyMsg.classList.add('hidden');
  if (checkoutBtn) checkoutBtn.disabled = false;

  list.innerHTML = cart.map(item => `
    <div class="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-100 transition-all hover:border-primary/20">
      <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm" />
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 text-sm truncate">${item.name}</h4>
        <p class="text-primary font-bold text-sm">₹${item.price}</p>
        <div class="flex items-center gap-2 mt-1">
          <button onclick="window.RanjitCart.updateQty(${item.id}, -1)" class="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm flex items-center justify-center transition-colors">−</button>
          <span class="font-bold text-sm w-6 text-center">${item.qty}</span>
          <button onclick="window.RanjitCart.updateQty(${item.id}, 1)" class="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm flex items-center justify-center transition-colors">+</button>
        </div>
      </div>
      <div class="text-right flex flex-col items-end gap-1">
        <span class="font-bold text-gray-900 text-sm">₹${item.price * item.qty}</span>
        <button onclick="window.RanjitCart.removeFromCart(${item.id})" class="text-red-400 hover:text-red-600 transition-colors p-1" title="Remove">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `).join('');

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

// ─── Place Order via WhatsApp ────────────────────────────────
export function placeOrder() {
  const custName = document.getElementById('checkout-name')?.value?.trim();
  const custAddr = document.getElementById('checkout-address')?.value?.trim();
  const custPhone = document.getElementById('checkout-phone')?.value?.trim();
  const shipping = document.getElementById('checkout-shipping')?.value;
  const utr = document.getElementById('checkout-utr')?.value?.trim();

  if (!custName || !custAddr || !custPhone) {
    alert('Please fill in your Name, Address, and Phone Number.');
    return;
  }

  // Build order message
  let msg = `🌿 *NEW ORDER — Ranjit Nursery* 🌿\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `*Customer:* ${custName}\n`;
  msg += `*Phone:* ${custPhone}\n`;
  msg += `*Address:* ${custAddr}\n`;
  msg += `*Shipping:* ${shipping || 'Standard'}\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `*Order Items:*\n`;
  cart.forEach((item, i) => {
    msg += `${i + 1}. ${item.name} × ${item.qty} = ₹${(item.price * item.qty).toLocaleString('en-IN')}\n`;
  });
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
  
  const total = (subtotal + shippingCost) - discountAmount;
  msg += `*Total Amount: ₹${total.toLocaleString('en-IN', {maximumFractionDigits:0})}*\n`;
  if (utr) {
    msg += `*UPI Txn Ref / UTR:* ${utr}\n`;
  }
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `Thank you for ordering from Ranjit Nursery! 🙏`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/919692905128?text=${encoded}`, '_blank');

  // Deduct stock in Supabase
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
      // Offline fallback deduction
      product.stock = newStock;
      renderProducts();
    }
  });

  clearCart();
  closeCheckoutModal();
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
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (!error && data && data.length > 0) {
      PRODUCTS = data;
    }
  } catch (err) {
    console.error("Failed to fetch products from Supabase. Using local fallback.", err);
  }
}

// ─── Initialize ──────────────────────────────────────────────
export async function init() {
  await initProducts();
  loadCart();

  // Check URL for category filters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  
  if (categoryParam) {
    currentCategoryFilter = categoryParam;
    isViewAll = false;
  } else {
    const isProductsPage = window.location.pathname.includes('products');
    if (isProductsPage) {
      isViewAll = true;
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

  // Bind Filter UI clear buttons
  const clearFilterBtn = document.getElementById('clear-filter-btn');
  if (clearFilterBtn) clearFilterBtn.addEventListener('click', clearFilter);
  const emptyStateClearBtn = document.getElementById('empty-state-clear-btn');
  if (emptyStateClearBtn) emptyStateClearBtn.addEventListener('click', clearFilter);

  // Bind View All button
  const viewAllBtn = document.getElementById('view-all-btn');
  if (viewAllBtn) viewAllBtn.addEventListener('click', showAllProducts);
}

// Expose to global for inline onclick handlers
window.RanjitCart = {
  addToCart,
  removeFromCart,
  updateQty,
  buyNow,
  openCartDrawer,
  closeCartDrawer,
  openCheckoutModal,
  closeCheckoutModal,
  placeOrder,
  filterProducts,
  clearFilter,
  showAllProducts,
  applyCoupon
};
