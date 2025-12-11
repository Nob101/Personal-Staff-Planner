<script setup>
    import { ref } from "vue";
    // import logo from '@/assets/icons/PSP_Logo_Transparent.png';

    const activeTab = ref("login");
    const benutzername = ref("");
    const passwort = ref("");
    const error = ref("");

//Dummy-Daten
const benutzer = ref([
    {benutzername: "Max", passwort: "1234"},
    {benutzername: "admin", passwort: "9999"}
]);

function handleSubmit(){
    error.value = "";

    if (activeTab.value === "login") {
        handleLogin();
    } else {
        handleRegistrieren();
    }
}
function handleLogin(){
    const gefunden = benutzer.value.find(
        u => u.benutzername === benutzername.value && u.passwort === passwort.value);
    

    if(!gefunden) {
        error.value = "Benutzername oder Passwort falsch!";
    } else {
        // Backend-Anbindung fehlt. Console.Log für jetzt.
        console.log("Erfolgreich eingeloggt: ", gefunden);
    }
}

function handleRegistrieren(){
    const existiert = benutzer.value.find(
        u => u.benutzername === benutzername.value
    );
    //Error falls Nutzer existiert
    if(existiert) {
        error.value = "Benutzername existiert bereits!";
        return;
    } 
    
    //neuen Nutzer hinzufügen
    benutzer.value.push({
        benutzername: benutzername.value,
        passwort: passwort.value
    })

    console.log("Benutzer angelegt: ", benutzername.value);
}

</script>

<template>
  <div class="app" :style="{ backgroundImage: `url(${logo})` }">
    <div class="auth-card">
      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">Anmelden</button>
        <button class="tab" :class="{ active: activeTab === 'registrieren' }" @click="activeTab = 'registrieren'">Registrieren</button>
      </div>
      <!-- Formular -->
      <div class="form">
        <label for="benutzername">Benutzername:</label>
        <input v-model="benutzername" type="text" placeholder="Benutzername">
        <label for="passwort">Passwort:</label>
        <input v-model="passwort" type="password" placeholder="Passwort">
        <p v-if="error" class="error">{{ error }}</p>

        <button class="submit" @click="handleSubmit">{{ activeTab === "login" ? "Anmelden" : "Registrieren" }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
    .auth-card {
    width: 300px;
    margin: 40px auto;
    padding: 24px;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    gap: 16px;
    }

    .tabs {
    display: flex;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    }

    .tab {
    flex: 1;
    padding: 10px;
    text-align: center;
    border: none;
    background: #e6e6e6;
    cursor: pointer;
    font-weight: 500;
    color: #333;
    transition: 0.2s;
    }

    .tabs.active {
    background: #3498db;
    color: white;
    }

    .form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    }

    .input {
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 14px;
    }

    .submit {
    padding: 10px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: 0.2s;
    }

    .submit:hover {
    background: #2d80b8;
    }

    .error {
    color: red;
    font-size: 0.9rem;
    }
</style>