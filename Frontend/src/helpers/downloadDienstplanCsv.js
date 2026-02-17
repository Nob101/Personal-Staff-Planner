import http from "@/services/http";

/**
 * CSV Export für Dienstplan (einzelne Filiale)
 */
export async function downloadDienstplanCsv({ jahr, monat, fnr }) {
  // NEU: Try Catch-Block Errorhandling
  try {
  const res = await http.get("/download/csv", {
    params: { jahr, monat, fnr },
    responseType: "blob", // wichtig: Datei
  });

  // Filename aus Content-Disposition (wenn verfügbar)
  const cd = res.headers["content-disposition"] || "";
  const match = cd.match(/filename="([^"]+)"/i);
  const filename = match?.[1] ?? `dienstplan_${jahr}_${monat}_fnr_${fnr}.csv`;

  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  // NEU: Angepasst an Stundenwert
} catch (error){
  console.error("Export fehlgeschlagen:", error);

    if (error.response && error.response.status === 404) {
      alert("Für diesen Monat/Filiale sind keine Dienstplandaten vorhanden.");
    } else {
      alert("Server-Fehler beim Export. Bitte Backend-Logs prüfen.");
    }
  }
}
