
DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER(10) NOT NULL
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES 
    ("Birkenstocks", "Shoe", 99.95, 300),
    ("TONYMOLY Sheetmask (14)", "Beauty", 26.00, 250),
    ("Cordless ONSON Vacuum Cleaner", "Home", 119.00, 2),
    ("Mophie Power Boost XXL External Battery", "Electronics", 39.99, 500),
    ("Steamed Brown Rice Bowl, Microwave (12)", "Grocery", 20.89, 30),
    ("Instant Pot", "Kitchen", 74.96, 5),
    ("Philips Sonicare G3 Toothbrush heads (4)", "Oral Care", 46.95, 400),
    ("Pilot G2 Ink Fine Pen (0.38)", "Office", 12.75, 200),
    ("Mr. SIGA Heavy Duty Scrub Sponge (24)", "Kitchen", 12.99, 50),
    ("Cheetos Crunchy Cheese Flavored Snacks, Party Size'", "Grocery", 3.95, 470);


--- SQL FOR SUPERVISOR VIEW
CREATE TABLE departments (
    department_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(50) NOT NULL UNIQUE,
    over_head_costs DECIMAL(10,2) NOT NULL
);

INSERT INTO departments (department_name, over_head_costs)
VALUES 
	("Electronics", 45000),
    ("Home", 10000),
    ("Shoe", 78000),
    ("Kitchen", 89000),
    ("Oral Care", 106000),
    ("Office", 53000),
    ("Grocery", 72500);

ALTER TABLE products
ADD COLUMN product_sales DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE products
ADD COLUMN quantity_purchased INTEGER(10) NOT NULL DEFAULT 0;

UPDATE products SET product_sales = quantity_purchased * price;