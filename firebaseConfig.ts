import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE,
  authDomain: 'pictusblog-b7c58.firebaseapp.com',
  projectId: 'pictusblog-b7c58',
  storageBucket: 'pictusblog-b7c58.appspot.com',
  messagingSenderId: '910817067795',
  appId: '1:910817067795:web:0c3eed6b32935b5e8590e6',
}

const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

export { storage, app }
