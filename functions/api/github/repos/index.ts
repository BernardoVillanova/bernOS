import { getRepos, jsonResponse } from "../../../_db";
import type { Env } from "../../../_types";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = context.env.GITHUB_USER || "BernardoVillanova";
    const repos = await getRepos(context.env.DB, false, user);
    return jsonResponse(repos);
  } catch (err: any) {
    console.error("Error retrieving github repos:", err);
    return jsonResponse({ error: err.message || "Failed to load repositories" }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse(null);
};
