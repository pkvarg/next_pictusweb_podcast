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
  trustHost: true, // Add this for production deployment
  basePath: '/api/auth',
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/sk/auth/error', // Default to Slovak, but NextAuth will handle this
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id
        token.role = user.role || 'user' // Default to 'user' for OAuth providers
        token.email = user.email

        // Check if OAuth user is authorized
        if (account?.provider && account.provider !== 'credentials') {
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
          if (!allowedEmails.includes(user.email || '')) {
            throw new Error('ACCESS_DENIED')
          }
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
        if (!credentials?.username || !credentials?.password) {
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
          return {
            id: '1',
            name: 'Admin',
            email: credentials.username as string,
            role: 'admin',
          }
        }

        return null
      },
    }),
  ],
}

// Initialize NextAuth with the auth options
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
