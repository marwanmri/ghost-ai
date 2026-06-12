import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#65a30d",
  "#d97706",
  "#dc2626",
  "#db2777",
] as const;

declare global {
  // eslint-disable-next-line no-var
  var liveblocksClient: Liveblocks | undefined;
}

function getLiveblocksSecret() {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not configured");
  }

  return secret;
}

export function getLiveblocksClient() {
  if (!globalThis.liveblocksClient) {
    globalThis.liveblocksClient = new Liveblocks({
      secret: getLiveblocksSecret(),
    });
  }

  return globalThis.liveblocksClient;
}

export function getCursorColorForUser(userId: string) {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }

  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}
