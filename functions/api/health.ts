import { jsonResponse } from "../_db";
import type { Env } from "../_types";

export const onRequestGet: PagesFunction<Env> = async () => {
  return jsonResponse({
    status: "healthy",
    platform: "cloudflare-pages",
    timestamp: new Date().toISOString()
  });
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse(null);
};
