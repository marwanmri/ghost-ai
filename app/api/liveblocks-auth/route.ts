import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getCursorColorForUser, getLiveblocksClient } from "@/lib/liveblocks";
import { checkProjectAccess } from "@/lib/project-access";

type LiveblocksAuthPayload = {
  room?: unknown;
  projectId?: unknown;
};

function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) {
    return "Anonymous";
  }

  return (
    user.fullName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.username ||
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
      ?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    "Anonymous"
  );
}

async function readProjectId(request: Request) {
  let payload: LiveblocksAuthPayload;

  try {
    payload = (await request.json()) as LiveblocksAuthPayload;
  } catch {
    return null;
  }

  const projectId = payload.projectId ?? payload.room;

  return typeof projectId === "string" && projectId.trim()
    ? projectId.trim()
    : null;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = await readProjectId(request);

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    const access = await checkProjectAccess(projectId);

    if (!access.hasAccess) {
      if (access.reason === "unauthenticated") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (access.reason === "not_found") {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const liveblocks = getLiveblocksClient();
    const roomId = projectId;

    const project = access.project;
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const clerk = await clerkClient();
    const emails = project.collaborators.map((c) => c.emailNormalized);
    let collaboratorUserIds: string[] = [];
    if (emails.length > 0) {
      try {
        const response = await clerk.users.getUserList({
          emailAddress: emails,
          limit: 100,
        });
        collaboratorUserIds = response.data.map((u) => u.id);
      } catch (e) {
        console.error("Error fetching collaborator user IDs from Clerk:", e);
      }
    }

    const canonicalMapping: Record<string, ["room:write"]> = {};
    const memberIds = Array.from(new Set([
      project.ownerId,
      ...collaboratorUserIds,
      userId
    ]));
    for (const id of memberIds) {
      canonicalMapping[id] = ["room:write"];
    }

    const room = await liveblocks.getOrCreateRoom(roomId, {
      defaultAccesses: [],
      usersAccesses: canonicalMapping,
      metadata: {
        projectId,
      },
    });

    const updateUsersAccesses: Record<string, ["room:write"] | null> = {};
    let needsUpdate = false;

    // Check for additions / upgrades
    for (const key of Object.keys(canonicalMapping)) {
      const roomAccess = room.usersAccesses[key];
      if (!roomAccess || roomAccess.length !== 1 || roomAccess[0] !== "room:write") {
        updateUsersAccesses[key] = ["room:write"];
        needsUpdate = true;
      }
    }

    // Check for revocations
    for (const key of Object.keys(room.usersAccesses)) {
      if (!(key in canonicalMapping)) {
        updateUsersAccesses[key] = null;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      await liveblocks.updateRoom(roomId, {
        usersAccesses: updateUsersAccesses,
        metadata: { projectId },
      });
    }

    const user = await currentUser();
    const { status, body } = await liveblocks.identifyUser(
      { userId, groupIds: [] },
      {
        userInfo: {
          name: getDisplayName(user),
          avatar: user?.imageUrl || "",
          color: getCursorColorForUser(userId),
        },
      },
    );

    return new Response(body, { status });
  } catch (error) {
    console.error("Error in POST /api/liveblocks-auth:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
