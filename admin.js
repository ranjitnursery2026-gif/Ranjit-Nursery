import { supabase } from './supabase.js';

const productListEl = document.getElementById('admin-product-list');
const form = document.getElementById('add-product-form');
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');
const saveBtn = document.getElementById('save-btn');

let products = [];
let currentTab = 'all';
let searchQuery = '';
let selectedProductIds = new Set();
let allCategories = [];

// Initialize Admin Dashboard
async function initAdmin() {
    if (sessionStorage.getItem('admin_auth') !== 'true') {
        document.getElementById('admin-login').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        return;
    }
    
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');

    if (!supabase) {
        productListEl.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500 font-medium">Supabase Connection Error. Check supabase.js configuration.</td></tr>`;
        return;
    }
    await fetchProducts();
}

window.loginAdmin = async () => {
    const pwdInput = document.getElementById('admin-password-input');
    const errEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');
    const pwd = pwdInput.value.trim();
    
    if(!pwd) return;
    
    btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Verifying...`;
    btn.disabled = true;
    errEl.classList.add('hidden');
    
    try {
        const { data, error } = await supabase.from('store_settings').select('admin_password').eq('id', 1).single();
        if (error) throw error;
        
        if (data && data.admin_password === pwd) {
            sessionStorage.setItem('admin_auth', 'true');
            initAdmin(); // reload dashboard
        } else {
            errEl.classList.remove('hidden');
            pwdInput.value = '';
        }
    } catch(err) {
        console.error("Login error:", err);
        alert("Database connection error or settings missing. Run setup.sql first.");
    } finally {
        btn.innerHTML = `<i data-lucide="log-in" class="w-5 h-5"></i> Access Dashboard`;
        btn.disabled = false;
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }
};

window.logoutAdmin = () => {
    sessionStorage.removeItem('admin_auth');
    document.getElementById('admin-login').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('admin-password-input').value = '';
};

// Fetch all products
async function fetchProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        products = data || [];
        
        // Extract unique categories for autocomplete
        const cats = new Set();
        products.forEach(p => {
            let pc = p.categories;
            if (typeof pc === 'string') {
                try { pc = JSON.parse(pc); } catch(e) { pc = []; }
            }
            if (Array.isArray(pc)) {
                pc.forEach(c => cats.add(c.trim()));
            }
        });
        allCategories = Array.from(cats).filter(Boolean).sort();
        
        calculateStats();
        renderProducts();
    } catch (err) {
        console.error("Error fetching products:", err);
        productListEl.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500 font-medium">Failed to load products: ${err.message}</td></tr>`;
    }
}

// Render the product table
function renderProducts() {
    let filteredProducts = products;
    
    // Apply Search Filter
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(q) || String(p.id).includes(q));
    }

    // Apply Tab Filter
    if (currentTab === 'plants') {
        filteredProducts = filteredProducts.filter(p => p.categories && p.categories.some(c => c.toLowerCase().includes('plant')));
    } else if (currentTab === 'seeds') {
        filteredProducts = filteredProducts.filter(p => p.categories && p.categories.some(c => c.toLowerCase().includes('seed')));
    } else if (currentTab === 'fertilizers') {
        filteredProducts = filteredProducts.filter(p => p.categories && p.categories.some(c => ['fertilizer', 'medicine', 'soil', 'pesticide', 'cocopeat'].some(kw => c.toLowerCase().includes(kw))));
    } else if (currentTab === 'tools') {
        filteredProducts = filteredProducts.filter(p => p.categories && p.categories.some(c => ['tool', 'pot', 'planter', 'accessory'].some(kw => c.toLowerCase().includes(kw))));
    }

    if (filteredProducts.length === 0) {
        productListEl.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No products found in this category.</td></tr>`;
        return;
    }

    productListEl.innerHTML = filteredProducts.map(p => {
        // Parse categories safely
        let cats = [];
        try {
            cats = typeof p.categories === 'string' ? JSON.parse(p.categories) : p.categories;
        } catch(e) {}
        
        const catText = (cats && cats.length) ? cats.slice(0,2).join(', ') + (cats.length > 2 ? '...' : '') : 'None';
        
        const availStatus = p.availability_status || 'In Stock';
        const stockCount = p.stock !== undefined && p.stock !== null ? p.stock : 10;
        
        let statusBadge = '';
        if (availStatus === 'In Stock') {
            statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-500/20"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Stock (${stockCount})</span>`;
        } else if (availStatus === 'Out of Stock') {
            statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-500/20"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Out of Stock</span>`;
        } else if (availStatus === 'Coming Soon') {
            statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500 text-white text-xs font-bold shadow-sm"><span class="w-1.5 h-1.5 rounded-full bg-white"></span> Coming Soon</span>`;
        } else if (availStatus === 'Not Available') {
            statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-xs font-bold border border-gray-200 dark:border-gray-700"><span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Not Available</span>`;
        } else {
            statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-xs font-bold border border-gray-200 dark:border-gray-700">${availStatus}</span>`;
        }

        const isCarpetGrass = p.name.toLowerCase().includes('carpet grass');
        let priceText = `<span class="text-gray-900 dark:text-white">₹${p.price}</span>`;
        if (isCarpetGrass) {
            priceText = `<div class="flex flex-col"><span class="text-sm font-bold text-gray-900 dark:text-white">₹3 to ₹15</span><span class="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">per sq. ft.</span></div>`;
        } else if (p.mrp && p.mrp > p.price) {
            priceText = `<div class="flex flex-col"><span class="text-sm font-semibold text-gray-900 dark:text-white">₹${p.price}</span><span class="text-xs text-gray-400 dark:text-gray-500 line-through">₹${p.mrp}</span></div>`;
        }

        return `
            <tr class="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors group">
                <td class="px-6 py-4 text-center">
                    <input type="checkbox" value="${p.id}" onchange="window.toggleProductSelection(${p.id}, this.checked)" ${selectedProductIds.has(p.id) ? 'checked' : ''} class="product-cb w-4 h-4 text-primary rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary">
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                            <img src="${p.image || 'https://via.placeholder.com/150'}" alt="${p.name}" class="w-full h-full object-cover">
                        </div>
                        <div>
                            <div class="font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-green-400 transition-colors">${p.name}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ID: ${p.id} ${p.badge ? `• <span class="text-primary dark:text-green-400 font-medium">${p.badge}</span>` : ''}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">${catText}</td>
                <td class="px-6 py-4">${priceText}</td>
                <td class="px-6 py-4 text-center">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="window.openEditModal(${p.id})" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">
                            <i data-lucide="edit-2" class="w-4 h-4"></i> Edit
                        </button>
                        <button onclick="window.deleteProduct(${p.id})" class="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30" title="Delete Product">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Toggle Availability
window.toggleStock = async (id, newStatus) => {
    try {
        const { error } = await supabase
            .from('products')
            .update({ is_available: newStatus })
            .eq('id', id);

        if (error) throw error;
        
        // Update local state
        const idx = products.findIndex(p => p.id === id);
        if (idx !== -1) {
            products[idx].is_available = newStatus;
            calculateStats();
            renderProducts();
            showToast(`Product ${newStatus ? 'marked as In Stock' : 'marked as Out of Stock'}!`);
        }
    } catch (err) {
        console.error("Error updating stock:", err);
        alert("Failed to update status.");
    }
};

// Delete Product
window.deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to completely delete this product? This action cannot be undone.")) return;
    
    try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        
        products = products.filter(p => p.id !== id);
        calculateStats();
        renderProducts();
        showToast("Product deleted successfully!");
    } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete product.");
    }
};

// Handle Tabs
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.admin-tab').forEach(t => {
            t.classList.remove('active', 'bg-white', 'text-primary', 'shadow-sm');
            t.classList.add('text-gray-600');
        });
        const btn = e.target;
        btn.classList.add('active', 'bg-white', 'text-primary', 'shadow-sm');
        btn.classList.remove('text-gray-600');
        
        currentTab = btn.getAttribute('data-tab');
        renderProducts();
    });
});

window.openAddModal = () => {
    form.reset();
    document.getElementById('p-id').value = '';
    document.getElementById('modal-title').innerText = 'Add New Product';
    document.getElementById('addProductModal').classList.remove('hidden');
};

window.openEditModal = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('p-id').value = product.id;
    document.getElementById('p-name').value = product.name;
    
    const priceInput = document.getElementById('p-price');
    const isCarpetGrass = product.name.toLowerCase().includes('carpet grass');
    if (isCarpetGrass) {
        priceInput.type = 'text';
        priceInput.value = '3 to 15 per sq. ft.';
        priceInput.readOnly = true;
        priceInput.classList.add('bg-gray-100', 'cursor-not-allowed', 'text-gray-500');
    } else {
        priceInput.type = 'number';
        priceInput.value = product.price;
        priceInput.readOnly = false;
        priceInput.classList.remove('bg-gray-100', 'cursor-not-allowed', 'text-gray-500');
    }
    
    document.getElementById('p-mrp').value = product.mrp || '';
    document.getElementById('p-badge').value = product.badge || '';
    document.getElementById('p-stock').value = product.stock !== undefined && product.stock !== null ? product.stock : 10;
    
    const availElement = document.getElementById('p-availability');
    if(availElement) {
        availElement.value = product.availability_status || 'In Stock';
    }
    
    let cats = product.categories;
    if (typeof cats === 'string') {
        try { cats = JSON.parse(cats); } catch(e) { cats = []; }
    }
    document.getElementById('p-categories').value = cats.join(', ');
    
    document.getElementById('p-image').value = product.image || '';
    document.getElementById('p-desc').value = product.description || '';
    
    document.getElementById('modal-title').innerText = 'Edit Product';
    document.getElementById('addProductModal').classList.remove('hidden');
};

// Add/Edit Product Form Submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Saving...`;
    saveBtn.disabled = true;

    try {
        const idVal = document.getElementById('p-id').value;
        const name = document.getElementById('p-name').value;
        const price = parseFloat(document.getElementById('p-price').value);
        const mrpVal = document.getElementById('p-mrp').value;
        const mrp = mrpVal ? parseFloat(mrpVal) : null;
        const stockVal = document.getElementById('p-stock').value;
        const stock = stockVal ? parseInt(stockVal) : 0;
        const image = document.getElementById('p-image').value;
        const desc = document.getElementById('p-desc').value || null;
        const badge = document.getElementById('p-badge').value || null;
        const availElement = document.getElementById('p-availability');
        const availability_status = availElement ? availElement.value : 'In Stock';
        const categoriesRaw = document.getElementById('p-categories').value;
        
        const categories = categoriesRaw.split(',').map(c => c.trim()).filter(Boolean);

        if (idVal) {
            // UPDATE EXISTING
            const updateProduct = { name, price, mrp, stock, image, description: desc, badge, categories, availability_status };
            const { error } = await supabase.from('products').update(updateProduct).eq('id', parseInt(idVal));
            if (error) throw error;
            showToast("Product updated successfully!");
        } else {
            // INSERT NEW
            const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
            const newId = maxId + 1;
            const newProduct = {
                id: newId,
                name,
                price,
                mrp,
                stock,
                image,
                description: desc,
                badge,
                categories,
                is_available: true,
                availability_status
            };
            const { error } = await supabase.from('products').insert([newProduct]);
            if (error) throw error;
            showToast("Product added successfully!");
        }

        document.getElementById('addProductModal').classList.add('hidden');
        form.reset();
        await fetchProducts(); // Refresh list

    } catch (err) {
        console.error("Error saving product:", err);
        alert("Failed to save product: " + err.message);
    } finally {
        saveBtn.innerHTML = `Save Product`;
        saveBtn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
});

function showToast(msg) {
    toastMsg.textContent = msg;
    toastEl.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toastEl.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Calculate Stats
function calculateStats() {
    const total = products.length;
    const oos = products.filter(p => !p.is_available || (p.stock !== undefined && p.stock <= 0)).length;
    let inventoryValue = 0;
    products.forEach(p => {
        if (p.is_available && p.stock > 0) {
            inventoryValue += (p.price * p.stock);
        }
    });

    const elTotal = document.getElementById('stat-total');
    if (elTotal) {
        elTotal.innerText = total;
        document.getElementById('stat-oos').innerText = oos;
        document.getElementById('stat-cats').innerText = allCategories.length;
        document.getElementById('stat-value').innerText = `₹${inventoryValue.toLocaleString()}`;
    }
}

// Search Functionality
const searchInput = document.getElementById('admin-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderProducts();
    });
}

// Bulk Selection
window.toggleProductSelection = (id, isChecked) => {
    if (isChecked) selectedProductIds.add(id);
    else selectedProductIds.delete(id);
    updateBulkDeleteBtn();
};

window.toggleAllProducts = (checkbox) => {
    const checkboxes = document.querySelectorAll('.product-cb');
    if (checkbox.checked) {
        checkboxes.forEach(cb => {
            cb.checked = true;
            selectedProductIds.add(parseInt(cb.value));
        });
    } else {
        checkboxes.forEach(cb => cb.checked = false);
        selectedProductIds.clear();
    }
    updateBulkDeleteBtn();
};

function updateBulkDeleteBtn() {
    const btn = document.getElementById('bulk-delete-btn');
    if (!btn) return;
    if (selectedProductIds.size > 0) {
        btn.classList.remove('hidden');
        btn.innerHTML = `<i data-lucide="trash-2" class="w-5 h-5"></i> Delete Selected (${selectedProductIds.size})`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } else {
        btn.classList.add('hidden');
    }
}

window.bulkDeleteProducts = async () => {
    if (selectedProductIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedProductIds.size} products? This cannot be undone.`)) return;

    try {
        const idsToDelete = Array.from(selectedProductIds);
        const { error } = await supabase.from('products').delete().in('id', idsToDelete);
        if (error) throw error;

        products = products.filter(p => !selectedProductIds.has(p.id));
        selectedProductIds.clear();
        
        const selectAllCb = document.getElementById('select-all-cb');
        if(selectAllCb) selectAllCb.checked = false;
        
        updateBulkDeleteBtn();
        calculateStats();
        renderProducts();
        showToast(`${idsToDelete.length} products deleted successfully!`);
    } catch (err) {
        console.error("Bulk delete error:", err);
        alert("Failed to delete selected products.");
    }
};

// View Switcher
window.switchAdminView = (viewName) => {
    // Hide all views
    ['products', 'categories', 'orders', 'pincodes', 'settings', 'reviews'].forEach(v => {
        const viewEl = document.getElementById(`view-${v}`);
        if(viewEl) viewEl.classList.add('hidden');
    });

    const inactiveClasses = ['font-medium', 'text-gray-500', 'hover:text-gray-900', 'hover:bg-gray-100', 'dark:text-gray-400', 'dark:hover:text-white', 'dark:hover:bg-gray-800'];
    const activeClasses = ['font-semibold', 'text-primary', 'bg-primary/10', 'dark:bg-primary/20', 'dark:text-green-400', 'shadow-sm'];

    // Reset all nav buttons
    ['products', 'categories', 'orders', 'pincodes', 'settings', 'reviews'].forEach(v => {
        const navEl = document.getElementById(`nav-${v}`);
        if (navEl) {
            navEl.classList.remove(...activeClasses);
            navEl.classList.add(...inactiveClasses);
        }
    });

    // Show active view and highlight button
    const activeView = document.getElementById(`view-${viewName}`);
    if(activeView) activeView.classList.remove('hidden');

    const activeNav = document.getElementById(`nav-${viewName}`);
    if (activeNav) {
        activeNav.classList.remove(...inactiveClasses);
        activeNav.classList.add(...activeClasses);
    }

    // Trigger data fetching for specific views
    if (viewName === 'orders') fetchOrders();
    if (viewName === 'pincodes') window.fetchAdminPincodes();
    if (viewName === 'settings') window.fetchSettings();
    if (viewName === 'reviews') fetchReviews();
    if (viewName === 'categories') window.fetchCategoryData();
};

window.toggleAdminTheme = () => {
    const isDark = document.body.classList.contains('dark');
    if (isDark) {
        document.body.classList.remove('dark');
        localStorage.setItem('admin_theme', 'light');
        document.getElementById('theme-toggle-text').textContent = 'Dark Mode';
    } else {
        document.body.classList.add('dark');
        localStorage.setItem('admin_theme', 'dark');
        document.getElementById('theme-toggle-text').textContent = 'Light Mode';
    }
};

// Initialize Theme
if (localStorage.getItem('admin_theme') === 'dark') {
    document.body.classList.add('dark');
    const toggleText = document.getElementById('theme-toggle-text');
    if (toggleText) toggleText.textContent = 'Light Mode';
}

let realOrders = [];

async function fetchOrders() {
    const orderList = document.getElementById('admin-order-list');
    if (!orderList || !supabase) return;

    orderList.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-400"><i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2"></i> Loading orders...</td></tr>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        realOrders = data || [];
        renderOrders();
    } catch (err) {
        console.error("Error fetching orders:", err);
        orderList.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500 font-medium">Failed to load orders: ${err.message}</td></tr>`;
    }
}

function renderOrders() {
    const orderList = document.getElementById('admin-order-list');
    if (!orderList) return;
    
    if (realOrders.length === 0) {
        orderList.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No orders found.</td></tr>`;
        return;
    }

    orderList.innerHTML = realOrders.map(o => {
        let statusColor = 'gray';
        if(o.status === 'Pending') statusColor = 'gray';
        if(o.status === 'Processing') statusColor = 'amber';
        if(o.status === 'Shipped') statusColor = 'blue';
        if(o.status === 'Delivered') statusColor = 'emerald';
        if(o.status === 'Cancelled') statusColor = 'red';
        
        const dateStr = new Date(o.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">${o.id}</td>
                <td class="px-6 py-4">
                    <div class="text-sm font-bold text-gray-900">${o.customer_name}</div>
                    <div class="text-xs text-gray-500">${o.customer_phone}</div>
                </td>
                <td class="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">${dateStr}</td>
                <td class="px-6 py-4">
                    <select onchange="window.updateOrderStatus('${o.id}', this.value)" class="bg-${statusColor}-50 border border-${statusColor}-200 text-${statusColor}-700 text-xs font-bold rounded-lg focus:ring-${statusColor}-500 focus:border-${statusColor}-500 block w-full p-1.5 cursor-pointer outline-none">
                        <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td class="px-6 py-4 text-right font-bold text-gray-900 whitespace-nowrap">₹${o.total_amount.toLocaleString('en-IN')}</td>
                <td class="px-6 py-4 text-center">
                    <button onclick="window.deleteOrder('${o.id}')" class="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full p-1.5 transition-colors focus:outline-none" title="Delete Order">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.deleteOrder = async (id) => {
    if(!supabase || !confirm(`Are you sure you want to permanently delete order ${id}?`)) return;
    try {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) throw error;
        
        realOrders = realOrders.filter(o => o.id !== id);
        renderOrders();
        showToast(`Order ${id} deleted successfully!`);
    } catch (err) {
        console.error("Error deleting order:", err);
        alert("Failed to delete order.");
    }
};

window.updateOrderStatus = async (id, newStatus) => {
    if(!supabase) return;
    try {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
        if (error) throw error;
        
        const idx = realOrders.findIndex(o => o.id === id);
        if (idx !== -1) {
            realOrders[idx].status = newStatus;
            renderOrders();
            showToast(`Order status updated to ${newStatus}`);
        }
    } catch (err) {
        console.error("Error updating order:", err);
        alert("Failed to update status.");
        fetchOrders(); // Revert UI
    }
};

// Start
document.addEventListener('DOMContentLoaded', initAdmin);

window.toggleCod = async (id, newStatus) => {
    if (!supabase) return;
    try {
        const { error } = await supabase.from('pincodes').update({ is_cod_available: newStatus }).eq('id', id);
        if (error) throw error;
        showToast(`COD ${newStatus ? 'enabled' : 'disabled'} for pincode.`);
        await fetchAdminPincodes();
    } catch (err) {
        console.error("Error toggling COD:", err);
        alert("Failed to toggle COD: " + err.message);
    }
};

// ─── PINCODE MANAGEMENT ──────────────────────────────────────
let adminPincodes = [];

window.fetchAdminPincodes = async () => {
    const grid = document.getElementById('pincodes-grid');
    if (!grid || !supabase) return;

    grid.innerHTML = `<div class="text-gray-400 w-full"><i data-lucide="loader-2" class="w-5 h-5 animate-spin mb-2 inline"></i> Loading pincodes...</div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    try {
        const { data, error } = await supabase.from('pincodes').select('*').order('code', { ascending: true });
        if (error) throw error;
        adminPincodes = data || [];
        renderPincodes();
    } catch (err) {
        console.error("Error fetching pincodes:", err);
        grid.innerHTML = `<div class="text-red-500 font-medium">Failed to load pincodes: ${err.message}</div>`;
    }
};

function renderPincodes() {
    const grid = document.getElementById('pincodes-grid');
    if (!grid) return;

    if (adminPincodes.length === 0) {
        grid.innerHTML = `<div class="text-gray-500 w-full">No pincodes added yet. Add one above.</div>`;
        return;
    }

    grid.innerHTML = adminPincodes.map(p => `
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border ${p.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'} font-semibold text-sm shadow-sm transition-all hover:shadow-md">
            <i data-lucide="map-pin" class="w-4 h-4"></i>
            ${p.code}
            <div class="h-4 w-px bg-gray-300 mx-1"></div>
            <button onclick="window.toggleCod('${p.id}', ${!p.is_cod_available})" class="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold transition-colors ${p.is_cod_available ? 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}" title="${p.is_cod_available ? 'Disable COD' : 'Enable COD'}">
                <i data-lucide="${p.is_cod_available ? 'check' : 'x'}" class="w-3 h-3"></i> COD
            </button>
            <button onclick="window.deletePincode('${p.id}')" class="ml-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full p-0.5 transition-colors focus:outline-none" title="Remove">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.addPincode = async () => {
    const input = document.getElementById('new-pincode');
    if (!input || !supabase) return;

    const code = input.value.trim();
    if (!code || code.length !== 6) return;

    // Check duplicate
    if (adminPincodes.find(p => p.code === code)) {
        alert("This pincode is already added.");
        return;
    }

    try {
        const { error } = await supabase.from('pincodes').insert([{ code, is_active: true }]);
        if (error) throw error;
        
        await window.fetchAdminPincodes();
        showToast(`Pincode ${code} added!`);
        input.value = '';
    } catch (err) {
        console.error("Error adding pincode:", err);
        alert("Failed to add pincode. Make sure the database setup was executed successfully.");
    }
};

window.deletePincode = async (id) => {
    if (!supabase || !confirm("Are you sure you want to remove this pincode?")) return;

    try {
        const { error } = await supabase.from('pincodes').delete().eq('id', id);
        if (error) throw error;

        adminPincodes = adminPincodes.filter(p => p.id !== id);
        renderPincodes();
        showToast("Pincode removed!");
    } catch (err) {
        console.error("Error deleting pincode:", err);
        alert("Failed to delete pincode.");
    }
};

// ─── SETTINGS MANAGEMENT ─────────────────────────────────────
window.fetchSettings = async () => {
    if (!supabase) return;
    try {
        const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single();
        if (error && error.code !== 'PGRST116') throw error; // ignore no rows error
        if (data) {
            const orderWa = document.getElementById('setting-order-whatsapp');
            const inquiryWa = document.getElementById('setting-inquiry-whatsapp');
            const servicesWa = document.getElementById('setting-services-whatsapp');
            const adminPwd = document.getElementById('setting-admin-password');
            if (orderWa) orderWa.value = data.order_whatsapp || '';
            if (inquiryWa) inquiryWa.value = data.inquiry_whatsapp || '';
            if (servicesWa) servicesWa.value = data.services_whatsapp || '';
            if (adminPwd) adminPwd.value = data.admin_password || '';

            const featuredTitle = document.getElementById('setting-featured-title');
            const featuredSubtitle = document.getElementById('setting-featured-subtitle');
            const featuredCategory = document.getElementById('setting-featured-category');
            if (featuredTitle) featuredTitle.value = data.featured_title || 'Our Core Products';
            if (featuredSubtitle) featuredSubtitle.value = data.featured_subtitle || 'Explore our diverse collection of premium plants, gardening supplies, and exotic specialities perfect for any space.';
            if (featuredCategory) featuredCategory.value = data.featured_category || '';
        }
    } catch (err) {
        console.error("Error fetching settings:", err);
    }
};

window.saveSettings = async () => {
    if (!supabase) return;
    const btn = document.getElementById('save-settings-btn');
    const orderWa = document.getElementById('setting-order-whatsapp').value.trim();
    const inquiryWa = document.getElementById('setting-inquiry-whatsapp').value.trim();
    const servicesWa = document.getElementById('setting-services-whatsapp').value.trim();
    const adminPwd = document.getElementById('setting-admin-password').value.trim();

    if (!orderWa || !inquiryWa || !servicesWa || !adminPwd) {
        alert("All fields are required.");
        return;
    }

    btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Saving...`;
    btn.disabled = true;

    try {
        const { error } = await supabase.from('store_settings').upsert({
            id: 1,
            order_whatsapp: orderWa,
            inquiry_whatsapp: inquiryWa,
            services_whatsapp: servicesWa,
            admin_password: adminPwd
        });
        if (error) throw error;
        showToast("Settings saved successfully!");
    } catch (err) {
        console.error("Error saving settings:", err);
        alert("Failed to save settings. Ensure setup.sql was executed.");
    } finally {
        btn.innerHTML = `<i data-lucide="save" class="w-5 h-5"></i> Save Settings`;
        btn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

window.saveFeaturedSettings = async () => {
    if (!supabase) return;
    const btn = document.querySelector('#featured-settings-form button[type="submit"]');
    const title = document.getElementById('setting-featured-title').value.trim();
    const subtitle = document.getElementById('setting-featured-subtitle').value.trim();
    const category = document.getElementById('setting-featured-category').value.trim();

    if (!title) {
        alert("Section Title is required.");
        return;
    }

    btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Saving...`;
    btn.disabled = true;

    try {
        const { error } = await supabase.from('store_settings').update({
            featured_title: title,
            featured_subtitle: subtitle,
            featured_category: category
        }).eq('id', 1);
        
        if (error) throw error;
        showToast("Featured section settings saved successfully!");
    } catch (err) {
        console.error("Error saving featured settings:", err);
        alert("Failed to save settings. Ensure setup.sql was executed.");
    } finally {
        btn.innerHTML = `<i data-lucide="save" class="w-5 h-5"></i> Save Featured Settings`;
        btn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

// Category Auto-suggestion Logic
const catInput = document.getElementById('p-categories');
const catSuggestions = document.getElementById('category-suggestions');

if (catInput && catSuggestions) {
    catInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const parts = val.split(',');
        const currentPart = parts[parts.length - 1].trimStart();
        const query = currentPart.toLowerCase();
        
        if (query.length === 0) {
            catSuggestions.classList.add('hidden');
            return;
        }
        
        const matches = allCategories.filter(c => c.toLowerCase().includes(query) && c.toLowerCase() !== query);
        
        if (matches.length > 0) {
            catSuggestions.innerHTML = matches.map(m => `
                <div class="px-4 py-3 hover:bg-emerald-50 cursor-pointer text-sm text-gray-700 font-medium transition-colors border-b border-gray-100 last:border-0 flex items-center gap-2" 
                     onclick="selectCategory('${m.replace(/'/g, "\\'")}')">
                    <i data-lucide="tag" class="w-4 h-4 text-emerald-500"></i> ${m}
                </div>
            `).join('');
            if (typeof lucide !== 'undefined') lucide.createIcons();
            catSuggestions.classList.remove('hidden');
        } else {
            catSuggestions.classList.add('hidden');
        }
    });

    window.selectCategory = (cat) => {
        const val = catInput.value;
        const parts = val.split(',');
        parts[parts.length - 1] = (parts.length === 1 ? '' : ' ') + cat;
        catInput.value = parts.join(',') + ', ';
        catSuggestions.classList.add('hidden');
        catInput.focus();
    };

    document.addEventListener('click', (e) => {
        if (!catInput.contains(e.target) && !catSuggestions.contains(e.target)) {
            catSuggestions.classList.add('hidden');
        }
    });
}

// ─── REVIEWS MANAGEMENT ──────────────────────────────────────

let allReviews = [];

async function fetchReviews() {
    const reviewList = document.getElementById('admin-reviews-list');
    if (!reviewList || !supabase) return;

    reviewList.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-400"><i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2"></i> Loading reviews...</td></tr>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, products(name, image)')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        allReviews = data || [];
        renderReviews();
    } catch (err) {
        console.error("Error fetching reviews:", err);
        reviewList.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500 font-medium">Failed to load reviews.</td></tr>`;
    }
}

function renderReviews() {
    const reviewList = document.getElementById('admin-reviews-list');
    if (!reviewList) return;
    
    if (allReviews.length === 0) {
        reviewList.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No reviews found.</td></tr>`;
        return;
    }

    reviewList.innerHTML = allReviews.map(r => {
        const dateStr = new Date(r.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
        const product = r.products || { name: 'Unknown Product', image: '' };
        
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += `<i data-lucide="star" class="w-3 h-3 ${i <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}"></i>`;
        }

        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <img src="${product.image}" class="w-10 h-10 rounded-md object-cover border border-gray-100">
                        <span class="font-bold text-gray-900 text-sm">${product.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-bold text-gray-900">${r.customer_name}</div>
                    <div class="text-xs text-gray-500 uppercase">ORD: ${r.order_id}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-0.5 mb-1">${starsHTML}</div>
                    <p class="text-sm text-gray-700 italic max-w-xs truncate" title="${r.comment || ''}">"${r.comment || 'No comment'}"</p>
                </td>
                <td class="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">${dateStr}</td>
                <td class="px-6 py-4 text-center">
                    <button onclick="window.deleteReview(${r.id})" class="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full p-1.5 transition-colors focus:outline-none" title="Delete Review">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.deleteReview = async (id) => {
    if(!supabase || !confirm("Are you sure you want to permanently delete this review?")) return;
    try {
        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) throw error;
        
        allReviews = allReviews.filter(r => r.id !== id);
        renderReviews();
        showToast("Review deleted successfully!");
    } catch (err) {
        console.error("Error deleting review:", err);
        alert("Failed to delete review.");
    }
};

// ─── CATEGORY MANAGEMENT ─────────────────────────────────────

let currentCategoryData = {};

window.fetchCategoryData = async () => {
    const container = document.getElementById('category-builder-container');
    const loader = document.getElementById('category-loading');
    if (!container || !supabase) return;
    
    container.innerHTML = '';
    loader.classList.remove('hidden');

    try {
        const { data, error } = await supabase.from('store_category_data').select('data').eq('id', 1).single();
        if (error) throw error;
        currentCategoryData = data.data || {};
        window.renderCategoryBuilder();
    } catch (err) {
        console.error("Error fetching categories:", err);
        alert("Failed to load categories.");
    } finally {
        loader.classList.add('hidden');
    }
};

window.renderCategoryBuilder = () => {
    const container = document.getElementById('category-builder-container');
    if (!container) return;
    
    let html = '';
    
    Object.keys(currentCategoryData).forEach(rootKey => {
        const groups = currentCategoryData[rootKey];
        
        let groupsHtml = '';
        groups.forEach((group, gIndex) => {
            groupsHtml += `
                <div class="border border-gray-100 rounded-lg p-4 bg-white shadow-sm relative group mb-4">
                    <button onclick="window.deleteGroup('${rootKey.replace(/'/g, "\\'")}', ${gIndex})" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1" title="Delete Group">
                        <i data-lucide="trash" class="w-4 h-4"></i>
                    </button>
                    <div class="mb-3">
                        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Group Title</label>
                        <input type="text" value="${group.title}" onchange="window.updateGroupTitle('${rootKey.replace(/'/g, "\\'")}', ${gIndex}, this.value)" class="w-full border-b border-gray-200 focus:border-primary outline-none py-1 font-bold text-gray-800 transition-colors">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Links (Comma separated)</label>
                        <textarea rows="2" onchange="window.updateGroupLinks('${rootKey.replace(/'/g, "\\'")}', ${gIndex}, this.value)" class="w-full border border-gray-200 rounded p-2 text-sm text-gray-600 focus:ring-1 focus:ring-primary outline-none resize-none transition-shadow">${group.links.join(', ')}</textarea>
                    </div>
                </div>
            `;
        });

        html += `
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 relative">
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 border-b border-gray-200 pb-3 gap-3">
                    <input type="text" value="${rootKey}" onchange="window.updateRootKey('${rootKey.replace(/'/g, "\\'")}', this.value)" class="text-xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent focus:border-primary outline-none px-1 py-0.5 w-full sm:w-1/2 transition-colors">
                    <div class="flex items-center gap-2">
                        <button onclick="window.addGroup('${rootKey.replace(/'/g, "\\'")}')" class="text-sm font-semibold text-primary hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <i data-lucide="plus" class="w-4 h-4"></i> Add Group
                        </button>
                        <button onclick="window.deleteRootCategory('${rootKey.replace(/'/g, "\\'")}')" class="text-sm font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <i data-lucide="trash-2" class="w-4 h-4"></i> Delete Root
                        </button>
                    </div>
                </div>
                <div class="space-y-4">
                    ${groupsHtml}
                </div>
            </div>
        `;
    });
    
    if (Object.keys(currentCategoryData).length === 0) {
        html = `<div class="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-500">No categories found. Click "Add Root Category" to begin.</div>`;
    }
    
    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.addRootCategory = () => {
    let name = "New Category";
    let counter = 1;
    while(currentCategoryData[name]) {
        name = "New Category " + counter;
        counter++;
    }
    currentCategoryData[name] = [];
    window.renderCategoryBuilder();
};

window.deleteRootCategory = (rootKey) => {
    if(confirm(`Delete the entire category "${rootKey}"?`)) {
        delete currentCategoryData[rootKey];
        window.renderCategoryBuilder();
    }
};

window.updateRootKey = (oldKey, newKey) => {
    if(oldKey === newKey || !newKey.trim()) return;
    if(currentCategoryData[newKey]) {
        alert("A category with this name already exists.");
        window.renderCategoryBuilder(); // revert UI
        return;
    }
    // Maintain object order by recreating
    const newData = {};
    Object.keys(currentCategoryData).forEach(k => {
        if(k === oldKey) newData[newKey] = currentCategoryData[oldKey];
        else newData[k] = currentCategoryData[k];
    });
    currentCategoryData = newData;
    window.renderCategoryBuilder();
};

window.addGroup = (rootKey) => {
    currentCategoryData[rootKey].push({ title: "New Group", links: [] });
    window.renderCategoryBuilder();
};

window.deleteGroup = (rootKey, gIndex) => {
    if(confirm("Delete this group?")) {
        currentCategoryData[rootKey].splice(gIndex, 1);
        window.renderCategoryBuilder();
    }
};

window.updateGroupTitle = (rootKey, gIndex, title) => {
    currentCategoryData[rootKey][gIndex].title = title.trim();
};

window.updateGroupLinks = (rootKey, gIndex, linksStr) => {
    currentCategoryData[rootKey][gIndex].links = linksStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

window.saveCategoryData = async () => {
    if (!supabase) return;
    try {
        const { error } = await supabase.from('store_category_data').update({ data: currentCategoryData }).eq('id', 1);
        if (error) throw error;
        showToast("Category data saved successfully!");
    } catch (err) {
        console.error("Error saving categories:", err);
        alert("Failed to save category data.");
    }
};
