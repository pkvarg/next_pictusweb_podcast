import React from 'react'

interface MessageProps {
  variant?: string
  children: string
}

const Message: React.FC<MessageProps> = ({ variant = 'info', children }) => {
  return (
    <div
      className={`mb-6 px-5 py-4 rounded-xl text-sm font-medium ${
        variant === 'danger'
          ? 'bg-red-500/10 border border-red-500/20 text-red-400'
          : 'bg-pictus-lime/10 border border-pictus-lime/20 text-pictus-lime'
      }`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      role="alert"
    >
      {children}
    </div>
  )
}

export default Message
