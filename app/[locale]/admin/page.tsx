import AdminNavbar from '@/app/components/admin/AdminNavbar'
import AllPodcasts from '@/app/components/admin/AllPodcasts'
import Counter from '@/app/components/admin/Counter'
import RefreshButton from '@/app/components/admin/RefreshButton'
import React from 'react'

const Admin = () => {
  return (
    <div>
      <AdminNavbar />

      <h1 className='text-center'>Admin</h1>
      <Counter />
      <RefreshButton />
      <AllPodcasts />
    </div>
  )
}

export default Admin
