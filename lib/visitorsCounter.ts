'use server'
import db from '@/db/db'

interface Visitors {
  id: string
  count: number
}

export async function getVisitors(): Promise<{
  count: Visitors | null
  success: boolean
  message: string
}> {
  'use server'
  try {
    const count = await db.visitorsCounter.findUnique({
      where: {
        id: '81e50d99-fd93-4c74-91d0-39e85d026f8c',
      },
    })
    if (count) {
      return { count, success: true, message: 'Visitors success' }
    }
    return { count: null, success: true, message: 'Visitors success' }
  } catch (error) {
    console.error('Error getting Visitors:', error)
    return { count: null, success: false, message: 'Failed to get visitors' }
  }
}

export async function updateVisitors(): Promise<{
  success: boolean
  message: string
}> {
  'use server'

  try {
    const countInDb = await db.visitorsCounter.findUnique({
      where: {
        id: '81e50d99-fd93-4c74-91d0-39e85d026f8c',
      },
    })

    if (!countInDb) {
      return { success: false, message: 'Visitor counter not found' }
    }

    const newCount = countInDb.count + 1

    await db.visitorsCounter.update({
      where: {
        id: '81e50d99-fd93-4c74-91d0-39e85d026f8c',
      },
      data: {
        count: newCount,
      },
    })

    return { success: true, message: 'Visitors updated successfully' }
  } catch (error) {
    console.error('Error updating Visitors:', error)
    return { success: false, message: 'Failed to update Visitors' }
  }
}
