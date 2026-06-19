-- Run this script in your Supabase SQL Editor

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
(1, 'Exotic Dendrobium Orchid', '["Orchids","Trending Plants","Flowering Plants","Premium Gifts"]'::jsonb, 499, '/images/about_orchid_1781686291477.png', 'Stunning Dendrobium orchid in vibrant purple. Long-lasting blooms, perfect for gifting or home décor.', 'Specialty', true),
(2, 'White Phalaenopsis Orchid', '["Orchids","Indoor Plants","Low Maintenance Plants","Gifts Under ₹999"]'::jsonb, 649, '/images/white_orchid.png', 'Elegant white Phalaenopsis (Moth Orchid) — the queen of indoor orchids. Low maintenance, high impact.', 'Bestseller', true),
(3, 'Money Plant (Golden Pothos)', '["Indoor Plants","Air Purifying Plants","Low Maintenance Plants","Hanging Baskets","Plants For Office"]'::jsonb, 149, '/images/money_plant.png', 'Air-purifying golden pothos in a premium ceramic pot. Thrives in low light. Symbol of prosperity.', NULL, true),
(4, 'Areca Palm', '["Indoor Plants","Air Purifying Plants","Palm Plants","Areca Palm Plants","Plants for Living Room"]'::jsonb, 399, '/images/areca_palm.png', 'Elegant areca palm that acts as a natural air humidifier. Perfect for living rooms and offices.', 'Popular', true),
(5, 'Mango Sapling (Alphonso)', '["Fruit Plants","Fruit Plants can be grown in Pots","Grafted Fruit Plants","Summer Plants"]'::jsonb, 299, '/images/mango_sapling.png', 'Grafted Alphonso mango sapling. Starts bearing fruit within 2-3 years. Organically grown.', NULL, true),
(6, 'Guava Plant (Thai Variety)', '["Fruit Plants","Grafted Fruit Plants","Low Maintenance Plants"]'::jsonb, 199, '/images/guava_plant.png', 'High-yield Thai guava plant. Sweet, crispy fruits within the first year. Disease-resistant variety.', 'Popular', true),
(7, 'Neem Avenue Tree', '["Avenue Trees","Medicinal Plants","Outdoor Plants","Tree And Forestry Seeds"]'::jsonb, 549, '/images/neem_tree.png', 'Mature neem tree sapling (4ft). Natural pest repellent. Perfect for avenues and large gardens.', NULL, true),
(8, 'Carpet Grass Roll (10 sq ft)', '["Ground Cover Plants","Outdoor Plants"]'::jsonb, 799, '/images/carpet_grass.png', 'Premium Korean carpet grass roll covering 10 sq ft. Instant green lawn transformation.', 'Bestseller', true),
(9, 'Premium Plastic Pot (12 inch)', '["Plastic Planters","Floor Planters","Accessories"]'::jsonb, 129, '/images/ceramic_planter.png', 'Durable UV-resistant 12-inch plastic pot with drainage tray. Available in multiple colors.', NULL, true),
(10, 'Organic Vermicompost (5 Kg)', '["Organic Fertilizer","Best Seller Soil and Fertilizer","Soil Additives"]'::jsonb, 249, '/images/potting_mix.png', '100% organic vermicompost fertilizer. Enriches soil, boosts plant growth naturally.', 'Popular', true),
(11, 'Bougainvillea (Pink)', '["Flowering Plants","Bougainvillea Plants","Climber Plants","Outdoor Plants","All Season Flowering Plants"]'::jsonb, 179, '/images/bougainvillea.png', 'Vibrant pink bougainvillea plant. Drought-tolerant, blooms year-round. Perfect for fences and walls.', NULL, true),
(12, 'Jasmine (Mogra) Plant', '["Flowering Plants","Aromatic / Fragrant Plants","Aromatic Plants","Plants'' Packs For Pooja"]'::jsonb, 199, '/images/jasmine_plant.png', 'Fragrant Arabian jasmine (Mogra). Heavenly scent, beautiful white flowers. Ideal for pooja gardens.', 'Specialty', true),
(13, 'Ficus Bonsai (Ginseng)', '["Bonsai Plants","Indoor Plants","Trending Plants","Plants for Table Top","Ficus Plants"]'::jsonb, 899, '/images/ficus_bonsai.png', 'Beautifully shaped Ficus Bonsai. A miniature tree that brings Zen to any indoor space.', 'Specialty', true),
(14, 'Pink Water Lily', '["Aquatic Plants","Outdoor Plants","Flowering Plants","Monsoon Plants","Summer Plants"]'::jsonb, 349, '/images/pink_water_lily.png', 'Stunning pink water lily tuber. Perfect for small ponds and outdoor water bowls.', NULL, true),
(15, 'Golden Barrel Cactus', '["Cactus Plants","Cactus and Succulents","Low Maintenance Plants","Drought Tolerant Plants","Indoor Plants"]'::jsonb, 299, '/images/barrel_cactus.png', 'Striking round cactus with golden spines. Needs very little water and bright sunlight.', NULL, true),
(16, 'Snake Plant (Sansevieria)', '["Air Purifying Plants","Indoor Plants","Oxygen Plants","Low Maintenance Plants","Plants for Bedroom"]'::jsonb, 199, '/images/snake_plant.png', 'One of the best air purifiers. Releases oxygen at night. Extremely hard to kill.', 'Bestseller', true),
(17, 'Aloe Vera Plant', '["Aloe vera Plants","Medicinal Plants","Air Purifying Plants","Low Maintenance Plants","Herb Plants"]'::jsonb, 149, '/images/aloe_vera.png', 'The wonder plant. Excellent for skin care, minor burns, and purifying indoor air.', 'Popular', true),
(18, 'Jade Plant (Crassula ovata)', '["Jade Plants","Lucky Plants","Indoor Plants","Plants for Office Desk","Foliage Plants"]'::jsonb, 179, '/images/jade_plant.png', 'Symbol of wealth and prosperity. Fleshy oval leaves, easy to care for.', NULL, true),
(19, 'Tomato Seeds (Hybrid)', '["Vegetable / Herb Seeds","Veg / Herb Seeds (Hybrid)","Easy to Grow Vegetable Seeds","Summer Seeds"]'::jsonb, 49, '/images/tomato_seeds.png', 'High-yielding hybrid tomato seeds. Disease resistant, suitable for home gardens and pots.', 'Popular', true),
(20, 'Marigold Seeds (French)', '["Marigold Seeds","Flower Seeds","Easy to grow Seeds","All Seasons Seeds","Flower Seeds Can be Grown in Pots"]'::jsonb, 39, 'https://image.pollinations.ai/prompt/Vibrant%20orange%20marigold%20flowers%20close%20up%20macro%20photography%20garden?width=600&height=600&nologo=true', 'Vibrant orange and yellow marigold seeds. Easy to grow, repels nematodes in soil.', NULL, true),
(21, 'Italian Basil Seeds', '["Basil Seeds","Exotic Herb Seeds","Easy to Grow Herb Seeds","Herb Seeds Can be Grown in Pots"]'::jsonb, 59, 'https://image.pollinations.ai/prompt/Fresh%20green%20basil%20leaves%20herb%20plant%20close%20up%20photography?width=600&height=600&nologo=true', 'Aromatic sweet Italian basil. Perfect for pesto, pastas, and kitchen gardens.', NULL, true),
(22, 'Premium Potting Mix (10 Kg)', '["Potting Soil","Best Seller Soil and Fertilizer","Soil and Fertilizers'' Packs","Soil","Fertilizers"]'::jsonb, 399, '/images/potting_mix.png', 'Ready-to-use enriched potting mix. Contains cocopeat, perlite, and organic compost.', 'Bestseller', true),
(23, 'Cocopeat Block (5 Kg)', '["Cocopeat","Soil Additives","Organic Fertilizer","Soil","Fertilizers"]'::jsonb, 229, '/images/cocopeat.png', 'Expands up to 75 liters. Excellent water retention, improves soil aeration.', NULL, true),
(24, 'Neem Cake Fertilizer (1 Kg)', '["Organic Fertilizer","Plant Medicines","Soil Additives","Fertilizers","Pesticides"]'::jsonb, 99, '/images/neem_cake.png', 'Organic pest repellent and fertilizer. Protects plant roots from nematodes and fungi.', NULL, true),
(25, 'Ceramic Glazed Planter', '["Ceramic Planters","Table Top Planters","Planters"]'::jsonb, 349, '/images/ceramic_planter.png', 'Elegant 6-inch ceramic planter with drip tray. Glossy finish, perfect for indoor tables.', 'Popular', true),
(26, 'Coir Hanging Basket', '["Coir Planters","Hanging Planters","Eco Friendly"]'::jsonb, 199, '/images/coir_basket.png', '10-inch eco-friendly coir hanging basket with metal chain. Excellent drainage.', NULL, true),
(27, 'Bamboo Plant in Glass Vase', '["Lucky Bamboos","Corporate Gifts","Gifts Under ₹499","Plants For Office Desk","Indoor Plants"]'::jsonb, 399, '/images/bamboo_vase.png', 'Two-layer lucky bamboo in a premium clear glass vase. Requires only water.', 'Specialty', true),
(28, 'Succulent Gift Box (Set of 3)', '["Corporate Gifts","Birthday Gifts","Gifts Under ₹999","Cactus and Succulents"]'::jsonb, 599, '/images/succulent_box.png', 'Assorted premium succulents planted in cute ceramic pots, beautifully packaged.', NULL, true),
(29, 'Balcony Garden Starter Kit', '["Balcony and Terrace Garden","Garden Kits","Value For Money Packs","Trending in Gardening"]'::jsonb, 1299, '/images/about_potted_1781686303406.png', 'Complete kit: 5 pots, 5 flowering plants, potting soil, and basic tools.', 'Bestseller', true),
(30, 'Indoor Air Purifier Pack', '["Air Purifying Plants'' Packs","Top 4 Plants'' Packs","Indoor Garden","Value For Money Packs"]'::jsonb, 899, '/images/about_potted_1781686303406.png', 'Set of 4 best air-purifying plants: Snake Plant, Areca Palm, Money Plant, and Spider Plant.', 'Specialty', true);

-- 3. Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric NOT NULL,
  shipping_method text,
  utr text,
  status text NOT NULL DEFAULT 'Processing',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create the pincodes table (Delivery Areas)
CREATE TABLE IF NOT EXISTS public.pincodes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Allow public read access (for the frontend to check if a pincode is valid)
ALTER TABLE public.pincodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on pincodes" ON public.pincodes;
CREATE POLICY "Allow public read access on pincodes" ON public.pincodes
  FOR SELECT USING (true);

-- Allow anonymous insert/update/delete for the Admin Panel
DROP POLICY IF EXISTS "Allow anonymous all access on pincodes" ON public.pincodes;
CREATE POLICY "Allow anonymous all access on pincodes" ON public.pincodes
  FOR ALL USING (true) WITH CHECK (true);

-- Insert the initial 32 pincodes provided by you
INSERT INTO public.pincodes (code, is_active) VALUES
  ('769001', true), ('769002', true), ('769003', true), ('769004', true),
  ('769005', true), ('769006', true), ('769007', true), ('769008', true),
  ('769009', true), ('769010', true), ('769011', true), ('769012', true),
  ('769013', true), ('769014', true), ('769015', true), ('769016', true),
  ('769017', true), ('769041', true), ('769042', true), ('769043', true),
  ('770012', true), ('770015', true), ('770016', true), ('770017', true),
  ('770018', true), ('770020', true), ('770021', true), ('770032', true),
  ('770033', true), ('770035', true), ('770036', true), ('770037', true)
ON CONFLICT (code) DO NOTHING;
