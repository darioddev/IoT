import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js'

import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider, 
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/9.6.2/firebase-auth.js'

// Your web app's Firebase configuration
// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_APP_FIREBASE_MEASUREMENT_ID
}

//Conectamos con la base de datos
const app = initializeApp(firebaseConfig) 
const db = getFirestore(app)
export const auth = getAuth(app) // Obtenemos la autenticación de Firebase

//Sobre una collection
export const getDataChanged_collection = (ref, callBack) =>
  onSnapshot(collection(db, ref), callBack)
//Sobre un documento
export const getDataChanged_document = (ref, document, callBack) => onSnapshot(doc(db, ref, document), callBack)

// Métodos de autenticación
export const createUserCredentials = (email, password , displayName) =>
  createUserWithEmailAndPassword(auth, email, password , displayName)

// Método para iniciar sesión con correo y contraseña
export const signInUserCredentials = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

// Método para cerrar sesión
export const signOutUser = () => signOut(auth)

export const onAuthStateChangedUser = (callBack) => onAuthStateChanged(auth, callBack)

export const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider())

/* Metodo que permite guardar un doucmento con el id que pongamos*/
export const saveDataWithId = (ref, id, objeto) => setDoc(doc(db, ref, id), objeto)

// Acceder a una subcolección de un documento con snapshot
export const getSubCollection = (ref, id, subCollection, callBack) =>
  onSnapshot(collection(doc(db, ref, id), subCollection), callBack)
// Almacenar un documento en una subcolección con id aleatorio
export const saveSubCollection = (ref, id, subCollection, objeto) =>
  addDoc(collection(doc(db, ref, id), subCollection), objeto)
// Eliminar un documento de una subcolección 
export const deleteSubCollection = (ref, id, subCollection, subId) =>
  deleteDoc(doc(db, ref, id, subCollection, subId))
//Actualizar un documento de una subcolección
export const updateSubCollection = (ref, id, subCollection, subId, objeto) =>
  updateDoc(doc(db, ref, id, subCollection, subId), objeto)