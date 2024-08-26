// 'use server'
// import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

// const subscriptionKey = process.env.AZURE_TTS_1!
// const serviceRegion = process.env.AZURE_TTS_REGION!
// const filename = 'YourAudioFile3.mp3'

// if (!subscriptionKey || !serviceRegion) {
//   throw new Error('Azure TTS subscription key or region is not defined.')
// }

// export default async function azureTts(text: string) {
//   return new Promise<void>((resolve, reject) => {
//     const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename)
//     const speechConfig = sdk.SpeechConfig.fromSubscription(
//       subscriptionKey,
//       serviceRegion
//     )
//     speechConfig.speechSynthesisVoiceName = 'sk-SK-LukasNeural'

//     const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)

//     synthesizer.speakTextAsync(
//       text,
//       (result) => {
//         if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
//           console.log('Synthesis finished.')
//           resolve()
//         } else {
//           console.error('Speech synthesis canceled:', result.errorDetails)
//           reject(new Error(result.errorDetails))
//         }
//         synthesizer.close()
//       },
//       (err) => {
//         console.error('Error during synthesis:', err)
//         synthesizer.close()
//         reject(err)
//       }
//     )
//   })
// }

'use server'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

const subscriptionKey = process.env.AZURE_TTS_1!
const serviceRegion = process.env.AZURE_TTS_REGION!
const filename = 'YourAudioFile1.mp3'

if (!subscriptionKey || !serviceRegion) {
  throw new Error('Azure TTS subscription key or region is not defined.')
}

export default async function azureTts(text: string, rate: string = '-20%') {
  return new Promise<void>((resolve, reject) => {
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename)
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      subscriptionKey,
      serviceRegion
    )

    // SSML with Slovak language specified
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="sk-SK">
        <voice name="sk-SK-LukasNeural">
          <prosody rate="${rate}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log('Synthesis finished.')
          resolve()
        } else {
          console.error('Speech synthesis canceled:', result.errorDetails)
          reject(new Error(result.errorDetails))
        }
        synthesizer.close()
      },
      (err) => {
        console.error('Error during synthesis:', err)
        synthesizer.close()
        reject(err)
      }
    )
  })
}
