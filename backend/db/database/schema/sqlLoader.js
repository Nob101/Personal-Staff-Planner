
/*
###############################
-- Module for loading and executing SQL script files dynamically
################################
*/



const fs = require('fs');
const path = require('path');


// Loads and executes all .sql files from the specified directories in alphabetical order
async function loadSqlFiles(client, directories) {
  for (const dir of directories) {  // Iterates through all provided directories
    
    if (fs.existsSync(dir)) {
      // Filters for .sql files and sorts them alphabetically to guarantee execution order
      const files = fs.readdirSync(dir).filter(file => file.endsWith('.sql')).sort(); 


      for (const file of files) {
            const fullPath = path.join(dir, file);
            const sql = fs.readFileSync(fullPath, 'utf8');

        try {
          // Execute the SQL file within the current transaction block
          await client.query(sql);
             console.log(`SQL executed successfully: ${file}`);
        } catch (err) {
            console.error(`Error in file ${file}:`, err.message);

          throw err; // Aborts the transaction and triggers a rollback on failure
        }
      }
    } else {
      console.warn(` Verzeichnis nicht gefunden: ${dir}`);
    }
  }
}

module.exports = { loadSqlFiles };