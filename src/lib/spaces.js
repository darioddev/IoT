import { saveDataWithId, saveSubCollection, deleteSubCollection } from './firebase.js'

export const espacios = {
  name: import.meta.env.VITE_APP_FIREBASE_COLLECTION_SPACE, // Obtenemos el nombre de la colección de espacios desde las variables de entorno
  spacesName: import.meta.env.VITE_APP_FIREBASE_COLLLECTION_NAMES,
  /**
   * Crea un nuevo documento en la colección de espacios con el id del usuario
   * @param {Object} data
   */
  async createDocument(uid) {
    try {
      return await saveDataWithId(this.name, uid, {}) // Guardamos el documento en la colección de espacios con el id del usuario
    } catch (error) {
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
    // Buscamos si existe un espacio con el mismo nombre
    return spaces.some((space) => space.name.trim().toUpperCase() === name.trim().toUpperCase())
  },
  async saveSpace(idUser, data) {
    try {
      return await saveSubCollection(this.name, idUser, this.spacesName, data) // Guardamos el espacio en la base de datos
    } catch (error) {
      throw new Error(error)
    }
  },
  /**
   * Obtiene el espacio de la lista de espacios con el id
   */
  findSpaceIndex: (spaces, id) => spaces.findIndex((space) => space.id === id),

  isExistSensor(spaces, id, name) {
    // Buscamos si existe un sensor con el mismo nombre en el espacio
    const index = this.findSpaceIndex(spaces, id) // Obtenemos el índice del espacio
    if (index === -1) throw new Error('No se ha encontrado el espacio') // Si no se encuentra el espacio, lanzamos un error
    return spaces[index].sensores.some(
      // Buscamos si existe un sensor con el mismo nombre en el espacio
      (sensor) => sensor.name.trim().toUpperCase() === name.trim().toUpperCase()
    )
  },
  isExistExecutor(spaces, id, name) {
    // Buscamos si existe un ejecutor con el mismo nombre en el espacio
    const index = this.findSpaceIndex(spaces, id) // Obtenemos el índice del espacio
    if (index === -1) throw new Error('No se ha encontrado el espacio') // Si no se encuentra el espacio, lanzamos un error
    return spaces[index].ejecutores.some(
      // Buscamos si existe un ejecutor con el mismo nombre en el espacio
      (executor) => executor.name.trim().toUpperCase() === name.trim().toUpperCase()
    )
  },
  findSensor: (spaces, idSpace, idSensor) => {
    // Buscamos un sensor en un espacio
    const index = espacios.findSpaceIndex(spaces, idSpace) // Obtenemos el índice del espacio
    if (index === -1) throw new Error('No se ha encontrado el espacio') // Si no se encuentra el espacio, lanzamos un error
    const sensorIndex = spaces[index].sensores.findIndex((sensor) => sensor.id === idSensor) // Obtenemos el índice del sensor
    if (sensorIndex === -1) throw new Error('No se ha encontrado el sensor') // Si no se encuentra el sensor, lanzamos un error
    return {
      // Devolvemos el sensor y el índice del espacio y del sensor
      data: spaces[index].sensores[sensorIndex],
      indexSpace: index,
      sensorIndex
    }
  },
  findExecutor(spaces, idSpace, idExecutor) {
    // Buscamos un ejecutor en un espacio
    const index = espacios.findSpaceIndex(spaces, idSpace) // Obtenemos el índice del espacio
    if (index === -1) throw new Error('No se ha encontrado el espacio') // Si no se encuentra el espacio, lanzamos un error
    const executorIndex = spaces[index].ejecutores.findIndex(
      // Obtenemos el índice del ejecutor
      (executor) => executor.id === idExecutor
    )
    if (executorIndex === -1) throw new Error('No se ha encontrado el ejecutor') // Si no se encuentra el ejecutor, lanzamos un error
    return {
      // Devolvemos el ejecutor y el índice del espacio y del ejecutor
      data: spaces[index].ejecutores[executorIndex],
      indexSpace: index,
      executorIndex
    }
  }
}
