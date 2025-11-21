<script setup>
    import { ref } from 'vue'
    import logo from '../assets/images/icons/PSP_Logo_Transparent.png';
    //import dienstplaene_icon from '../assets/images/icons/dienstplaene_icon.png'
    //import mitarbeiter_icon from '../assets/images/icons/mitarbeiter_icon.png'
    //import filialen_icon from '../assets/images/icons/filialen_icon.png'
    //import einstellungen_icon from '../assets/images/icons/einstellungen_icon.png'

    //!! To-Do: Link von offener Page soll gehighlighted werden, derzeit nicht der Fall
    const activeLink = ref('')
</script>

<template>
    <nav class="navbar">
        <div class="navbar-logo">
            <img v-bind:src="logo" alt="Personal Staff Planner Logo" class="logo-image" />
        </div>
    <ul class="navbar-links">
      <li>
        <a href="Dienstpläne" v-bind:class="{ active: activeLink === 'Dienstpläne' }" @click="activeLink = 'Dienstpläne'">
          <img v-bind:src="dienstplaene_icon" alt="dienstplaene icon" class="link-icon" />
          Dienstpläne
        </a>
      </li>
      <li>
        <a href="Mitarbeiter" v-bind:class="{ active: activeLink === 'Mitarbeiter' }" @click="activeLink = 'Mitarbeiter'">
          <img v-bind:src="mitarbeiter_icon" alt="mitarbeiter icon" class="link-icon" />
          Mitarbeiter
        </a>
      </li>
      <li>
        <a href="Filialen" v-bind:class="{ active: activeLink === 'Filialen' }" @click="activeLink = 'Filialen'">
          <img v-bind:src="filialen_icon" alt="filialen icon" class="link-icon" />
          Filialen
        </a>
      </li>
      <li>
        <a href="Einstellungen" v-bind:class="{ active: activeLink === 'Einstellungen' }" @click="activeLink = 'Einstellungen'">
          <img v-bind:src="einstellungen_icon" alt="einstellungen icon" class="link-icon" />
          Einstellungen
        </a>
      </li>
    </ul>
    </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 2px solid #ccc;
}
.navbar-links {
  display: flex;
  flex: 1;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  margin-right: 50px;
  padding: 200;
}
.navbar-links li {
  display: flex;
  padding: 10px 20px;
  align-items: center;
}
.navbar-links li a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
  display: flex;
  align-items: center;
}
.navbar-links li a.active {
  background-color: #007bff;
  color: white;
  border-radius: 6px;
}
.logo-image {
  width: 40px;
  height: auto;
}
</style>