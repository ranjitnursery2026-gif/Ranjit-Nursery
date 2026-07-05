import './style.css'
import { supabase } from './supabase.js'
import * as Cart from './cart.js'
import { categoryData as fallbackCategoryData } from './categoryData.js'

let categoryData = fallbackCategoryData;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when a link is clicked
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Navbar Scroll Effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('shadow-md', 'bg-white/95');
      navbar.classList.remove('bg-white/80', 'shadow-sm');
    } else {
      navbar.classList.add('bg-white/80', 'shadow-sm');
      navbar.classList.remove('shadow-md', 'bg-white/95');
    }
  });

  // Intersection Observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('opacity-0', 'translate-y-8', '-translate-x-8', 'translate-x-8');
        entry.target.classList.add('opacity-100', 'translate-y-0', 'translate-x-0');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Select all elements with the animate-on-scroll class
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  animatedElements.forEach(el => {
    observer.observe(el);
  });

  // Handle Consultation Form Submission
  const consultationForm = document.getElementById('consultation-form');
  const submitBtn = document.getElementById('submit-btn');
  const formStatus = document.getElementById('form-status');

  if (consultationForm) {
    consultationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('consult-name').value;
      const phone = document.getElementById('consult-phone').value;
      const service = document.getElementById('consult-service').value;
      const message = document.getElementById('consult-message').value;

      // Build WhatsApp Message
      let waMsg = `🌿 *NEW INQUIRY — Ranjit Nursery* 🌿\n`;
      waMsg += `━━━━━━━━━━━━━━━━━━\n`;
      waMsg += `*Name:* ${name}\n`;
      waMsg += `*Phone:* ${phone}\n`;
      waMsg += `*Interested In:* ${service}\n`;
      if (message && message.trim() !== '') {
        waMsg += `*Message:* ${message.trim()}\n`;
      }
      waMsg += `━━━━━━━━━━━━━━━━━━\n`;

      const whatsappUrl = `https://wa.me/${Cart.inquiryWhatsapp || '919692905128'}?text=${encodeURIComponent(waMsg)}`;
      window.open(whatsappUrl, '_blank');

      // Success feedback
      formStatus.classList.remove('hidden', 'bg-red-100', 'text-red-700');
      formStatus.classList.add('bg-emerald-100', 'text-emerald-700');
      formStatus.textContent = 'Redirecting to WhatsApp...';
      consultationForm.reset();
    });
  }

  // ─── Mega Menu & Category Navigation Logic ───────────────────
  const categoriesTab = document.getElementById('categories-tab-container');
  const megaMenuContainer = document.getElementById('mega-menu-container');
  const megaMenuRootList = document.getElementById('mega-menu-root-list');
  const megaMenuGrid = document.getElementById('mega-menu-grid');
  const mobileAccordion = document.getElementById('mobile-category-accordion');
  
  let hoverTimeout;
  let activeCategoryKey = Object.keys(categoryData)[0]; // Default to first

  // Function to render the Desktop Mega Menu Sidebar
  function renderSidebar() {
    if (!megaMenuRootList) return;
    megaMenuRootList.innerHTML = Object.keys(categoryData).map(categoryKey => `
      <li>
        <button data-category="${categoryKey}" class="mega-root-btn w-full text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-between transition-colors ${categoryKey === activeCategoryKey ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100'}">
          ${categoryKey}
          <i data-lucide="chevron-right" class="w-4 h-4 opacity-50"></i>
        </button>
      </li>
    `).join('');

    const rootBtns = document.querySelectorAll('.mega-root-btn');
    rootBtns.forEach(btn => {
      btn.addEventListener('mouseenter', (e) => {
        const cat = e.currentTarget.dataset.category;
        if (cat !== activeCategoryKey) {
          activeCategoryKey = cat;
          rootBtns.forEach(b => {
            b.className = `mega-root-btn w-full text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-between transition-colors ${b.dataset.category === activeCategoryKey ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100'}`;
          });
          renderMegaMenu(activeCategoryKey);
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      });
    });
  }

  // Function to render the Mobile Accordion
  function renderMobileCategories() {
    if (!mobileAccordion) return;
    mobileAccordion.innerHTML = '';
    Object.keys(categoryData).forEach(categoryKey => {
      const accItem = document.createElement('div');
      accItem.className = 'border-b border-gray-100';
      
      const accHeader = document.createElement('button');
      accHeader.className = 'w-full px-3 py-3 text-base font-bold text-gray-900 flex justify-between items-center text-left';
      accHeader.innerHTML = `<span>${categoryKey}</span> <i data-lucide="chevron-down" class="w-5 h-5 text-gray-400 transition-transform duration-200"></i>`;
      
      const accBody = document.createElement('div');
      accBody.className = 'hidden px-3 pb-3 space-y-4 max-h-0 overflow-hidden transition-all duration-300';
      
      const columns = categoryData[categoryKey];
      accBody.innerHTML = columns.map(col => `
        <div>
          <h5 class="text-sm font-bold text-primary mb-2 uppercase tracking-wider">${col.title}</h5>
          <ul class="space-y-2">
            ${col.links.map(link => `
              <li><a href="products.html?category=${encodeURIComponent(link)}" class="text-gray-600 text-sm hover:text-primary block py-1">${link}</a></li>
            `).join('')}
          </ul>
        </div>
      `).join('');

      accHeader.addEventListener('click', () => {
        const isExpanded = !accBody.classList.contains('hidden') && accBody.style.maxHeight !== '0px';
        
        document.querySelectorAll('#mobile-category-accordion .accordion-body').forEach(body => {
          body.style.maxHeight = '0px';
          setTimeout(() => body.classList.add('hidden'), 300);
          body.previousElementSibling.querySelector('i').classList.remove('rotate-180');
        });

        if (!isExpanded) {
          accBody.classList.remove('hidden');
          accBody.classList.add('accordion-body');
          setTimeout(() => {
            accBody.style.maxHeight = accBody.scrollHeight + 'px';
          }, 10);
          accHeader.querySelector('i').classList.add('rotate-180');
        }
      });

      accItem.appendChild(accHeader);
      accItem.appendChild(accBody);
      mobileAccordion.appendChild(accItem);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // Fetch categories asynchronously and init everything
  async function initCategories() {
    try {
      const { data, error } = await supabase.from('store_category_data').select('data').eq('id', 1).single();
      if (!error && data && data.data) {
        categoryData = data.data;
      }
    } catch (err) {
      console.error("Failed to fetch categories, using fallback:", err);
    }
    
    activeCategoryKey = Object.keys(categoryData)[0];
    
    if (categoriesTab && megaMenuContainer && megaMenuGrid && megaMenuRootList) {
      renderSidebar();
      renderMegaMenu(activeCategoryKey);
    }
    
    if (mobileAccordion) {
      renderMobileCategories();
    }
  }

  // Bind desktop hover events
  if (categoriesTab && megaMenuContainer) {
    categoriesTab.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      megaMenuContainer.classList.remove('hidden', 'pointer-events-none');
      setTimeout(() => {
        megaMenuContainer.classList.remove('opacity-0');
      }, 10);
    });
    
    categoriesTab.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => hideMegaMenu(), 300);
    });

    megaMenuContainer.addEventListener('mouseenter', () => clearTimeout(hoverTimeout));
    megaMenuContainer.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => hideMegaMenu(), 300);
    });
  }

  // Start initialization
  initCategories();

  function renderMegaMenu(categoryKey) {
    const columns = categoryData[categoryKey];
    if (!columns) return;
    
    megaMenuGrid.innerHTML = columns.map(col => `
      <div class="min-w-[200px] flex-1">
        <h4 class="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">${col.title}</h4>
        <ul class="space-y-2">
          ${col.links.map(link => `
            <li>
              <a href="products.html?category=${encodeURIComponent(link)}" onclick="hideMegaMenu();" class="text-sm text-gray-600 hover:text-primary hover:font-medium transition-colors block py-0.5">
                ${link}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');
  }

  function hideMegaMenu() {
    megaMenuContainer.classList.remove('opacity-100');
    megaMenuContainer.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      if (megaMenuContainer.classList.contains('opacity-0')) {
        megaMenuContainer.classList.add('hidden');
      }
    }, 300);
  }

  // Make hideMegaMenu globally available for inline onclick handlers in the mega menu links
  window.hideMegaMenu = hideMegaMenu;

  // ─── Sidebar Rendering for Products Page ─────────────────────
  const sidebarContainer = document.getElementById('sidebar-categories');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = Object.keys(categoryData).map(categoryKey => {
      const columns = categoryData[categoryKey];
      return `
        <div class="mb-6">
          <h4 class="text-base font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2">${categoryKey}</h4>
          ${columns.map(col => `
            <div class="mt-3">
              <h5 class="text-xs font-bold text-primary uppercase tracking-wider mb-2">${col.title}</h5>
              <ul class="space-y-1.5 border-l-2 border-emerald-50 ml-1 pl-3">
                ${col.links.map(link => `
                  <li>
                    <a href="products.html?category=${encodeURIComponent(link)}" class="text-sm text-gray-600 hover:text-primary hover:font-medium transition-colors block py-0.5">
                      ${link}
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');
  }

  // (Hero Carousel logic is now dynamically initialized)

  // ─── Plant Finder Quiz Logic ─────────────────────────────────
  const quizBtns = document.querySelectorAll('.quiz-btn');
  const quizSteps = [
    document.getElementById('quiz-step-1'),
    document.getElementById('quiz-step-2'),
    document.getElementById('quiz-step-3'),
    document.getElementById('quiz-step-4'),
    document.getElementById('quiz-step-5'),
    document.getElementById('quiz-result')
  ];
  const quizReset = document.getElementById('quiz-reset');
  const quizPlantName = document.getElementById('quiz-plant-name');
  const quizShopLink = document.getElementById('quiz-shop-link');

  let quizAnswers = { step1: '', step2: '', step3: '', step4: '', step5: '' };

  if (quizBtns.length > 0) {
    quizBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const currentBtn = e.currentTarget;
        const step = parseInt(currentBtn.dataset.step);
        const val = currentBtn.dataset.val;

        quizAnswers[`step${step}`] = val;

        // Update glowing progress bar
        const progressBar = document.getElementById('quiz-progress-bar');
        if (progressBar) {
          const percentage = ((step) / 5) * 100;
          progressBar.style.width = `${percentage}%`;
          if (step === 5) progressBar.classList.add('bg-accent-gold');
        }

        // Hide current step
        const currentStepEl = quizSteps[step - 1];
        if(currentStepEl) {
            currentStepEl.classList.remove('opacity-100');
            currentStepEl.classList.add('opacity-0');
        }
        
        setTimeout(() => {
          if(currentStepEl) currentStepEl.classList.add('hidden');
          
          // Show next step
          const nextStepEl = quizSteps[step];
          if (nextStepEl) {
            nextStepEl.classList.remove('hidden');
            
            // Staggered Entrance Animation for buttons inside the next step
            const nextBtns = nextStepEl.querySelectorAll('.quiz-btn');
            nextBtns.forEach((b, i) => {
              b.style.transform = 'translateY(20px)';
              b.style.opacity = '0';
              setTimeout(() => {
                b.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                b.style.transform = 'translateY(0)';
                b.style.opacity = '1';
              }, 50 + (i * 100));
            });

            setTimeout(() => {
              nextStepEl.classList.remove('opacity-0');
              nextStepEl.classList.add('opacity-100');
            }, 50);

            // If it's the result step, calculate the plant
            if (step === 5) {
              calculateQuizResult();
            }
          }
        }, 500);
      });
    });

    if (quizReset) {
      quizReset.addEventListener('click', () => {
        quizAnswers = { step1: '', step2: '', step3: '', step4: '', step5: '' };
        
        const progressBar = document.getElementById('quiz-progress-bar');
        if (progressBar) {
          progressBar.style.width = `20%`; // Approx 1st step width
          progressBar.classList.remove('bg-accent-gold');
        }

        quizSteps[5].classList.remove('opacity-100');
        quizSteps[5].classList.add('opacity-0');
        
        setTimeout(() => {
          quizSteps[5].classList.add('hidden');
          quizSteps[0].classList.remove('hidden');
          setTimeout(() => {
            quizSteps[0].classList.remove('opacity-0');
            quizSteps[0].classList.add('opacity-100');
          }, 50);
        }, 500);
      });
    }

    function calculateQuizResult() {
      const allProducts = window.RanjitCart.PRODUCTS || [];
      let matchedProducts = [];

      let categoryKeywords = [];
      
      // Step 1: Type
      if (quizAnswers.step1 === 'plants') categoryKeywords.push('Indoor Plants', 'Outdoor Plants', 'Air Purifying', 'Foliage');
      if (quizAnswers.step1 === 'flowers') categoryKeywords.push('Flowering Plants', 'Flower Seeds');
      if (quizAnswers.step1 === 'seeds') categoryKeywords.push('Vegetable Seeds', 'Fruit Seeds', 'Herb Seeds', 'Seeds');
      
      // Step 2: Season
      if (quizAnswers.step2 === 'summer') categoryKeywords.push('Summer');
      if (quizAnswers.step2 === 'winter') categoryKeywords.push('Winter');
      if (quizAnswers.step2 === 'rainy') categoryKeywords.push('Monsoon', 'All Seasons');

      // Step 3: Location (Old step 1)
      if (quizAnswers.step3 === 'indoor') categoryKeywords.push('Indoor', 'Table Top', 'Bedroom', 'Office');
      if (quizAnswers.step3 === 'outdoor') categoryKeywords.push('Outdoor', 'Avenue Trees');
      if (quizAnswers.step3 === 'balcony') categoryKeywords.push('Balcony', 'Hanging Planters', 'Terrace');

      // Step 4: Light (Old step 2)
      if (quizAnswers.step4 === 'low') categoryKeywords.push('Low Light', 'Low Maintenance');
      if (quizAnswers.step4 === 'high') categoryKeywords.push('Direct Sun');

      // Step 5: Care (Old step 3)
      if (quizAnswers.step5 === 'low') categoryKeywords.push('Low Maintenance', 'Drought Tolerant', 'Cactus', 'Succulents');

      if (allProducts.length > 0) {
        matchedProducts = allProducts.filter(p => {
          if(!p.categories) return false;
          let pCats = Array.isArray(p.categories) ? p.categories : [];
          if (typeof p.categories === 'string') {
            try { pCats = JSON.parse(p.categories); } catch(e){}
          }
          return categoryKeywords.some(kw => pCats.some(c => c.toLowerCase().includes(kw.toLowerCase())));
        });

        if (matchedProducts.length < 6) {
          const others = allProducts.filter(p => !matchedProducts.some(mp => mp.id === p.id));
          const shuffled = others.sort(() => 0.5 - Math.random());
          matchedProducts = [...matchedProducts, ...shuffled.slice(0, 6 - matchedProducts.length)];
        }
      } else {
        matchedProducts = [
          { id: 16, name: "Snake Plant (Sansevieria)", price: 199, image: "/images/snake_plant.png" },
          { id: 18, name: "Jade Plant (Crassula ovata)", price: 179, image: "/images/jade_plant.png" },
          { id: 1, name: "Golden Pothos (Money Plant)", price: 149, image: "/images/money_plant.png" },
          { id: 17, name: "Aloe Vera Plant", price: 149, image: "/images/aloe_vera.png" },
          { id: 15, name: "Golden Barrel Cactus", price: 299, image: "/images/barrel_cactus.png" },
          { id: 12, name: "Areca Palm", price: 399, image: "/images/areca_palm.png" }
        ];
      }

      matchedProducts = matchedProducts.slice(0, 6);

      const gridEl = document.getElementById('quiz-results-grid');
      if (gridEl) {
        gridEl.innerHTML = matchedProducts.map(p => `
          <div class="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 flex flex-col hover:bg-white/20 transition-all group">
            <div class="w-full h-32 sm:h-24 md:h-32 rounded-lg overflow-hidden mb-3 shrink-0">
              <img src="${p.image || '/images/default.png'}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
            </div>
            <h4 class="text-white font-bold text-sm leading-tight mb-1 line-clamp-2 flex-grow">${p.name}</h4>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
              <span class="text-emerald-300 font-bold text-base">₹${p.price}</span>
              <button onclick="window.RanjitCart.addToCart(${p.id})" class="bg-emerald-500 hover:bg-emerald-400 text-white p-1.5 rounded-lg transition-colors cursor-pointer z-10 relative">
                <i data-lucide="shopping-cart" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  }

  // ─── Plant Doctor Logic ──────────────────────────────────────
  const symptomBtns = document.querySelectorAll('.symptom-btn');
  const doctorResult = document.getElementById('doctor-result');
  
  const doctorData = {
    yellow: {
      title: "Overwatering or Nutrient Deficiency",
      desc: "Yellow leaves often indicate that the roots are suffocating from too much water, or the plant lacks essential nitrogen.",
      remedy: "Organic NPK Fertilizer & Soil Aeration",
      link: "products.html?category=Fertilizers",
      icon: "alert-triangle",
      color: "text-yellow-600"
    },
    bugs: {
      title: "Pest Infestation (Aphids/Mealybugs)",
      desc: "Small insects or sticky sap on leaves mean pests are feeding on your plant's sap. Left untreated, this can stunt growth.",
      remedy: "Premium Cold-Pressed Neem Oil",
      link: "products.html?category=Pesticides",
      icon: "bug",
      color: "text-red-600"
    },
    drooping: {
      title: "Underwatering or Heat Stress",
      desc: "When plants lose water faster than they can absorb it, their cells lose turgidity, causing stems and leaves to wilt.",
      remedy: "Moisture-Retaining Potting Mix",
      link: "products.html?category=Soil",
      icon: "droplet",
      color: "text-blue-600"
    },
    spots: {
      title: "Fungal or Bacterial Leaf Spot",
      desc: "Dark spots usually develop when water sits on leaves for too long in poor ventilation, promoting fungal growth.",
      remedy: "Organic Fungicide Spray",
      link: "products.html?category=Pesticides",
      icon: "microscope",
      color: "text-gray-600"
    }
  };

  function updatePlantDoctor(symptomKey) {
    if (!doctorResult || !doctorData[symptomKey]) return;
    
    const data = doctorData[symptomKey];
    
    doctorResult.classList.add('opacity-0', 'translate-y-4');
    
    setTimeout(() => {
      doctorResult.innerHTML = `
        <div class="mb-5 relative z-10">
          <div class="flex items-center gap-3 mb-4">
             <div class="relative">
               <div class="absolute inset-0 bg-${data.color.split('-')[1]}-200 rounded-xl blur animate-pulse opacity-60"></div>
               <div class="relative w-14 h-14 rounded-2xl bg-white flex items-center justify-center ${data.color} border border-gray-100 shadow-md">
                 <i data-lucide="${data.icon}" class="w-6 h-6"></i>
               </div>
             </div>
             <div>
               <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-widest mb-1 border border-red-100">
                 <span class="w-1 h-1 rounded-full bg-red-600 animate-pulse"></span> Alert
               </div>
               <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Diagnosis Match</h4>
             </div>
          </div>
          <h3 class="text-2xl font-outfit font-extrabold text-gray-900 mb-3 leading-tight">${data.title}</h3>
          <p class="text-gray-600 text-base leading-relaxed">${data.desc}</p>
        </div>
        
        <div class="bg-gradient-to-br from-emerald-50 to-green-50/50 rounded-xl p-5 border border-emerald-200 shadow-[inset_0_2px_10px_rgba(52,211,153,0.1)] relative z-10">
          <h4 class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><i data-lucide="shield-check" class="w-4 h-4"></i> Verified Remedy</h4>
          <p class="text-lg font-bold text-gray-900 mb-4">${data.remedy}</p>
          <div class="flex flex-col sm:flex-row gap-2">
            <a href="${data.link}" class="flex-1 text-center bg-white border-2 border-emerald-200 text-emerald-800 hover:border-primary hover:text-primary font-bold py-2.5 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm">
              <i data-lucide="shopping-bag" class="w-4 h-4"></i> Shop Product
            </a>
            <a href="https://wa.me/919692905128?text=Hi!%20I%20used%20the%20Plant%20Doctor.%20My%20plant%20has%20${symptomKey}%20symptoms.%20Can%20you%20help?" target="_blank" class="flex-1 text-center bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.6)] transform hover:-translate-y-0.5 text-sm">
               <i data-lucide="message-circle" class="w-4 h-4"></i> Consult Expert
            </a>
          </div>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      doctorResult.classList.remove('opacity-0', 'translate-y-4');
    }, 300);
  }

  if (symptomBtns.length > 0) {
    symptomBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Remove active class from all
        symptomBtns.forEach(b => {
          b.classList.remove('border-primary', 'bg-emerald-50');
          b.classList.add('border-transparent', 'bg-white');
        });
        
        // Add active class to clicked
        const current = e.currentTarget;
        current.classList.remove('border-transparent', 'bg-white');
        current.classList.add('border-primary', 'bg-emerald-50');
        
        const symptom = current.dataset.symptom;
        updatePlantDoctor(symptom);
      });
    });

    // Initialize first symptom
    updatePlantDoctor('yellow');
    symptomBtns[0].classList.remove('border-transparent', 'bg-white');
    symptomBtns[0].classList.add('border-primary', 'bg-emerald-50');
  }

  // ─── Global Search Logic ──────────────────────────────────────
  const searchInput = document.getElementById('global-search-input');
  const searchResults = document.getElementById('global-search-results');
  
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        searchResults.innerHTML = '<div class="text-center text-gray-400 py-10">Start typing to search our catalogue...</div>';
        return;
      }
      
      const allProducts = window.RanjitCart ? window.RanjitCart.PRODUCTS : [];
      const matches = allProducts.filter(p => {
        const nameMatch = p.name && p.name.toLowerCase().includes(q);
        const catMatch = p.category && p.category.toLowerCase().includes(q);
        const tagsMatch = p.categories && Array.isArray(p.categories) && p.categories.some(c => c.toLowerCase().includes(q));
        return nameMatch || catMatch || tagsMatch;
      });
      
      if (matches.length === 0) {
        searchResults.innerHTML = '<div class="text-center text-gray-400 py-10">No products found for "'+q+'"</div>';
        return;
      }

      searchResults.innerHTML = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' + matches.map(p => `
        <div class="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors shadow-sm">
          <img src="${p.image || '/images/default.png'}" alt="${p.name}" class="w-16 h-16 rounded-lg object-cover">
          <div class="flex-grow">
            <h4 class="text-gray-900 font-bold text-sm line-clamp-2">${p.name}</h4>
            <span class="text-emerald-600 font-bold text-sm">₹${p.price}</span>
          </div>
          <button onclick="window.RanjitCart.addToCart(${p.id});" class="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-2 rounded-lg transition-colors shrink-0" title="Add to Cart">
            <i data-lucide="shopping-cart" class="w-4 h-4"></i>
          </button>
        </div>
      `).join('') + '</div>';
      
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  // ─── Initialize E-Commerce Cart System ─────────────────────
  window.RanjitCart = Cart;
  Cart.init();
});

// ─── DYNAMIC LANDING PAGE GENERATION ────────────────────────────
window.fetchAndRenderLandingPage = async () => {
    if (!window.supabase) return;
    
    // Check if we are on index.html (the homepage)
    const isHomepage = document.getElementById('hero-carousel') || document.getElementById('mobile-promo-banners');
    if (!isHomepage) return;
    
    try {
        const { data, error } = await supabase.from('store_settings').select('landing_config').eq('id', 1).single();
        if (error && error.code !== 'PGRST116') throw error;
        
        let config = data?.landing_config;
        if (!config || Object.keys(config).length === 0) {
            initHeroCarousel(); // Initialize the fallback HTML slider
            return;
        }
        
        // Render Desktop Hero Slides
        const heroContainer = document.getElementById('hero-carousel');
        const dotsContainer = document.getElementById('hero-dots');
        if (heroContainer && config.hero_slides && config.hero_slides.length > 0) {
            heroContainer.innerHTML = config.hero_slides.map((slide, i) => `
                <div class="carousel-slide absolute inset-0 w-full h-full transition-opacity duration-1000 ${i === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}" data-index="${i}">
                    <div class="absolute inset-0 z-0">
                        <div class="w-full h-full bg-cover bg-center" style="background-image: url('${slide.image || ''}');"></div>
                        <div class="absolute inset-0 bg-gradient-to-r from-emerald-950/90 to-emerald-900/60 mix-blend-multiply"></div>
                    </div>
                    <div class="relative z-10 h-full flex flex-col justify-center items-center text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="slide-content transform ${i === 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} transition-all duration-700 ease-out ${i === 0 ? 'mt-10 md:mt-0' : 'delay-300'}">
                            ${slide.badge ? `<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/50 text-amber-300 mb-8 mx-auto"><i data-lucide="sparkles" class="w-4 h-4"></i><span class="text-sm font-bold tracking-wider uppercase">${slide.badge}</span></div>` : ''}
                            <h1 class="text-5xl md:text-7xl font-outfit font-extrabold text-white mb-6 leading-tight drop-shadow-lg">${slide.title}</h1>
                            <p class="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl font-light mx-auto drop-shadow-md">${slide.subtitle}</p>
                            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href="products.html" class="px-8 py-4 bg-primary hover:bg-emerald-600 text-white rounded-full font-semibold text-lg transition-all shadow-xl hover:shadow-primary/40 transform hover:-translate-y-1 text-center">Explore Our Plants</a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            if (dotsContainer) {
                dotsContainer.innerHTML = config.hero_slides.map((_, i) => `
                    <button class="carousel-dot ${i === 0 ? 'w-10 opacity-100' : 'w-3 opacity-40'} h-3 rounded-full bg-white transition-all duration-300"></button>
                `).join('');
            }
            
            // Re-initialize hero carousel logic
            initHeroCarousel();
        }
        
        // Render Mobile Promo Banners
        const mobileBannersContainer = document.getElementById('mobile-promo-banners');
        if (mobileBannersContainer && config.mobile_banners && config.mobile_banners.length > 0) {
            mobileBannersContainer.innerHTML = config.mobile_banners.map(banner => `
                <div class="snap-center shrink-0 w-[85vw] max-w-[320px] rounded-2xl ${banner.bg_color || 'bg-gradient-to-r from-emerald-800 to-primary'} p-5 text-white relative overflow-hidden shadow-md">
                    <div class="relative z-10">
                        <span class="bg-white/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Promo</span>
                        <h3 class="text-xl font-bold mt-2">${banner.title}</h3>
                        <p class="text-emerald-100 text-sm mt-1 mb-3">${banner.text}</p>
                        <a href="products.html" class="inline-block bg-white text-gray-900 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">Shop Now</a>
                    </div>
                    ${banner.image ? `<img src="${banner.image}" class="absolute -right-4 -bottom-4 w-32 h-32 opacity-15 object-contain" />` : ''}
                </div>
            `).join('');
        }
        
        // Render About Us
        if (config.about_us) {
            const titleEl = document.getElementById('dynamic-founder-title');
            const imgEl = document.getElementById('dynamic-founder-image');
            const textEl = document.getElementById('dynamic-about-text');
            
            if (titleEl && config.about_us.title) titleEl.textContent = config.about_us.title;
            if (imgEl && config.about_us.image) imgEl.src = config.about_us.image;
            if (textEl && config.about_us.text) textEl.textContent = config.about_us.text;
        }
        // Render Services
        const servicesList = document.getElementById('dynamic-services-list');
        if (servicesList && config.services && config.services.length > 0) {
            servicesList.innerHTML = config.services.map(svc => `
                <li class="flex items-start gap-3">
                  <div class="mt-1 bg-emerald-100 p-1.5 rounded-full text-primary shrink-0">
                    <i data-lucide="${svc.icon || 'check'}" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <strong class="text-gray-900">${svc.title}</strong>
                    <p class="text-gray-600 text-sm mt-1">${svc.desc}</p>
                  </div>
                </li>
            `).join('');
        }

        // Render Packages
        const packagesGrid = document.getElementById('dynamic-packages-grid');
        if (packagesGrid && config.packages && config.packages.length > 0) {
            packagesGrid.innerHTML = config.packages.map(pkg => `
                <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
                  <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-emerald-100/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h3 class="text-2xl font-outfit font-bold text-gray-900 mb-2 relative z-10">${pkg.title}</h3>
                  <div class="text-primary font-black text-xl mb-6 relative z-10">${pkg.price}</div>
                  <ul class="space-y-4 mb-8 relative z-10">
                    ${(pkg.features || '').split(',').map(f => `
                        <li class="flex items-center gap-3 text-gray-600">
                          <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-500 shrink-0"></i>
                          <span>${f.trim()}</span>
                        </li>
                    `).join('')}
                  </ul>
                  <button class="w-full bg-gray-50 hover:bg-primary text-gray-900 hover:text-white font-bold py-3 rounded-xl transition-colors relative z-10" onclick="window.RanjitCart && window.RanjitCart.openAuthModal ? window.RanjitCart.openAuthModal() : alert('Coming soon!')">
                    Select Package
                  </button>
                </div>
            `).join('');
        }

        // Render Testimonials
        const testimonialsGrid = document.getElementById('dynamic-testimonials-grid');
        if (testimonialsGrid && config.testimonials && config.testimonials.length > 0) {
            testimonialsGrid.innerHTML = config.testimonials.map((test, idx) => `
                <div class="bg-white/10 backdrop-blur-md rounded-3xl p-5 md:p-8 border border-white/20 shadow-xl animate-on-scroll opacity-0 translate-y-8 delay-${(idx % 3) * 100}">
                  <div class="flex text-accent-gold mb-4">
                    ${Array.from({length: 5}).map((_, i) => `<i data-lucide="star" class="w-5 h-5 ${i < parseInt(test.rating || 5) ? 'fill-current' : 'text-gray-400'}"></i>`).join('')}
                  </div>
                  <p class="text-gray-100 mb-6 italic">"${test.text}"</p>
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-emerald-800 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-accent shrink-0">
                      ${test.name ? test.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 class="text-white font-bold">${test.name}</h4>
                      <p class="text-emerald-200 text-sm">Customer</p>
                    </div>
                  </div>
                </div>
            `).join('');
            
            // Re-trigger scroll animations for injected content
            setTimeout(() => {
                if (window.IntersectionObserver) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.remove('opacity-0', 'translate-y-8');
                            }
                        });
                    }, { threshold: 0.1 });
                    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
                }
            }, 100);
        }
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
    } catch (err) {
        console.error("Error fetching landing page config:", err);
    }
};

function initHeroCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    if (slides.length > 0 && dots.length > 0) {
      let currentSlide = 0;
      let slideInterval;
  
      function goToSlide(index) {
        slides[currentSlide].classList.remove('opacity-100', 'z-10');
        slides[currentSlide].classList.add('opacity-0', 'z-0', 'pointer-events-none');
        const currentContent = slides[currentSlide].querySelector('.slide-content');
        if (currentContent) {
          currentContent.classList.remove('translate-y-0', 'opacity-100');
          currentContent.classList.add('translate-y-8', 'opacity-0');
        }
        
        dots[currentSlide].classList.remove('w-10', 'opacity-100');
        dots[currentSlide].classList.add('w-3', 'opacity-40');
  
        currentSlide = index;
  
        slides[currentSlide].classList.remove('opacity-0', 'z-0', 'pointer-events-none');
        slides[currentSlide].classList.add('opacity-100', 'z-10');
        
        dots[currentSlide].classList.remove('w-3', 'opacity-40');
        dots[currentSlide].classList.add('w-10', 'opacity-100');
  
        const newContent = slides[currentSlide].querySelector('.slide-content');
        if (newContent) {
          setTimeout(() => {
            newContent.classList.remove('translate-y-8', 'opacity-0');
            newContent.classList.add('translate-y-0', 'opacity-100');
          }, 100);
        }
      }
  
      function nextSlide() {
        goToSlide((currentSlide + 1) % slides.length);
      }
  
      function startSlideShow() {
        if(slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
      }
  
      function resetSlideShow() {
        if(slideInterval) clearInterval(slideInterval);
        startSlideShow();
      }
  
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          if (currentSlide !== index) {
            goToSlide(index);
            resetSlideShow();
          }
        });
      });
  
      startSlideShow();
    }
}

// Fetch rendering immediately after DOM loads (or manually called here)
document.addEventListener('DOMContentLoaded', () => {
    window.fetchAndRenderLandingPage();
});
