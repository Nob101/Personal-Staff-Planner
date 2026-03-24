<script setup>
import logo from '@/assets/icons/PSP_Logo_Transparent.png'
import dienstplaene_icon from '@/assets/icons/dienstplaene_icon.svg'
import mitarbeiter_icon from '@/assets/icons/mitarbeiter_icon.svg'
import filialen_icon from '@/assets/icons/filialen_icon.svg'
import benutzer_icon from '@/assets/icons/benutzer_icon.svg'

</script>

<template>
  <header class="app-navbar">
    <div class="app-navbar__inner">
      <!-- Logo -->
      <RouterLink to="/home" class="app-navbar__logo-link">
        <img
          :src="logo"
          alt="Personal Staff Planner Logo"
          class="app-navbar__logo"
        />
      </RouterLink>

      <!-- Navigation -->
      <nav class="app-navbar__nav">
        <RouterLink to="/dienstplaene" class="app-navbar__link">
          <img :src="dienstplaene_icon" class="app-navbar__icon app-navbar__icon--dienst" />
          <span>Dienstpläne</span>
        </RouterLink>

        <RouterLink to="/mitarbeiter" class="app-navbar__link">
          <img :src="mitarbeiter_icon" class="app-navbar__icon" />
          <span>Mitarbeiter</span>
        </RouterLink>

        <RouterLink to="/filialen" class="app-navbar__link">
          <img :src="filialen_icon" class="app-navbar__icon app-navbar__icon--filialen" />
          <span>Filialen</span>
        </RouterLink>

        <RouterLink to="/benutzer" class="app-navbar__link">
          <img :src="benutzer_icon" class="app-navbar__icon app-navbar__icon--benutzer" />
          <span>Benutzer</span>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>