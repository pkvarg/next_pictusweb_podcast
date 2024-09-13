'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const AdminNavbar = () => {
  const [navbar, setNavbar] = useState(false)
  const { locale } = useParams()

  return (
    <header>
      <nav className='w-full text-white nav-font'>
        <div className='justify-between px-4 mx-auto md:items-center md:flex md:px-8'>
          <div className='mb-0 lg:mb-2'>
            <div className='flex items-center justify-between md:block'>
              <Link href='/'>Home</Link>

              <div className='md:hidden'>
                <button
                  className='p-2 text-white rounded-md outline-none focus:border-gray-400 focus:border'
                  onClick={() => setNavbar(!navbar)}
                >
                  {navbar ? (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='w-10 h-10'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='w-10 h-10'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M4 6h16M4 12h16M4 18h16'
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div>
            <div
              className={`flex-1 justify-self-center h-[80vh] lg:h-auto pb-3 mt-8 md:block md:pb-0 md:mt-0 ${
                navbar ? 'block' : 'hidden'
              }`}
            >
              <ul className='justify-center items-center space-y-8 md:flex md:space-x-6 md:space-y-0 text-[30px] lg:text-[25px] text-red-500'>
                <li>
                  <Link href={`/${locale}/admin/ai`}>AI</Link>
                </li>
                {/* <li>
                  <Link href={`/${locale}/admin/audio`}>Audio</Link>
                </li> */}
                <li>
                  <Link href={`/${locale}/admin/audio`}>Create Podcast</Link>
                </li>

                <li>
                  <Link href={`/${locale}/admin/video`}>Video</Link>
                </li>

                {/* <li>
                  <Link href={`/${locale}/admin/blogs`}>Blogs</Link>
                </li> */}

                {/* <li>
                  <Link href={`/${locale}/admin/announcements`}>Oznamy</Link>
                </li> */}

                {/* <li
                  className='text-red-500 cursor-pointer pt-[1px]'
                  onClick={handleLogout}
                >
                  Odhlásiť sa
                </li> */}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default AdminNavbar
