import { getDataChanged_collection } from './firebase.js'

/**
 * Funcion que obtiene los datos de una colección de la base de datos
 * @param {string} collectionName
 */
const fetchDataFromCollection = (collectionName) => {
  return new Promise((resolve) => {
    getDataChanged_collection(collectionName, (snapshot) => {
      resolve(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
  })
}

export const devices = {
  unitName: import.meta.env.VITE_APP_FIREBASE_COLLECTION_UNITS, // Nombre de la colección de unidades de medida
  executorName: import.meta.env.VITE_APP_FIREBASE_COLLECTION_EXECUTORS, // Nombre de la colección de ejecutores

  async getUnits() {
    // Obtenemos las unidades de medida de la base de datos
    return await fetchDataFromCollection(this.unitName) // Llamamos a la función que nos permite obtener los datos de una colección
  },

  async getExecutors() {
    // Obtenemos los ejecutores de la base de datos
    return await fetchDataFromCollection(this.executorName) // Llamamos a la función que nos permite obtener los datos de una colección
  },
  getLength: (obj) => Object.keys(obj).length, //Obtener el numero de lo que recibamos por parametro como objecto y devolvemos el numero de propiedades que tiene
  handleSelect: (object, tipo, event) => {
    const selectedOption = event.target.selectedOptions[0].value // Obtengo el valor del select a medida que se va seleccionando
    object[tipo] = selectedOption // Asigno el valor del select a la variable reactiva
  }
}
