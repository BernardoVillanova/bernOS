import { jsonResponse, setFolder } from "../../../../_db";
import type { Env } from "../../../../_types";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const repoId = parseInt(context.params.id as string, 10);
    if (isNaN(repoId)) {
      return jsonResponse({ error: "Invalid repository ID" }, 400);
    }

    const body = (await context.request.json()) as { folder?: string | null };
    const folder = body.folder ?? null;

    await setFolder(context.env.DB, repoId, folder);

    return jsonResponse({ success: true, folder });
  } catch (err: any) {
    console.error("Error setting repo folder:", err);
    return jsonResponse({ error: err.message || "Failed to update folder" }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse(null);
};
