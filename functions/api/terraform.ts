import { getTerraformResources, jsonResponse } from "../_db";
import type { Env } from "../_types";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const resources = await getTerraformResources(context.env.DB);
    return jsonResponse(resources);
  } catch (err: any) {
    console.error("Error retrieving terraform resources:", err);
    return jsonResponse({ error: err.message || "Failed to load terraform resources" }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse(null);
};
