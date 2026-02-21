import AdminLayout from '@/app/components/admin/AdminLayout'
import AllPodcasts from '@/app/components/admin/AllPodcasts'
import { Link } from '@/i18n/routing'
import { Plus, Mic } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PodcastsAdmin = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Podcasts Management</h1>
            <p className="text-gray-400 mt-2">Create and manage all your AI-generated podcasts</p>
          </div>
          <Link
            href="/admin/audio"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-pictus-black rounded-lg transition-all shadow-lg hover:shadow-pictus-lime/50"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Podcast</span>
          </Link>
        </div>
        <AllPodcasts />
      </div>
    </AdminLayout>
  )
}

export default PodcastsAdmin
