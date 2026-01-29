

/*
###############################

-- Zum Laden der Trigger usw. (sql-files)

################################
*/



const fs = require('fs');
const path = require('path');


// *.sql -Files aus den ordnern Laden

async function loadSqlFiles(client, directories) {
  for (const dir of directories) {  //sucht in alle Verzeichnisse
    
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(file => file.endsWith('.sql')).sort(); //lädt gezielt .sql-FIles


      for (const file of files) {
            const fullPath = path.join(dir, file);
            const sql = fs.readFileSync(fullPath, 'utf8');

        try {
// Ausführen der sql-files in der aktuellen Transaktion
          await client.query(sql);
             console.log(`  SQL ausgeführt: ${file}`);
        } catch (err) {
            console.error(` Fehler in Datei ${file}:`, err.message);

          throw err; //  Transaktion bricht ab bei fehler -> RollBack
        }
      }
    } else {
      console.warn(` Verzeichnis nicht gefunden: ${dir}`);
    }
  }
}

module.exports = { loadSqlFiles };