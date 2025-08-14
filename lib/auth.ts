// auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
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
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account, trigger }: any) {
      console.log('JWT callback - Trigger:', trigger, 'Provider:', account?.provider, 'User:', user?.email, 'Environment:', process.env.NODE_ENV)
      
      // Only process when user data is present (initial sign in)
      if (user && account) {
        console.log('Processing new sign-in for user:', user.email)
        token.id = user.id
        token.role = user.role || 'user' // Default to 'user' for OAuth providers
        token.email = user.email
        token.name = user.name

        // Check if OAuth user is authorized
        if (account.provider !== 'credentials') {
          console.log('OAuth login attempt for:', user.email, 'Provider:', account.provider)
          const clientUsernames = process.env.CLIENT_USERNAMES
          let allowedEmails: string[] = []
          
          if (clientUsernames) {
            try {
              // Clean up the string and parse the array
              const cleanedString = clientUsernames.replace(/\\/g, '').trim()
              allowedEmails = JSON.parse(cleanedString)
            } catch (error) {
              console.error('Failed to parse CLIENT_USERNAMES:', error)
              console.error('Raw CLIENT_USERNAMES value:', clientUsernames)
              // Fallback: try to extract emails manually
              const emailMatch = clientUsernames.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g)
              allowedEmails = emailMatch || []
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
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
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
export default NextAuth(authOptions)
