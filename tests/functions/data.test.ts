import { describe, it, expect } from "vitest";
import { TERRAFORM_SERVICES, MOCK_REPOS } from "../../functions/_data";
import { jsonResponse } from "../../functions/_db";

describe("Cloudflare Functions Seed Data & Helpers", () => {
  it("should have all 32 LocalStack and AWS services defined", () => {
    expect(TERRAFORM_SERVICES).toBeDefined();
    expect(TERRAFORM_SERVICES.length).toBe(32);
  });

  it("should ensure every service has required attributes and valid column positions", () => {
    for (const service of TERRAFORM_SERVICES) {
      expect(service.id).toBeGreaterThan(0);
      expect(service.service_name).toBeTruthy();
      expect(service.aws_category).toBeTruthy();
      expect(service.column_position).toBeGreaterThanOrEqual(1);
      expect(service.column_position).toBeLessThanOrEqual(4);
      expect(service.display_order).toBeGreaterThanOrEqual(1);
    }
  });

  it("should validate mock repositories integrity", () => {
    expect(MOCK_REPOS.length).toBeGreaterThan(0);
    for (const repo of MOCK_REPOS) {
      expect(repo.id).toBeDefined();
      expect(repo.name).toBeTruthy();
      expect(Array.isArray(repo.topics)).toBe(true);
      expect(["Trabalho", "Estudos", null]).toContain(repo.folder);
    }
  });

  it("should create JSON response with proper CORS headers", async () => {
    const res = jsonResponse({ status: "ok" });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");

    const data = await res.json();
    expect(data).toEqual({ status: "ok" });
  });
});
