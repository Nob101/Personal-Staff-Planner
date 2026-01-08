//mitarbeiterServie.js
//Hier ist gesamte Backend-Kommunikation für Filialen

//Dummy-Daten für Testzwecke sind im Json-Server db.json

//BaseURL importieren
import { http } from "./http"

// Alle Filialen abrufen
export async function getFilialen() {
  const res = await http.get("/filialen");
  return {
    ...res,
    data: res.data.map(f => ({
      id: f.fnr,
      name: f.filialname,
      ...f,
    })),
  };
}