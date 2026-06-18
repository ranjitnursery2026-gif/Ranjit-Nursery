import { supabase } from './supabase.js';

const productListEl = document.getElementById('admin-product-list');
const form = document.getElementById('add-product-form');
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');
const saveBtn = document.getElementById('save-btn');

let products = [];
let currentTab = 'all';

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
        renderProducts();
    } catch (err) {
        console.error("Error fetching products:", err);
        productListEl.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500 font-medium">Failed to load products: ${err.message}</td></tr>`;
    }
}

// Render the product table
function renderProducts() {
    let filteredProducts = products;
    if (currentTab === 'plants') {
        filteredProducts = products.filter(p => p.categories && p.categories.some(c => c.toLowerCase().includes('plant')));
    } else if (currentTab === 'seeds') {
        filteredProducts = products.filter(p => p.categories && p.categories.some(c => c.toLowerCase().includes('seed')));
    } else if (currentTab === 'fertilizers') {
        filteredProducts = products.filter(p => p.categories && p.categories.some(c => ['fertilizer', 'medicine', 'soil', 'pesticide', 'cocopeat'].some(kw => c.toLowerCase().includes(kw))));
    } else if (currentTab === 'tools') {
        filteredProducts = products.filter(p => p.categories && p.categories.some(c => ['tool', 'pot', 'planter', 'accessory'].some(kw => c.toLowerCase().includes(kw))));
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

        let priceText = `₹${p.price}`;
        if (p.mrp && p.mrp > p.price) {
            priceText = `<div class="flex flex-col"><span class="text-sm font-semibold text-gray-900">₹${p.price}</span><span class="text-xs text-gray-400 line-through">₹${p.mrp}</span></div>`;
        }

        return `
            <tr class="hover:bg-gray-50 transition-colors group">
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
    document.getElementById('p-price').value = product.price;
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

// Start
document.addEventListener('DOMContentLoaded', initAdmin);
