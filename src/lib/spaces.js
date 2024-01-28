import { saveDataWithId, getDataChanged_document, updateData } from './firebase.js'

export const espacios = {
  name: import.meta.env.VITE_APP_FIREBASE_COLLECTION_SPACE, // Obtenemos el nombre de la colección de espacios desde las variables de entorno
  /**
   * Crea un nuevo documento en la colección de espacios con el id del usuario
   * @param {Object} data
   */
  async createDocument(data) {
    try {
      return saveDataWithId(this.name, data.id)
    } catch (error) {
      throw new Error(error)
    }
  },
  /**
   * Obtiene los datos del documento de la colección de espacios con el id del usuario
   */
  getDocument(id) {
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
    try {
      return await updateData(id, this.name, data)
    } catch (error) {
      throw new Error(error)
    }
  },
  /**
   * Obtiene el espacio de la lista de espacios con el id
   */
  findSpaceIndex: (spaces, id) => spaces.findIndex((space) => space.id === id),
  isExistSensor(spaces, id, name) {
    const index = this.findSpaceIndex(spaces, id)
    if (index === -1) throw new Error('No se ha encontrado el espacio')
    return spaces[index].sensores.some(
      (sensor) => sensor.name.trim().toUpperCase() === name.trim().toUpperCase()
    )
  },
  isExistExecutor(spaces, id, name) {
    const index = this.findSpaceIndex(spaces, id)
    if (index === -1) throw new Error('No se ha encontrado el espacio')
    return spaces[index].ejecutores.some(
      (executor) => executor.name.trim().toUpperCase() === name.trim().toUpperCase()
    )
  },
  isExistSpace(spaces, name) {
    return spaces.some((space) => space.name.trim().toUpperCase() === name.trim().toUpperCase())
  },
  findSensor: (spaces, idSpace, idSensor) => {
    const index = espacios.findSpaceIndex(spaces, idSpace)
    if (index === -1) throw new Error('No se ha encontrado el espacio')
    const sensorIndex = spaces[index].sensores.findIndex((sensor) => sensor.id === idSensor)
    if (sensorIndex === -1) throw new Error('No se ha encontrado el sensor')
    return {
      data: spaces[index].sensores[sensorIndex],
      indexSpace: index,
      sensorIndex
    }
  },
  findExecutor(spaces, idSpace, idExecutor) {
    const index = espacios.findSpaceIndex(spaces, idSpace)
    if (index === -1) throw new Error('No se ha encontrado el espacio')
    const executorIndex = spaces[index].ejecutores.findIndex(
      (executor) => executor.id === idExecutor
    )
    if (executorIndex === -1) throw new Error('No se ha encontrado el ejecutor')
    return {
      data: spaces[index].ejecutores[executorIndex],
      indexSpace: index,
      executorIndex
    }
  }
}
