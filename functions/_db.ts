import { TERRAFORM_SERVICES, MOCK_REPOS } from "./_data";
import type { Repo, TerraformResource } from "./_types";

export function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type",
      ...extraHeaders
    }
  });
}

export async function ensureTables(db: D1Database): Promise<void> {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS github_repos (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        language TEXT,
        stars INTEGER DEFAULT 0,
        forks INTEGER DEFAULT 0,
        url TEXT,
        homepage TEXT,
        topics TEXT,
        updated_at TEXT,
        created_at TEXT,
        cached_at INTEGER
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS favorites (
        repo_id INTEGER PRIMARY KEY
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS repo_categories (
        repo_id INTEGER PRIMARY KEY,
        folder TEXT NOT NULL
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS terraform_resources (
        id INTEGER PRIMARY KEY,
        service_name TEXT UNIQUE NOT NULL,
        resource_key TEXT,
        aws_category TEXT,
        icon_color TEXT,
        is_pro INTEGER DEFAULT 0,
        curiosity_title TEXT,
        curiosity_content TEXT,
        display_order INTEGER,
        column_position INTEGER
      )
    `)
  ]);

  try {
    const countRow = await db.prepare("SELECT count(*) as count FROM terraform_resources").first<{ count: number }>();
    if (!countRow || countRow.count === 0) {
      const inserts = TERRAFORM_SERVICES.map(item =>
        db.prepare(`
          INSERT OR REPLACE INTO terraform_resources (
            id, service_name, resource_key, aws_category, icon_color, is_pro, curiosity_title, curiosity_content, display_order, column_position
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          item.id,
          item.service_name,
          item.resource_key,
          item.aws_category,
          item.icon_color,
          item.is_pro,
          item.curiosity_title,
          item.curiosity_content,
          item.display_order,
          item.column_position
        )
      );
      await db.batch(inserts);
    }
  } catch (err) {
    console.warn("Could not check/seed terraform_resources:", err);
  }
}

export async function getTerraformResources(db?: D1Database): Promise<TerraformResource[]> {
  if (!db) {
    return TERRAFORM_SERVICES;
  }

  try {
    const result = await db
      .prepare("SELECT * FROM terraform_resources ORDER BY column_position, display_order")
      .all<TerraformResource>();

    if (result.results && result.results.length > 0) {
      return result.results;
    }

    await ensureTables(db);
    const recheck = await db
      .prepare("SELECT * FROM terraform_resources ORDER BY column_position, display_order")
      .all<TerraformResource>();

    if (recheck.results && recheck.results.length > 0) {
      return recheck.results;
    }
  } catch (err) {
    console.warn("Error reading terraform_resources from D1, initializing tables...", err);
    try {
      await ensureTables(db);
    } catch {}
  }

  return TERRAFORM_SERVICES;
}

export async function queryMergedRepos(db: D1Database): Promise<Repo[]> {
  const rows = await db.prepare(`
    SELECT 
      r.id, r.name, r.description, r.language, r.stars, r.forks, r.url, r.homepage, r.topics, r.updated_at, r.created_at,
      CASE WHEN f.repo_id IS NOT NULL THEN 1 ELSE 0 END as is_favorite,
      c.folder
    FROM github_repos r
    LEFT JOIN favorites f ON r.id = f.repo_id
    LEFT JOIN repo_categories c ON r.id = c.repo_id
  `).all<any>();

  return (rows.results || []).map(row => ({
    ...row,
    is_favorite: !!row.is_favorite,
    topics: typeof row.topics === "string" ? JSON.parse(row.topics || "[]") : (row.topics || [])
  }));
}

export async function fetchAndCacheRepos(db: D1Database, githubUser: string): Promise<Repo[]> {
  const response = await fetch(`https://api.github.com/users/${githubUser}/repos?sort=updated&per_page=50`, {
    headers: {
      "User-Agent": "BernOS-CloudflarePages"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API returned status ${response.status}: ${response.statusText}`);
  }

  const githubRepos = await response.json() as any[];
  const now = Date.now();

  const statements: D1PreparedStatement[] = [
    db.prepare("DELETE FROM github_repos")
  ];

  for (const repo of githubRepos) {
    statements.push(
      db.prepare(`
        INSERT OR REPLACE INTO github_repos (
          id, name, description, language, stars, forks, url, homepage, topics, updated_at, created_at, cached_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        repo.id,
        repo.name,
        repo.description || "",
        repo.language || "Other",
        repo.stargazers_count || 0,
        repo.forks_count || 0,
        repo.html_url,
        repo.homepage || "",
        JSON.stringify(repo.topics || []),
        repo.updated_at,
        repo.created_at,
        now
      )
    );

    const nameLower = repo.name.toLowerCase();
    let folder: string | null = null;
    if (
      nameLower.includes("course") || 
      nameLower.includes("study") || 
      nameLower.includes("estudo") || 
      nameLower.includes("tutorial") || 
      nameLower.includes("exercises") || 
      nameLower.includes("learning") || 
      nameLower.includes("fho") || 
      nameLower.includes("class")
    ) {
      folder = "Estudos";
    } else if (
      nameLower.includes("terraform") || 
      nameLower.includes("iac") || 
      nameLower.includes("pipeline") || 
      nameLower.includes("infra") || 
      nameLower.includes("aws") || 
      nameLower.includes("ezops") || 
      nameLower.includes("yeb") || 
      nameLower.includes("k8s") || 
      nameLower.includes("kubernetes") || 
      nameLower.includes("action")
    ) {
      folder = "Trabalho";
    }

    if (folder) {
      statements.push(
        db.prepare("INSERT OR IGNORE INTO repo_categories (repo_id, folder) VALUES (?, ?)").bind(repo.id, folder)
      );
    }
  }

  await db.batch(statements);
  return queryMergedRepos(db);
}

export async function seedMockRepos(db: D1Database): Promise<Repo[]> {
  const now = Date.now();
  const statements: D1PreparedStatement[] = [
    db.prepare("DELETE FROM github_repos")
  ];

  for (const repo of MOCK_REPOS) {
    statements.push(
      db.prepare(`
        INSERT OR REPLACE INTO github_repos (
          id, name, description, language, stars, forks, url, homepage, topics, updated_at, created_at, cached_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        repo.id,
        repo.name,
        repo.description,
        repo.language,
        repo.stars,
        repo.forks,
        repo.url,
        repo.homepage,
        JSON.stringify(repo.topics),
        repo.updated_at,
        repo.created_at,
        now
      )
    );

    if (repo.folder) {
      statements.push(
        db.prepare("INSERT OR REPLACE INTO repo_categories (repo_id, folder) VALUES (?, ?)").bind(repo.id, repo.folder)
      );
    }

    if (repo.is_favorite) {
      statements.push(
        db.prepare("INSERT OR REPLACE INTO favorites (repo_id) VALUES (?)").bind(repo.id)
      );
    }
  }

  await db.batch(statements);
  return queryMergedRepos(db);
}

export async function getRepos(db?: D1Database, forceRefresh = false, githubUser = "BernardoVillanova"): Promise<Repo[]> {
  if (!db) {
    try {
      const response = await fetch(`https://api.github.com/users/${githubUser}/repos?sort=updated&per_page=50`, {
        headers: { "User-Agent": "BernOS-CloudflarePages" }
      });
      if (response.ok) {
        const ghRepos = await response.json() as any[];
        return ghRepos.map(repo => {
          const nameLower = repo.name.toLowerCase();
          let folder: string | null = null;
          if (
            nameLower.includes("course") || 
            nameLower.includes("study") || 
            nameLower.includes("estudo") || 
            nameLower.includes("tutorial") || 
            nameLower.includes("exercises") || 
            nameLower.includes("learning") || 
            nameLower.includes("fho") || 
            nameLower.includes("class")
          ) {
            folder = "Estudos";
          } else if (
            nameLower.includes("terraform") || 
            nameLower.includes("iac") || 
            nameLower.includes("pipeline") || 
            nameLower.includes("infra") || 
            nameLower.includes("aws") || 
            nameLower.includes("ezops") || 
            nameLower.includes("yeb") || 
            nameLower.includes("k8s") || 
            nameLower.includes("kubernetes") || 
            nameLower.includes("action")
          ) {
            folder = "Trabalho";
          }

          return {
            id: repo.id,
            name: repo.name,
            description: repo.description || "",
            language: repo.language || "Other",
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            url: repo.html_url,
            homepage: repo.homepage || "",
            topics: repo.topics || [],
            updated_at: repo.updated_at,
            created_at: repo.created_at,
            is_favorite: false,
            folder
          };
        });
      }
    } catch {}
    return MOCK_REPOS;
  }

  try {
    await ensureTables(db);
  } catch {}

  if (forceRefresh) {
    try {
      return await fetchAndCacheRepos(db, githubUser);
    } catch (err) {
      console.warn("Force refresh failed, checking cache:", err);
      const cached = await queryMergedRepos(db);
      if (cached.length > 0) return cached;
      return seedMockRepos(db);
    }
  }

  const now = Date.now();
  let cacheRow: { cached_at: number } | null = null;
  try {
    cacheRow = await db.prepare("SELECT cached_at FROM github_repos LIMIT 1").first<{ cached_at: number }>();
  } catch {}

  if (cacheRow && (now - cacheRow.cached_at < 3600000)) {
    return queryMergedRepos(db);
  }

  try {
    return await fetchAndCacheRepos(db, githubUser);
  } catch (err) {
    console.warn("GitHub API error, using cache/mock:", err);
    const cached = await queryMergedRepos(db);
    if (cached.length > 0) return cached;
    return seedMockRepos(db);
  }
}

export async function setFavorite(db: D1Database | undefined, repoId: number, isFavorite: boolean): Promise<void> {
  if (!db) return;
  await ensureTables(db);
  if (isFavorite) {
    await db.prepare("INSERT OR REPLACE INTO favorites (repo_id) VALUES (?)").bind(repoId).run();
  } else {
    await db.prepare("DELETE FROM favorites WHERE repo_id = ?").bind(repoId).run();
  }
}

export async function setFolder(db: D1Database | undefined, repoId: number, folder: string | null): Promise<void> {
  if (!db) return;
  await ensureTables(db);
  if (folder === "Trabalho" || folder === "Estudos") {
    await db.prepare("INSERT OR REPLACE INTO repo_categories (repo_id, folder) VALUES (?, ?)").bind(repoId, folder).run();
  } else {
    await db.prepare("DELETE FROM repo_categories WHERE repo_id = ?").bind(repoId).run();
  }
}
