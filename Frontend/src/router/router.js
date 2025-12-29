//Router.js Routet alle Seiten die über die Navbar geöffnet werden

//Erstellung einer Router-Instanz und Webhistory (Seite vor/zurück, etc.)
import { createRouter, createWebHistory } from "vue-router";

//Importieren aller Views
import LoginView from "@/views/LoginView.vue";
import MitarbeiterView from "@/views/MitarbeiterView.vue";
import FilialenView from "@/views/FilialenView.vue";
import DienstplaeneView from "@/views/DienstplaeneView.vue";
import EinstellungenView from "@/views/EinstellungenView.vue";


//Definieren aller Routen-Objekte, in einem Array gespeichert
const routes = [
  { path: "/", name: "login", component: LoginView },
  { path: "/mitarbeiter", name: "mitarbeiter", component: MitarbeiterView },
  { path: "/filialen", name: "filialen", component: FilialenView },
  { path: "/dienstplaene", name: "dienstplaene", component: DienstplaeneView },
  { path: "/einstellungen", name: "einstellungen", component: EinstellungenView },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// --- temporäre Weiterleitung für Login ---
router.beforeEach((to, from, next) => {
  if (to.name === "login") {
    return next({ name: "mitarbeiter" }) // temporär Login überspringen
  }
  next()
})

//Export
export default router