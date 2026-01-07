import { createRouter, createWebHistory } from "vue-router";
 
import MitarbeiterView from "@/views/MitarbeiterView.vue";
import LoginView from "@/views/LoginView.vue";
import DienstplanView from "@/views/DienstplanView.vue";
 
const routes = [
  { path: "/", redirect: "/mitarbeiter" },
  { path: "/login", name: "login", component: LoginView },
  { path: "/mitarbeiter", name: "mitarbeiter", component: MitarbeiterView },
  { path: "/dienstplan", name: "dienstplan", component: DienstplanView },
];
 
export default createRouter({
  history: createWebHistory(),
  routes,
});