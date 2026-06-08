import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
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

    // Only the project owner can rename
    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let name = "";
    try {
      const body = await request.json();
      if (body.name && typeof body.name === "string" && body.name.trim()) {
        name = body.name.trim();
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required and cannot be empty" },
        { status: 400 },
      );
    }

    // Extract suffix from current projectId
    const getSuffix = (id: string): string => {
      const parts = id.split("-");
      if (parts.length > 1) {
        const lastPart = parts[parts.length - 1];
        if (lastPart.length === 4) {
          return lastPart;
        }
      }
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const baseSlug = slugify(name);
    const suffix = getSuffix(projectId);
    const newId = baseSlug ? `${baseSlug}-${suffix}` : `project-${suffix}`;

    const dataToUpdate: { id?: string; name: string } = { name };
    if (newId !== projectId) {
      dataToUpdate.id = newId;
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    const err = error as any;
    if (
      err &&
      (err.code === "P2002" ||
        (err.meta &&
          typeof err.meta === "object" &&
          (err.meta.target === "id" ||
            (Array.isArray(err.meta.target) && err.meta.target.includes("id")))))
    ) {
      return NextResponse.json(
        { error: "Project ID already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
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

    // Only the project owner can delete
    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
