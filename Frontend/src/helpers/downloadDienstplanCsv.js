import http from "@/services/http";

/**
 * CSV Export für Dienstplan (einzelne Filiale)
 */
export async function downloadDienstplanCsv({ jahr, monat, fnr }) {
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
}
