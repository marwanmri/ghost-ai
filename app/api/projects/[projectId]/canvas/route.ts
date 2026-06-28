import { NextResponse } from "next/server";
import { checkProjectAccess } from "@/lib/project-access";
import { supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

let isCanvasesBucketVerified = false;

async function ensureCanvasesBucket() {
  if (isCanvasesBucketVerified) return;
  try {
    const { data: bucketData, error: bucketError } = await supabaseAdmin.storage.getBucket("canvases");
    if (bucketError || !bucketData) {
      const { error: createError } = await supabaseAdmin.storage.createBucket("canvases", {
        public: false,
        allowedMimeTypes: ["application/json"],
      });
      if (createError) {
        console.error("Failed to create canvases bucket:", createError);
        return;
      }
    }
    isCanvasesBucketVerified = true;
  } catch (bucketErr) {
    console.error("Error checking/creating bucket:", bucketErr);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;

    // Enforce authentication and project access checks
    const access = await checkProjectAccess(projectId);
    if (!access.hasAccess || !access.project) {
      return NextResponse.json(
        { error: access.reason === "unauthenticated" ? "Unauthorized" : "Forbidden" },
        { status: access.reason === "unauthenticated" ? 401 : 403 },
      );
    }

    // Parse request payload
    let nodes: unknown[];
    let edges: unknown[];
    try {
      const body = await request.json();
      nodes = body.nodes;
      edges = body.edges;
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return NextResponse.json(
        { error: "nodes and edges must be arrays" },
        { status: 400 },
      );
    }

    // Ensure the canvases bucket exists in Supabase Storage
    await ensureCanvasesBucket();

    // Upload the canvas JSON to Supabase Storage
    const storagePath = `projects/${projectId}/canvas.json`;
    const canvasJson = JSON.stringify({ nodes, edges });

    const { error: uploadError } = await supabaseAdmin.storage
      .from("canvases")
      .upload(storagePath, canvasJson, {
        contentType: "application/json",
        upsert: true,
      });

    if (uploadError) {
      console.error("Failed to upload canvas to Supabase Storage:", uploadError);
      return NextResponse.json({ error: "Failed to upload canvas to storage" }, { status: 500 });
    }

    // Store the returned Supabase storage path on the matching Prisma project record
    await prisma.project.update({
      where: { id: projectId },
      data: {
        canvasJsonPath: storagePath,
      },
    });

    return NextResponse.json({ success: true, path: storagePath });
  } catch (error) {
    console.error("Error in canvas PUT route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;

    // Enforce authentication and project access checks
    const access = await checkProjectAccess(projectId);
    if (!access.hasAccess || !access.project) {
      return NextResponse.json(
        { error: access.reason === "unauthenticated" ? "Unauthorized" : "Forbidden" },
        { status: access.reason === "unauthenticated" ? 401 : 403 },
      );
    }

    // Read the project's saved storage path from Prisma or fallback to deterministic path
    const storagePath = access.project.canvasJsonPath || `projects/${projectId}/canvas.json`;

    // Fetch the saved canvas JSON from Supabase Storage
    const { data, error: downloadError } = await supabaseAdmin.storage
      .from("canvases")
      .download(storagePath);

    if (downloadError) {
      console.error("Failed to download canvas from Supabase Storage:", downloadError);
      // Only fallback for not found (status 404 or message includes Object not found)
      const isNotFound =
        downloadError.status === 404 ||
        downloadError.message?.toLowerCase().includes("not found") ||
        downloadError.message?.toLowerCase().includes("nosuchkey");
      if (isNotFound) {
        return NextResponse.json({ nodes: [], edges: [], isEmpty: true });
      }
      return NextResponse.json({ error: "Failed to download canvas from storage" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "No data returned from storage" }, { status: 500 });
    }

    try {
      const text = await data.text();
      const canvasData = JSON.parse(text);
      return NextResponse.json(canvasData);
    } catch (parseError) {
      console.error("Failed to parse canvas JSON:", parseError);
      return NextResponse.json({ error: "Invalid canvas JSON stored in bucket" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in canvas GET route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

