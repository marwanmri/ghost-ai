import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentIdentity() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const primaryEmail = user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress.trim().toLowerCase();
  const emails = user?.emailAddresses.map((e) => e.emailAddress.trim().toLowerCase()) || [];

  return {
    userId,
    primaryEmail,
    emails,
  };
}

export async function checkProjectAccess(projectId: string) {
  const identity = await getCurrentIdentity();
  if (!identity) {
    return { hasAccess: false, reason: "unauthenticated" as const };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: true,
    },
  });

  if (!project) {
    return { hasAccess: false, reason: "not_found" as const };
  }

  const isOwner = project.ownerId === identity.userId;
  const isCollaborator = project.collaborators.some(
    (c) => identity.emails.includes(c.emailNormalized)
  );

  if (isOwner || isCollaborator) {
    return { hasAccess: true, project };
  }

  return { hasAccess: false, reason: "unauthorized" as const };
}
