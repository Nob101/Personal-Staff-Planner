<script setup>
    import { useRoute } from "vue-router"
    import logo from '@/assets/icons/PSP_Logo_Transparent.png';
    import dienstplaene_icon from '@/assets/icons/dienstplaene_icon_solid.svg'
    import mitarbeiter_icon from '@/assets/icons/mitarbeiter_icon_solid.svg'
    import  filialen_icon from '@/assets/icons/filialen_icon_solid.svg'
    import einstellungen_icon from '@/assets/icons/einstellungen_icon_solid.svg'

    //!! To-Do: Link von offener Page soll gehighlighted werden, derzeit nicht der Fall
    // Zugriff auf aktuelle Route
    const route = useRoute()
</script>

<template>
  <nav class="navbar">
    <!-- Logo -->
    <div class="navbar-logo">
      <img :src="logo" alt="PSP Logo" class="icon" />
    </div>

    <!-- Navigation Links -->
    <ul class="navbar-links">
      <li>
        <router-link :to="{ name: 'dienstplaene' }" :class="{ active: route.name === 'dienstplaene' }">
          <img :src="dienstplaene_icon" class="icon" /> Dienstpläne
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'mitarbeiter' }" :class="{ active: route.name === 'mitarbeiter' }">
          <img :src="mitarbeiter_icon" class="icon" /> Mitarbeiter
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'filialen' }" :class="{ active: route.name === 'filialen' }">
          <img :src="filialen_icon" class="icon" /> Filialen
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'einstellungen' }" :class="{ active: route.name === 'einstellungen' }">
          <img :src="einstellungen_icon" class="icon" /> Einstellungen
        </router-link>
      </li>
    </ul>
  </nav>
</template>


<style scoped>
.navbar {
  display: flex;
  align-items: center;
  height: 60px; 
  padding: 0 20px;
  background-color: #f5f5f5;
}

.navbar-logo {
  margin-right: 40px; 
}

.navbar-links {
  display: flex;
  flex: 1;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar-links li a {
  display: inline-flex;   
  align-items: center;    
  padding: 5px 10px;     
  border-radius: 4px;     
  text-decoration: none;  
  color: inherit;         
}

.router-link-active,
.active {
  background-color: #ddd;
}

.icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  margin-right: 8px; 
}
</style>
