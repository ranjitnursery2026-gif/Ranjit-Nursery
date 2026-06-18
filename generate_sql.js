import fs from 'fs';

// Read cart.js to extract the PRODUCTS array
const cartCode = fs.readFileSync('./cart.js', 'utf-8');

// Use a simple regex to extract the PRODUCTS array string
const productsMatch = cartCode.match(/export const PRODUCTS = (\[[\s\S]*?\]);\s*\/\//);
let productsString = '';

if (productsMatch) {
  productsString = productsMatch[1];
} else {
  // Try another regex if the first fails
  const fallbackMatch = cartCode.match(/export const PRODUCTS = (\[[\s\S]*?\]);/);
  productsString = fallbackMatch[1];
}

// Evaluate it in a safe context
let PRODUCTS = [];
try {
  PRODUCTS = eval(productsString);
} catch (e) {
  console.error("Error parsing PRODUCTS:", e);
}

// Generate SQL
let sql = `-- Run this script in your Supabase SQL Editor

-- 1. Create the products table
CREATE TABLE IF NOT EXISTS public.products (
  id integer PRIMARY KEY,
  name text NOT NULL,
  categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  price numeric NOT NULL,
  image text,
  description text,
  badge text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert existing products
INSERT INTO public.products (id, name, categories, price, image, description, badge, is_available) VALUES
`;

const values = PRODUCTS.map(p => {
  const badge = p.badge ? `'${p.badge.replace(/'/g, "''")}'` : 'NULL';
  const desc = p.description ? `'${p.description.replace(/'/g, "''")}'` : 'NULL';
  const cats = `'${JSON.stringify(p.categories).replace(/'/g, "''")}'::jsonb`;
  return `(${p.id}, '${p.name.replace(/'/g, "''")}', ${cats}, ${p.price}, '${p.image}', ${desc}, ${badge}, true)`;
});

sql += values.join(',\n') + ';\n';

fs.writeFileSync('./setup.sql', sql);
console.log('setup.sql generated successfully!');
