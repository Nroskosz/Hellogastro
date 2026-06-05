<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { setUser } from '../store/user'

const email = ref('')
const password = ref('')

async function login() {

  try {

    const response = await axios.post(
      'https://roskosznoah.alwaysdata.net/login',
      {
        email: email.value,
        password: password.value
      }
    )

    setUser(response.data.user)

    localStorage.setItem('token', response.data.token)

    alert(response.data.message)

  } catch (error) {

    alert(
      error.response?.data?.message ||
      'Erreur login'
    )

  }

}
</script>

<template>
  <div class="page">

    <div class="login-card">

      <h1>🔐 Connexion</h1>

      <input
        v-model="email"
        placeholder="Email"
      >

      <input
        v-model="password"
        type="password"
        placeholder="Mot de passe"
      >

      <button @click="login">
        Se connecter
      </button>

    </div>

  </div>
</template>

<style scoped>
.page {
  min-height: calc(100vh - 80px);
  background: #f7f3ee;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.page::before {
  content: '';
  width: 100%;
  max-width: 450px;
  height: 100%;
  position: absolute;
  z-index: -1;
}

h1 {
  margin-bottom: 30px;
  color: #2f2a25;
  font-size: 34px;
}

input {
  width: 100%;
  max-width: 420px;
  padding: 14px 16px;
  margin-bottom: 14px;
  border: 1px solid #ddd3c9;
  border-radius: 14px;
  background: #fffdf9;
  font-size: 15px;
  color: #2f2a25;
  outline: none;
  transition: 0.25s;
}

input::placeholder {
  color: #9c9087;
}

input:focus {
  border-color: #b8794c;
  box-shadow: 0 0 0 4px rgba(184, 121, 76, 0.15);
}

button {
  width: 100%;
  max-width: 420px;
  padding: 14px;
  margin-top: 8px;
  border: none;
  border-radius: 16px;
  background: #b8794c;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s;
}

button:hover {
  background: #9f633c;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(159, 99, 60, 0.2);
}

.login-card {
  width: 100%;
  max-width: 500px;
  background: #fffdf9;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(80, 60, 40, 0.08);
}
</style>