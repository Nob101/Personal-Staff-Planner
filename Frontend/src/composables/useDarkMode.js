// src/composables/useDarkMode.js
import { ref } from "vue";

const isDark = ref(false);
let initialized = false;

function applyClass(v) {
  document.documentElement.classList.toggle("dark", !!v);
}

export function useDarkMode() {
  if (!initialized) {
    initialized = true;

    // 1) aus localStorage laden
    const saved = localStorage.getItem("darkmode");
    if (saved !== null) {
      isDark.value = saved === "true";
    } else {
      // 2) fallback: system preference
      isDark.value = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
    }

    applyClass(isDark.value);
  }

  function toggle() {
    isDark.value = !isDark.value;
    localStorage.setItem("darkmode", String(isDark.value));
    applyClass(isDark.value);
  }

  function setDark(v) {
    isDark.value = !!v;
    localStorage.setItem("darkmode", String(isDark.value));
    applyClass(isDark.value);
  }

  return { isDark, toggle, setDark };
}
