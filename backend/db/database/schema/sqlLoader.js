

/*
###############################

-- ZUm Laden der Trigger usw. (sql-files)

################################
*/



const fs = require('fs');
const path = require('path');


// *.sql asu den ordnern Laden

async function loadSqlFiles(client, directories) {
  for (const dir of directories) {
    
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();


      for (const file of files) {
            const fullPath = path.join(dir, file);
            const sql = fs.readFileSync(fullPath, 'utf8');

        try {

          await client.query(sql);
             console.log(`  SQL ausgeführt: ${file}`);
        } catch (err) {
            console.error(` Fehler in Datei ${file}:`, err.message);

          throw err; //  Transaktion bricht ab bei fehler
        }
      }
    } else {
      console.warn(`  ⚠️ Verzeichnis nicht gefunden: ${dir}`);
    }
  }
}

module.exports = { loadSqlFiles };