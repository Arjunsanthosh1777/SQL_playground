/**
 * Seed SQL datasets for SQL Playground
 * Realistic, relational sample databases for Students, Employees, Products, and Customers & Orders.
 */

export interface DatasetMeta {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  tableCount: number;
  tables: string[];
  sqlSeed: string;
}

export const DATASETS: Record<string, DatasetMeta> = {
  students: {
    id: 'students',
    name: 'University & Students',
    tagline: 'Academic records, courses, professors, and grade enrollments',
    description: 'A university management database modeling academic departments, faculty professors, enrolled students, course catalogs, and semester grading.',
    icon: 'GraduationCap',
    tableCount: 5,
    tables: ['departments', 'professors', 'students', 'courses', 'enrollments'],
    sqlSeed: `
-- ========================================================
-- UNIVERSITY & STUDENTS DATASET
-- ========================================================

CREATE TABLE departments (
    dept_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    building TEXT NOT NULL,
    budget REAL NOT NULL
);

CREATE TABLE professors (
    professor_id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    dept_id INTEGER,
    hire_date TEXT NOT NULL,
    salary REAL NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    dept_id INTEGER,
    enrollment_year INTEGER NOT NULL,
    gpa REAL NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_code TEXT NOT NULL,
    title TEXT NOT NULL,
    credits INTEGER NOT NULL,
    dept_id INTEGER,
    professor_id INTEGER,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
    FOREIGN KEY (professor_id) REFERENCES professors(professor_id)
);

CREATE TABLE enrollments (
    enrollment_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    semester TEXT NOT NULL,
    grade TEXT,
    score INTEGER,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

-- Seed Departments
INSERT INTO departments VALUES
(1, 'Computer Science', 'Turing Hall', 1250000.00),
(2, 'Mathematics', 'Euler Pavilion', 850000.00),
(3, 'Physics', 'Curie Science Center', 950000.00),
(4, 'Economics', 'Smith Complex', 720000.00),
(5, 'Literature', 'Shakespeare Tower', 480000.00);

-- Seed Professors
INSERT INTO professors VALUES
(101, 'Ada', 'Lovelace', 'lovelace@university.edu', 1, '2016-08-15', 115000.00),
(102, 'Alan', 'Turing', 'turing@university.edu', 1, '2014-01-10', 128000.00),
(103, 'Carl', 'Gauss', 'gauss@university.edu', 2, '2012-09-01', 135000.00),
(104, 'Katherine', 'Johnson', 'johnson@university.edu', 2, '2017-03-20', 122000.00),
(105, 'Richard', 'Feynman', 'feynman@university.edu', 3, '2015-11-05', 119000.00),
(106, 'Marie', 'Curie', 'curie@university.edu', 3, '2010-07-12', 142000.00),
(107, 'John', 'Nash', 'nash@university.edu', 4, '2018-08-25', 110000.00),
(108, 'Maya', 'Angelou', 'angelou@university.edu', 5, '2019-01-15', 98000.00);

-- Seed Students
INSERT INTO students VALUES
(201, 'Alex', 'Chen', 'alex.chen@student.edu', 1, 2023, 3.85),
(202, 'Sarah', 'Jenkins', 's.jenkins@student.edu', 1, 2022, 3.92),
(203, 'David', 'Kim', 'david.kim@student.edu', 1, 2024, 3.40),
(204, 'Elena', 'Rostova', 'elena.r@student.edu', 2, 2022, 3.78),
(205, 'Marcus', 'Johnson', 'm.johnson@student.edu', 2, 2023, 3.25),
(206, 'Priya', 'Patel', 'priya.patel@student.edu', 3, 2021, 3.95),
(207, 'Liam', 'O’Connor', 'liam.oc@student.edu', 3, 2023, 3.10),
(208, 'Hannah', 'Schmidt', 'hannah.s@student.edu', 4, 2022, 3.65),
(209, 'Omar', 'Farooq', 'omar.f@student.edu', 4, 2024, 3.50),
(210, 'Chloe', 'Dubois', 'chloe.d@student.edu', 5, 2023, 3.80),
(211, 'Mateo', 'Garcia', 'mateo.g@student.edu', 1, 2024, 2.95),
(212, 'Amara', 'Okafor', 'amara.o@student.edu', 2, 2022, 3.88);

-- Seed Courses
INSERT INTO courses VALUES
(301, 'CS101', 'Introduction to Computing', 3, 1, 101),
(302, 'CS201', 'Data Structures & Algorithms', 4, 1, 102),
(303, 'CS301', 'Database Systems', 4, 1, 101),
(304, 'MATH101', 'Calculus I', 4, 2, 103),
(305, 'MATH201', 'Linear Algebra', 3, 2, 104),
(306, 'PHYS101', 'Classical Mechanics', 4, 3, 105),
(307, 'PHYS201', 'Quantum Mechanics', 4, 3, 106),
(308, 'ECON101', 'Principles of Microeconomics', 3, 4, 107),
(309, 'LIT101', 'World Literature', 3, 5, 108);

-- Seed Enrollments
INSERT INTO enrollments VALUES
(1, 201, 301, 'Fall 2023', 'A', 94),
(2, 201, 302, 'Spring 2024', 'A', 96),
(3, 201, 303, 'Fall 2024', 'A', 92),
(4, 202, 301, 'Fall 2022', 'A', 98),
(5, 202, 302, 'Spring 2023', 'A', 95),
(6, 202, 303, 'Fall 2023', 'A', 97),
(7, 203, 301, 'Fall 2024', 'B', 83),
(8, 204, 304, 'Fall 2022', 'A', 91),
(9, 204, 305, 'Spring 2023', 'B', 87),
(10, 205, 304, 'Fall 2023', 'C', 76),
(11, 206, 306, 'Fall 2021', 'A', 99),
(12, 206, 307, 'Spring 2022', 'A', 98),
(13, 207, 306, 'Fall 2023', 'B', 81),
(14, 208, 308, 'Fall 2022', 'A', 90),
(15, 209, 308, 'Fall 2024', 'B', 85),
(16, 210, 309, 'Fall 2023', 'A', 93),
(17, 211, 301, 'Fall 2024', 'C', 72),
(18, 212, 304, 'Fall 2022', 'A', 94),
(19, 212, 305, 'Spring 2023', 'A', 92);
`
  },

  employees: {
    id: 'employees',
    name: 'Corporate & HR',
    tagline: 'Company workforce, departments, managers, salaries, and client projects',
    description: 'Enterprise human resources database featuring employee hierarchies, department budgets, active tech projects, and compensation tracking.',
    icon: 'Briefcase',
    tableCount: 5,
    tables: ['departments', 'employees', 'projects', 'employee_projects', 'performance_reviews'],
    sqlSeed: `
-- ========================================================
-- CORPORATE & HR DATASET
-- ========================================================

CREATE TABLE departments (
    dept_id INTEGER PRIMARY KEY,
    dept_name TEXT NOT NULL,
    location TEXT NOT NULL,
    budget REAL NOT NULL
);

CREATE TABLE employees (
    emp_id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    job_title TEXT NOT NULL,
    dept_id INTEGER,
    manager_id INTEGER,
    hire_date TEXT NOT NULL,
    salary REAL NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
    FOREIGN KEY (manager_id) REFERENCES employees(emp_id)
);

CREATE TABLE projects (
    project_id INTEGER PRIMARY KEY,
    project_name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    budget REAL NOT NULL,
    status TEXT NOT NULL
);

CREATE TABLE employee_projects (
    emp_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    hours_allocated INTEGER NOT NULL,
    PRIMARY KEY (emp_id, project_id),
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE performance_reviews (
    review_id INTEGER PRIMARY KEY,
    emp_id INTEGER NOT NULL,
    review_year INTEGER NOT NULL,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    feedback TEXT,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
);

-- Seed Departments
INSERT INTO departments VALUES
(10, 'Executive', 'San Francisco, CA', 4500000.00),
(20, 'Engineering', 'Seattle, WA', 8200000.00),
(30, 'Product & Design', 'San Francisco, CA', 3100000.00),
(40, 'Sales & Marketing', 'New York, NY', 5400000.00),
(50, 'Human Resources', 'Austin, TX', 1600000.00);

-- Seed Employees
INSERT INTO employees VALUES
(1, 'Evelyn', 'Vance', 'e.vance@enterprise.com', 'Chief Executive Officer', 10, NULL, '2015-03-01', 320000.00),
(2, 'Marcus', 'Sterling', 'm.sterling@enterprise.com', 'VP of Engineering', 20, 1, '2016-06-15', 215000.00),
(3, 'Sophia', 'Castillo', 's.castillo@enterprise.com', 'VP of Product', 30, 1, '2017-02-10', 195000.00),
(4, 'Derek', 'Morgan', 'd.morgan@enterprise.com', 'VP of Sales', 40, 1, '2017-09-01', 190000.00),
(5, 'Clara', 'Bennett', 'c.bennett@enterprise.com', 'Director of HR', 50, 1, '2018-04-12', 150000.00),
(6, 'Devon', 'Miles', 'd.miles@enterprise.com', 'Principal Architect', 20, 2, '2018-08-01', 178000.00),
(7, 'Aisha', 'Khan', 'a.khan@enterprise.com', 'Senior Software Engineer', 20, 2, '2019-11-15', 145000.00),
(8, 'Lucas', 'Perez', 'l.perez@enterprise.com', 'Software Engineer', 20, 7, '2021-03-20', 115000.00),
(9, 'Maya', 'Lin', 'm.lin@enterprise.com', 'Junior Engineer', 20, 7, '2023-01-10', 88000.00),
(10, 'Julian', 'Ross', 'j.ross@enterprise.com', 'Lead Product Designer', 30, 3, '2019-05-18', 135000.00),
(11, 'Tara', 'Simmons', 't.simmons@enterprise.com', 'UX Researcher', 30, 3, '2021-08-22', 105000.00),
(12, 'Bradley', 'Cooper', 'b.cooper@enterprise.com', 'Senior Enterprise Account Exec', 40, 4, '2019-10-05', 130000.00),
(13, 'Jessica', 'Huang', 'j.huang@enterprise.com', 'Marketing Specialist', 40, 4, '2022-04-01', 92000.00),
(14, 'Carlos', 'Gomez', 'c.gomez@enterprise.com', 'HR Generalist', 50, 5, '2020-07-14', 85000.00);

-- Seed Projects
INSERT INTO projects VALUES
(101, 'Cloud Migration 2.0', '2023-01-15', '2024-06-30', 1200000.00, 'Completed'),
(102, 'NextGen Mobile App', '2023-08-01', '2024-12-15', 850000.00, 'In Progress'),
(103, 'AI Customer Assistant', '2024-02-01', NULL, 1500000.00, 'In Progress'),
(104, 'Global Brand Refresh', '2023-09-01', '2024-03-31', 400000.00, 'Completed'),
(105, 'Security Compliance ISO27001', '2024-04-01', '2024-11-30', 300000.00, 'In Progress');

-- Seed Employee Projects
INSERT INTO employee_projects VALUES
(6, 101, 'Lead Architect', 25),
(7, 101, 'Backend Tech Lead', 35),
(8, 101, 'Database Engineer', 40),
(7, 102, 'Backend Consultant', 10),
(8, 102, 'Fullstack Dev', 30),
(9, 102, 'Mobile Engineer', 40),
(10, 102, 'Design Lead', 20),
(6, 103, 'ML Infrastructure', 20),
(7, 103, 'Pipeline Lead', 30),
(10, 103, 'Product Designer', 15),
(10, 104, 'Brand Designer', 25),
(13, 104, 'Campaign Manager', 40),
(2, 105, 'Executive Sponsor', 5),
(6, 105, 'Security Lead', 20);

-- Seed Performance Reviews
INSERT INTO performance_reviews VALUES
(1, 6, 2023, 5, 'Exceptional technical vision and architecture delivery.'),
(2, 7, 2023, 5, 'Outstanding reliability; mentored junior engineers successfully.'),
(3, 8, 2023, 4, 'Solid contributor with fast turnaround times.'),
(4, 9, 2023, 4, 'Quick learner, adapted to stack with high enthusiasm.'),
(5, 10, 2023, 5, 'Revamped design system with remarkable consistency.'),
(6, 12, 2023, 4, 'Exceeded annual enterprise quota by 18%.');
`
  },

  products: {
    id: 'products',
    name: 'Retail Inventory & Suppliers',
    tagline: 'Product catalog, categories, wholesale suppliers, and stock tracking',
    description: 'A comprehensive supply chain and inventory management database detailing retail merchandise, supplier contacts, warehouse allocations, and unit pricing.',
    icon: 'Package',
    tableCount: 4,
    tables: ['categories', 'suppliers', 'products', 'inventory'],
    sqlSeed: `
-- ========================================================
-- RETAIL INVENTORY & SUPPLIERS DATASET
-- ========================================================

CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE suppliers (
    supplier_id INTEGER PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL
);

CREATE TABLE products (
    product_id INTEGER PRIMARY KEY,
    product_name TEXT NOT NULL,
    category_id INTEGER,
    supplier_id INTEGER,
    unit_price REAL NOT NULL,
    units_in_stock INTEGER NOT NULL,
    units_on_order INTEGER NOT NULL,
    reorder_level INTEGER NOT NULL,
    is_discontinued INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

CREATE TABLE inventory (
    inventory_id INTEGER PRIMARY KEY,
    product_id INTEGER NOT NULL,
    warehouse_code TEXT NOT NULL,
    bin_location TEXT NOT NULL,
    last_counted_date TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Seed Categories
INSERT INTO categories VALUES
(1, 'Electronics', 'Laptops, mobile devices, monitors, and computer accessories'),
(2, 'Audio & Sound', 'Headphones, studio monitors, wireless speakers, and DACs'),
(3, 'Office Furniture', 'Ergonomic chairs, sit-stand desks, and monitor arms'),
(4, 'Storage & Media', 'NVMe drives, external backup arrays, and memory cards'),
(5, 'Cables & Power', 'Thunderbolt cables, surge protectors, and USB-C chargers');

-- Seed Suppliers
INSERT INTO suppliers VALUES
(10, 'Apex Tech Supply', 'Hans Gruber', 'Germany', 'Munich', '+49-89-123456'),
(11, 'Nippon Component Ltd', 'Kenji Sato', 'Japan', 'Osaka', '+81-6-987654'),
(12, 'Nordic Industrial', 'Astrid Lind', 'Sweden', 'Stockholm', '+46-8-555123'),
(13, 'Pacific Rim Logistics', 'Wei Chen', 'Taiwan', 'Taipei', '+886-2-234567'),
(14, 'Silicon Valley Parts', 'Rachel Adams', 'United States', 'San Jose', '+1-408-555019');

-- Seed Products
INSERT INTO products VALUES
(101, 'Quantum UltraBook 15"', 1, 10, 1499.99, 45, 20, 15, 0),
(102, 'PixelView 4K 27" Monitor', 1, 11, 489.50, 78, 0, 20, 0),
(103, 'AcousticPro Studio Headphones', 2, 10, 299.00, 120, 50, 30, 0),
(104, 'SubBass Wireless Soundbar', 2, 13, 179.99, 65, 0, 15, 0),
(105, 'ErgoFlex Mesh Desk Chair', 3, 12, 549.00, 32, 15, 10, 0),
(106, 'Titan Stand Desk 60x30', 3, 12, 720.00, 18, 10, 8, 0),
(107, 'SpeedFast 2TB NVMe SSD', 4, 11, 169.99, 210, 100, 50, 0),
(108, 'SecureVault 8TB External HDD', 4, 14, 199.50, 84, 0, 25, 0),
(109, 'ProCharge 140W GaN Charger', 5, 13, 69.99, 310, 150, 60, 0),
(110, 'ThunderSpeed 40Gbps Cable 2m', 5, 13, 34.50, 420, 0, 80, 0),
(111, 'Legacy Optical Mouse USB', 1, 14, 14.99, 12, 0, 10, 1),
(112, 'Mechanical Keyboard RGB Pro', 1, 11, 139.00, 95, 25, 25, 0);

-- Seed Inventory Warehouses
INSERT INTO inventory VALUES
(1, 101, 'WH-WEST-01', 'A-12-3', '2024-05-10'),
(2, 102, 'WH-WEST-01', 'B-04-1', '2024-05-12'),
(3, 103, 'WH-EAST-02', 'C-08-2', '2024-05-15'),
(4, 104, 'WH-EAST-02', 'C-09-1', '2024-05-15'),
(5, 105, 'WH-CENTRAL-01', 'D-01-4', '2024-05-08'),
(6, 106, 'WH-CENTRAL-01', 'D-02-1', '2024-05-08'),
(7, 107, 'WH-WEST-01', 'E-03-2', '2024-05-20'),
(8, 108, 'WH-WEST-01', 'E-05-1', '2024-05-20'),
(9, 109, 'WH-EAST-02', 'F-02-3', '2024-05-18'),
(10, 110, 'WH-EAST-02', 'F-03-1', '2024-05-18');
`
  },

  customers_orders: {
    id: 'customers_orders',
    name: 'E-Commerce Orders & Customers',
    tagline: 'Retail consumer accounts, shopping orders, line items, and reviews',
    description: 'An end-to-end consumer storefront database containing registered buyers, multi-item checkout orders, transaction payments, and verified customer product reviews.',
    icon: 'ShoppingCart',
    tableCount: 5,
    tables: ['customers', 'orders', 'order_items', 'payments', 'reviews'],
    sqlSeed: `
-- ========================================================
-- E-COMMERCE ORDERS & CUSTOMERS DATASET
-- ========================================================

CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    loyalty_tier TEXT NOT NULL DEFAULT 'Bronze',
    joined_date TEXT NOT NULL
);

CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    order_date TEXT NOT NULL,
    shipping_date TEXT,
    order_status TEXT NOT NULL,
    total_amount REAL NOT NULL,
    shipping_fee REAL NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
    item_id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    unit_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    discount_rate REAL DEFAULT 0.0,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE payments (
    payment_id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    payment_method TEXT NOT NULL,
    amount_paid REAL NOT NULL,
    payment_date TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE reviews (
    review_id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    review_date TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Seed Customers
INSERT INTO customers VALUES
(1001, 'Liam', 'Henderson', 'liam.h@email.com', 'Austin', 'USA', 'Platinum', '2022-01-15'),
(1002, 'Emma', 'Watson', 'emma.w@email.co.uk', 'London', 'UK', 'Gold', '2022-03-22'),
(1003, 'Sora', 'Takahashi', 'sora.t@email.jp', 'Tokyo', 'Japan', 'Gold', '2022-06-10'),
(1004, 'Lucas', 'Müller', 'lucas.m@email.de', 'Berlin', 'Germany', 'Silver', '2023-01-05'),
(1005, 'Isabella', 'Rossi', 'isabella.r@email.it', 'Milan', 'Italy', 'Platinum', '2021-11-19'),
(1006, 'Mateo', 'Fernandez', 'mateo.f@email.es', 'Madrid', 'Spain', 'Bronze', '2023-04-14'),
(1007, 'Zoe', 'Dubois', 'zoe.d@email.fr', 'Paris', 'France', 'Silver', '2023-07-28'),
(1008, 'Noah', 'Smith', 'noah.smith@email.com', 'Seattle', 'USA', 'Bronze', '2023-10-12'),
(1009, 'Hannah', 'Ahn', 'hannah.ahn@email.kr', 'Seoul', 'South Korea', 'Gold', '2022-08-30');

-- Seed Orders
INSERT INTO orders VALUES
(5001, 1001, '2024-01-10', '2024-01-12', 'Delivered', 1549.99, 0.00),
(5002, 1002, '2024-01-15', '2024-01-17', 'Delivered', 489.50, 15.00),
(5003, 1003, '2024-02-01', '2024-02-03', 'Delivered', 338.99, 12.00),
(5004, 1001, '2024-02-14', '2024-02-16', 'Delivered', 720.00, 0.00),
(5005, 1004, '2024-03-02', '2024-03-05', 'Delivered', 204.49, 10.00),
(5006, 1005, '2024-03-20', '2024-03-22', 'Delivered', 1848.99, 0.00),
(5007, 1006, '2024-04-05', '2024-04-08', 'Delivered', 69.99, 8.50),
(5008, 1007, '2024-04-18', '2024-04-20', 'Delivered', 299.00, 12.00),
(5009, 1002, '2024-05-01', NULL, 'Processing', 549.00, 0.00),
(5010, 1008, '2024-05-02', NULL, 'Pending', 139.00, 9.99);

-- Seed Order Items
INSERT INTO order_items VALUES
(1, 5001, 'Quantum UltraBook 15"', 1499.99, 1, 0.0),
(2, 5001, 'ThunderSpeed 40Gbps Cable 2m', 34.50, 1, 0.0),
(3, 5001, 'Legacy Optical Mouse USB', 15.50, 1, 0.0),
(4, 5002, 'PixelView 4K 27" Monitor', 489.50, 1, 0.0),
(5, 5003, 'AcousticPro Studio Headphones', 299.00, 1, 0.0),
(6, 5003, 'ProCharge 140W GaN Charger', 69.99, 1, 0.10),
(7, 5004, 'Titan Stand Desk 60x30', 720.00, 1, 0.0),
(8, 5005, 'SpeedFast 2TB NVMe SSD', 169.99, 1, 0.0),
(9, 5005, 'ThunderSpeed 40Gbps Cable 2m', 34.50, 1, 0.0),
(10, 5006, 'Quantum UltraBook 15"', 1499.99, 1, 0.0),
(11, 5006, 'PixelView 4K 27" Monitor', 489.50, 1, 0.15),
(12, 5007, 'ProCharge 140W GaN Charger', 69.99, 1, 0.0),
(13, 5008, 'AcousticPro Studio Headphones', 299.00, 1, 0.0),
(14, 5009, 'ErgoFlex Mesh Desk Chair', 549.00, 1, 0.0),
(15, 5010, 'Mechanical Keyboard RGB Pro', 139.00, 1, 0.0);

-- Seed Payments
INSERT INTO payments VALUES
(701, 5001, 'Credit Card', 1549.99, '2024-01-10 14:22:00', 'Settled'),
(702, 5002, 'PayPal', 504.50, '2024-01-15 09:15:00', 'Settled'),
(703, 5003, 'Credit Card', 350.99, '2024-02-01 18:40:00', 'Settled'),
(704, 5004, 'Apple Pay', 720.00, '2024-02-14 11:05:00', 'Settled'),
(705, 5005, 'Credit Card', 214.49, '2024-03-02 16:30:00', 'Settled'),
(706, 5006, 'Bank Wire', 1848.99, '2024-03-20 10:00:00', 'Settled'),
(707, 5007, 'Credit Card', 78.49, '2024-04-05 13:12:00', 'Settled'),
(708, 5008, 'PayPal', 311.00, '2024-04-18 20:45:00', 'Settled'),
(709, 5009, 'Apple Pay', 549.00, '2024-05-01 15:20:00', 'Authorized'),
(710, 5010, 'Credit Card', 148.99, '2024-05-02 08:35:00', 'Pending');

-- Seed Reviews
INSERT INTO reviews VALUES
(1, 1001, 'Quantum UltraBook 15"', 5, 'Superb build quality, lightning-fast compiler performance!', '2024-01-25'),
(2, 1002, 'PixelView 4K 27" Monitor', 5, 'Color accuracy is top tier for photography work.', '2024-02-02'),
(3, 1003, 'AcousticPro Studio Headphones', 4, 'Crisp soundstage and very comfortable ear cups.', '2024-02-15'),
(4, 1005, 'Quantum UltraBook 15"', 5, 'Best laptop I have owned in a decade.', '2024-04-01'),
(5, 1006, 'ProCharge 140W GaN Charger', 5, 'Charges laptop and phone simultaneously without heating up.', '2024-04-20');
`
  }
};
