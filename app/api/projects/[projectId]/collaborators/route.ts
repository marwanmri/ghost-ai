import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkProjectAccess } from "@/lib/project-access";

// Simple email regex for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Check project access using project-access helper
    const access = await checkProjectAccess(projectId);
    if (!access.hasAccess) {
      if (access.reason === "unauthenticated") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (access.reason === "not_found") {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const project = access.project;
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const clerk = await clerkClient();

    // 1. Fetch Owner details from Clerk
    let ownerEmail = "";
    let ownerName = "";
    let ownerAvatar = "";

    try {
      const ownerUser = await clerk.users.getUser(project.ownerId);
      ownerEmail =
        ownerUser.emailAddresses.find((e) => e.id === ownerUser.primaryEmailAddressId)?.emailAddress ||
        ownerUser.emailAddresses[0]?.emailAddress ||
        "";
      ownerName =
        ownerUser.fullName ||
        `${ownerUser.firstName || ""} ${ownerUser.lastName || ""}`.trim() ||
        ownerUser.username ||
        "";
      ownerAvatar = ownerUser.imageUrl || "";
    } catch (e) {
      console.error("Error fetching project owner from Clerk:", e);
      ownerEmail = "unknown-owner@ghostai.dev";
      ownerName = "Project Owner";
    }

    // 2. Fetch Collaborators from Database
    const dbCollaborators = await prisma.projectCollaborator.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });

    // 3. Enrich Collaborators using Clerk if any exist
    let enrichedCollaborators: Array<{
      id: string;
      email: string;
      emailNormalized: string;
      name: string;
      avatar: string | null;
      isOwner: boolean;
      createdAt: Date;
    }> = [];
    if (dbCollaborators.length > 0) {
      const emails = dbCollaborators.map((c) => c.emailNormalized);
      let clerkUsers: import("@clerk/backend").User[] = [];
      try {
        const response = await clerk.users.getUserList({
          emailAddress: emails,
          limit: 100, // Safe limit for typical collaborator list sizing
        });
        clerkUsers = response.data;
      } catch (e) {
        console.error("Error fetching collaborators from Clerk:", e);
      }

      enrichedCollaborators = dbCollaborators.map((collab) => {
        const match = clerkUsers.find((u) =>
          u.emailAddresses.some(
            (e) => e.emailAddress.trim().toLowerCase() === collab.emailNormalized
          )
        );

        return {
          id: collab.id,
          email: collab.email,
          emailNormalized: collab.emailNormalized,
          name: match
            ? match.fullName ||
              `${match.firstName || ""} ${match.lastName || ""}`.trim() ||
              match.username ||
              collab.email
            : collab.email,
          avatar: match ? match.imageUrl : null,
          isOwner: false,
          createdAt: collab.createdAt,
        };
      });
    }

    // 4. Combine Owner & Collaborators
    const ownerItem = {
      id: "owner",
      email: ownerEmail,
      emailNormalized: ownerEmail.trim().toLowerCase(),
      name: ownerName || ownerEmail,
      avatar: ownerAvatar || null,
      isOwner: true,
      createdAt: project.createdAt,
    };

    return NextResponse.json([ownerItem, ...enrichedCollaborators]);
  } catch (error) {
    console.error("Error in GET /api/projects/[projectId]/collaborators:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    // Fetch the project to verify existence and ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Only the project owner can invite collaborators
    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let email = "";
    try {
      const body = await request.json();
      email = body.email;
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const targetEmail = email.trim();
    const targetEmailNormalized = targetEmail.toLowerCase();

    if (!EMAIL_REGEX.test(targetEmailNormalized)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }

    // Verify target email is not the owner themselves
    const clerk = await clerkClient();
    let isOwnerEmail = false;
    try {
      const ownerUser = await clerk.users.getUser(project.ownerId);
      const ownerEmails = ownerUser.emailAddresses.map((e) => e.emailAddress.trim().toLowerCase());
      if (ownerEmails.includes(targetEmailNormalized)) {
        isOwnerEmail = true;
      }
    } catch (e) {
      console.error("Error verifying owner email from Clerk:", e);
    }

    if (isOwnerEmail) {
      return NextResponse.json({ error: "You cannot invite the project owner" }, { status: 400 });
    }

    // Check if user is already a collaborator
    const existing = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_emailNormalized: {
          projectId,
          emailNormalized: targetEmailNormalized,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "User is already a collaborator" }, { status: 409 });
    }

    // Add collaborator
    const newCollaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        email: targetEmail,
        emailNormalized: targetEmailNormalized,
      },
    });

    return NextResponse.json(newCollaborator, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/projects/[projectId]/collaborators:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    // Fetch the project to verify existence and ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Only the project owner can remove collaborators
    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let id = "";
    try {
      const body = await request.json();
      id = body.id;
    } catch {
      // Fallback to query param
      const { searchParams } = new URL(request.url);
      id = searchParams.get("id") || "";
    }

    if (!id) {
      // Try search param if body parsing succeeded but ID was missing
      const { searchParams } = new URL(request.url);
      id = searchParams.get("id") || "";
    }

    if (!id) {
      return NextResponse.json({ error: "Collaborator ID is required" }, { status: 400 });
    }

    // Delete collaborator matching both id and projectId (for security)
    const result = await prisma.projectCollaborator.deleteMany({
      where: {
        id,
        projectId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Collaborator not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/projects/[projectId]/collaborators:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
