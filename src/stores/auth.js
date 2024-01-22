import { defineStore } from 'pinia'
import { User } from '../lib/crud.js'

export const useAuth = defineStore('auth', {
  state: () => ({
    id: localStorage.getItem('id') || '',
    username: localStorage.getItem('username') || '',
    mail: localStorage.getItem('mail') || '',
    isLogged: localStorage.getItem('isLogged') || false
  }),

  actions: {
    setId(id) {
      this.id = id
    },

    setUsername(username) {
      this.username = username
    },

    setMail(mail) {
      this.mail = mail
    },
    setLogged(logged) {
      this.isLogged = logged
    },
    setAuth(id, username, mail) {
      this.setId(id)
      this.setUsername(username)
      this.setMail(mail)
      this.setLogged(true)

      // Guardamos los datos en el localStorage
      localStorage.setItem('id', id)
      localStorage.setItem('username', username)
      localStorage.setItem('mail', mail)
      localStorage.setItem('isLogged', true)
    },
    getAuth() {
      return {
        id: this.id,
        username: this.username,
        mail: this.mail,
        isLogged: this.isLogged
      }
    },
    async login(username, password) {
      try {
        const user = await User.getUser(username, password)
        this.setAuth(user.user.uid, user.user.email, user.user.email)
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
        // Eliminamos los datos del localStorage
        localStorage.removeItem('id')
        localStorage.removeItem('username')
        localStorage.removeItem('mail')
        localStorage.removeItem('isLogged')
        
        await User.logout()
        this.reset()
      } catch (error) {
        throw new Error(error.message)
      }
    },
    reset() {
      this.id = ''
      this.username = ''
      this.mail = ''
      this.setLogged(false)
    }
  }
})
