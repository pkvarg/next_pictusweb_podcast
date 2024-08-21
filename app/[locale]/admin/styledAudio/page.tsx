'use client'

import React, { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AiOutlineDelete } from 'react-icons/ai'
import { Loader } from 'lucide-react'
import {
  create,
  createSpeech,
} from '@/app/[locale]/admin/_actions/podcastActions'
import PreviewAudio from '@/lib/PreviewAudio'
<<<<<<< Updated upstream
=======
import AudioBack from './../../../components/admin/AdminBack'
>>>>>>> Stashed changes

const StyledAudio = () => {
  const { toast } = useToast()
  const [textPrompt, setTextPrompt] = useState<string>('')
  const [podcastTitle, setPodcastTitle] = useState('')
  const [description, setDescription] = useState<string>('')

  const [openOwnImg, setOpenOwnImage] = useState<boolean>(false)
<<<<<<< Updated upstream
  const [media, setMedia] = useState('')
=======
>>>>>>> Stashed changes

  const [openAiImg, setOpenAiImage] = useState<boolean>(false)

  const [file, setFile] = useState<File | null>(null)
  // State to hold the preview URL of the selected file
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [imagePrompt, setImagePrompt] = useState<string>('')
  const [audioPath, setAudioPath] = useState<string>('')
  const [imagePath, setImagePath] = useState<string>('')
  const [aiImage, setAiImage] = useState('')

  const [category, setCategory] = useState<string>('faith')
  const [english, setEnglish] = useState<boolean>(false)
  const [message, setMessage] = useState('')

  const voiceCategories = ['alloy', 'shimmer', 'nova', 'echo', 'fable', 'onyx']
  const [voiceType, setVoiceType] = useState<string | null>(null)

  useEffect(() => {
    if (openOwnImg) {
      setOpenAiImage(false)
    }
    if (openAiImg) {
      setOpenOwnImage(false)
    }
  }, [openOwnImg, openAiImg])

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
      setIsSubmitting(true)
      const response = await fetch('/api/podcastAiImg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON
        },
        body: JSON.stringify(data), // Convert the data object to a JSON string
      })
      const result = await response.json()
      console.log('returned', result)

      setIsSubmitting(false)
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
      return
    }
    setIsSubmitting(true)
    // const audio = await createSpeech(podcastTitle, textPrompt)
    // console.log('aud', audio)
    // if (audio && audio.frontendPath) {
    //   setAudioPath(audio.frontendPath)

    // // save file to server
    // if (file) {
    //   try {
    //     const formdata = new FormData()
    //     if (file) formdata.append('files', file)

    //     const requestOptions = { method: 'POST', body: formdata }

    //     const response = await fetch('/api/podcastOwnImg', requestOptions)
    //     const result = await response.json()
    //     console.log('returned', result)
    //     setImagePath(result.data)
    //     setPreviewUrl(result.data)
    //     console.log('imagePath', result.data)
    //   } catch (error) {
    //     console.log('hs', error)
    //   }
    // }

    const formData = new FormData()
    formData.append('title', podcastTitle)
    formData.append('description', description)
    formData.append('textPrompt', textPrompt)
    formData.append('imagePrompt', imagePrompt)
    formData.append('audioPath', audioPath)
    formData.append('imagePath', imagePath)
    formData.append('category', category)
    formData.append('english', english.toString())
    const result = await create(formData)
    console.log('rescreate', result)
    //setMessage(result.message)
    setIsSubmitting(false)
    // alert(message)
    toast({ title: 'Podcast created and saved to the server.' })
    //}
  }

  const handleVoiceType = (value: string) => {
    setVoiceType(value)
<<<<<<< Updated upstream
    console.log('hvt', voiceType)
=======

>>>>>>> Stashed changes
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

      //setFile(selectedFile)
      console.log('media4', e.target.files[0])
      try {
        const formdata = new FormData()
        formdata.append('files', e.target.files[0])

        const requestOptions = { method: 'POST', body: formdata }

        const response = await fetch('/api/podcastOwnImg', requestOptions)
        const result = await response.json()
        console.log('returned', result)
        setImagePath(result.data)
        console.log('imagePath', imagePath)
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
    setIsSubmitting(true)
    const audio = await createSpeech(podcastTitle, textPrompt)
    console.log('aud', audio)
    if (audio && audio.frontendPath) {
      setAudioPath(audio.frontendPath)
    }
    setIsSubmitting(false)
  }

  return (
    <div className='flex flex-col gap-2 justify-center items-center py-16 w-full bg-[#0f1114] text-white  px-4 lg:px-[10%]'>
<<<<<<< Updated upstream
=======
      <AudioBack />
>>>>>>> Stashed changes
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
            Select AI Voice
          </label>

          <select
            id='category'
            name='category'
            className='mt-2 bg-[#15181c]'
            value={voiceType || 'choose voice'}
            onChange={(e) => handleVoiceType(e.target.value)}
          >
            {voiceCategories.map((category) => (
              <option
                key={category}
                value={category}
                className='capitalize w-full px-16 !text-white bg-[#15181c]'
              >
                {category}
              </option>
            ))}
          </select>

          {voiceType && (
            <audio src={`/${voiceType}.mp3`} autoPlay className='hidden' />
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
            <button
              onClick={generateAudio}
              className='bg-orange-500 px-4 py-2 rounded-xl mt-4 cursor-pointer'
            >
              Generate
            </button>
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
          <option value='faith' className='focus:bg-orange-500'>
            Faith
          </option>
          <option value='tech'>Tech</option>
          <option value='other'>Other</option>
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

<<<<<<< Updated upstream
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

          <p
            onClick={() => setOpenAiImage((prev) => !prev)}
            className='cursor-pointer hover:text-blue-500'
=======
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
>>>>>>> Stashed changes
          >
            Use AI to create an Image
          </p>
        </div>

<<<<<<< Updated upstream
        {openAiImg && (
          <div className='flex flex-col relative bg-[#2e2236] mt-8'>
            <textarea
              className='text-black text-[18px] pl-2 w-[100%] mt-2 h-[300px]'
=======
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
>>>>>>> Stashed changes
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder='Enter promt for AI image creation'
            />

            {isSubmitting ? (
              <Loader size={60} className='animate-spin ml-[45%] mt-4' />
            ) : (
              <button
                onClick={handleGetAiImage}
<<<<<<< Updated upstream
                className='mt-4 hover:text-blue-500'
=======
                className='bg-orange-500 px-4 py-2 rounded-xl mt-4 cursor-pointer w-max'
>>>>>>> Stashed changes
              >
                Get AI Image from Prompt
              </button>
            )}
          </div>
        )}

        {previewUrl && (
          <Image
<<<<<<< Updated upstream
            className='my-4 w-[150px] h-auto'
=======
            className='my-4 w-[250px] h-auto'
>>>>>>> Stashed changes
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

export default StyledAudio
