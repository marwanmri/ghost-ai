import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Retrieve the user from Clerk to get their email addresses
    const user = await currentUser();
    const emails = user?.emailAddresses.map((e) => e.emailAddress.trim().toLowerCase()) || [];

    // Find projects owned by the user OR projects where the user is a collaborator
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
      include: {
        collaborators: true,
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let name = "Untitled Project";
    let description: string | undefined = undefined;

    // Safely parse request body
    try {
      const body = await request.json();
      if (body.name && typeof body.name === "string" && body.name.trim()) {
        name = body.name.trim();
      }
      if (body.description && typeof body.description === "string") {
        description = body.description.trim();
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    const project = await prisma.project.create({
      data: {
        ownerId: userId,
        name,
        description,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
