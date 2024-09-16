'use client'
import React, { useState } from 'react'
//import { deleteSingleBlog } from '@/app/[locale]/admin/_actions/blogActions'

interface Blog {
  blogId: string
}

const DeleteBlogButton: React.FC<Blog> = (blogId) => {
  const [message, setMessage] = useState('')
  const deleteBlog = async (e: any, blogId: string) => {
    e.preventDefault()
    const userConfirmed = confirm('Are you sure you want to delete this item?')
    if (userConfirmed) {
      // Perform the delete operation
      //const response = await deleteSingleBlog(blogId)
      // if (response.message) setMessage(response.message)
    } else {
      // Cancel the delete operation
      console.log('Delete operation cancelled')
    }
  }

  return (
    <>
      <button
        className='text-red-500 text-[18px]'
        onClick={(e) => deleteBlog(e, blogId.blogId)}
      >
        Delete Blog
      </button>
      {message && (
        <p className='text-green-600 text-[15px] bg-white'>{message}</p>
      )}
    </>
  )
}

export default DeleteBlogButton
