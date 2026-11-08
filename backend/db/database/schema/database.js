

/**#####################################################
 * Module managing the database initialization
 * --------------------
 * 
 * EXECUTION FLOW:
 * 1. Role Check: Ensures the 'admin' role exists.
 * 2. Schema: Creates tables (must always run first).
 * 3. Logic: Loads PL/pgSQL functions, triggers, and database indexes.
 * 4. Seeds: Populates tables with initial master data (e.g., work types).
 * 5. Admin User: Creates the initial user (password hashed via Bcrypt from .env).
 * 
 * --------------------
 * NOTE: Uses 'sqlLoader.js' to automatically execute all files 
 * in their respective directories.
 */



// New! Pool is more maintainable when defined externally
const pool = require('../../pool.js');  
const bcrypt = require('bcrypt');
const path = require('path');

require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const { loadSqlFiles } = require("./sqlLoader");
const saltRounds = 10;

async function initDatabase() {
  const client = await pool.connect();

  try {
    const markusPassword = process.env.INITIAL_MARKUS_PASSWORD;
    const adminRole = process.env.DB_ROLE_ADMIN_PASSWORD;

    if (!markusPassword || !adminRole) {
      throw new Error(`Config-Passwörter fehlen in der .env!`);
    }
    /**
     * If the database already exists, the full setup block can be skipped.
     * Controlled via the PostgreSQL information schema checking for existing tables.
     */
    const checkTableRes = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables   --'Inhaltsverzeichnis' von Postgres über alle Tabellen
                WHERE table_schema = 'public' 
                AND table_name = 'dienstplaene'
                );
            `);

        const dbExists = checkTableRes.rows[0].exists;
        if(dbExists){
             console.log("--- Database already exists. Skipping setup ---");
             return ;
        }
    

        console.log("--- Database initialization started ---");
        // Wrapped in a DO block since Postgres does not support 'CREATE ROLE IF NOT EXISTS' directly
        // Admin has superuser privileges (Create, Delete, etc.). '%L' prevents special characters in passwords from breaking the SQL command.
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin') THEN
                    EXECUTE format('CREATE ROLE admin LOGIN PASSWORD %L SUPERUSER', '${adminRole}');
                END IF;
            END $$;
        `);
 
        await client.query('BEGIN');
 
        //!! Load external scripts directories
        const schemaDir = __dirname;
        
        const procedureDir = path.resolve(__dirname, '../procedures');
        const functionsDir = path.resolve(__dirname, '../functions');
        const triggersDir = path.resolve(__dirname, '../triggers');
        const indexesDir = path.resolve(__dirname, '../indexes');
        const seedsDir = path.resolve(__dirname, '../seeds');

        // Important: Load the schema first -> strict execution order 
            // First: Base schema tables
            await loadSqlFiles(client, [schemaDir]);

            // Second: Procedures and functions
            await loadSqlFiles(client, [procedureDir, functionsDir]);

            // Third: Triggers and indexes
            await loadSqlFiles(client, [triggersDir, indexesDir]);

            // Fourth: Seed data
            await loadSqlFiles(client, [seedsDir]);

            // Query Planner receives updated dataset statistics
            await client.query('CALL pr_refresh_indexes();');

            // Create initial admin user
            const hashPassword = await bcrypt.hash(markusPassword, saltRounds);

 
        await client.query(`
            INSERT INTO users (username, password_hash, role)
            VALUES ('markus', $1, 'admin') ON CONFLICT (username) DO NOTHING;
        `, [hashPassword]);
 
        await client.query('COMMIT');
 
 
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error("Database initialization failed:", err.message);
    } finally {
        client.release();
    }
}



module.exports = {
    query: (text, params) => pool.query(text, params),
    initDatabase,
};


