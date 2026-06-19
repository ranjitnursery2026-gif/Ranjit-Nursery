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
    if (!supabase) {
        productListEl.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500 font-medium">Supabase Connection Error. Check supabase.js configuration.</td></tr>`;
        return;
    }
    await fetchProducts();
}

// Fetch all products
async function fetchProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('id', { ascending: false });

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
        
        const isAvailable = p.is_available;
        const stockCount = p.stock !== undefined && p.stock !== null ? p.stock : 10;
        const statusBadge = isAvailable && stockCount > 0
            ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Stock (${stockCount})</span>`
            : `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Out of Stock</span>`;

        const isCarpetGrass = p.name.toLowerCase().includes('carpet grass');
        let priceText = `₹${p.price}`;
        if (isCarpetGrass) {
            priceText = `<div class="flex flex-col"><span class="text-sm font-bold text-gray-900">₹3 to ₹15</span><span class="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">per sq. ft.</span></div>`;
        } else if (p.mrp && p.mrp > p.price) {
            priceText = `<div class="flex flex-col"><span class="text-sm font-semibold text-gray-900">₹${p.price}</span><span class="text-xs text-gray-400 line-through">₹${p.mrp}</span></div>`;
        }

        return `
            <tr class="hover:bg-gray-50 transition-colors group">
                <td class="px-6 py-4 text-center">
                    <input type="checkbox" value="${p.id}" onchange="window.toggleProductSelection(${p.id}, this.checked)" ${selectedProductIds.has(p.id) ? 'checked' : ''} class="product-cb w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary">
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                            <img src="${p.image || 'https://via.placeholder.com/150'}" alt="${p.name}" class="w-full h-full object-cover">
                        </div>
                        <div>
                            <div class="font-bold text-gray-900">${p.name}</div>
                            <div class="text-xs text-gray-500 mt-0.5">ID: ${p.id} ${p.badge ? `• <span class="text-primary font-medium">${p.badge}</span>` : ''}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">${catText}</td>
                <td class="px-6 py-4">${priceText}</td>
                <td class="px-6 py-4 text-center">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="window.openEditModal(${p.id})" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                            <i data-lucide="edit-2" class="w-4 h-4"></i> Edit
                        </button>
                        <button onclick="toggleStock(${p.id}, ${!isAvailable})" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            isAvailable ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-red-600' : 'bg-primary text-white hover:bg-green-800'
                        }">
                            <i data-lucide="${isAvailable ? 'x-circle' : 'check-circle'}" class="w-4 h-4"></i>
                            ${isAvailable ? 'Out of Stock' : 'Mark In Stock'}
                        </button>
                        <button onclick="window.deleteProduct(${p.id})" class="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200" title="Delete Product">
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
        const categoriesRaw = document.getElementById('p-categories').value;
        
        const categories = categoriesRaw.split(',').map(c => c.trim()).filter(Boolean);

        if (idVal) {
            // UPDATE EXISTING
            const updateProduct = { name, price, mrp, stock, image, description: desc, badge, categories };
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
                is_available: true
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
    document.getElementById('view-products').classList.add('hidden');
    document.getElementById('view-orders').classList.add('hidden');
    document.getElementById('view-pincodes').classList.add('hidden');
    
    const resetNav = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.replace('text-primary', 'text-gray-500');
            el.classList.replace('border-primary', 'border-transparent');
            el.classList.remove('font-bold');
        }
    };
    resetNav('nav-products');
    resetNav('nav-orders');
    resetNav('nav-pincodes');

    if (viewName === 'products') {
        document.getElementById('view-products').classList.remove('hidden');
        const nav = document.getElementById('nav-products');
        if (nav) {
            nav.classList.replace('text-gray-500', 'text-primary');
            nav.classList.replace('border-transparent', 'border-primary');
            nav.classList.add('font-bold');
        }
    } else if (viewName === 'orders') {
        document.getElementById('view-orders').classList.remove('hidden');
        const nav = document.getElementById('nav-orders');
        if (nav) {
            nav.classList.replace('text-gray-500', 'text-primary');
            nav.classList.replace('border-transparent', 'border-primary');
            nav.classList.add('font-bold');
        }
        fetchOrders();
    } else if (viewName === 'pincodes') {
        document.getElementById('view-pincodes').classList.remove('hidden');
        const nav = document.getElementById('nav-pincodes');
        if (nav) {
            nav.classList.replace('text-gray-500', 'text-primary');
            nav.classList.replace('border-transparent', 'border-primary');
            nav.classList.add('font-bold');
        }
        fetchAdminPincodes();
    }
};

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
            </tr>
        `;
    }).join('');
}

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
            <button onclick="window.deletePincode('${p.id}')" class="ml-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full p-0.5 transition-colors focus:outline-none" title="Remove">
                <i data-lucide="x" class="w-4 h-4"></i>
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
