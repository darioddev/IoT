import { User } from './crud.js'
import { auth, onAuthStateChangedUser } from './firebase.js'

export const useAuth = {
  /**
   * Función para iniciar sesión con correo y contraseña en Firebase
   * @param {String} username Correo electrónico del usuario
   * @param {String} password Contraseña del usuario
   */
  async login(datos) {
    try {
      await User.getUser(datos.mail, datos.password) // Obtenemos el usuario de la base de datos de Firebase
    } catch (error) {
      throw new Error(error.message) // Si hay un error lo mostramos
    }
  },
  /**
   * Función para registrar un usuario con correo y contraseña en Firebase
   * @param {Object} user Objeto con los datos del usuario
   */
  async register(user) {
    try {
      await User.saveUser(user) // Guardamos el usuario en la base de datos de Firebase
    } catch (error) {
      throw new Error(error.message) // Si hay un error lo mostramos
    }
  },
  /**
   * Función para cerrar sesión en Firebase
   */
  async logout() {
    try {
      await User.logout() // Cerramos sesión
    } catch (error) {
      throw new Error(error.message) // Si hay un error lo mostramos
    }
  },
  /**
   * Función para obtener el usuario actual de Firebase
   * @returns {Object | null} Objeto con los datos del usuario actual o null si no hay ninguno
   */
  async getAuth() {
    try {
      return await auth.currentUser || null // Obtenemos el usuario actual , si no hay ninguno devuelve null
    } catch (error) {
      throw new Error('Error al obtener el usuario actual') // Si hay un error lo mostramos
    }
  },

  /**
   * Función para obtener el estado de la autenticación de Firebase , devuelve una promesa
   * @returns {Promise} Promesa con el estado de la autenticación
   */

  isAuthenticated() {
    return new Promise((resolve) => {
      onAuthStateChangedUser((user) => {
        resolve(user ? true : false) // Si hay un usuario resolvemos la promesa con true , si no con false
      })
    })
  }
}
