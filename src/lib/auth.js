import { User } from './crud.js'
import { auth } from './firebase.js'

export const useAuth = {
  async login(username, password) {
    try {
      await User.getUser(username, password)
    } catch (error) {
      console.log(error)
      throw new Error(error.message)
    }
  },

  async register(user) {
    try {
      await User.saveUser(user)
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async logout() {
    try {
      await User.logout()
    } catch (error) {
      throw new Error(error.message)
    }
  },
  async getAuth() {
    return await auth.currentUser // Obtenemos el usuario actual , si no hay ninguno devuelve null
  }
}
