import { reactive } from 'vue'

export const user = reactive({
  data: JSON.parse(localStorage.getItem('user')) || null
})

export function setUser(u) {
  user.data = u
  localStorage.setItem('user', JSON.stringify(u))
}

export function logout() {
  user.data = null
  localStorage.removeItem('user')
}