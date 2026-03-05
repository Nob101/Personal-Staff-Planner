import { ref, onMounted } from "vue";

const isDark = ref(false);

function apply(value) {
  document.documentElement.classList.toggle("dark", value);
}

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value;
    apply(isDark.value);
    localStorage.setItem("theme", isDark.value ? "dark" : "light");
  }

  onMounted(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") isDark.value = true;
    else if (saved === "light") isDark.value = false;
    else isDark.value = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

    apply(isDark.value);
  });

  return { isDark, toggle };
}