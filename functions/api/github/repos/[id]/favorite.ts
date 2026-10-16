import { jsonResponse, setFavorite } from "../../../../_db";
import type { Env } from "../../../../_types";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const repoId = parseInt(context.params.id as string, 10);
    if (isNaN(repoId)) {
      return jsonResponse({ error: "Invalid repository ID" }, 400);
    }

    const body = (await context.request.json()) as { favorite?: boolean };
    const isFavorite = !!body.favorite;

    await setFavorite(context.env.DB, repoId, isFavorite);

    return jsonResponse({ success: true, is_favorite: isFavorite });
  } catch (err: any) {
    console.error("Error setting repo favorite:", err);
    return jsonResponse({ error: err.message || "Failed to update favorite" }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse(null);
};
