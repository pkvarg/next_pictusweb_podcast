// auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { isValidPassword } from './isValidPassword'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role?: string
  }
}


// Export auth options for use in other files  
export const authOptions = {
  trustHost: true, // Add this for production deployment
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      console.log('JWT callback - Provider:', account?.provider, 'User:', user?.email, 'Environment:', process.env.NODE_ENV)
      
      if (user) {
        token.id = user.id
        token.role = user.role || 'user' // Default to 'user' for OAuth providers
        token.email = user.email

        // Check if OAuth user is authorized
        if (account?.provider && account.provider !== 'credentials') {
          console.log('OAuth login attempt for:', user.email, 'Provider:', account.provider)
          const clientUsernames = process.env.CLIENT_USERNAMES
          let allowedEmails: string[] = []
          
          if (clientUsernames) {
            try {
              // Parse the array string from environment variable
              allowedEmails = JSON.parse(clientUsernames)
            } catch (error) {
              console.error('Failed to parse CLIENT_USERNAMES:', error)
              allowedEmails = []
            }
          }

          // Add admin username to allowed list
          if (process.env.ADMIN_USERNAME) {
            allowedEmails.push(process.env.ADMIN_USERNAME)
          }

          // Check if user email is in allowed list
          console.log('Allowed emails:', allowedEmails, 'User email:', user.email)
          if (!allowedEmails.includes(user.email || '')) {
            console.log('ACCESS DENIED for:', user.email)
            throw new Error('ACCESS_DENIED')
          }
          console.log('ACCESS GRANTED for:', user.email)
        }
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Credentials login attempt for:', credentials?.username)
        console.log('Environment variables - ADMIN_USERNAME:', !!process.env.ADMIN_USERNAME, 'HASHED_ADMIN_PASSWORD:', !!process.env.HASHED_ADMIN_PASSWORD)
        
        if (!credentials?.username || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        // Check against environment variables
        if (
          credentials.username === process.env.ADMIN_USERNAME &&
          process.env.HASHED_ADMIN_PASSWORD &&
          (await isValidPassword(
            credentials.password as string,
            process.env.HASHED_ADMIN_PASSWORD as string,
          ))
        ) {
          console.log('Credentials login SUCCESS for:', credentials.username)
          return {
            id: '1',
            name: 'Admin',
            email: credentials.username as string,
            role: 'admin',
          }
        }

        console.log('Credentials login FAILED for:', credentials.username)
        return null
      },
    }),
  ],
}

// Initialize NextAuth with the auth options
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
