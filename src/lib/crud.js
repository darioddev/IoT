import {
  createUserCredentials,
  signInUserCredentials,
  signOutUser,
} from './firebase.js'
import { espacios } from './spaces.js'

export const User = {
  /**
   * Funcion que comprueba si un usuario existe en la base de datos y si la contraseña es correcta llamando a la funcion signInUserCredentials de firebase
   * @param {string} username
   * @param {string} password
   * @returns {object}
   */
  async getUser(username, password) {
    try {
      await signInUserCredentials(username, password) // Llamamos a la funcion de firebase que nos permite loguearnos
    } catch (error) {
      if (error.code === 'auth/user-not-found')
        throw new Error('El usuario no existe') // Mensaje en caso de que el usuario no exista
      else if (error.code === 'auth/invalid-login-credentials')
        throw new Error('Credenciales incorrectas')
      //Mensaje en caso de que no sean las credenciales correctas
      else if (error.code === 'auth/wrong-password') throw new Error('Contraseña incorrecta')
      // Mensaje en caso de que la contraseña sea incorrecta
      else throw new Error('Algo ha ido mal') // Mensaje en caso de que haya un error
    }
  },
  /**
   * Funcion que crea un usuario en la base de datos llamando a la funcion createUserCredentials de firebase
   * @param {object} user
   * @returns {object}
   */
  async saveUser(user) {
    try {
      // Llamamos a la funcion de firebase que nos permite crear un usuario y obtenemos el uid del usuario mediante destructuring
      const {
        user: { uid }
      } = await createUserCredentials(user.mail, user.password, user.username)
      await espacios.createDocument({ id: uid, space: [] }) // Creamos un documento en la coleccion de espacios con el id del usuario
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') throw new Error('El correo ya está en uso')
      else if (error.code === 'auth/invalid-email') throw new Error('El correo no es válido')
      else if (error.code === 'auth/weak-password')
        throw new Error('La contraseña es demasiado débil')
      else throw new Error('Algo ha ido mal')
    }
  },
  /**
   * Funcion que cierra la sesion del usuario llamando a la funcion signOutUser de firebase
   */
  async logout() {
    try {
      await signOutUser()
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
