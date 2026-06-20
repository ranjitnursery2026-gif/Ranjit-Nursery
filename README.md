# Ranjit Nursery E-Commerce Platform 🌱

Welcome to the **Ranjit Nursery** source code! This is a modern, responsive, and dynamic E-Commerce web application built to sell plants, gardening tools, seeds, and fertilizers.

## 🚀 Live Features

### For Customers (Storefront)
*   **Dynamic Landing Page:** Features an immersive UI with scroll animations, dynamic product grids, and a customizable "Featured Products" section.
*   **Smart Product Catalog:** Real-time search, category filtering, and detailed product cards displaying average review ratings and stock status.
*   **Shopping Cart & Checkout:** Persistent cart using `localStorage`. Includes promo code validation and pincode serviceability checks before checkout.
*   **WhatsApp Ordering:** Seamlessly converts checkout data into a formatted WhatsApp message sent directly to the nursery's order number.
*   **Order Tracking & Reviews:** Customers can track their order status. Once an order is marked as "Delivered", customers can write product reviews directly from the tracking portal!

### For Administrators (Admin Dashboard)
*   **Secure Access:** Password-protected dashboard UI.
*   **Product Management:** Add, edit, delete, and bulk-delete products. Manage stock units and availability badges (In Stock, Out of Stock, Coming Soon).
*   **Order Management:** Track incoming orders and update delivery statuses (Processing, Shipped, Delivered, Cancelled).
*   **Delivery Areas:** Add, toggle, and delete serviceable pincodes. Control Cash on Delivery (COD) availability per pincode.
*   **Visual Category Builder:** Manage the store's mega menu and product tags without touching code! Add categories, subgroups, and links via an intuitive UI.
*   **Store Settings:** Change WhatsApp contact numbers (Sales, Inquiry, Services) and dynamically control the landing page's "Featured Products" section in real-time.
*   **Review Moderation:** View all customer reviews and remove inappropriate ones.

## 🛠 Tech Stack
*   **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript (ES6 Modules)
*   **Icons:** [Lucide Icons](https://lucide.dev/)
*   **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL)
*   **Deployment Workflow:** Git & GitHub

## 📂 Project Structure
```text
Ranjit Nursery/
├── index.html          # Landing Page
├── products.html       # Full Product Catalog Page
├── admin.html          # Admin Dashboard UI
├── main.js             # Core UI logic (Modals, Navigation, Search)
├── cart.js             # E-commerce Logic (Cart, Checkout, Orders, Products Fetching)
├── admin.js            # Admin panel logic and Supabase Data Management
├── supabase.js         # Supabase connection initialization
├── categoryData.js     # Fallback local category structure
└── setup.sql           # Database Schema & Migrations
```

## ⚙️ Setup Instructions

### 1. Database Initialization
This platform relies entirely on Supabase for data storage. To set up your project:
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project.
3. Go to the **SQL Editor** tab.
4. Open the `setup.sql` file from this repository, copy all the contents, and run the query. This will automatically create all required tables (`products`, `orders`, `pincodes`, `store_settings`, `reviews`, `store_category_data`) and insert the necessary default data.

### 2. Environment Variables
1. In your Supabase dashboard, navigate to **Project Settings > API**.
2. Copy your **Project URL** and **anon public API Key**.
3. Open `supabase.js` and replace the placeholder keys with your actual Supabase credentials.

### 3. Running Locally
Simply serve the directory using any local web server. For example:
```bash
# Using Node.js http-server
npx http-server

# Or using Python
python -m http.server
```
Visit `http://localhost:8080` to view the store.

## 🔒 Default Admin Credentials
To access the `/admin.html` page locally or in production, you will be prompted for a password.
*   **Default Password:** `Ranjit@123`
*(Note: You can change this password at any time from within the Admin Dashboard Settings tab).*
