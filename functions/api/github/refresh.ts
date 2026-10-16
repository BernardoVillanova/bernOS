import { getRepos, jsonResponse } from "../../_db";
import type { Env } from "../../_types";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = context.env.GITHUB_USER || "BernardoVillanova";
    const repos = await getRepos(context.env.DB, true, user);
    return jsonResponse(repos);
  } catch (err: any) {
    console.error("Error refreshing github repos:", err);
    return jsonResponse({ error: err.message || "Failed to refresh repositories" }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse(null);
};
