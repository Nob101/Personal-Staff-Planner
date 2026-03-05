// src/composables/useDienstplan.js
import { ref } from "vue";
import {
  getDienstplanView,
  generateDienstplan,
  deleteDienstplan,
  shiftDienst,
  ersatzKandidaten,
  shiftMitErsatz,
} from "@/services/dienstplanService.js";

export function useDienstplan() {
  const view = ref(null);
  const loading = ref(false);
  const error = ref("");

  async function load(jahr, monat) {
    loading.value = true;
    error.value = "";
    try {
      view.value = await getDienstplanView(jahr, monat);
    } catch (e) {
      console.error(e);
      error.value = e?.response?.data?.error || e?.message || "Fehler beim Laden";
      view.value = null;
    } finally {
      loading.value = false;
    }
  }

async function generate(jahr, monat, fnr) {
  loading.value = true;
  error.value = "";
  try {
    await generateDienstplan(jahr, monat, fnr);
    await load(jahr, monat);
  } catch (e) {
    console.error(e);
    error.value = e?.response?.data?.error || e?.message || "Fehler beim Generieren";
  } finally {
    loading.value = false;
  }
}

async function remove(jahr, monat, fnr) {
  loading.value = true;
  error.value = "";
  try {
    await deleteDienstplan(jahr, monat, fnr);
    await load(jahr, monat);
  } catch (e) {
    console.error(e);
    error.value = e?.response?.data?.error || e?.message || "Fehler beim Löschen";
  } finally {
    loading.value = false;
  }
}

  async function doShift({ jahr, monat, id, schicht_typ }) {
    loading.value = true;
    error.value = "";
    try {
      await shiftDienst(id, schicht_typ);
      await load(jahr, monat);
    } catch (e) {
      console.error(e);
      error.value = e?.response?.data?.error || e?.message || "Fehler beim Shift";
    } finally {
      loading.value = false;
    }
  }

  async function getErsatz(dienstId) {
    // returns { dienstId, kandidaten }
    try {
      return await ersatzKandidaten(dienstId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async function doShiftMitErsatz({ jahr, monat, altId, neuId, schicht_typ }) {
    loading.value = true;
    error.value = "";
    try {
      await shiftMitErsatz({ altId, neuId, schicht_typ });
      await load(jahr, monat);
    } catch (e) {
      console.error(e);
      error.value = e?.response?.data?.error || e?.message || "Fehler bei ShiftMitErsatz";
    } finally {
      loading.value = false;
    }
  }

  return {
    view,
    loading,
    error,
    load,
    generate,
    remove,
    doShift,
    getErsatz,
    doShiftMitErsatz
  };
}