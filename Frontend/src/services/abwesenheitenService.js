import http from "./http";

export function createAbwesenheit(data) {
  return http.post("/abwesenheiten", data);
}

export function getAbwesenheiten(jahr, monat) {
  return http.get(`/abwesenheiten?jahr=${jahr}&monat=${monat}`);
}

export function deleteAbwesenheit(id) {
  return http.delete(`/abwesenheiten/${id}`);
}
