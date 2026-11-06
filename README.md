# SQL Playground 🚀

An interactive, production-quality educational web application where users can write, execute, understand, and practice SQL queries using realistic relational sample databases.

---

## 🌟 Key Features

- **Isolated Practice Sandboxes**: Every user session executes queries against an isolated in-memory SQLite WebAssembly (`sql.js`) database instance. Users can run any query—including `INSERT`, `UPDATE`, `DELETE`, and `CREATE TABLE`—without risking the host or other sessions.
- **Instant Factory Resets**: Reset tables back to their pristine seed state at any time with a single click.
- **4 Rich Relational Datasets**:
  1. **University & Students**: Departments, Professors, Students, Courses, and Enrollments.
  2. **Corporate & HR**: Departments, Employees, Projects, Assignments, and Performance Reviews.
  3. **Retail Inventory & Suppliers**: Categories, Suppliers, Products, and Warehouse Stock.
  4. **E-Commerce & Orders**: Customers, Orders, Order Items, Payments, and Reviews.
- **18+ Auto-Graded Challenges**: Categorized by Beginner, Intermediate, and Advanced tiers covering `SELECT`, `WHERE`, `ORDER BY`, `GROUP BY`, `JOIN`, `SUBQUERY`, `INSERT`, `UPDATE`, and `DELETE`.
- **Integrated Schema Explorer**: View all tables, primary keys, foreign keys, row counts, and sample records.
- **Full Query History & Bookmarks**: Diagnostic execution timers, row counters, status logs, and bookmarking for favorite queries.
- **Export Capabilities**: 1-click export of query output records to CSV or JSON.
- **Developer-Tool Aesthetics**: Dark and light modes, resizable panels, and monospace tabular numerals.

---

## 🛠️ Architecture & Tech Stack

```
SQL PLAYGROUND
├── Frontend (React 19, TypeScript, Vite, Tailwind CSS v4)
│   ├── CodeMirror 6 with SQL Syntax Highlighting (@codemirror/lang-sql)
│   ├── Resizable Split-Pane Workbench
│   ├── Real-time Schema Explorer
│   └── Tabular Data Grid with Sorting & Filtering
│
└── Backend (Node.js, Express, TypeScript, sql.js WebAssembly)
    ├── /api/execute           (Isolated SQL execution with timeouts)
    ├── /api/datasets          (Dataset metadata and schema inspection)
    ├── /api/challenges        (Challenge catalog)
    ├── /api/verify-challenge  (Sandboxed automated test grading)
    └── /api/reset             (Pristine memory snapshot cloning)
```

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd sql-playground
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(No external database credentials or API keys are required for SQLite playground mode).*

### 3. Start Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📡 Backend API Documentation

### 1. `POST /api/execute`
Executes SQL queries inside the session's isolated SQLite sandbox.

**Headers:**
- `Content-Type: application/json`
- `x-session-id: <session_string>` (optional, defaults to guest session)

**Request Body:**
```json
{
  "sql": "SELECT * FROM students WHERE gpa >= 3.80;",
  "datasetId": "students"
}
```

**Response (Success):**
```json
{
  "success": true,
  "results": [
    {
      "columns": ["student_id", "first_name", "last_name", "email", "dept_id", "enrollment_year", "gpa"],
      "values": [
        [206, "Priya", "Patel", "priya.patel@student.edu", 3, 2021, 3.95],
        [202, "Sarah", "Jenkins", "s.jenkins@student.edu", 1, 2022, 3.92]
      ],
      "rowCount": 2,
      "truncated": false,
      "statementType": "SELECT"
    }
  ],
  "executionTimeMs": 1.42
}
```

### 2. `GET /api/datasets`
Lists all available sample databases and their summary tables.

### 3. `GET /api/datasets/:id/schema`
Introspects tables, columns, data types, primary keys, foreign key constraints, and row counts.

### 4. `POST /api/reset`
Resets the specified dataset for the session back to its pristine seed data.

### 5. `GET /api/challenges`
Returns all 18 structured SQL challenges.

### 6. `POST /api/verify-challenge`
Runs the user's submitted query against canonical test cases in an isolated sandbox clone.

---

## 🔒 Security Architecture

1. **No Host Access**: Queries run exclusively inside in-memory WebAssembly SQLite instances.
2. **Restricted Operations**: Prohibits `ATTACH DATABASE`, `DETACH DATABASE`, `PRAGMA load_extension`, SQLite dot commands (`.shell`, `.read`), and OS file read/write routines.
3. **Execution Timeouts & Row Caps**: Large result sets are capped at 1,000 rows to prevent browser memory exhaustion, with clear user alerts.
4. **Sanitized Errors**: Internal system paths and server stack traces are scrubbed before returning error diagnostics.

---

## 🧪 Testing Instructions

Run the type-check and linting suite:
```bash
npm run lint
```

To test query execution and API endpoints via cURL:
```bash
# 1. Health check
curl http://localhost:3000/api/health

# 2. Execute SQL
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"sql":"SELECT * FROM departments;","datasetId":"students"}'

# 3. Test invalid SQL handling
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"sql":"SELECT * FROM non_existent_table;","datasetId":"students"}'
```

---

## 📸 Capturing Screenshots

To capture screenshots of the application:
1. **SQL Editor View**: Navigate to the SQL Editor, execute `SELECT * FROM students WHERE gpa >= 3.80;`, and show the results grid with execution time.
2. **Challenge Practice Modal**: Navigate to Challenges, click "Dean's Honor Roll", reveal a hint, and click "Verify Solution" to capture the success state.
3. **Database Explorer**: Navigate to Explorer, switch between datasets, and view the foreign key relationships and live preview records.
4. **Dark / Light Modes**: Click the sun/moon icon in the header to view both color schemes.
