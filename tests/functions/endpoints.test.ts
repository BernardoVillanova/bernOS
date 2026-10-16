import { describe, it, expect } from "vitest";
import { onRequestGet as getHealth } from "../../functions/api/health";
import { onRequestGet as getRootHealth } from "../../functions/health";
import { onRequestGet as getTerraform } from "../../functions/api/terraform";
import { onRequestGet as getRepos } from "../../functions/api/github/repos/index";

describe("Cloudflare Pages Function Handlers", () => {
  it("GET /api/health should return status healthy", async () => {
    const fakeContext = {} as any;
    const res = await getHealth(fakeContext);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { status: string; platform: string };
    expect(body.status).toBe("healthy");
    expect(body.platform).toBe("cloudflare-pages");
  });

  it("GET /health should return status healthy", async () => {
    const fakeContext = {} as any;
    const res = await getRootHealth(fakeContext);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("healthy");
  });

  it("GET /api/terraform should return fallback resources when D1 is not bound", async () => {
    const fakeContext = { env: {} } as any;
    const res = await getTerraform(fakeContext);
    expect(res.status).toBe(200);

    const data = (await res.json()) as any[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(32);
  });

  it("GET /api/github/repos should return repositories list", async () => {
    const fakeContext = { env: { GITHUB_USER: "BernardoVillanova" } } as any;
    const res = await getRepos(fakeContext);
    expect(res.status).toBe(200);

    const data = (await res.json()) as any[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});
