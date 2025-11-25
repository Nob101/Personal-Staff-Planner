// public/app.js
// Frontend-Logik für die Dienstplan-Ansicht (reines Vanilla JS)

const API_BASE = 'http://localhost:3000/api';

// DOM-Elemente
const jahrInput     = document.getElementById('jahrInput');
const monatInput    = document.getElementById('monatInput');
const ladenBtn      = document.getElementById('ladenBtn');
const neuGenerieren = document.getElementById('neuGenerieren');
const resultEl      = document.getElementById('result');


// ---------------------------------------------------------------------------
// Buttons: Dienstplan neu generieren / nur laden
// ---------------------------------------------------------------------------

// "Neu generieren" – ruft Backend mit force=1 auf
neuGenerieren.addEventListener('click', () => { 
  const jahr  = parseInt(jahrInput.value, 10);
  const monat = parseInt(monatInput.value, 10);

  if (isNaN(jahr) || isNaN(monat) || monat < 1 || monat > 12) {
    alert('Bitte gültiges Jahr und Monat eingeben.');
    return;
  }

  loadDienstplan(jahr, monat, 1);
});

// "Laden" – bestehenden Plan holen, wenn vorhanden
ladenBtn.addEventListener('click', () => {
  const jahr  = parseInt(jahrInput.value, 10);
  const monat = parseInt(monatInput.value, 10);

  if (isNaN(jahr) || isNaN(monat) || monat < 1 || monat > 12) {
    alert('Bitte gültiges Jahr und Monat eingeben.');
    return;
  }

  loadDienstplan(jahr, monat);
});


// ---------------------------------------------------------------------------
// Dienstplan vom Backend laden
// ---------------------------------------------------------------------------
async function loadDienstplan(jahr, monat, force = 0) {
  resultEl.innerHTML = '<p>Dienstplan wird geladen...</p>';

  try {
    const res = await fetch(
      `${API_BASE}/dienstplan?jahr=${jahr}&monat=${monat}&force=${force}`
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    renderDienstplan(data);

  } catch (err) {
    console.error('Fehler beim Laden des Dienstplans:', err);
    resultEl.innerHTML = `<p style="color:#f87171;">Fehler: ${err.message}</p>`;
  }
}


// ---------------------------------------------------------------------------
// Dienstplan rendern (Gesamt)
// ---------------------------------------------------------------------------
function renderDienstplan(data) {
  const { jahr, monat, filialen } = data;
  resultEl.innerHTML = '';

  if (!Array.isArray(filialen) || filialen.length === 0) {
    resultEl.innerHTML = '<p>Keine Filialen oder keine Daten vorhanden.</p>';
    return;
  }

  const header = document.createElement('h2');
  header.textContent = `Dienstplan für ${jahr}-${String(monat).padStart(2, '0')}`;
  resultEl.appendChild(header);

  filialen.forEach(fBlock => renderFilialeMatrix(fBlock, data));
}


// ---------------------------------------------------------------------------
// Dienst-Matrix einer Filiale rendern
// ---------------------------------------------------------------------------
function renderFilialeMatrix(fBlock, gesamtData) {
  const { filiale, arbeitstage, plan, info } = fBlock;

  const filialeDiv = document.createElement('div');
  filialeDiv.className = 'filiale-block';

  // ----- Kopfbereich: Name + Farbpunk -----
  const headerDiv = document.createElement('div');
  headerDiv.className = 'filiale-header';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'filiale-title';
  titleSpan.textContent = `${filiale.standort} (ID: ${filiale.id})`;

  const colorDot = document.createElement('div');
  colorDot.className = 'filiale-color';
  colorDot.style.backgroundColor = filiale.farbe;

  headerDiv.appendChild(titleSpan);
  headerDiv.appendChild(colorDot);
  filialeDiv.appendChild(headerDiv);

  // Sollstunden-Hinweis
  if (gesamtData.monatsstunden != null) {
    const sollDiv = document.createElement('div');
    sollDiv.style.fontSize = '0.85rem';
    sollDiv.style.color = '#aaa';
    sollDiv.textContent = `Soll-Stunden pro Vollzeit-Mitarbeiter: ${gesamtData.monatsstunden}h`;
    filialeDiv.appendChild(sollDiv);
  }

  // Info-Text vom Backend (z.B. Keine Filialen / Fehlerhinweise)
  if (info) {
    const infoP = document.createElement('p');
    infoP.style.fontSize = '0.85rem';
    infoP.style.color = '#facc15';
    infoP.textContent = info;
    filialeDiv.appendChild(infoP);
  }

  if (!Array.isArray(plan) || plan.length === 0) {
    resultEl.appendChild(filialeDiv);
    return;
  }


  // -------------------------------------------------------------------
  // Mitarbeiter sammeln (Zeilen) + Zellen-Map bauen
  // -------------------------------------------------------------------
  const dates = plan.map(p => p.datum);   // Spalten: alle Tage

  // mitarbeiterMap: id -> { id, name }
  const mitarbeiterMap = new Map();
  // cellMap: mitarbeiterId -> Map(datum -> einsatz)
  const cellMap = new Map();

  // Wir laufen über ALLE Filialblöcke des Plans,
  // aber nehmen nur Mitarbeiter, deren Hauptfiliale = diese Filiale ist.
  gesamtData.filialen.forEach(f => {
    (f.plan || []).forEach(tag => {
      const datum = tag.datum;

      (tag.einsatz || []).forEach(e => {
        // Nur MA, deren Hauptfiliale diese Filiale ist
        if (e.hauptfilialeId !== filiale.id) return;

        // Mitarbeiterliste auffüllen
        if (!mitarbeiterMap.has(e.mitarbeiterId)) {
          mitarbeiterMap.set(e.mitarbeiterId, {
            id:   e.mitarbeiterId,
            name: `${e.vorname} ${e.nachname}`
          });
        }

        // Zellen-Map pro Mitarbeiter
        let mMap = cellMap.get(e.mitarbeiterId);
        if (!mMap) {
          mMap = new Map();
          cellMap.set(e.mitarbeiterId, mMap);
        }

        // Falls ein MA am selben Datum mehrfach vorkommt:
        // Arbeitsdienste (A/E/U/K) überschreiben F (frei).
        const existing     = mMap.get(datum);
        const existingWork = existing && existing.schicht !== 'F';
        const newWork      = e.schicht && e.schicht !== 'F';

        if (!existing || (!existingWork && newWork)) {
          mMap.set(datum, e);
        }
      });
    });
  });

  // sortierte Mitarbeiter-Liste (für Zeilen)
  const mitarbeiterListe = Array
    .from(mitarbeiterMap.values())
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));


  // -------------------------------------------------------------------
  // Matrix-Container
  // -------------------------------------------------------------------
  const matrix = document.createElement('div');
  matrix.className = 'matrix';

  const matrixInner = document.createElement('div');
  matrixInner.className = 'matrix-inner';


  // ----- Header-Zeile: Wochentag + Datum -----
  const headerRow = document.createElement('div');
  headerRow.className = 'matrix-header-row';

  const nameHeadCell = document.createElement('div');
  nameHeadCell.className = 'matrix-cell matrix-cell-name';
  headerRow.appendChild(nameHeadCell);

  const wochentageKurz = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  dates.forEach(datum => {
    const dateObj = new Date(datum);

    const cell = document.createElement('div');
    cell.className = 'matrix-cell matrix-cell-header';

    const dow = document.createElement('div');
    dow.className = 'matrix-dow';
    dow.textContent = wochentageKurz[dateObj.getDay()];

    const dayNum = document.createElement('div');
    dayNum.className = 'matrix-day';
    dayNum.textContent = String(dateObj.getDate()).padStart(2, '0');

    cell.appendChild(dow);
    cell.appendChild(dayNum);
    headerRow.appendChild(cell);
  });

  matrixInner.appendChild(headerRow);


  // -------------------------------------------------------------------
  // Mitarbeiterzeilen (jede Zeile = 1 Mitarbeiter, jede Spalte = Tag)
// -------------------------------------------------------------------
  mitarbeiterListe.forEach(m => {
    const row = document.createElement('div');
    row.className = 'matrix-row';

    const hours = fBlock.stundenProMitarbeiter[m.id] || 0;

    // Name + Stunden links
    const nameCell = document.createElement('div');
    nameCell.className = 'matrix-cell matrix-cell-name';
    nameCell.textContent = `${m.name} ${hours}h`;
    row.appendChild(nameCell);

    const mMap = cellMap.get(m.id) || new Map();

    dates.forEach(datum => {
      const cell = document.createElement('div');
      cell.className = 'matrix-cell matrix-cell-day';

      const einsatz = mMap.get(datum);

      // kein Einsatz an diesem Tag -> weiße Zelle
      if (!einsatz) {
        cell.style.backgroundColor = 'white';
        cell.style.borderColor     = 'white';
        row.appendChild(cell);
        return;
      }

      const farbe = einsatz.farbe;

      // Hintergrundfarben nach Schicht
      if (einsatz.schicht === 'F') {
        cell.style.backgroundColor = 'white';
        cell.style.borderColor     = 'white';
      } else if (einsatz.schicht === 'U') {
        // Urlaub = schwarz
        cell.style.backgroundColor = 'black';
        cell.style.borderColor     = 'black';
      } else if (einsatz.schicht === 'K') {
        // Krankenstand = grau
        cell.style.backgroundColor = 'gray';
        cell.style.borderColor     = 'gray';
      } else {
        // A/E/... = Filialfarbe transparent
        cell.style.backgroundColor = hexToRgba(farbe, 0.25);
        cell.style.borderColor     = farbe;
      }

      const schichtSpan = document.createElement('span');
      schichtSpan.className = 'matrix-schicht';
      schichtSpan.textContent = einsatz.schicht === 'F' ? '' : einsatz.schicht;
      cell.appendChild(schichtSpan);


      // -----------------------------------------------------------------
      // CLICK-HANDLER: Dropdown zum Ändern des Dienstes öffnen
      // -----------------------------------------------------------------
      cell.style.cursor = 'pointer';

      cell.addEventListener('click', async (ev) => {
        ev.stopPropagation();

        // Kein zweites Select in derselben Zelle
        if (cell.querySelector('.dienst-select')) return;

        // Alle anderen offenen Selects schließen
        document.querySelectorAll('.dienst-select').forEach(s => s.remove());

        const jahr  = parseInt(jahrInput.value, 10);
        const monat = parseInt(monatInput.value, 10);

        const select = document.createElement('select');
        select.className = 'dienst-select';

        // --- Platzhalter ---
        const optPlaceholder = document.createElement('option');
        optPlaceholder.value = '_';
        optPlaceholder.textContent = 'Aktion wählen ...';
        optPlaceholder.disabled = true;
        optPlaceholder.selected = true;
        select.appendChild(optPlaceholder);

        // --- Frei ---
        const optFrei = document.createElement('option');
        optFrei.value = 'FREI';
        optFrei.textContent = 'Frei (Dienst entfernen)';
        select.appendChild(optFrei);

        // --- Arbeitsdienste A / E für den aktuellen MA ---
        const optE = document.createElement('option');
        optE.value = 'E';
        optE.textContent = `Arbeitsdienst (E) für ${einsatz.vorname} ${einsatz.nachname}`;
        select.appendChild(optE);

        const optA = document.createElement('option');
        optA.value = 'A';
        optA.textContent = `Arbeitsdienst (A) für ${einsatz.vorname} ${einsatz.nachname}`;
        select.appendChild(optA);

        // --- Urlaub / Krankenstand für aktuellen MA ---
        const optUrlaub = document.createElement('option');
        optUrlaub.value = 'URLAUB';
        optUrlaub.textContent = `Urlaub (U) für ${einsatz.vorname} ${einsatz.nachname}`;
        select.appendChild(optUrlaub);

        const optKrank = document.createElement('option');
        optKrank.value = 'KRANK';
        optKrank.textContent = `Krankenstand (K) für ${einsatz.vorname} ${einsatz.nachname}`;
        select.appendChild(optKrank);

        // Trenner
        const optSep = document.createElement('option');
        optSep.disabled = true;
        optSep.textContent = '──────────';
        select.appendChild(optSep);

        // --- aktueller Mitarbeiter (bleibt, nur Shiftänderung oder als Info) ---
        const optSame = document.createElement('option');
        optSame.value = `MA:${einsatz.mitarbeiterId}`;
        optSame.textContent = `${einsatz.vorname} ${einsatz.nachname} (aktuell)`;
        select.appendChild(optSame);


        // --- Verfügbare Mitarbeiter für diese Filiale / diesen Tag laden ---
        let verfuegbare = [];
        try {
          const resp = await fetch(`${API_BASE}/mitarbeiter/verfuegbar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filialeId: filiale.id,
              datum,
              jahr,
              monat
            })
          });

          if (resp.ok) {
            verfuegbare = await resp.json();
          }
        } catch (e) {
          console.error('Fehler beim Laden der Mitarbeiter:', e);
        }

        // Verfügbare Mitarbeiter ins Dropdown hängen
        verfuegbare.forEach(ma => {
          if (ma.id === einsatz.mitarbeiterId) return;

          const opt = document.createElement('option');
          opt.value = `MA:${ma.id}`;
          opt.textContent = `${ma.vorname} ${ma.nachname} (MA ${ma.id})`;
          select.appendChild(opt);
        });

        // Select anzeigen
        cell.appendChild(select);
        select.focus();


        // --- Änderungshandler für das erste Dropdown ---
        select.addEventListener('change', async () => {
          const value = select.value;
          if (value === '_') return;

          let neuerMitarbeiterId = null;
          let neueSchicht        = einsatz.schicht;

          if (value === 'FREI') {
            // Dienst komplett streichen
            neuerMitarbeiterId = null;
            neueSchicht        = 'F';

          } else if (value === 'E') {
            neuerMitarbeiterId = einsatz.mitarbeiterId;
            neueSchicht        = 'E';

          } else if (value === 'A') {
            neuerMitarbeiterId = einsatz.mitarbeiterId;
            neueSchicht        = 'A';

          } else if (value === 'URLAUB' || value === 'KRANK') {
            // U oder K -> zuerst prüfen, ob Ersatz nötig ist
            const ziel = (value === 'URLAUB') ? 'U' : 'K';

            try {
              const checkRes = await fetch(
                `${API_BASE}/dienstplan/check-ersatz?jahr=${jahr}&monat=${monat}` +
                `&dienstId=${encodeURIComponent(einsatz.dienstId)}`
              );

              if (!checkRes.ok) {
                const err = await checkRes.json().catch(() => ({}));
                alert('Fehler bei der Ersatzprüfung: ' + (err.error || checkRes.status));
                select.value = '_';
                return;
              }

              const checkData = await checkRes.json();

              // Fall 1: Kein Ersatz nötig -> direkt K/U setzen (alter Flow)
              if (!checkData.ersatzNoetig) {
                neuerMitarbeiterId = einsatz.mitarbeiterId;
                neueSchicht        = ziel;
                // wir brechen NICHT ab, sondern laufen weiter zum PATCH /shift
              } else {
                // Fall 2: Ersatz nötig -> zweites Dropdown für Ersatz-MA

                if (!Array.isArray(verfuegbare) || verfuegbare.length === 0) {
                  alert('Es ist kein Ersatz-Mitarbeiter verfügbar. Aktion abgebrochen.');
                  select.value = '_';
                  return;
                }

                const ersatzSelect = document.createElement('select');
                ersatzSelect.className = 'dienst-select-ersatz';

                const ph = document.createElement('option');
                ph.value = '';
                ph.textContent = 'Ersatz wählen ...';
                ph.disabled = true;
                ph.selected = true;
                ersatzSelect.appendChild(ph);

                verfuegbare.forEach(ma => {
                  const opt = document.createElement('option');
                  opt.value = String(ma.id);
                  opt.textContent = `${ma.vorname} ${ma.nachname} (MA ${ma.id})`;
                  ersatzSelect.appendChild(opt);
                });

                cell.appendChild(ersatzSelect);
                ersatzSelect.focus();

                // Handler für das zweite Dropdown (K/U *mit* Ersatz)
                ersatzSelect.addEventListener('change', async () => {
                  const ersatzId = Number(ersatzSelect.value);
                  if (!ersatzId) return;

                  try {
                    const res = await fetch(`${API_BASE}/dienstplan/krank-mit-ersatz`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        jahr,
                        monat,
                        dienstId: einsatz.dienstId,
                        ersatzMitarbeiterId: ersatzId,
                        art: ziel          // 'K' oder 'U'
                      })
                    });

                    if (!res.ok) {
                      const err = await res.json().catch(() => ({}));
                      alert('Fehler beim Setzen von Krank/Urlaub mit Ersatz: ' + (err.error || res.status));
                      return;
                    }

                    const updatedPlan = await res.json();
                    renderDienstplan(updatedPlan);
                  } catch (err) {
                    console.error('Fehler bei /krank-mit-ersatz:', err);
                    alert('Netzwerkfehler bei Krank/Urlaub mit Ersatz.');
                  }
                });

                // erste Auswahl zurücksetzen, Patch /shift wird in diesem Fall NICHT gemacht
                select.value = '_';
                return;
              }

            } catch (e) {
              console.error('Fehler bei /dienstplan/check-ersatz:', e);
              alert('Netzwerkfehler bei der Ersatzprüfung.');
              select.value = '_';
              return;
            }

          } else if (value.startsWith('MA:')) {
            // Dienst auf anderen Mitarbeiter umhängen, Schicht bleibt
            neuerMitarbeiterId = Number(value.slice(3));
            neueSchicht        = einsatz.schicht;
          }

          // PATCH /shift für alle normalen Fälle (umhängen, F, A, E, U/K ohne Ersatz)
          try {
            const res = await fetch(`${API_BASE}/dienstplan/shift`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jahr,
                monat,
                dienstId: einsatz.dienstId,
                neuerMitarbeiterId,
                neueSchicht
              })
            });

            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              alert('Fehler beim Update: ' + (err.error || res.status));
              return;
            }

            const updatedPlan = await res.json();
            renderDienstplan(updatedPlan);

          } catch (err) {
            console.error('Fehler PATCH /shift:', err);
            alert('Fehler beim Aktualisieren des Dienstes.');
          }
        });

      }); // Ende CLICK-HANDLER

      row.appendChild(cell);
    }); // Ende Tage-Loop

    matrixInner.appendChild(row);
  }); // Ende Mitarbeiter-Loop

  matrix.appendChild(matrixInner);
  filialeDiv.appendChild(matrix);

  // Footer mit Info
  const footerInfo = document.createElement('div');
  footerInfo.style.fontSize   = '0.8rem';
  footerInfo.style.color      = '#888';
  footerInfo.style.marginTop  = '6px';
  footerInfo.textContent =
    `Tage im Monat: ${gesamtData.tageImMonat}, Arbeitstage laut Plan: ${arbeitstage}`;
  filialeDiv.appendChild(footerInfo);

  resultEl.appendChild(filialeDiv);
}


// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

/**
 * Hex-Farbe (#RRGGBB) -> rgba(...) mit Transparenz
 */
function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string') return 'rgba(255,255,255,0.1)';
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h.split('').map(ch => ch + ch).join('');
  }
  if (h.length !== 6) return 'rgba(255,255,255,0.1)';

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);

  return `rgba(${r},${g},${b},${alpha})`;
}
