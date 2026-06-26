import { ref } from "vue";

import {
  createAbwesenheit,
  getAbwesenheiten,
  deleteAbwesenheit,
} from "@/services/abwesenheitenService";

export function useAbwesenheiten() {
  const abwesenheiten = ref([]);

  const successMessage = ref("");
  const errorMessage = ref("");

  async function ladeAbwesenheiten(jahr, monat) {
    const response = await getAbwesenheiten(jahr, monat);

    abwesenheiten.value = response.data;
  }

  async function speichereAbwesenheit(data, jahr, monat) {
    try {
      errorMessage.value = "";

      await createAbwesenheit(data);

      await ladeAbwesenheiten(jahr, monat);

      successMessage.value = "Urlaub erfolgreich gespeichert";

      setTimeout(() => {
        successMessage.value = "";
      }, 3000);

      return true;
    } catch (err) {
      errorMessage.value =
        err.response?.data?.error ||
        "Abwesenheit konnte nicht gespeichert werden";

      setTimeout(() => {
        errorMessage.value = "";
      }, 5000);

      return false;
    }
  }

  async function entferneAbwesenheit(id, jahr, monat) {
    await deleteAbwesenheit(id);

    await ladeAbwesenheiten(jahr, monat);
  }

  return {
    abwesenheiten,
    successMessage,
    errorMessage,
    ladeAbwesenheiten,
    speichereAbwesenheit,
    entferneAbwesenheit,
  };
}