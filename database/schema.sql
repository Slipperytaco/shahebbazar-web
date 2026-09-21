-- Categories (MASTER)
-- - matches up other category tables - allows for vendors to have multiple 
-- and for categories to have multiple vendors many to many relationship
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name varchar(255) NOT NULL UNIQUE 
);

-- VENDORS PROFILE
CREATE TABLE vendors (
    vendor_id SERIAL PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_phone VARCHAR(20) NOT NULL,
    vendor_address TEXT,
	vendor_email TEXT,
    vendor_city VARCHAR(255),
    vendor_created_at TIMESTAMP DEFAULT NOW(),
    user_id INT REFERENCES users(user_id)
);


-- vendor <---> category many to many relationship
CREATE TABLE vendor_categories (
    vendor_id INT REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (vendor_id, category_id)
);

-- standard end users: 
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255),
    user_email VARCHAR(255) UNIQUE,
    user_password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    user_created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vendor_listings (
    listing_id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(category_id),
    vendor_id INT REFERENCES vendors(vendor_id),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2),
    category TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE listing_photos (
    photo_id SERIAL PRIMARY KEY,
    listing_id INT REFERENCES vendor_listings(listing_id),
    photo_url TEXT NOT NULL
);

CREATE TABLE vendor_categories (
    vendor_id INT REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (vendor_id, category_id)
);

CREATE TABLE inquiries (
    inquiry_id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES vendors(vendor_id),
    listing_id INTEGER REFERENCES vendor_listings(listing_id),
    
    inquiry_type TEXT DEFAULT 'general',   -- general | product | category | listing
    product_id INTEGER REFERENCES vendor_products(product_id),
    category_id INTEGER REFERENCES categories(category_id),

    customer_name TEXT,
    customer_email TEXT,
    message TEXT NOT NULL,

    status TEXT DEFAULT 'new',
    vendor_response TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE vendor_products (
    product_id SERIAL PRIMARY KEY,
    vendor_id INT REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    product_name TEXT NOT NULL
);

INSERT INTO categories (category_name) VALUES
('Silk & Textiles'),
('Handicrafts & Gifts'),
('Agro-Supplies & Inputs'),
('Machinery & Local Manufacturing'),
('Food & Agro Products'),
('Retail & Wholesale'),
('Services');
