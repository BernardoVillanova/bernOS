import { Database } from "bun:sqlite";
import { join } from "path";

const dbPath = join(__dirname, "bernos.db");
const db = new Database(dbPath, { create: true });

// Initialize database tables
db.run(`
  CREATE TABLE IF NOT EXISTS github_repos (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    language TEXT,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    url TEXT,
    homepage TEXT,
    topics TEXT, -- JSON string array
    updated_at TEXT,
    created_at TEXT,
    cached_at INTEGER
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS favorites (
    repo_id INTEGER PRIMARY KEY
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS repo_categories (
    repo_id INTEGER PRIMARY KEY,
    folder TEXT NOT NULL -- 'Trabalho' or 'Estudos'
  )
`);

db.run(`
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
`);

const GITHUB_USER = process.env.GITHUB_USER || "BernardoVillanova";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Seed local resources
function seedTerraformResources() {
  const count = db.prepare("SELECT count(*) as count FROM terraform_resources").get() as { count: number };
  if (count.count > 0) return;

  console.log("[API] Seeding terraform_resources table with AWS services and curiosities.");
  const services = [
    // Column 1
    { name: "AppSync", key: "", cat: "App Integration", color: "pink", pro: 1, title: "", content: "", order: 1, col: 1 },
    { name: "API Gateway", key: "aws_api_gateway.api", cat: "App Integration", color: "pink", pro: 0, title: "Como entro em um novo time", content: "Eu sou uma pessoa introvertida, então demoro um pouco para me adaptar ao ambiente. Mas na maioria das vezes sou a pessoa que escuta, entende e vou conhecendo cada um e interagindo com cada um.", order: 2, col: 1 },
    { name: "SQS", key: "aws_sqs_queue.curiosidades", cat: "App Integration", color: "pink", pro: 0, title: "Fatos aleatórios", content: "Sou viciado em ler, minha média de livros costuma ser algo em torno de 30 livros por anos e mais de 15 mil páginas (Uso o Skoob para acompanhar)", order: 3, col: 1 },
    { name: "SNS", key: "", cat: "App Integration", color: "pink", pro: 0, title: "", content: "", order: 4, col: 1 },
    { name: "Step Functions", key: "", cat: "App Integration", color: "pink", pro: 0, title: "", content: "", order: 5, col: 1 },
    { name: "EventBridge", key: "aws_eventbridge.events", cat: "App Integration", color: "pink", pro: 0, title: "O que me fez virar DevOps", content: "Minha curiosidade sempre me moveu para frente, logo quando comecei o curso técnico, conheci a dita palavra 'Cultura DevOps', uma profissão que une a codificação com a infraestrutura e eu que havia começado a mexer com AWS achei um máximo, dito e feito, minha primeira experiência profissional acabou sendo DevOps e desde então estou por aí kkkkk.", order: 6, col: 1 },
    { name: "EC2", key: "aws_ec2_instance.sonhos", cat: "Compute", color: "orange", pro: 0, title: "Onde quero chegar", content: "Atualmente minha maior meta pessoal é comprar minha casa e/ou AP e profissional, diria que é não parar de ter a curiosidade que tenho, para conseguir me adaptar com a área de T.I.", order: 7, col: 1 },
    { name: "Lambda", key: "aws_lambda_function.hobbies", cat: "Compute", color: "orange", pro: 0, title: "Fora do terminal", content: "Fora do terminal: jogo xadrez (Elo ~1200 no Chess.com), jogo basquete, e tento aprender coisas novas, como tocar teclado, violão e por ai vai.", order: 8, col: 1 },
    { name: "ECS", key: "", cat: "Compute", color: "orange", pro: 1, title: "", content: "", order: 9, col: 1 },
    { name: "ECR", key: "", cat: "Compute", color: "orange", pro: 1, title: "", content: "", order: 10, col: 1 },

    // Column 2
    { name: "CloudFormation", key: "", cat: "Management / Governance", color: "pink", pro: 0, title: "", content: "", order: 1, col: 2 },
    { name: "CloudWatch Logs", key: "", cat: "Management / Governance", color: "pink", pro: 0, title: "", content: "", order: 2, col: 2 },
    { name: "CloudWatch", key: "", cat: "Management / Governance", color: "pink", pro: 0, title: "", content: "", order: 3, col: 2 },
    { name: "Systems Manager", key: "", cat: "Management / Governance", color: "pink", pro: 0, title: "", content: "", order: 4, col: 2 },
    { name: "CloudTrail", key: "", cat: "Management / Governance", color: "pink", pro: 1, title: "", content: "", order: 5, col: 2 },
    { name: "SES", key: "aws_ses_email.sender", cat: "Business Applications", color: "pink", pro: 0, title: "Primeiro emprego em tech", content: "Meu primeiro emprego na área de T.I já foi como DevOps, atuava como meio período por conta da minha faculdade.", order: 6, col: 2 },

    // Column 3
    { name: "Cognito", key: "", cat: "Security Identity Compliance", color: "purple", pro: 1, title: "", content: "", order: 1, col: 3 },
    { name: "Secrets Manager", key: "", cat: "Security Identity Compliance", color: "purple", pro: 0, title: "", content: "", order: 2, col: 3 },
    { name: "KMS", key: "", cat: "Security Identity Compliance", color: "purple", pro: 0, title: "", content: "", order: 3, col: 3 },
    { name: "IAM", key: "", cat: "Security Identity Compliance", color: "purple", pro: 0, title: "", content: "", order: 4, col: 3 },
    { name: "S3", key: "aws_s3_bucket.origem", cat: "Storage", color: "orange", pro: 0, title: "Minha primeira linha de código", content: "Minha primeira linha de código foi um console.log que coloquei em algum site, enquanto jogava ClickJogo", order: 5, col: 3 },
    { name: "Backup", key: "", cat: "Storage", color: "orange", pro: 1, title: "", content: "", order: 6, col: 3 },
    { name: "SageMaker", key: "", cat: "Machine Learning", color: "purple", pro: 1, title: "", content: "", order: 7, col: 3 },

    // Column 4
    { name: "DynamoDB", key: "aws_dynamodb_table.valores", cat: "Database", color: "purple", pro: 0, title: "O que me move", content: "Agora abrindo meu coração kkk, o que me move é ajudar pessoas, sabe aquela sensação de pertencimento quando você faz algo que gosta, um sentido de gratificante, é o que sinto quando vejo que consegui ajudar alguém, seja ouvindo, conversando e até mesmo aconselhando, me sinto bem. Talvez não seja uma motivação de trabalho, mas é o que me faz ser feliz.", order: 1, col: 4 },
    { name: "RDS", key: "", cat: "Database", color: "purple", pro: 1, title: "", content: "", order: 2, col: 4 },
    { name: "ElastiCache", key: "", cat: "Database", color: "purple", pro: 1, title: "", content: "", order: 3, col: 4 },
    { name: "Timestream", key: "", cat: "Database", color: "purple", pro: 1, title: "", content: "", order: 4, col: 4 },
    { name: "Athena", key: "", cat: "Analytics", color: "purple", pro: 1, title: "", content: "", order: 5, col: 4 },
    { name: "Kinesis", key: "", cat: "Analytics", color: "purple", pro: 0, title: "", content: "", order: 6, col: 4 },
    { name: "Kafka", key: "", cat: "Analytics", color: "purple", pro: 1, title: "", content: "", order: 7, col: 4 },
    { name: "Glue", key: "", cat: "Analytics", color: "purple", pro: 1, title: "", content: "", order: 8, col: 4 },
    { name: "Route 53", key: "aws_route53_record.dns", cat: "Analytics", color: "purple", pro: 0, title: "Onde estou agora", content: "Onde estou agora: Rio Claro, SP, Brasil, trabalhando híbrido/remoto, disponível para oportunidades CLT/PJ. E tenho experiência fora do Brasil também.", order: 9, col: 4 }
  ];

  const insert = db.prepare(`
    INSERT OR REPLACE INTO terraform_resources (
      service_name, resource_key, aws_category, icon_color, is_pro, curiosity_title, curiosity_content, display_order, column_position
    ) VALUES (
      $name, $key, $cat, $color, $pro, $title, $content, $order, $col
    )
  `);

  const transaction = db.transaction((list) => {
    for (const item of list) {
      insert.run({
        $name: item.name,
        $key: item.key,
        $cat: item.cat,
        $color: item.color,
        $pro: item.pro,
        $title: item.title,
        $content: item.content,
        $order: item.order,
        $col: item.col
      });
    }
  });

  transaction(services);
  console.log(`[API] Seeded ${services.length} LocalStack services.`);
}

seedTerraformResources();

// Query merged repositories from local DB
function queryMergedRepos() {
  const rows = db.prepare(`
    SELECT 
      r.id, r.name, r.description, r.language, r.stars, r.forks, r.url, r.homepage, r.topics, r.updated_at, r.created_at,
      CASE WHEN f.repo_id IS NOT NULL THEN 1 ELSE 0 END as is_favorite,
      c.folder
    FROM github_repos r
    LEFT JOIN favorites f ON r.id = f.repo_id
    LEFT JOIN repo_categories c ON r.id = c.repo_id
  `).all() as any[];

  return rows.map(row => ({
    ...row,
    is_favorite: !!row.is_favorite,
    topics: JSON.parse(row.topics || "[]")
  }));
}

// Fetch and cache repos from GitHub
async function fetchAndCacheRepos() {
  console.log(`[API] Fetching repos for user "${GITHUB_USER}" from GitHub...`);
  const response = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=50`, {
    headers: {
      "User-Agent": "BunServer"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API returned status ${response.status}: ${response.statusText}`);
  }

  const githubRepos = await response.json() as any[];

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO github_repos (
      id, name, description, language, stars, forks, url, homepage, topics, updated_at, created_at, cached_at
    ) VALUES (
      $id, $name, $description, $language, $stars, $forks, $url, $homepage, $topics, $updated_at, $created_at, $cached_at
    )
  `);

  const now = Date.now();

  const transaction = db.transaction((repos) => {
    // Delete existing cached repos to keep database clean of deleted/renamed repos
    db.prepare("DELETE FROM github_repos").run();

    for (const repo of repos) {
      insertStmt.run({
        $id: repo.id,
        $name: repo.name,
        $description: repo.description || "",
        $language: repo.language || "Other",
        $stars: repo.stargazers_count || 0,
        $forks: repo.forks_count || 0,
        $url: repo.html_url,
        $homepage: repo.homepage || "",
        $topics: JSON.stringify(repo.topics || []),
        $updated_at: repo.updated_at,
        $created_at: repo.created_at,
        $cached_at: now
      });

      // Auto-categorize empty/new repos based on common keywords
      const catCheck = db.prepare("SELECT folder FROM repo_categories WHERE repo_id = ?").get(repo.id) as { folder: string } | undefined;
      if (!catCheck) {
        let folder: string | null = null;
        const nameLower = repo.name.toLowerCase();
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
          db.prepare("INSERT OR REPLACE INTO repo_categories (repo_id, folder) VALUES (?, ?)").run(repo.id, folder);
        }
      }
    }
  });

  transaction(githubRepos);
  console.log(`[API] Successfully cached ${githubRepos.length} repos.`);
  return queryMergedRepos();
}

// Seed local SQLite DB with premium mock data if GitHub API is offline and cache is empty
function seedMockRepos() {
  console.log("[API] Seeding SQLite database with mock repositories due to offline/API failure.");
  const mockRepos = [
    {
      id: 101,
      name: "Terraform-AWS-IaC",
      description: "Provisionamento modular de infraestrutura de rede (VPC, Subnets) e servidores elásticos na nuvem AWS.",
      language: "TypeScript",
      stars: 18,
      forks: 5,
      url: `https://github.com/${GITHUB_USER}/Terraform-AWS-IaC`,
      homepage: "https://aws.amazon.com",
      topics: ["terraform", "aws", "iac", "cloud-engineering", "vpc"],
      updated_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 365 * 24 * 3600000).toISOString(),
      is_favorite: true,
      folder: "Trabalho"
    },
    {
      id: 102,
      name: "PipelineWithActions",
      description: "Template corporativo de CI/CD para automação de testes estáticos, análise de segurança e deploy no Kubernetes.",
      language: "Shell",
      stars: 12,
      forks: 3,
      url: `https://github.com/${GITHUB_USER}/PipelineWithActions`,
      homepage: "",
      topics: ["github-actions", "cicd", "devops", "automation"],
      updated_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 180 * 24 * 3600000).toISOString(),
      is_favorite: false,
      folder: "Trabalho"
    },
    {
      id: 103,
      name: "Study-Algorithms-Java",
      description: "Repositório exploratório com implementações de algoritmos de ordenação, busca e estruturas de dados dinâmicas em Java.",
      language: "Java",
      stars: 8,
      forks: 2,
      url: `https://github.com/${GITHUB_USER}/Study-Algorithms-Java`,
      homepage: "",
      topics: ["java", "algorithms", "data-structures", "academic-etec"],
      updated_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 540 * 24 * 3600000).toISOString(),
      is_favorite: false,
      folder: "Estudos"
    },
    {
      id: 104,
      name: "bernOS",
      description: "Portfolio interativo simulando um sistema operacional completo construído com Vue 3, Pinia e TailwindCSS.",
      language: "Vue",
      stars: 25,
      forks: 8,
      url: `https://github.com/${GITHUB_USER}/bernOS`,
      homepage: "https://bernardo.dev",
      topics: ["vue", "portfolio", "os-simulator", "typescript", "tailwindcss"],
      updated_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 60 * 24 * 3600000).toISOString(),
      is_favorite: true,
      folder: "Estudos"
    },
    {
      id: 105,
      name: "Kubernetes-EKS-Cluster",
      description: "Configurações de infraestrutura para provisionamento e monitoramento de clusters Kubernetes sob o AWS EKS com Helm.",
      language: "Go",
      stars: 15,
      forks: 4,
      url: `https://github.com/${GITHUB_USER}/Kubernetes-EKS-Cluster`,
      homepage: "",
      topics: ["kubernetes", "eks", "aws", "helm", "grafana", "prometheus"],
      updated_at: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 220 * 24 * 3600000).toISOString(),
      is_favorite: true,
      folder: "Trabalho"
    },
    {
      id: 106,
      name: "FinOps-Cost-Optimizer",
      description: "Ferramenta de automação em Python para desligamento agendado de instâncias dev/staging e recomendação de instâncias spot na AWS.",
      language: "Python",
      stars: 20,
      forks: 6,
      url: `https://github.com/${GITHUB_USER}/FinOps-Cost-Optimizer`,
      homepage: "",
      topics: ["python", "finops", "aws-lambda", "cost-control"],
      updated_at: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
      is_favorite: false,
      folder: "Trabalho"
    },
    {
      id: 107,
      name: "Linux-Sysadmin-Scripts",
      description: "Scripts de automação Bash e Ansible para hardening de servidores CentOS/Debian e monitoramento básico de métricas do sistema.",
      language: "Shell",
      stars: 5,
      forks: 1,
      url: `https://github.com/${GITHUB_USER}/Linux-Sysadmin-Scripts`,
      homepage: "",
      topics: ["linux", "bash", "ansible", "sysadmin", "security"],
      updated_at: new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 400 * 24 * 3600000).toISOString(),
      is_favorite: false,
      folder: "Estudos"
    }
  ];

  const now = Date.now();
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO github_repos (
      id, name, description, language, stars, forks, url, homepage, topics, updated_at, created_at, cached_at
    ) VALUES (
      $id, $name, $description, $language, $stars, $forks, $url, $homepage, $topics, $updated_at, $created_at, $cached_at
    )
  `);

  const transaction = db.transaction((repos) => {
    db.prepare("DELETE FROM github_repos").run();
    for (const repo of repos) {
      insertStmt.run({
        $id: repo.id,
        $name: repo.name,
        $description: repo.description,
        $language: repo.language,
        $stars: repo.stars,
        $forks: repo.forks,
        $url: repo.url,
        $homepage: repo.homepage,
        $topics: JSON.stringify(repo.topics),
        $updated_at: repo.updated_at,
        $created_at: repo.created_at,
        $cached_at: now
      });

      // Insert default mock folder associations if not already present
      db.prepare("INSERT OR REPLACE INTO repo_categories (repo_id, folder) VALUES (?, ?)").run(repo.id, repo.folder);

      // Insert default mock favorites if true
      if (repo.is_favorite) {
        db.prepare("INSERT OR REPLACE INTO favorites (repo_id) VALUES (?)").run(repo.id);
      }
    }
  });

  transaction(mockRepos);
  console.log("[API] Seeding mock repositories completed.");
  return queryMergedRepos();
}

// Retrieve repos (uses cache if fresh, otherwise fetches)
async function getRepos(forceRefresh = false) {
  if (forceRefresh) {
    try {
      return await fetchAndCacheRepos();
    } catch (err) {
      console.error("[API] Force refresh failed, checking cache:", err);
      const cached = queryMergedRepos();
      if (cached.length > 0) return cached;
      return seedMockRepos();
    }
  }

  const now = Date.now();
  const cacheRow = db.prepare("SELECT cached_at FROM github_repos LIMIT 1").get() as { cached_at: number } | undefined;

  // TTL: 1 Hour (3,600,000 ms)
  if (cacheRow && (now - cacheRow.cached_at < 3600000)) {
    console.log("[API] Returning repositories from SQLite cache.");
    return queryMergedRepos();
  }

  try {
    return await fetchAndCacheRepos();
  } catch (err) {
    console.error("[API] Error fetching from GitHub API, falling back to cache:", err);
    const cached = queryMergedRepos();
    if (cached.length > 0) return cached;
    return seedMockRepos();
  }
}

// Start Bun Serve HTTP Server
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // CORS Headers for Dev environment
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers });
    }

    try {
      // GET /api/github/repos
      if (path === "/api/github/repos" && method === "GET") {
        const repos = await getRepos();
        return new Response(JSON.stringify(repos), { headers });
      }

      // GET /api/terraform
      if (path === "/api/terraform" && method === "GET") {
        const resources = db.prepare("SELECT * FROM terraform_resources ORDER BY column_position, display_order").all();
        return new Response(JSON.stringify(resources), { headers });
      }

      // POST /api/github/refresh
      if (path === "/api/github/refresh" && method === "POST") {
        const repos = await getRepos(true);
        return new Response(JSON.stringify(repos), { headers });
      }

      // POST /api/github/repos/:id/favorite
      const favMatch = path.match(/^\/api\/github\/repos\/(\d+)\/favorite$/);
      if (favMatch && method === "POST") {
        const repoId = parseInt(favMatch[1]);
        const body = await req.json() as { favorite: boolean };
        const isFavorite = !!body.favorite;

        if (isFavorite) {
          db.prepare("INSERT OR REPLACE INTO favorites (repo_id) VALUES (?)").run(repoId);
        } else {
          db.prepare("DELETE FROM favorites WHERE repo_id = ?").run(repoId);
        }

        return new Response(JSON.stringify({ success: true, is_favorite: isFavorite }), { headers });
      }

      // POST /api/github/repos/:id/folder
      const folderMatch = path.match(/^\/api\/github\/repos\/(\d+)\/folder$/);
      if (folderMatch && method === "POST") {
        const repoId = parseInt(folderMatch[1]);
        const body = await req.json() as { folder: string | null };
        const folder = body.folder; // 'Trabalho', 'Estudos' or null

        if (folder === "Trabalho" || folder === "Estudos") {
          db.prepare("INSERT OR REPLACE INTO repo_categories (repo_id, folder) VALUES (?, ?)").run(repoId, folder);
        } else {
          db.prepare("DELETE FROM repo_categories WHERE repo_id = ?").run(repoId);
        }

        return new Response(JSON.stringify({ success: true, folder }), { headers });
      }

      return new Response(JSON.stringify({ error: "Route not found" }), { status: 404, headers });
    } catch (err: any) {
      console.error(`[API Error] ${method} ${path}:`, err);
      return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500, headers });
    }
  }
});

console.log(`[API Server] Running on http://localhost:${server.port}`);
