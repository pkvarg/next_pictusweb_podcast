'use client'
import React, { useState, useEffect, useTransition } from 'react'
import { useParams } from 'next/navigation'
import {
  getSinglePodcast,
  editSinglePodcast,
  createSpeech,
} from '../../../_actions/podcastActions'
import DeletePodcastButton from './../../../../../components/admin/DeletePodcastButton'

import { AiOutlineDelete } from 'react-icons/ai'
import AudioBack from './../../../../../components/admin/AdminBack'
import Image from 'next/image'
import { Loader } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import PreviewAudio from '@/lib/PreviewAudio'

interface Podcast {
  id: string
  title: string
  textPrompt: string
  imagePrompt: string
  description: string | null // Allow null
  audioPath: string
  imagePath: string
  category: string
  english: boolean
  published: boolean
}

const EditPodcast = () => {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [podcastTitle, setPodcastTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [audioPath, setAudioPath] = useState<string>('')
  const [imagePath, setImagePath] = useState<string>('')
  const [category, setCategory] = useState<string>('gospel')
  const [english, setEnglish] = useState<boolean>(false)
  const [id, setId] = useState('')
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [openOwnImg, setOpenOwnImage] = useState<boolean>(false)
  const [openAiImg, setOpenAiImage] = useState<boolean>(false)
  const [imagePrompt, setImagePrompt] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingImage, setIsSubmittingImage] = useState(false)
  const voiceCategories = ['alloy', 'shimmer', 'nova', 'echo', 'fable', 'onyx']
  const [voiceType, setVoiceType] = useState<string | null>(null)
  const [textPrompt, setTextPrompt] = useState<string>('')

  // State to hold the preview URL of the selected file
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { podcastId } = useParams()
  const getPodcast = async () => {
    if (podcastId) {
      const singlePodcast = await getSinglePodcast(podcastId.toString())

      if (singlePodcast.success && singlePodcast.podcast) {
        setPodcast({
          ...singlePodcast.podcast,
          description: singlePodcast.podcast.description || '',
        } as Podcast)
      }
    }
  }

  useEffect(() => {
    getPodcast()
  }, [])

  useEffect(() => {
    if (podcast) {
      setId(podcast.id)
      setPodcastTitle(podcast.title)
      setTextPrompt(podcast.textPrompt)
      setCategory(podcast.category)
      setAudioPath(podcast.audioPath)
      setImagePrompt(podcast.imagePrompt)
      setImagePath(podcast.imagePath)
      setPreviewUrl(podcast.imagePath)
      setDescription(podcast.description || '')
      setEnglish(podcast.english)
    }
  }, [podcast, podcastId])

  const handleVoiceType = (value: string) => {
    setVoiceType(value)
    console.log('hvt', voiceType)
    setTimeout(() => {
      const audio = document.getElementById('voiceAudio') as HTMLAudioElement
      if (audio) {
        audio.play().catch((e) => console.error('Error playing audio:', e))
      }
    }, 100)
  }

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
      console.log('returned', result)

      setIsSubmittingImage(false)
      setImagePath(result.data)
      setPreviewUrl(result.data as string)
    }
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
    setPreviewUrl(null)
    setAudioPath('')
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      // const mediaUrl = await handleFileUpload()

      const formData = new FormData()
      formData.append('id', id)
      formData.append('title', podcastTitle)
      formData.append('description', description)
      formData.append('textPrompt', textPrompt)
      formData.append('imagePrompt', imagePrompt)
      formData.append('audioPath', audioPath)
      formData.append('imagePath', imagePath)
      formData.append('category', category)
      formData.append('english', english.toString())

      startTransition(async () => {
        const result = await editSinglePodcast(formData)
        setMessage(result.message)
      })
    } catch (error) {
      console.error('Error in form submission:', error)
    }
  }

  return (
    <div className='text-white text-[25px] flex flex-col gap-2 justify-center items-center my-8'>
      <AudioBack />
      <h1 className='text-yellow-300'>Edit Single Podcast</h1>
      {podcast ? (
        <form
          onSubmit={handleSubmit}
          method='post'
          className='relative flex flex-col mx-2 lg:mx-[35%] mt-16'
        >
          <input type='hidden' name='id' value={podcast.id} />

          <label className='text-16 font-bold text-white'>Title</label>
          <input
            className='bg-[#15181c] pl-2 w-full'
            type='text'
            value={podcastTitle}
            onChange={(e) => setPodcastTitle(e.target.value)}
            placeholder='Enter Podcast title'
          />

          <div className='flex flex-col gap-2.5 my-8'>
            <label htmlFor='description' className='text-[25px] mt-4'>
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
          <div className='flex flex-row gap-4 justify-start items-center'>
            <button
              onClick={generateAudio}
              className='bg-orange-500 px-4 py-1 rounded-xl mt-4 cursor-pointer'
            >
              Generate
            </button>
            {isSubmitting && (
              <Loader size={60} className='animate-spin ml-[45%] mt-4' />
            )}
            {audioPath && (
              <div className='mt-[19px]'>
                <PreviewAudio audioPath={audioPath as string} />
              </div>
            )}
          </div>
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

          <label className='text-white mt-4'>
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

                {/* <p className='mt-8'>{imagePath}</p> */}
              </div>
            )}

            <p
              onClick={() => setOpenAiImage((prev) => !prev)}
              className='cursor-pointer hover:text-blue-500'
            >
              Use AI to create an Image
            </p>
          </div>

          {openAiImg && (
            <div className='flex flex-col relative bg-[#2e2236] mt-8'>
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
                  className='bg-orange-500 px-4 py-1 rounded-xl mt-4 cursor-pointer w-max'
                >
                  Get AI Image from Prompt
                </button>
              )}
            </div>
          )}

          {previewUrl && (
            <Image
              className='w-[250px] my-8'
              src={previewUrl}
              alt={podcastTitle}
              width={250}
              height={250}
            />
          )}

          <button
            className='my-4 py-2 bg-green-400 text-white rounded-xl'
            type='submit'
            disabled={isPending}
          >
            {isPending ? '...Editing...' : 'Edit'}
          </button>
          {message && (
            <p className='my-8 text-center bg-yellow-500 text-white text-[25px]'>
              {message}
            </p>
          )}
          <DeletePodcastButton podcastId={podcast.id} />
        </form>
      ) : (
        <h1>...Loading</h1>
      )}
    </div>
  )
}

export default EditPodcast
