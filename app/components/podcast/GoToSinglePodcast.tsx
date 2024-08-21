'use client'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'

interface PodcastImageProps {
  imagePath: string
  title: string
  id: string
}

const PodcastImage: React.FC<PodcastImageProps> = ({
  imagePath,
  title,
  id,
}) => {
  const router = useRouter()
  const { locale } = useParams()

  const handleClick = () => {
    router.push(`/${locale}/podcast/${id}`)
  }

  return (
    <div className='cursor-pointer' onClick={handleClick}>
      <Image
        src={imagePath || '/icons/headphones.svg'}
        alt={title}
        className='w-[300px] h-[300px] object-cover rounded-xl'
        width={250}
        height={250}
        priority
      />
    </div>
  )
}

export default PodcastImage
