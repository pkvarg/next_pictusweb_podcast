'use client'

import React, { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'
import { AiOutlineDelete } from 'react-icons/ai'
import { Loader } from 'lucide-react'
import { create } from '@/app/[locale]/admin/_actions/podcastActions'
import { createOpenAiSpeech } from '../_actions/podcastOpenAiActions'
import { createAzureSpeech } from '../_actions/podcastAzureActions'
import { createElevenlabsSpeech } from '../_actions/podcastElevenlabsActions'

import PreviewAudio from '@/lib/PreviewAudio'
import AudioBack from './../../../components/admin/AdminBack'

const Audio = () => {
  const { toast } = useToast()
  const [textPrompt, setTextPrompt] = useState<string>('')
  const [podcastTitle, setPodcastTitle] = useState('')
  const [description, setDescription] = useState<string>('')

  const [openOwnImg, setOpenOwnImage] = useState<boolean>(false)

  const [media, setMedia] = useState('')

  const [openAiImg, setOpenAiImage] = useState<boolean>(false)

  const [file, setFile] = useState<File | null>(null)
  // State to hold the preview URL of the selected file
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isSubmittingText, setIsSubmittingText] = useState(false)
  const [isSubmittingImage, setIsSubmittingImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [imagePrompt, setImagePrompt] = useState<string>('')
  const [audioPath, setAudioPath] = useState<string>('')
  const [imagePath, setImagePath] = useState<string>('')
  const [aiImage, setAiImage] = useState('')

  const [category, setCategory] = useState<string>('life')
  const [english, setEnglish] = useState<boolean>(false)
  const [message, setMessage] = useState('')
  const [voiceProvider, setVoiceProvider] = useState('')

  const openaiVoices = ['alloy', 'shimmer', 'nova', 'echo', 'fable', 'onyx']
  const azureVoices = ['Lukas', 'Viktoria']
  const elevenlabsVoices = [
    'Andrej',
    'Karol',
    'Leo',
    'Juraj',
    'Peter',
    'Liam',
    'Erik',
  ]

  const [voiceType, setVoiceType] = useState<string>('')

  const [voiceCategs, setVoiceCategs] = useState<string[]>(openaiVoices)

  useEffect(() => {
    if (openOwnImg) {
      setOpenAiImage(false)
    }
    if (openAiImg) {
      setOpenOwnImage(false)
    }
  }, [openOwnImg, openAiImg])

  useEffect(() => {
    if (voiceProvider === 'openai') {
      setVoiceCategs(openaiVoices)
      handleVoiceType('alloy')
    } else if (voiceProvider === 'azure') {
      setVoiceCategs(azureVoices)
      handleVoiceType('Lukas')
    } else if (voiceProvider === 'elevenlabs') {
      setVoiceCategs(elevenlabsVoices)
      handleVoiceType('Karol')
    }
  }, [voiceProvider])

  const handleGetAiImage = async (e: any) => {
    e.preventDefault()
    setPreviewUrl('')
    if (!imagePrompt || !podcastTitle) {
      toast({ title: 'Title and Prompt must not be empty.' })
    } else {
      const data = {
        title: podcastTitle,
        prompt: imagePrompt,
      }
      setIsSubmittingImage(true)
      const response = await fetch('/api/podcastAiImg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON
        },
        body: JSON.stringify(data), // Convert the data object to a JSON string
      })
      const result = await response.json()

      setIsSubmittingImage(false)

      setImagePath(result.data)
      setPreviewUrl(result.data as string)
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!podcastTitle || !textPrompt) {
      toast({
        title: 'Title and Input Text must not be empty.',
        variant: 'destructive',
      })
      alert('Title and Input Text must not be empty.')
      return
    }
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('title', podcastTitle)
    formData.append('description', description)
    formData.append('textPrompt', textPrompt)
    formData.append('voiceType', voiceType)
    formData.append('imagePrompt', imagePrompt)
    formData.append('audioPath', audioPath)
    formData.append('imagePath', imagePath)
    formData.append('category', category)
    formData.append('english', english.toString())
    const result = await create(formData)

    setIsSubmitting(false)

    toast({ title: 'Podcast created and saved to the server.' })
  }

  const handleVoiceType = (value: string) => {
    setVoiceType(value)

    setTimeout(() => {
      const audio = document.getElementById('voiceAudio') as HTMLAudioElement
      if (audio) {
        audio.play().catch((e) => console.error('Error playing audio:', e))
      }
    }, 100)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      // Update preview URL state
      const reader = new FileReader()
      reader.readAsDataURL(selectedFile)
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }

      try {
        const formdata = new FormData()
        formdata.append('files', e.target.files[0])

        const requestOptions = { method: 'POST', body: formdata }

        const response = await fetch('/api/podcastOwnImg', requestOptions)
        const result = await response.json()

        setImagePath(result.data)
      } catch (error) {
        console.log('hs', error)
      }
    } else {
      setFile(null)
      setPreviewUrl('')
    }
  }
  const removeFile = () => {
    setFile(null)
    setPreviewUrl('')
    //setMedia('')
  }

  const generateAudio = async (e: any) => {
    e.preventDefault()
    if (!podcastTitle || !textPrompt) {
      toast({
        title: 'Title and Input Text must not be empty.',
        variant: 'destructive',
      })

      return
    }
    setIsSubmittingText(true)
    if (voiceProvider === 'openai') {
      const audio = await createOpenAiSpeech(
        podcastTitle,
        voiceType,
        textPrompt
      )

      if (audio && audio.frontendPath) {
        setAudioPath(audio.frontendPath)
      }
      setIsSubmittingText(false)
    } else if (voiceProvider === 'azure') {
      const audio = await createAzureSpeech(podcastTitle, voiceType, textPrompt)

      if (audio && audio.frontendPath) {
        setAudioPath(audio.frontendPath)
      }
      setIsSubmittingText(false)
    } else if (voiceProvider === 'elevenlabs') {
      const audio = await createElevenlabsSpeech(
        podcastTitle,
        voiceType,
        textPrompt
      )
      console.log('aud', audio)
      if (audio && audio.frontendPath) {
        setAudioPath(audio.frontendPath)
      }
      setIsSubmittingText(false)
    }
  }

  return (
    <div className='flex flex-col gap-2 justify-center items-center py-16 w-full bg-[#0f1114] text-white  px-4 lg:px-[10%]'>
      <AudioBack />

      <h1>Create Podcast</h1>
      <form>
        <label className='text-16 font-bold text-white'>Title</label>
        <input
          className='bg-[#15181c] pl-2 w-full'
          type='text'
          value={podcastTitle}
          onChange={(e) => setPodcastTitle(e.target.value)}
          placeholder='Enter Podcast title'
        />

        <div className='flex flex-col gap-2.5 my-8'>
          <label className='text-16 font-bold text-white'>
            Select AI Voice Provider
          </label>

          <div className='flex flex-row gap-4 justify-start items-center my-4'>
            <Image
              src={'/tech/openai-logo.webp'}
              width={250}
              height={250}
              alt='openai'
              onClick={() => setVoiceProvider('openai')}
              className='w-[50px] cursor-pointer'
            />
            <Image
              src={'/tech/azure-logo.webp'}
              width={250}
              height={250}
              alt='azureai'
              onClick={() => setVoiceProvider('azure')}
              className='w-[50px] cursor-pointer'
            />
            <Image
              src={'/tech/eleven-labs-logo.webp'}
              width={250}
              height={250}
              alt='elevenlabsai'
              onClick={() => setVoiceProvider('elevenlabs')}
              className='w-[50px] cursor-pointer rounded-full'
            />
          </div>

          <label className='text-16 font-bold text-white'>
            Select AI Voice
          </label>

          <select
            id='category'
            name='category'
            className='mt-2 bg-[#15181c]'
            value={voiceType || 'choose voice'}
            onChange={(e) => handleVoiceType(e.target.value)}
          >
            {voiceCategs?.map((category: string) => (
              <option
                key={category}
                value={category}
                className='w-full px-16 !text-white bg-[#15181c]'
              >
                {category.charAt(0).toUpperCase() +
                  category.slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          {voiceType && (
            <audio
              src={`/voices/${voiceType}.mp3`}
              autoPlay
              className='hidden'
            />
          )}
        </div>

        <div className='py-4'>
          <label htmlFor='description' className='text-[25px] mt-16'>
            Description
          </label>
          <textarea
            className='bg-[#15181c] mt-4 pl-1 w-full'
            name='text'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Description...'
          />
          <label htmlFor='aitexttospeech' className='text-[25px] mt-4'>
            AI Prompt to convert to speech
          </label>
          <textarea
            className='bg-[#15181c] text-[25px] pl-2 w-[100%] mt-2 h-[300px]'
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            placeholder='Enter text to convert to speech'
          />

          <div className='flex flex-row gap-4 justify-start items-center'>
            {isSubmittingText ? (
              <Loader size={60} className='animate-spin ' />
            ) : (
              <button
                onClick={generateAudio}
                className='bg-orange-500 px-4 py-2 rounded-xl mt-4 cursor-pointer'
              >
                Generate
              </button>
            )}

            {audioPath && (
              <div className='mt-[15px]'>
                <PreviewAudio audioPath={audioPath as string} />
              </div>
            )}
          </div>
        </div>

        <br />

        <label htmlFor='category' className='text-[25px] py-4'>
          Category
        </label>
        <select
          id='category'
          name='category'
          className='mt-2 text-white bg-[#15181c] w-full'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value='life' className='focus:bg-orange-500'>
            Life
          </option>
          <option value='tech'>Tech</option>
          <option value='random'>Random</option>
        </select>

        <label className='text-white'>
          <input
            name='english'
            type='checkbox'
            checked={english}
            onChange={(e) => setEnglish(e.target.checked)}
          />
          <span className='pl-2'>
            Is this to be displayed on the english webpage?
          </span>
        </label>

        <div className='flex flex-col gap-2 my-4'>
          <p
            onClick={() => setOpenOwnImage((prev) => !prev)}
            className='cursor-pointer hover:text-blue-500'
          >
            Upload your own Image
          </p>

          {openOwnImg && (
            <div className='flex flex-col relative my-8'>
              <input
                type='file'
                id='image'
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div className='flex flex-row'>
                <button
                  type='button'
                  className='border border-white w-[36px] h-[36px] 100 flex items-center justify-center cursor-pointer'
                >
                  <label htmlFor='image'>
                    <Image src='/plus.png' alt='' width={16} height={16} />
                  </label>
                </button>
                <button
                  type='button'
                  className='ml-16 border border-white w-[36px] h-[36px] 100 flex items-center justify-center cursor-pointer'
                >
                  <label htmlFor='image'>
                    <AiOutlineDelete
                      className='text-red-700'
                      onClick={removeFile}
                    />
                  </label>
                </button>
              </div>

              <p className='mt-8'>{imagePath}</p>
            </div>
          )}
        </div>

        <div className='flex flex-col lg:flex-row gap-4 my-4 text-orange-500'>
          <p
            onClick={() => setOpenOwnImage((prev) => !prev)}
            className='cursor-pointer hover:text-blue-500 border border-1 rounded-xl px-4'
          >
            Upload your own Image
          </p>
          <p
            onClick={() => setOpenAiImage((prev) => !prev)}
            className='cursor-pointer hover:text-blue-500 border border-1 rounded-xl px-4'
          >
            Use AI to create an Image
          </p>
        </div>

        {openOwnImg && (
          <div className='flex flex-col relative my-8'>
            <input
              type='file'
              id='image'
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className='flex flex-row ml-4'>
              <button
                type='button'
                className='border border-white w-[36px] h-[36px] 100 flex items-center justify-center cursor-pointer'
              >
                <label htmlFor='image'>
                  <Image src='/plus.png' alt='' width={16} height={16} />
                </label>
              </button>
              <button
                type='button'
                className='ml-16 border border-white w-[36px] h-[36px] 100 flex items-center justify-center cursor-pointer'
              >
                <label htmlFor='image'>
                  <AiOutlineDelete
                    className='text-red-700'
                    onClick={removeFile}
                  />
                </label>
              </button>
            </div>

            {/* <p className='mt-8'>{imagePath}</p> */}
          </div>
        )}

        {openAiImg && (
          <div className='flex flex-col relative  mt-8'>
            <textarea
              className='bg-[#15181c] text-[25px] pl-2 w-[100%] h-[300px]'
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder='Enter promt for AI image creation'
            />

            {isSubmittingImage ? (
              <Loader size={60} className='animate-spin ml-[45%] mt-4' />
            ) : (
              <button
                onClick={handleGetAiImage}
                className='bg-orange-500 px-4 py-2 rounded-xl mt-4 cursor-pointer w-max'
              >
                Get AI Image from Prompt
              </button>
            )}
          </div>
        )}

        {previewUrl && (
          <Image
            // className='my-4 w-[150px] h-auto'
            className='my-4 w-[250px] h-auto'
            src={previewUrl}
            alt={podcastTitle}
            width={50}
            height={50}
          />
        )}

        {isSubmitting ? (
          <Loader size={60} className='animate-spin ml-[45%] mt-4' />
        ) : (
          <button
            onClick={handleSubmit}
            className='bg-orange-500 px-4 py-2 rounded-xl mt-4 cursor-pointer'
          >
            Create Podcast
          </button>
        )}
      </form>
    </div>
  )
}

export default Audio
