import { saveDataWithId, getDataChanged_document , updateData} from './firebase.js'

export const espacios = {
  name: import.meta.env.VITE_APP_FIREBASE_COLLECTION_SPACE, // Obtenemos el nombre de la colección de espacios desde las variables de entorno
  /**
   * Crea un nuevo documento en la colección de espacios con el id del usuario
   * @param {Object} data
   */
  async createDocument(data) {
    return await saveDataWithId(this.name, data.id, {})
  },
  /**
   * Obtiene los datos del documento de la colección de espacios con el id del usuario
   * @param {string} id
   */
  async getDocument(id) {
    return new Promise((resolve, reject) => {
      getDataChanged_document(this.name, id, (doc) => {
        if (doc.exists()) resolve(doc.data())
        else reject('No existe el documento')
      })
    })
  },  
  /**
   * Actualiza los datos del documento de la colección de espacios con el id del usuario
   * @param {string} id
   * @param {Object} data
   */
  async updateDocument(id, data) {
    return await updateData(id, this.name, data)
  },

}

