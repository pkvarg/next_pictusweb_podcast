// auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { isValidPassword } from './isValidPassword'
import prisma from '@/db/db'
import { rateLimit } from './rateLimit'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role?: string
      organization?: string // Contains organizationId (UUID) after migration
      organizationId?: string // Explicit organizationId field
      isFleetManager?: boolean
      organizationDeleted?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role?: string
    organization?: string // Contains organizationId (UUID) after migration
    organizationId?: string // Explicit organizationId field
    isFleetManager?: boolean
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
    async signIn({ user, account }: any) {
      console.log('JWT SignIn attempt:', user.email, 'Provider:', account?.provider)
      
      // Check if user exists in database for JWT mode
      if (account?.provider !== 'credentials') {
        const dbUser = await prisma.user.findUnique({
          where: { 
            email: user.email,
            deletedAt: null,
            active: true
          }
        })

        if (!dbUser) {
          console.log('ACCESS DENIED - User not found:', user.email)
          return false
        }
        
        console.log('ACCESS GRANTED - User found:', user.email)
        return true
      }
      
      return true
    },
    async jwt({ token, user, account }: any) {
      try {
        if (user && account) {
          // Get user data from database for JWT
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.email = dbUser.email
            token.name = dbUser.name || `${dbUser.firstName} ${dbUser.lastName}`
            token.organizationId = dbUser.organizationId
            token.organization = dbUser.organizationId || dbUser.organization // Use organizationId (UUID) first
            token.isFleetManager = dbUser.isFleetManager

            // Check if organization is soft-deleted
            if (dbUser.organizationId) {
              const org = await prisma.organization.findUnique({
                where: { id: dbUser.organizationId },
                select: { deletedAt: true }
              })
              token.organizationDeleted = org?.deletedAt ? true : false
            } else {
              token.organizationDeleted = false
            }

            // Update login tracking
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                lastLoggedIn: new Date(),
                loginCount: { increment: 1 }
              }
            })
          } else {
          }
        } else if (token.email && !token.organization) {
          // For existing tokens, ensure we have organization data
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email }
          })

          if (dbUser) {
            token.organizationId = dbUser.organizationId
            token.organization = dbUser.organizationId || dbUser.organization // Use organizationId (UUID) first
            token.isFleetManager = dbUser.isFleetManager

            // Check if organization is soft-deleted
            if (dbUser.organizationId) {
              const org = await prisma.organization.findUnique({
                where: { id: dbUser.organizationId },
                select: { deletedAt: true }
              })
              token.organizationDeleted = org?.deletedAt ? true : false
            }

          }
        }

        return token
      } catch (error) {
        console.error('JWT callback error:', error)
        return token
      }
    },
    async session({ session, token }: any) {
      try {
        if (token) {
          session.user.id = token.id
          session.user.role = token.role?.toLowerCase() || 'client'
          session.user.email = token.email
          session.user.name = token.name || `${token.firstName || ''} ${token.lastName || ''}`.trim()
          session.user.organizationId = token.organizationId
          session.user.organization = token.organization
          session.user.isFleetManager = token.isFleetManager || false
          session.user.organizationDeleted = token.organizationDeleted || false
        }

        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
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
      name: 'Credentials Login',
      credentials: {
        username: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Credentials login attempt for:', credentials?.username)

        if (!credentials?.username || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        // Rate limit: 5 failed attempts per email per 15 min
        const emailKey = `login_fail:${credentials.username.toLowerCase()}`
        const emailLimit = rateLimit({ key: emailKey, maxAttempts: 5, windowMs: 15 * 60 * 1000, checkOnly: true })
        if (!emailLimit.success) {
          console.log('Rate limit exceeded for email:', credentials.username)
          return null
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.username,
              deletedAt: null,
              active: true
            }
          })

          if (!user) {
            console.log('Credentials login FAILED for:', credentials.username, '- User not found or inactive')
            return null
          }

          // Check if user has a password (credentials login)
          if (!user.password) {
            console.log('Credentials login FAILED for:', credentials.username, '- No password set (OAuth user)')
            return null
          }

          // Check if user is allowed to use credentials login
          if (user.loginProvider && user.loginProvider !== 'credentials') {
            console.log('Credentials login FAILED for:', credentials.username, '- User must use:', user.loginProvider)
            return null
          }

          // Check password
          let isValidPwd = false
          if (user.password) {
            isValidPwd = await isValidPassword(credentials.password, user.password)
          }
          
          if (!isValidPwd) {
            // Record the failed attempt for rate limiting
            rateLimit({ key: emailKey, maxAttempts: 5, windowMs: 15 * 60 * 1000 })
            console.log('Credentials login FAILED for:', credentials.username, '- Invalid password')
            return null
          }

          // Update last login info
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              lastLoggedIn: new Date(),
              loginCount: { increment: 1 }
            }
          })

          console.log('Credentials login SUCCESS for:', credentials.username)
          // Return user object compatible with database adapter
          return {
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            email: user.email,
            image: user.image,
          }
        } catch (error) {
          console.error('Credentials login ERROR for:', credentials.username, error)
          return null
        }
      },
    }),
  ],
}

// Initialize NextAuth with the auth options
export default NextAuth(authOptions)
