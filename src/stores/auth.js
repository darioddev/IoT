import { defineStore } from 'pinia'
import { User } from '../lib/crud.js'

export const useAuth = defineStore('auth', {
  state: () => ({
    id: '',
    username: '',
    mail: '',
    isLogged: false
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
    },
    reset() {
      this.id = ''
      this.username = ''
      this.mail = ''
      this.setLogged(false)
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
        await User.logout()
        this.reset()
      } catch (error) {
        throw new Error(error.message)
      }
    }
  }
})
