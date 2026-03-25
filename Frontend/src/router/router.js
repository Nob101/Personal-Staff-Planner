// router.js
// ============================================================================
// Zentrale Routing-Konfiguration der Anwendung
//
// Aufgaben dieser Datei:
// - Definition aller erreichbaren Pfade (Routes) und deren Komponenten
// - Konfiguration der Web-History für die Navigation
// - Implementierung des Navigations-Wächters (Auth Guard) für Zugriffsschutz
// ============================================================================

import { createRouter, createWebHistory } from "vue-router";

// Import der View-Komponenten
// Jede Route wird einer spezifischen View zugeordnet.
import LoginView from "@/views/LoginView.vue";
import HomeView from "@/views/HomeView.vue";
import MitarbeiterView from "@/views/MitarbeiterView.vue";
import FilialenView from "@/views/FilialenView.vue";
import DienstplaeneView from "@/views/DienstplaeneView.vue";
import BenutzerView from "@/views/BenutzerView.vue";

// Routen-Definition
// - path: Die URL im Browser
// - meta: Zusatzinfos (z.B. ob die Navbar ausgeblendet werden soll)
const routes = [
  { path: "/", name: "login", component: LoginView, meta: { hideNavbar: true } },
  // NEU: Login redirect
  {
    path: "/login", 
    redirect: { name: 'login'}
  },
  { path: "/home", name: "home", component: HomeView },
  { path: "/mitarbeiter", name: "mitarbeiter", component: MitarbeiterView },
  { path: "/filialen", name: "filialen", component: FilialenView },
  { path: "/dienstplaene", name: "dienstplaene", component: DienstplaeneView },
  { path: "/benutzer", name: "benutzer", component: BenutzerView },
  // NEU: Catch-all für route Fehler 404
  { 
    path: "/:pathMatch(.*)*", 
    redirect: {name: 'login'}
  }
];

// Web-History fürs für Browser - Back/Forward Navigation
const router = createRouter({
  history: createWebHistory(),
  routes
});


// Navigations-Wächter (Navigation Guard)
// Überprüft vor jedem Seitenwechsel den Authentifizierungsstatus.
// Zum Testen ohne Login den gesamten Block auskommentieren.
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('userToken');

  // Fall 1: Nicht eingeloggt -> Umleitung zum Login bei Zugriff auf interne Seiten
  if (to.name !== 'login' && !isAuthenticated) {
    next({ name: 'login' });
  } 
  // Fall 2: Bereits eingeloggt -> Umleitung weg vom Login zur Startseite (Home)
  else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'home' });
  }
  // Fall 3: Zugriff erlaubt
  else {
    next();
  }
});

export default router;