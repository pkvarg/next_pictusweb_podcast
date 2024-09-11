import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/firebaseConfig' // Import the initialized storage
import { getTimeStamp } from '@/lib/timestamp'

export async function uploadFirebase(
  podcastTitle: string,
  buffer: any,
  contentType: string
) {
  // Firebase storage path (in your Firebase storage bucket)
  console.log('speechfileXFR', buffer)

  const timestamp = getTimeStamp()
  const firebaseStoragePath = `podcast/${podcastTitle}_${timestamp}`

  // Create a reference to the file in Firebase storage
  const storageRef = ref(storage, firebaseStoragePath)

  try {
    // Upload the buffer to Firebase Storage
    const uploadResult = await uploadBytes(storageRef, buffer, {
      contentType: contentType,
    })

    // Get the public URL of the uploaded file
    const downloadURL = await getDownloadURL(uploadResult.ref)
    return downloadURL
  } catch (error) {
    console.log('firebase error', error)
  }
}
