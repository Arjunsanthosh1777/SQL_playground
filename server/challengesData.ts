/**
 * Learning Challenges Catalog for SQL Playground
 * Spans Beginner, Intermediate, and Advanced tiers covering SELECT, WHERE, JOIN,
 * GROUP BY, ORDER BY, INSERT, UPDATE, and DELETE.
 */

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'SELECT' | 'WHERE' | 'ORDER BY' | 'GROUP BY' | 'JOIN' | 'INSERT' | 'UPDATE' | 'DELETE' | 'SUBQUERY';
  datasetId: 'students' | 'employees' | 'products' | 'customers_orders';
  description: string;
  instructions: string;
  hints: string[];
  starterSql: string;
  expectedSql: string;
  isDml?: boolean;
  verifySql?: string; // Query used to check the table after DML mutation
}

export const CHALLENGES: Challenge[] = [
  // ===================== BEGINNER CHALLENGES =====================
  {
    id: 'b1-select-all-students',
    title: 'Select All University Departments',
    difficulty: 'beginner',
    category: 'SELECT',
    datasetId: 'students',
    description: 'Retrieve all recorded university departments from the database.',
    instructions: 'Write a SQL query to select all columns and rows from the `departments` table.',
    hints: [
      'Use the asterisk (*) symbol to select all columns.',
      'The syntax is SELECT * FROM table_name;',
      'Query the `departments` table.'
    ],
    starterSql: '-- Write a query to select all departments\nSELECT ',
    expectedSql: 'SELECT * FROM departments;'
  },
  {
    id: 'b2-select-columns-employees',
    title: 'Staff Directory Listing',
    difficulty: 'beginner',
    category: 'SELECT',
    datasetId: 'employees',
    description: 'Create a clean staff directory showing employee names, job titles, and hire dates.',
    instructions: 'Select `first_name`, `last_name`, `job_title`, and `hire_date` from the `employees` table.',
    hints: [
      'Specify the exact column names separated by commas after SELECT.',
      'Make sure spelling matches: first_name, last_name, job_title, hire_date.',
      'SELECT first_name, last_name, job_title, hire_date FROM employees;'
    ],
    starterSql: '-- Select specific columns from employees\nSELECT ',
    expectedSql: 'SELECT first_name, last_name, job_title, hire_date FROM employees;'
  },
  {
    id: 'b3-where-gpa-filter',
    title: 'Dean’s Honor Roll',
    difficulty: 'beginner',
    category: 'WHERE',
    datasetId: 'students',
    description: 'Filter students who achieved high academic distinction.',
    instructions: 'Select the `first_name`, `last_name`, and `gpa` of all students with a `gpa` greater than or equal to 3.80.',
    hints: [
      'Use the WHERE clause with the >= comparison operator.',
      'Filter on the `gpa` column.',
      'SELECT first_name, last_name, gpa FROM students WHERE gpa >= 3.80;'
    ],
    starterSql: '-- Find students with GPA >= 3.80\nSELECT first_name, last_name, gpa\nFROM students\nWHERE ',
    expectedSql: 'SELECT first_name, last_name, gpa FROM students WHERE gpa >= 3.80;'
  },
  {
    id: 'b4-where-multiple-conditions',
    title: 'High-Value Electronics',
    difficulty: 'beginner',
    category: 'WHERE',
    datasetId: 'products',
    description: 'Find active electronic hardware products with substantial stock.',
    instructions: 'Select `product_name`, `unit_price`, and `units_in_stock` from `products` where `category_id` is 1 AND `unit_price` is greater than 100.',
    hints: [
      'Combine conditions in the WHERE clause using the AND operator.',
      'Filter where category_id = 1 AND unit_price > 100.',
      'SELECT product_name, unit_price, units_in_stock FROM products WHERE category_id = 1 AND unit_price > 100;'
    ],
    starterSql: '-- Find electronics over $100\nSELECT product_name, unit_price, units_in_stock\nFROM products\nWHERE ',
    expectedSql: 'SELECT product_name, unit_price, units_in_stock FROM products WHERE category_id = 1 AND unit_price > 100;'
  },
  {
    id: 'b5-order-by-and-limit',
    title: 'Top 5 Highest Paid Employees',
    difficulty: 'beginner',
    category: 'ORDER BY',
    datasetId: 'employees',
    description: 'Determine the top compensated personnel in the corporate organization.',
    instructions: 'Select `first_name`, `last_name`, `job_title`, and `salary` from `employees`, ordered by `salary` in descending order, limiting the result to 5 rows.',
    hints: [
      'Use ORDER BY salary DESC for descending order.',
      'Append LIMIT 5 at the end of the query.',
      'SELECT first_name, last_name, job_title, salary FROM employees ORDER BY salary DESC LIMIT 5;'
    ],
    starterSql: '-- Find top 5 earners\nSELECT first_name, last_name, job_title, salary\nFROM employees\nORDER BY ',
    expectedSql: 'SELECT first_name, last_name, job_title, salary FROM employees ORDER BY salary DESC LIMIT 5;'
  },
  {
    id: 'b6-pattern-matching-like',
    title: 'US Customer Search',
    difficulty: 'beginner',
    category: 'WHERE',
    datasetId: 'customers_orders',
    description: 'Identify customers with email addresses ending in .com.',
    instructions: 'Select `first_name`, `last_name`, and `email` from `customers` whose `email` ends with \'.com\'.',
    hints: [
      'Use the LIKE operator with the wildcard character %.',
      'Pattern for ending with .com is \'%.com\'.',
      'SELECT first_name, last_name, email FROM customers WHERE email LIKE \'%.com\';'
    ],
    starterSql: '-- Find customers with .com emails\nSELECT first_name, last_name, email\nFROM customers\nWHERE email LIKE ',
    expectedSql: "SELECT first_name, last_name, email FROM customers WHERE email LIKE '%.com';"
  },

  // ===================== INTERMEDIATE CHALLENGES =====================
  {
    id: 'i1-aggregate-count-avg',
    title: 'Department Salary Statistics',
    difficulty: 'intermediate',
    category: 'GROUP BY',
    datasetId: 'employees',
    description: 'Calculate average compensation and staff headcount per department.',
    instructions: 'Write a query returning `dept_id`, the count of employees as `total_employees`, and the average salary rounded to 2 decimal places as `avg_salary`, grouped by `dept_id`.',
    hints: [
      'Use COUNT(*) AS total_employees and ROUND(AVG(salary), 2) AS avg_salary.',
      'Group by dept_id.',
      'SELECT dept_id, COUNT(*) AS total_employees, ROUND(AVG(salary), 2) AS avg_salary FROM employees GROUP BY dept_id;'
    ],
    starterSql: '-- Aggregate salary and headcount per department\nSELECT dept_id, COUNT(*) AS total_employees, ROUND(AVG(salary), 2) AS avg_salary\nFROM employees\nGROUP BY ',
    expectedSql: 'SELECT dept_id, COUNT(*) AS total_employees, ROUND(AVG(salary), 2) AS avg_salary FROM employees GROUP BY dept_id;'
  },
  {
    id: 'i2-group-by-having',
    title: 'High-Volume Customer Cities',
    difficulty: 'intermediate',
    category: 'GROUP BY',
    datasetId: 'customers_orders',
    description: 'Find countries with more than 1 registered customer.',
    instructions: 'Select `country` and the number of customers as `customer_count` from `customers`, grouped by `country`, keeping only countries where `customer_count` is greater than 1.',
    hints: [
      'To filter aggregated groups, use the HAVING clause, not WHERE.',
      'HAVING COUNT(*) > 1.',
      'SELECT country, COUNT(*) AS customer_count FROM customers GROUP BY country HAVING COUNT(*) > 1;'
    ],
    starterSql: '-- Find countries with more than 1 customer\nSELECT country, COUNT(*) AS customer_count\nFROM customers\nGROUP BY country\nHAVING ',
    expectedSql: 'SELECT country, COUNT(*) AS customer_count FROM customers GROUP BY country HAVING COUNT(*) > 1;'
  },
  {
    id: 'i3-inner-join-basic',
    title: 'Course Catalog with Faculty Names',
    difficulty: 'intermediate',
    category: 'JOIN',
    datasetId: 'students',
    description: 'Combine course listings with their assigned professor.',
    instructions: 'Perform an INNER JOIN between `courses` and `professors` on `courses.professor_id = professors.professor_id`. Select `courses.course_code`, `courses.title`, `professors.first_name`, and `professors.last_name`.',
    hints: [
      'Join syntax: FROM courses JOIN professors ON courses.professor_id = professors.professor_id',
      'Specify table prefixes to avoid ambiguity.',
      'SELECT courses.course_code, courses.title, professors.first_name, professors.last_name FROM courses JOIN professors ON courses.professor_id = professors.professor_id;'
    ],
    starterSql: '-- Join courses with professors\nSELECT courses.course_code, courses.title, professors.first_name, professors.last_name\nFROM courses\nJOIN professors ON ',
    expectedSql: 'SELECT courses.course_code, courses.title, professors.first_name, professors.last_name FROM courses JOIN professors ON courses.professor_id = professors.professor_id;'
  },
  {
    id: 'i4-multi-table-join',
    title: 'Customer Orders Breakdown',
    difficulty: 'intermediate',
    category: 'JOIN',
    datasetId: 'customers_orders',
    description: 'Trace customer orders and their associated item quantities.',
    instructions: 'Join `customers`, `orders`, and `order_items`. Select `customers.first_name`, `customers.last_name`, `orders.order_id`, `order_items.product_name`, and `order_items.quantity`. Order by `orders.order_id` ascending.',
    hints: [
      'Chain two JOINs: FROM customers JOIN orders ON customers.customer_id = orders.customer_id JOIN order_items ON orders.order_id = order_items.order_id',
      'Add ORDER BY orders.order_id ASC at the end.',
      'SELECT customers.first_name, customers.last_name, orders.order_id, order_items.product_name, order_items.quantity FROM customers JOIN orders ON customers.customer_id = orders.customer_id JOIN order_items ON orders.order_id = order_items.order_id ORDER BY orders.order_id ASC;'
    ],
    starterSql: '-- Multi-table join between customers, orders, and order_items\nSELECT customers.first_name, customers.last_name, orders.order_id, order_items.product_name, order_items.quantity\nFROM customers\nJOIN orders ON customers.customer_id = orders.customer_id\nJOIN order_items ON orders.order_id = order_items.order_id\nORDER BY ',
    expectedSql: 'SELECT customers.first_name, customers.last_name, orders.order_id, order_items.product_name, order_items.quantity FROM customers JOIN orders ON customers.customer_id = orders.customer_id JOIN order_items ON orders.order_id = order_items.order_id ORDER BY orders.order_id ASC;'
  },
  {
    id: 'i5-left-join-null-check',
    title: 'Students Without Recent Enrollments',
    difficulty: 'intermediate',
    category: 'JOIN',
    datasetId: 'students',
    description: 'Find students who have not enrolled in any registered course.',
    instructions: 'Perform a LEFT JOIN from `students` to `enrollments` on `students.student_id = enrollments.student_id`. Return `students.student_id`, `students.first_name`, and `students.last_name` where `enrollments.enrollment_id IS NULL`.',
    hints: [
      'Use LEFT JOIN to retain all students even if no enrollment row exists.',
      'Filter for unmatched rows using WHERE enrollments.enrollment_id IS NULL.',
      'SELECT students.student_id, students.first_name, students.last_name FROM students LEFT JOIN enrollments ON students.student_id = enrollments.student_id WHERE enrollments.enrollment_id IS NULL;'
    ],
    starterSql: '-- Find students with no enrollments\nSELECT students.student_id, students.first_name, students.last_name\nFROM students\nLEFT JOIN enrollments ON students.student_id = enrollments.student_id\nWHERE ',
    expectedSql: 'SELECT students.student_id, students.first_name, students.last_name FROM students LEFT JOIN enrollments ON students.student_id = enrollments.student_id WHERE enrollments.enrollment_id IS NULL;'
  },
  {
    id: 'i6-subquery-above-average',
    title: 'Above-Average Compensated Staff',
    difficulty: 'intermediate',
    category: 'SUBQUERY',
    datasetId: 'employees',
    description: 'Use a scalar subquery to find team members paid above company median/mean.',
    instructions: 'Select `first_name`, `last_name`, and `salary` from `employees` whose `salary` is strictly greater than the average salary of all employees in the table. Order by `salary` DESC.',
    hints: [
      'Use a subquery in the WHERE clause: WHERE salary > (SELECT AVG(salary) FROM employees)',
      'Order by salary DESC.',
      'SELECT first_name, last_name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees) ORDER BY salary DESC;'
    ],
    starterSql: '-- Subquery in WHERE clause\nSELECT first_name, last_name, salary\nFROM employees\nWHERE salary > (\n    SELECT AVG(salary) FROM employees\n)\nORDER BY salary DESC;' ,
    expectedSql: 'SELECT first_name, last_name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees) ORDER BY salary DESC;'
  },

  // ===================== ADVANCED CHALLENGES =====================
  {
    id: 'a1-self-join-hierarchy',
    title: 'Organizational Manager Hierarchy',
    difficulty: 'advanced',
    category: 'JOIN',
    datasetId: 'employees',
    description: 'Self-join the employee table to reveal who reports to whom.',
    instructions: 'Perform a self-join on `employees` (aliasing `e` for employee and `m` for manager). Select `e.first_name || \' \' || e.last_name AS employee_name`, `e.job_title`, and `m.first_name || \' \' || m.last_name AS manager_name`. Include only employees who have a manager (`e.manager_id IS NOT NULL`). Order by `employee_name` ASC.',
    hints: [
      'Join employees e with employees m ON e.manager_id = m.emp_id.',
      'Concatenate names using the || operator: e.first_name || \' \' || e.last_name AS employee_name.',
      'SELECT e.first_name || \' \' || e.last_name AS employee_name, e.job_title, m.first_name || \' \' || m.last_name AS manager_name FROM employees e JOIN employees m ON e.manager_id = m.emp_id ORDER BY employee_name ASC;'
    ],
    starterSql: '-- Self-join on employees\nSELECT \n  e.first_name || \' \' || e.last_name AS employee_name,\n  e.job_title,\n  m.first_name || \' \' || m.last_name AS manager_name\nFROM employees e\nJOIN employees m ON ',
    expectedSql: "SELECT e.first_name || ' ' || e.last_name AS employee_name, e.job_title, m.first_name || ' ' || m.last_name AS manager_name FROM employees e JOIN employees m ON e.manager_id = m.emp_id ORDER BY employee_name ASC;"
  },
  {
    id: 'a2-case-statement-tier',
    title: 'Product Stock Health Classification',
    difficulty: 'advanced',
    category: 'SELECT',
    datasetId: 'products',
    description: 'Classify inventory health dynamically using conditional CASE logic.',
    instructions: 'Select `product_name`, `units_in_stock`, and a calculated column `stock_status` using CASE: WHEN units_in_stock <= reorder_level THEN \'Critical Reorder\' WHEN units_in_stock <= reorder_level * 2 THEN \'Low Stock\' ELSE \'Adequate\' END. Order by `units_in_stock` ASC.',
    hints: [
      'Use CASE WHEN ... THEN ... ELSE ... END AS stock_status.',
      'Order by units_in_stock ASC.',
      'SELECT product_name, units_in_stock, CASE WHEN units_in_stock <= reorder_level THEN \'Critical Reorder\' WHEN units_in_stock <= reorder_level * 2 THEN \'Low Stock\' ELSE \'Adequate\' END AS stock_status FROM products ORDER BY units_in_stock ASC;'
    ],
    starterSql: '-- Categorize inventory with CASE WHEN\nSELECT product_name, units_in_stock,\n  CASE\n    WHEN units_in_stock <= reorder_level THEN \'Critical Reorder\'\n    WHEN units_in_stock <= reorder_level * 2 THEN \'Low Stock\'\n    ELSE \'Adequate\'\n  END AS stock_status\nFROM products\nORDER BY ',
    expectedSql: "SELECT product_name, units_in_stock, CASE WHEN units_in_stock <= reorder_level THEN 'Critical Reorder' WHEN units_in_stock <= reorder_level * 2 THEN 'Low Stock' ELSE 'Adequate' END AS stock_status FROM products ORDER BY units_in_stock ASC;"
  },
  {
    id: 'a3-dml-insert-record',
    title: 'Enroll New Scholar',
    difficulty: 'advanced',
    category: 'INSERT',
    datasetId: 'students',
    description: 'Insert a new freshman student record into the academic roster.',
    instructions: 'Write an INSERT statement to add a new student with `student_id = 299`, `first_name = \'Maya\'`, `last_name = \'Lin\'`, `email = \'maya.lin@student.edu\'`, `dept_id = 1`, `enrollment_year = 2024`, and `gpa = 3.90`.',
    hints: [
      'Syntax: INSERT INTO students (student_id, first_name, last_name, email, dept_id, enrollment_year, gpa) VALUES (299, \'Maya\', \'Lin\', \'maya.lin@student.edu\', 1, 2024, 3.90);',
      'Ensure string values are wrapped in single quotes.',
      'Check that column order matches your values.'
    ],
    starterSql: '-- Insert new student record\nINSERT INTO students (student_id, first_name, last_name, email, dept_id, enrollment_year, gpa)\nVALUES (',
    expectedSql: "INSERT INTO students (student_id, first_name, last_name, email, dept_id, enrollment_year, gpa) VALUES (299, 'Maya', 'Lin', 'maya.lin@student.edu', 1, 2024, 3.90);",
    isDml: true,
    verifySql: 'SELECT * FROM students WHERE student_id = 299;'
  },
  {
    id: 'a4-dml-update-record',
    title: 'Annual Department Merit Raise',
    difficulty: 'advanced',
    category: 'UPDATE',
    datasetId: 'employees',
    description: 'Apply an across-the-board 10% compensation increase to Engineering employees.',
    instructions: 'Write an UPDATE statement on `employees` setting `salary = ROUND(salary * 1.10, 2)` for all employees in `dept_id = 20`.',
    hints: [
      'Syntax: UPDATE employees SET salary = ROUND(salary * 1.10, 2) WHERE dept_id = 20;',
      'Remember the WHERE clause to avoid updating all employees!',
      'Check that dept_id = 20.'
    ],
    starterSql: '-- Give 10% raise to department 20\nUPDATE employees\nSET salary = ',
    expectedSql: 'UPDATE employees SET salary = ROUND(salary * 1.10, 2) WHERE dept_id = 20;',
    isDml: true,
    verifySql: 'SELECT emp_id, first_name, last_name, salary FROM employees WHERE dept_id = 20 ORDER BY emp_id ASC;'
  },
  {
    id: 'a5-dml-delete-record',
    title: 'Archive Discontinued Products',
    difficulty: 'advanced',
    category: 'DELETE',
    datasetId: 'products',
    description: 'Purge discontinued product lines from the active catalog.',
    instructions: 'Write a DELETE statement to remove all products from `products` where `is_discontinued = 1`.',
    hints: [
      'Syntax: DELETE FROM products WHERE is_discontinued = 1;',
      'Always test with a SELECT before executing a DELETE.',
      'Check that is_discontinued = 1.'
    ],
    starterSql: '-- Delete discontinued items\nDELETE FROM products\nWHERE ',
    expectedSql: 'DELETE FROM products WHERE is_discontinued = 1;',
    isDml: true,
    verifySql: 'SELECT COUNT(*) AS remaining_discontinued FROM products WHERE is_discontinued = 1;'
  },
  {
    id: 'a6-join-aggregate-having',
    title: 'Top Revenue Generating Customers',
    difficulty: 'advanced',
    category: 'JOIN',
    datasetId: 'customers_orders',
    description: 'Calculate total lifetime order expenditures by customer and identify VIP accounts.',
    instructions: 'Join `customers` and `orders` on `customers.customer_id = orders.customer_id`. Group by `customers.customer_id`, `customers.first_name`, and `customers.last_name`. Return `customers.customer_id`, `customers.first_name`, `customers.last_name`, and the sum of `orders.total_amount` rounded to 2 decimals as `lifetime_spend`. Only include customers whose `lifetime_spend` is at least 1000.00. Order by `lifetime_spend` DESC.',
    hints: [
      'Join customers c and orders o ON c.customer_id = o.customer_id',
      'Use GROUP BY c.customer_id, c.first_name, c.last_name',
      'Filter with HAVING SUM(orders.total_amount) >= 1000.00 and ORDER BY lifetime_spend DESC.'
    ],
    starterSql: '-- Lifetime customer spending >= 1000\nSELECT customers.customer_id, customers.first_name, customers.last_name, ROUND(SUM(orders.total_amount), 2) AS lifetime_spend\nFROM customers\nJOIN orders ON customers.customer_id = orders.customer_id\nGROUP BY customers.customer_id, customers.first_name, customers.last_name\nHAVING ',
    expectedSql: 'SELECT customers.customer_id, customers.first_name, customers.last_name, ROUND(SUM(orders.total_amount), 2) AS lifetime_spend FROM customers JOIN orders ON customers.customer_id = orders.customer_id GROUP BY customers.customer_id, customers.first_name, customers.last_name HAVING SUM(orders.total_amount) >= 1000.00 ORDER BY lifetime_spend DESC;'
  }
];
