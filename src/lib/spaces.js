import {
  saveDataWithId,
  saveSubCollection,
  deleteSubCollection,
} from './firebase.js'

export const espacios = {
  name: import.meta.env.VITE_APP_FIREBASE_COLLECTION_SPACE, // Obtenemos el nombre de la colección de espacios desde las variables de entorno
  spacesName: import.meta.env.VITE_APP_FIREBASE_COLLLECTION_NAMES,
  /**
   * Crea un nuevo documento en la colección de espacios con el id del usuario
   */
  async createDocument(uid) {
    try {
      await saveDataWithId(this.name, uid, {}) // Guardamos el documento en la colección de espacios con el id del usuario
    
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  },
  async deleteDocument(idUser, idSpace) {
    try {
      return await deleteSubCollection(this.name, idUser, this.spacesName, idSpace) // Eliminamos el documento en la colección de espacios con el id del usuario
    } catch (error) {
      throw new Error(error)
    }
  },
  isExistSpace(spaces, name) {
    // Buscamos si existe un espacio con el mismo nombre quitamos los espacios en blanco y lo pasamos a mayúsculas para una mejor comparación
    return spaces.some((space) => space.name.trim().toUpperCase() === name.trim().toUpperCase())
  },
  async saveSpace(idUser, data) {
    try {
      return await saveSubCollection(this.name, idUser, this.spacesName, data) // Guardamos el espacio en la base de datos
    } catch (error) {
      throw new Error(error)
    }
  }
}
