// IP Reputation Management System
// Tracks bot attempts and implements progressive banning
// PostgreSQL version with Prisma ORM

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// In-memory cache for faster lookups (60-second TTL)
const ipReputationCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute cache

// Ban durations in milliseconds
const BAN_DURATIONS = {
  FIRST: 24 * 60 * 60 * 1000, // 24 hours - First offense gets banned
  SECOND: Infinity, // Permanent ban - Second offense is permanent
}

/**
 * Get IP reputation data from database
 * @param ip - IP address
 * @returns Reputation data
 */
export async function getIPReputation(ip: string) {
  // Check cache first
  const cached = ipReputationCache.get(ip)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  // Query database
  let reputation = await prisma.iPReputation.findUnique({
    where: { ipAddress: ip },
  })

  // Create new record if doesn't exist
  if (!reputation) {
    reputation = await prisma.iPReputation.create({
      data: {
        ipAddress: ip,
        violations: 0,
        detectionHistory: [],
      },
    })
  }

  // Update cache
  ipReputationCache.set(ip, { data: reputation, timestamp: Date.now() })

  return reputation
}

/**
 * Check if IP is currently banned
 * @param ip - IP address
 * @returns boolean - true if banned
 */
export async function isIPBanned(ip: string): Promise<boolean> {
  const reputation = await getIPReputation(ip)

  if (!reputation.bannedUntil) return false

  // Check if permanent ban
  if (reputation.isPermanentBan) return true

  // Check if temporary ban expired
  const now = new Date()
  if (reputation.bannedUntil > now) {
    return true
  }

  // Ban expired, clear it
  await prisma.iPReputation.update({
    where: { ipAddress: ip },
    data: {
      bannedUntil: null,
    },
  })

  // Clear cache
  ipReputationCache.delete(ip)

  return false
}

/**
 * Record a violation for an IP address
 * Implements progressive banning: 1st = 24hr ban, 2nd+ = permanent
 * @param ip - IP address
 * @param detectionType - Type of detection (honeypot, time-based, etc.)
 * @param detectionDetails - Additional details
 * @returns Updated reputation with ban info
 */
export async function recordViolation(
  ip: string,
  detectionType: string,
  detectionDetails?: string,
) {
  const reputation = await getIPReputation(ip)
  const newViolations = reputation.violations + 1

  // Build detection history
  const detectionHistory = Array.isArray(reputation.detectionHistory)
    ? reputation.detectionHistory
    : []

  detectionHistory.push({
    type: detectionType,
    details: detectionDetails || '',
    timestamp: Date.now(),
  })

  // Calculate ban duration based on violation count
  let bannedUntil: Date | null = null
  let isPermanentBan = false
  let banMessage = ''

  switch (newViolations) {
    case 1:
      // First violation - 24 hour ban
      bannedUntil = new Date(Date.now() + BAN_DURATIONS.FIRST)
      banMessage = '1st offense: Banned for 24 hours'
      break

    default:
      // Second+ violation - PERMANENT BAN
      bannedUntil = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) // 100 years (effective permanent)
      isPermanentBan = true
      banMessage = '2nd+ offense: PERMANENT BAN'
      break
  }

  // Update database
  const updatedReputation = await prisma.iPReputation.update({
    where: { ipAddress: ip },
    data: {
      violations: newViolations,
      bannedUntil,
      isPermanentBan,
      detectionHistory: detectionHistory as any,
    },
  })

  // Clear cache for this IP
  ipReputationCache.delete(ip)

  console.log('🚨 IP VIOLATION RECORDED:', {
    ip,
    violations: newViolations,
    banMessage,
  })

  return {
    ...updatedReputation,
    banMessage,
    isBanned: await isIPBanned(ip),
  }
}

/**
 * Get ban information for an IP
 * @param ip - IP address
 * @returns Ban information
 */
export async function getBanInfo(ip: string) {
  const reputation = await getIPReputation(ip)

  if (!reputation.bannedUntil) {
    return {
      isBanned: false,
      message: 'IP is not banned',
    }
  }

  if (reputation.isPermanentBan) {
    return {
      isBanned: true,
      isPermanent: true,
      violations: reputation.violations,
      message: 'Permanently banned due to repeated violations',
    }
  }

  const now = new Date()
  if (reputation.bannedUntil > now) {
    const hoursLeft = Math.ceil(
      (reputation.bannedUntil.getTime() - now.getTime()) / (1000 * 60 * 60),
    )
    return {
      isBanned: true,
      isPermanent: false,
      violations: reputation.violations,
      bannedUntil: reputation.bannedUntil,
      message: `Temporarily banned for ${hoursLeft} more hours`,
    }
  }

  return {
    isBanned: false,
    message: 'Ban expired',
  }
}

/**
 * Get all banned IPs
 * @returns Array of banned IP reputations
 */
export async function getAllBannedIPs() {
  const now = new Date()

  const bannedIPs = await prisma.iPReputation.findMany({
    where: {
      OR: [
        { isPermanentBan: true },
        {
          bannedUntil: {
            gt: now,
          },
        },
      ],
    },
    orderBy: {
      lastSeen: 'desc',
    },
  })

  return bannedIPs.map((ip) => ({
    ip: ip.ipAddress,
    violations: ip.violations,
    isPermanent: ip.isPermanentBan,
    bannedUntil: ip.bannedUntil,
    firstSeen: ip.firstSeen,
    lastSeen: ip.lastSeen,
  }))
}

/**
 * Get statistics
 * @returns Statistics object
 */
export async function getStats() {
  const totalIPs = await prisma.iPReputation.count()
  const permanentBans = await prisma.iPReputation.count({
    where: { isPermanentBan: true },
  })
  const temporaryBans = await prisma.iPReputation.count({
    where: {
      AND: [
        { isPermanentBan: false },
        {
          bannedUntil: {
            gt: new Date(),
          },
        },
      ],
    },
  })

  return {
    totalTrackedIPs: totalIPs,
    permanentBans,
    temporaryBans,
    totalBans: permanentBans + temporaryBans,
  }
}

/**
 * Clear all bans (admin function)
 */
export async function clearAllBans() {
  await prisma.iPReputation.deleteMany({})
  ipReputationCache.clear()
  console.log('🗑️  All IP bans cleared')
}
