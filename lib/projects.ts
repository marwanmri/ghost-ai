import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwned: boolean;
}

export async function getProjects(): Promise<Project[]> {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }

  const user = await currentUser();
  const emails = user?.emailAddresses.map((e) => e.emailAddress.trim().toLowerCase()) || [];

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          collaborators: {
            some: {
              emailNormalized: {
                in: emails,
              },
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.id, // The project ID and room ID are aligned and act as the slug
    isOwned: p.ownerId === userId,
  }));
}
