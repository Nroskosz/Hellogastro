import { reactive} from 'vue'

export const cart = reactive({
  items: JSON.parse(localStorage.getItem('cart') || '[]')
})

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart.items))
}

export function addToCart(plat) {
  const item = cart.items.find(i => i.id_plat === plat.id_plat)

  if (item) {
    item.quantity++
  } else {
    cart.items.push({
      ...plat,
      quantity: 1
    })
  }

  saveCart()
}

export function removeFromCart(id) {
  const index = cart.items.findIndex(i => i.id_plat === id)
  if (index !== -1) {
    cart.items.splice(index, 1)
  }

  saveCart()
}

export function decreaseQuantity(id) {
  const item = cart.items.find(i => i.id_plat === id)

  if (!item) return

  item.quantity--

  if (item.quantity <= 0) {
    removeFromCart(id)
  }

  saveCart()
}

export function getTotal() {
  return cart.items.reduce((sum, item) => {
    return sum + item.prix_plat * item.quantity
  }, 0)
}

export function clearCart() {
  cart.items.splice(0)
  saveCart()
}