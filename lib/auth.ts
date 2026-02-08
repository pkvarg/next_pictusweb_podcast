// auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { isValidPassword } from './isValidPassword'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role?: string
      organization?: string
      isFleetManager?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role?: string
    organization?: string
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
        
        // For hybrid login, allow both OAuth and password
        if (dbUser.loginProvider === 'hybrid') {
          console.log('ACCESS GRANTED - Hybrid user with OAuth:', user.email)
          return true
        }
        
        console.log('ACCESS GRANTED - User found:', user.email)
        return true
      }
      
      return true
    },
    async jwt({ token, user, account }: any) {
      console.log('TESTING: JWT callback triggered for:', user?.email || token?.email)
      console.log('TESTING: Account provider:', account?.provider)
      
      try {
        if (user && account) {
          console.log('TESTING: Getting user data from database...')
          // Get user data from database for JWT
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (dbUser) {
            console.log('TESTING: Found user in database, setting token data')
            token.id = dbUser.id
            token.role = dbUser.role
            token.email = dbUser.email
            token.name = dbUser.name || `${dbUser.firstName} ${dbUser.lastName}`
            token.organization = dbUser.organization
            token.isFleetManager = dbUser.isFleetManager
            
            console.log('TESTING: Updating login tracking...')
            // Update login tracking
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { 
                lastLoggedIn: new Date(),
                loginCount: { increment: 1 }
              }
            })
            console.log('TESTING: Login tracking updated successfully')
          } else {
            console.log('TESTING: User not found in database!')
          }
        } else if (token.email && !token.organization) {
          console.log('TESTING: Refreshing token organization data...')
          // For existing tokens, ensure we have organization data
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email }
          })

          if (dbUser) {
            token.organization = dbUser.organization
            token.isFleetManager = dbUser.isFleetManager
            console.log('TESTING: Organization data refreshed')
          }
        }
        
        console.log('TESTING: JWT callback completed successfully')
        return token
      } catch (error) {
        console.error('TESTING: JWT callback error:', error)
        return token
      }
    },
    async session({ session, token }: any) {
      console.log('TESTING: Session callback triggered for:', token?.email)
      try {
        if (token) {
          console.log('TESTING: Setting session data from token')
          session.user.id = token.id
          session.user.role = token.role?.toLowerCase() || 'client'
          session.user.email = token.email
          session.user.name = token.name || `${token.firstName || ''} ${token.lastName || ''}`.trim()
          session.user.organization = token.organization
          session.user.isFleetManager = token.isFleetManager || false
          console.log('TESTING: Session data set successfully')
        } else {
          console.log('TESTING: No token provided to session callback')
        }
        
        console.log('TESTING: Session callback completed successfully')
        return session
      } catch (error) {
        console.error('TESTING: Session callback error:', error)
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
          if (user.loginProvider && user.loginProvider !== 'credentials' && user.loginProvider !== 'hybrid') {
            console.log('Credentials login FAILED for:', credentials.username, '- User must use:', user.loginProvider)
            return null
          }

          // Check password (hybrid users use regular password field)
          let isValidPwd = false
          if (user.password) {
            console.log('TESTING: Login attempt for:', credentials.username)
            console.log('TESTING: User loginProvider:', user.loginProvider)
            console.log('TESTING: Provided password:', credentials.password)
            console.log('TESTING: Password hash (first 20 chars):', user.password.substring(0, 20) + '...')
            
            isValidPwd = await isValidPassword(credentials.password, user.password)
            console.log('TESTING: Password validation result:', isValidPwd)
          } else {
            console.log('TESTING: No password found for user:', credentials.username)
          }
          
          if (!isValidPwd) {
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
