import { Prisma } from '@prisma/client'

// GDPR data export for a garage (organization): a JSON-serializable bundle of the
// CarCare data belonging to it. Intended to back an admin "export" action.
export async function exportGarageData(tx: Prisma.TransactionClient, organizationId: string) {
  const [organization, members, vehicles, providers, recurringEvents, occurrences, invitations] =
    await Promise.all([
      tx.organization.findUnique({ where: { id: organizationId } }),
      tx.garageMembership.findMany({
        where: { organizationId },
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      }),
      tx.myVehicle.findMany({
        where: { organizationId },
        include: { expenses: true, mileageRecords: true },
      }),
      tx.provider.findMany({ where: { organizationId } }),
      tx.recurringEvent.findMany({ where: { organizationId } }),
      tx.eventOccurrence.findMany({
        where: { recurringEvent: { organizationId } },
        include: { appointments: true },
      }),
      tx.garageInvitation.findMany({ where: { organizationId } }),
    ])

  return {
    exportedAt: new Date().toISOString(),
    organization,
    members,
    vehicles,
    providers,
    recurringEvents,
    occurrences,
    invitations,
  }
}

// GDPR erasure for a single user (account deletion). Removes the user's reminder
// deliveries, garage memberships and vehicle access, detaches them from any events
// they were responsible for, then anonymizes and soft-deletes the account. Keeps
// shared garage history (vehicles, events, completed records) intact.
export async function deleteUserData(tx: Prisma.TransactionClient, userId: string) {
  await tx.notificationDelivery.deleteMany({ where: { recipientUserId: userId } })

  const memberships = await tx.garageMembership.findMany({
    where: { userId },
    select: { id: true },
  })
  await tx.vehicleAccess.deleteMany({
    where: { membershipId: { in: memberships.map((m) => m.id) } },
  })
  await tx.garageMembership.deleteMany({ where: { userId } })

  await tx.recurringEvent.updateMany({
    where: { responsibleUserId: userId },
    data: { responsibleUserId: null },
  })

  await tx.user.update({
    where: { id: userId },
    data: {
      email: `deleted-${userId}@removed.invalid`,
      firstName: null,
      lastName: null,
      phoneNumber: null,
      password: null,
      active: false,
      deletedAt: new Date(),
    },
  })
}
