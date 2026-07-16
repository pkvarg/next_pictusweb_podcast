'use client'
import Image from 'next/image'
import { Link } from '@/i18n/routing'

interface PodcastImageProps {
  imagePath: string
  title: string
  id: string
}

const PodcastImage: React.FC<PodcastImageProps> = ({ imagePath, title, id }) => {
  return (
    <Link href={`/podcasts/${id}`} className="cursor-pointer">
      <Image
        src={imagePath || '/icons/headphones.svg'}
        alt={title}
        className="w-[300px] h-[300px] object-cover rounded-2xl"
        width={250}
        height={250}
        priority
      />
    </Link>
  )
}

export default PodcastImage
