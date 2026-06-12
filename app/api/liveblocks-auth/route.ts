import { auth, currentUser } from "@clerk/nextjs/server";
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

    const room = await liveblocks.getOrCreateRoom(roomId, {
      defaultAccesses: [],
      usersAccesses: {
        [userId]: ["room:write"],
      },
      metadata: {
        projectId,
      },
    });

    if (!room.usersAccesses[userId]) {
      await liveblocks.updateRoom(roomId, {
        usersAccesses: {
          [userId]: ["room:write"],
        },
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
