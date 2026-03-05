//services/dienstplanService.js
 
import { http } from "@/services/http.js";
 
export async function getDienstplanView(jahr, monat) {
  const res = await http.get("dienstplan/view", { params: { jahr, monat } });
  return res.data;
}
 
/* export async function generateDienstplan(jahr, monat, fnr) {
  const res = await http.post("dienstplan/generate", {
    jahr,
    monat,
    fnr,
  });
  return res.data;
} */

export async function generateDienstplan(jahr, monat, fnr) {
  console.log("[POST] generate", { jahr, monat, fnr });
  const res = await http.post("dienstplan/generate", { jahr, monat, fnr });
  return res.data;
}

export async function deleteDienstplan(jahr, monat, fnr) {
  const res = await http.delete(`dienstplan/${jahr}/${monat}`, {
    params: { fnr }, // <-- GENAU wie in test.http
  });
  return res.data;
}
 
export async function shiftDienst(id, schicht_typ) {
  const res = await http.post("dienstplan/shift", { id, schicht_typ });
  return res.data;
}
 
export async function ersatzKandidaten(dienstId) {
  const res = await http.get(`dienstplan/${dienstId}/ersatz`);
  return res.data;
}
 
export async function shiftMitErsatz({ altId, neuId, schicht_typ }) {
  const res = await http.post("dienstplan/shiftMitErsatz", { altId, neuId, schicht_typ });
  return res.data;
}

export async function updateStunden({ mr, jahr, monat, ist_stunden_monat }) {
  const { data } = await http.put("dienstplan/updateStunden", { mr, jahr, monat, ist_stunden_monat });
  return data;
}