# shahebbazar-web
COS40005 - Group 23 Shaheb Bazar 


Startup guide: 
1. Clone Respository:
git clone https://github.com/Slipperytaco/shahebbazar-web.git
cd shahebbazar-web

2. Install Required Software: 
- git 
- VS Code 
- Node.js -> 24.2.0
--- https://nodejs.org/en/download 
--- npm (comes with node) 
- PostgreSQL -> 15.19
--- https://www.enterprisedb.com/downloads/postgres-postgresql-downloads 
--- with pgAdmin 

3. Set Up PostgreSQL Database: 
Database creation: Open pgAdmin --> Query Tool:
--> CREATE DATABASE shahebbazar; 

In pgAdmin, open, run the SQL code in pgAdmin to create all tables: 
--> database/schema.sql 

Load sample data - run this query in pgAdmin: 
--> database/sampleinput.sql

4. Backend Setup:  
--> cd backend 

// install dependencies: 
--> npm install 

// inside /backend, create a file named .env , Add details: 
--> PGHOST=localhost
    PGUSER=postgres
    PGPASSWORD=<your-local-password>
    PGDATABASE=shahebbazar
    PGPORT=5432

// start the backend: 
--> node index.js

// you should see: 
"API running on http://localhost:4000"

// Test backend - visit: 
http://localhost:4000/api/vendors/ 
// you shold see the sample vendor JSON that was added earlier in these instructions

5. Frontend Setup (Next.js)
--> cd ../frontend 

// install dependencies: 
--> npm install 

// start the frontend 
--> npm run dev

//visit: 
http://localhost:3000

// go to:
http://localhost:3000/vendors/register

// after filling out the form and clicking submit check pgAdmin --> new vendor should appear. 

Naming CONVENTIONS: 
DATABASE NAMING CONVENTIONS: 
- table names --> snake_case plural
- column names --> table-prefixed snake_case
- foreign keys --> table_id
EXAMPLES: 
- vendor_id
- category_id
- user_email
- vendor_created_at

PROJECT STRUCTURE: 
shahebbazar-web/
│
├── backend/        # Express API
│   ├── routes/     # API routes (vendors, categories, etc.)
│   ├── db.js       # PostgreSQL connection
│   ├── index.js    # Server entry point
│   └── .env        # Environment variables
│
├── database/       # SQL schema + seed data
│   ├── schema.sql
│   └── sampleinput.sql
│
├── frontend/       # Next.js app
│   ├── app/
│   
│
└── docs/           # Documentation 

Branch structure: 
main → protected, production-ready
dev → shared development
feature/<task> → individual work