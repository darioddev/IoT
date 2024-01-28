
/**
 * Funcion que comprueba si un objecto tiene campos vacios , primero se convierte el objeto en un array de sus valores
 * Despues se comprueba si alguno de esos valores es igual a un string vacio , con el metodo de array some()
 * Si alguno de los valores es igual a un string vacio, la funcion devuelve true
 * @param {object} obj
 * @returns {boolean}
 */
export const hasEmptyFields = (obj) => Object.values(obj).some((value) => value === '')

/**
 * Funcion que comprueba si dos contraseñas son iguales 
 * @param {string} password 
 * @param {string} repeatPassword
 * @returns {boolean}
 */
export const isSamePassword = (password, repeatPassword) => password === repeatPassword

// Generador de ids unicos
export const generateUUID = ()  => {
  let d = new Date().getTime()
  let uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}