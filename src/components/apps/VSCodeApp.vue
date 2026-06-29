<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useWindowStore } from '../../stores/windowStore'
import {
  Files,
  Search,
  Settings,
  ChevronDown,
  ChevronRight,
  GitBranch,
  FileText,
  FileCode,
  Check,
  Play,
  X,
  Terminal,
  Cpu,
  Award,
  BookOpen,
  Briefcase
} from 'lucide-vue-next'

interface TechInfo {
  name: string
  level: string
  years: string
  description: string
}

interface Token {
  text: string
  type: 'keyword' | 'string' | 'comment' | 'type' | 'variable' | 'number' | 'operator' | 'plain' | 'tech'
  techInfo?: TechInfo
}

interface BlameInfo {
  author: string
  time: string
  message: string
}

interface CodeLine {
  lineNumber: number
  blame: BlameInfo
  isMilestone: boolean
  milestoneYear: string
  tokens: Token[]
}

interface FileItem {
  name: string
  path: string
  language: 'typescript' | 'yaml' | 'markdown'
  content: string
}

const store = useWindowStore()

// Technology Database for hover tooltips
const techDb: Record<string, TechInfo> = {
  kubernetes: { name: 'Kubernetes', level: 'Avançado', years: '4 anos', description: 'Orquestração de microsserviços, clusters EKS/GKE, Helm charts, ArgoCD e troubleshooting de clusters.' },
  k8s: { name: 'Kubernetes', level: 'Avançado', years: '4 anos', description: 'Orquestração de microsserviços, clusters EKS/GKE, Helm charts, ArgoCD e troubleshooting de clusters.' },
  docker: { name: 'Docker', level: 'Especialista', years: '5 anos', description: 'Criação de containers leves, escrita de Dockerfiles eficientes, multi-stage builds e Docker Compose.' },
  aws: { name: 'Amazon Web Services', level: 'Avançado', years: '4+ anos', description: 'Arquiteturas resilientes na nuvem. Expertise em EC2, EKS, ECS, S3, RDS, IAM e VPC.' },
  terraform: { name: 'Terraform', level: 'Avançado', years: '4 anos', description: 'Infraestrutura como Código (IaC), criação de módulos corporativos reutilizáveis e controle de states remotos.' },
  helm: { name: 'Helm', level: 'Avançado', years: '3+ anos', description: 'Gerenciador de pacotes para Kubernetes. Versionamento e manutenção de charts de microsserviços.' },
  argocd: { name: 'ArgoCD', level: 'Intermediário', years: '2+ anos', description: 'Sincronização de estado GitOps no Kubernetes para deploy seguro e contínuo.' },
  nodejs: { name: 'Node.js', level: 'Avançado', years: '4 anos', description: 'Desenvolvimento backend robusto com REST APIs e GraphQL usando Express, NestJS e TypeScript.' },
  vue: { name: 'Vue.js', level: 'Avançado', years: '3 anos', description: 'Construção de SPAs modernas e reativas usando Vue 3 Composition API, Pinia, Vite e TailwindCSS.' },
  react: { name: 'React.js', level: 'Avançado', years: '3 anos', description: 'Interfaces dinâmicas usando Hooks, context API, integração com Next.js e consumo de APIs GraphQL/REST.' },
  typescript: { name: 'TypeScript', level: 'Avançado', years: '4 anos', description: 'Superconjunto tipado de JavaScript, garantindo segurança estática tanto no frontend quanto no backend.' },
  githubactions: { name: 'GitHub Actions', level: 'Avançado', years: '4 anos', description: 'Criação de pipelines complexos de CI/CD, runners self-hosted e automação geral do repositório.' },
  jenkins: { name: 'Jenkins', level: 'Intermediário', years: '2 anos', description: 'Criação de pipelines declarativos e integrados em infraestrutura local.' },
  grafana: { name: 'Grafana', level: 'Avançado', years: '3 anos', description: 'Criação de dashboards centralizados e sistemas de alertas com Prometheus e CloudWatch.' },
  prometheus: { name: 'Prometheus', level: 'Avançado', years: '3 anos', description: 'Coleta e retenção de métricas de séries temporais com consultas em PromQL.' },
  cloudwatch: { name: 'AWS CloudWatch', level: 'Avançado', years: '4 anos', description: 'Coleta de logs de containers, alarmes de faturamento, monitoramento de EC2/RDS.' }
}

// Sidebar File Database
const filesDb: Record<string, FileItem> = {
  'career/2020.ts': {
    name: '2020.ts',
    path: 'career/2020.ts',
    language: 'typescript',
    content: `// [2020] Início nos Estudos & ETEC
// Julho de 2020 — Dei meus primeiros passos na ETEC de Rio Claro no curso de Desenvolvimento de Sistemas.
// Tive meu primeiro contato com AWS, Android Studio, Java e algoritmos em si.
// Meus estudos este ano foram exploratórios, sem premiações ou certificações.

const inicioETEC: AcademicStart = {
  period: 'Julho de 2020 - Dezembro de 2021',
  location: 'ETEC Rio Claro, SP',
  course: 'Técnico em Desenvolvimento de Sistemas',
  operatingSystem: 'Linux (Ubuntu / Debian)',
  languages: {
    portugues: 'Nativo ou Bilíngue',
    ingles: 'Professional Working Proficiency'
  }
}`
  },
  'career/2021.ts': {
    name: '2021.ts',
    path: 'career/2021.ts',
    language: 'typescript',
    content: `// [2021] Primeiro Trabalho DevOps no FL Group & Bacharelado FHO
// Dezembro de 2021 — Fui contratado como DevOps Developer na FL Group - Tech (Rio Claro, SP).
// Comecei a configurar ambientes Linux, pipelines de CI/CD (Jenkins, CodePipeline) e containers Docker.
// Criando recursos na AWS (EC2, S3, IAM) e ingressando na FHO para cursar Sistemas de Informação.

const primeiroTrabalho: ProfessionalDevOps = {
  company: 'FL Group - Tech',
  period: 'Dezembro de 2021 - Novembro de 2022 (1 ano)',
  location: 'Rio Claro, SP, Brasil',
  activities: [
    'Configuração e gerenciamento de ambientes Linux',
    'Configurando e usando Jenkins e AWS CodePipeline para realizar CI/CD',
    'Criação, configuração e building de imagens e containers Docker',
    'Configurações da AWS (CodeBuild, CodeCommit, CodePipeline)',
    'Criação de serviços de armazenamento S3, servidores EC2 e acessos no IAM na AWS',
    'Configuração e orquestração de containers usando Kubernetes',
    'Programação em linguagens Shell Script (Bash) para automações de infra',
    'Controle de versão usando Git e GitHub'
  ],
  academia: {
    institution: 'FHO | Fundação Hermínio Ometto',
    course: 'Bacharelado em Sistemas de Informação',
    period: 'Janeiro de 2021 - Dezembro de 2025'
  },
  certifications: [
    'Linux Admin (LINUXtips.local)',
    'Iniciativa DevOps - Docker',
    'DevOps Essentials',
    'Linux Admin'
  ]
}`
  },
  'career/2022.ts': {
    name: '2022.ts',
    path: 'career/2022.ts',
    language: 'typescript',
    content: `// [2022] DevOps Engineer na EZOps.cloud
// Novembro de 2022 — Contratado como DevOps Engineer na EZOps.cloud (Orlando, FL, EUA - Remoto).
// Atuei integrado em uma equipe altamente focada em processos ágeis e projetos internacionais.
// Contato direto e conversas com clientes para alinhamento de requisitos e soluções técnicas.
// Desenho e provisionamento de infraestrutura AWS usando CloudFormation e Terraform.

const ezopsJourney: InternationalDevOps = {
  company: 'EZOps.cloud — Experiência Internacional',
  period: 'Novembro de 2022 - Abril de 2023 (6 meses)',
  location: 'Orlando, Flórida, Estados Unidos (Remoto)',
  activities: [
    'Trabalho com equipe altamente orientada para processos ágeis',
    'Contato e conversas diretas com clientes e gerentes de projetos de diversas localidades do mundo, desenvolvendo soluções baseadas nas suas necessidades',
    'Arquitetar e provisionar ambientes de nuvem (AWS) usando IaC (CloudFormation e Terraform)',
    'Automatização e implementação de releases de código em pipelines de CI/CD',
    'Revisão e implementação das melhores práticas de segurança em ambientes DevOps provisionados'
  ],
  competencies: ['AWS Cloud', 'Terraform', 'CloudFormation', 'Scrum / Kanban']
}`
  },
  'career/2023.ts': {
    name: '2023.ts',
    path: 'career/2023.ts',
    language: 'typescript',
    content: `// [2023] DevOps Freelancer Internacional
// Abril de 2023 — Atuei de forma autônoma como Engenheiro DevOps em projeto internacional sediado em New Jersey, EUA.
// Provisionamento modular de infraestrutura AWS com Terraform e implantação de pipelines automatizados.
// Arquitetura Docker/Kubernetes em alta disponibilidade com observabilidade Prometheus/Grafana.

const projetoInternacional: FreelancerDevOps = {
  projectScope: 'DevOps & Infraestrutura AWS',
  period: 'Abril de 2023 - Dezembro de 2023 (9 meses)',
  location: 'New Jersey, EUA (Remoto)',
  deliverables: [
    'Infra AWS para produção/homologação com Terraform (modularização, reutilização e versionamento de recursos)',
    'CI/CD end-to-end (build/test/deploy)',
    'Práticas de GitOps com revisão via Pull Request (PR) e rollback controlado',
    'Docker/Kubernetes (manifests, rollout, alta disponibilidade)',
    'Segurança robusta na nuvem (IAM, redes VPC/subnets/Security Groups)',
    'Monitoramento e observabilidade de clusters e aplicações com Grafana'
  ]
}`
  },
  'career/2024.ts': {
    name: '2024.ts',
    path: 'career/2024.ts',
    language: 'typescript',
    content: `// [2024] Entrada na Yeb e Transição para DevOps
// Fevereiro de 2024 — Iniciei minha jornada na Yeb Inteligência de Mercado como Desenvolvedor Full Stack.
// Foco no desenvolvimento de APIs Node.js/GraphQL e interfaces reativas Vue 3/React.
// Em Julho de 2024, fui promovido a DevOps Júnior, iniciando no monitoramento e incident response da nuvem AWS.

const yebInicio: YebJuniorJourney = {
  company: 'Yeb Inteligência de Mercado',
  year: 2024,
  roles: [
    {
      title: 'Desenvolvedor Full Stack (Fev 2024 - Jul 2024)',
      stack: ['Node.js', 'Express', 'GraphQL', 'Vue 3', 'React', 'Next.js', 'PostgreSQL'],
      focus: 'Criação e manutenção de APIs REST e integrações robustas.'
    },
    {
      title: 'Engenheiro DevOps Júnior (Jul 2024 - Fev 2025)',
      stack: ['AWS', 'GitFlow', 'Shell Scripting', 'Docker', 'Kubernetes'],
      focus: 'Monitoramento da nuvem AWS, automação de scripts operacionais e suporte a deploys.'
    }
  ],
  honors: [
    '1° Lugar na XX Maratona FHO de Programação (4° ano)',
    '3° Lugar na XX Maratona FHO de Programação (Geral)'
  ]
}`
  },
  'career/2025.ts': {
    name: '2025.ts',
    path: 'career/2025.ts',
    language: 'typescript',
    content: `// [2025] Promoção a DevOps Pleno & FHO Bacharelado Concluído
// Fevereiro de 2025 — Promovido a Engenheiro DevOps Pleno na Yeb Inteligência de Mercado!
// Assumi a governança completa da infraestrutura AWS com Terraform e padronização de pipelines CI/CD.
// Dezembro de 2025 — Concluí meu Bacharelado em Sistemas de Informação na Fundação Hermínio Ometto (FHO).

const yebPlenoCrescimento: YebPlenoJourney = {
  company: 'Yeb Inteligência de Mercado',
  year: 2025,
  role: 'Engenheiro DevOps Pleno',
  achievements: [
    'Liderança técnica na evolução de pipelines CI/CD corporativos via GitHub Actions',
    'Desenho de arquitetura de alta disponibilidade na nuvem AWS usando Terraform modularizado',
    'Conclusão do Bacharelado em Sistemas de Informação (FHO)'
  ],
  infrastructure: {
    IaC: 'Terraform (reutilização, states isolados por buckets S3 com DynamoDB locking)',
    observability: 'Configuração centralizada de logs com Grafana, Prometheus e AWS CloudWatch'
  }
}`
  },
  'career/2026.ts': {
    name: '2026.ts',
    path: 'career/2026.ts',
    language: 'typescript',
    content: `// [2026] Atuação Atual e Engenharia Cloud Otimizada
// Ano Atual (2026) — Atuação como DevOps Pleno na Yeb Inteligência de Mercado.
// Foco total em Platform Engineering, otimização de faturamento cloud (FinOps), e DevSecOps.
// Mentoria técnica para profissionais em início de carreira e governança multi-cloud.

const yebPlenoAtual: PresentState = {
  company: 'Yeb Inteligência de Mercado',
  year: 2026,
  status: 'Ativo (DevOps Pleno - 1 ano e 5 meses no cargo)',
  currentFocus: [
    'Platform Engineering: Criação de soluções internas que simplificam de forma drástica os deploys de backend/frontend',
    'FinOps: Monitoramento de custos AWS e escalabilidade elástica',
    'Mentoria: Acompanhamento técnico ativo de estagiários e desenvolvedores júniores',
    'Segurança: Revisão de redes (VPC, NAT Gateways), políticas restritivas IAM e secrets management'
  ],
  contact: {
    email: 'bernardo.villasantana@gmail.com',
    location: 'Rio Claro, SP, Brasil'
  }
}`
  },
  'skills/containers.yml': {
    name: 'containers.yml',
    path: 'skills/containers.yml',
    language: 'yaml',
    content: `# [Containers & Orquestração]
# Docker e Kubernetes formam a base para a infraestrutura moderna de microsserviços.

Docker:
  details: "Criação de containers leves, escrita de Dockerfiles eficientes, multi-stage builds e Docker Compose."

Kubernetes:
  details: "Orquestração de microsserviços, clusters EKS/GKE, Helm charts, ArgoCD e troubleshooting de clusters."

ECS:
  details: "Orquestração de containers com ECS e AWS Fargate (Serverless)."
  achievements:
    - "Criação de tasks definitions, task groups e service autoscaling."`
  },
  'skills/cloud.yml': {
    name: 'cloud.yml',
    path: 'skills/cloud.yml',
    language: 'yaml',
    content: `# [Computação em Nuvem AWS & Multi-cloud]
# Arquitetura de infraestrutura segura, elástica e otimizada financeiramente.

AWS_Cloud_Engineering:
  proficiency: "95%"
  level: "Avançado"
  services:
    Networking: "VPC completa, Subnets públicas/privadas, NAT Gateways redundantes, Route53, VPNs e Security Groups estruturados."
    Security_IAM: "Políticas IAM baseadas em menor privilégio, Service Control Policies (SCP), KMS e AWS Secrets Manager."
    Compute_Orchestration: "EKS (Kubernetes gerenciado), ECS (Fargate serverless) e Instâncias EC2."
    Databases: "AWS RDS PostgreSQL/SQL Server em arquitetura Multi-AZ com réplicas de leitura."
    Observability: "CloudWatch Logs centralizados, CloudWatch Alarms baseados em métricas de rede/sistema e X-Ray Tracing."

Azure_Engineering:
  proficiency: "35%"
  level: "Intermediário"
  details: "Hospedagem básica de infraestrutura, gestão de blobs e pipelines no Azure DevOps."

GCP_Engineering:
  proficiency: "25%"
  level: "Intermediário"
  details: "Hospedagem de containers no Google Kubernetes Engine (GKE) e monitoramento básico."`
  },
  'skills/cicd.yml': {
    name: 'cicd.yml',
    path: 'skills/cicd.yml',
    language: 'yaml',
    content: `# [CI/CD & Automação de Entregas]
# Automação e otimização do ciclo de deploy com o mínimo de intervenção humana.

GitHub_Actions:
  proficiency: "95%"
  years: 4
  level: "Avançado"
  features:
    - Reusable_Workflows: "Templates corporativos reutilizáveis para uniformizar deploys de dezenas de microsserviços."
    - Runners: "Gestão e provisionamento de self-hosted runners dedicados dentro de instâncias EC2."
    - Security: "Secrets injection integrado ao GitHub Secrets e controle de concorrência de deploys."

Jenkins_Automation:
  proficiency: "75%"
  years: 2
  level: "Intermediário"
  features:
    - "Pipelines declarativas (Jenkinsfile) com versionamento e rollbacks automatizados."
    - "Integração de testes estáticos, testes de cobertura e ferramentas de build locais."

GitOps:
  tool: "ArgoCD para sincronização de manifests de infraestrutura declarados em repositório Git."
  benefits: "Detecção automática de drift de configuração de infraestrutura e recuperação de desastres instantânea."`
  },
  'skills/iac.yml': {
    name: 'iac.yml',
    path: 'skills/iac.yml',
    language: 'yaml',
    content: `# [Infraestrutura como Código - IaC]
# Definição e controle de recursos de nuvem documentados e reproduzíveis.

Terraform:
  proficiency: "95%"
  years: 4
  level: "Avançado"
  capabilities:
    - Module_Design: "Criação de módulos Terraform reutilizáveis e versionados, isolados por redes e subnets."
    - State_Management: "Armazenamento do tfstate em buckets S3 com criptografia e concorrência controlada por DynamoDB locking."
    - Workspaces: "Gestão multi-environment (Dev, Hml, Prd) e drift detection avançado."

CloudFormation:
  proficiency: "80%"
  years: 3
  level: "Avançado"
  capabilities:
    - "Definição declarativa nativa de recursos AWS via templates estruturados YAML/JSON."
    - "Uso de StackSets para implantação multi-região/multi-account."

Ansible:
  proficiency: "70%"
  years: 2
  level: "Intermediário"
  capabilities:
    - "Configuração automatizada de patches de segurança e packages em frotas de instâncias Linux EC2."`
  },
  'skills/frontend.yml': {
    name: 'frontend.yml',
    path: 'skills/frontend.yml',
    language: 'yaml',
    content: `# [Desenvolvimento Front-end]
# Construção de interfaces web interativas, reativas e com performance otimizada.

JavaScript_ES6:
  level: "Especialista"
  proficiency: "95%"
  experience: "5 anos"
  details: "Sólido domínio de hoisting, clojures, promises/async-await assíncrono, manipulação de ES Modules e DOM nativo."

VueJS:
  level: "Avançado"
  proficiency: "90%"
  experience: "3 anos"
  details: "Arquiteturas com Vue 3 Composition API, reatividade nativa estruturada, Pinia Store, Vite Bundler e custom composables."

ReactJS:
  level: "Avançado"
  proficiency: "85%"
  experience: "3 anos"
  details: "Uso estrito de hooks estruturais (useState, useEffect, useContext), render custom tokens, useMemo e useCallback."

NextJS:
  level: "Avançado"
  proficiency: "85%"
  experience: "3 anos"
  details: "Trabalho ativo com Server-Side Rendering (SSR), Server Components, App Routing, Static Generation e otimizações de SEO."`
  },
  'skills/backend.yml': {
    name: 'backend.yml',
    path: 'skills/backend.yml',
    language: 'yaml',
    content: `# [Desenvolvimento Back-end & Integrações]
# Engenharia de microsserviços eficientes, APIs rápidas e consumo de integrações.

NodeJS:
  level: "Avançado"
  proficiency: "90%"
  experience: "4 anos"
  details: "Execução assíncrona orientada a eventos, event loop analytics, gerenciamento de streams e performance tuning."

ExpressJS:
  level: "Avançado"
  proficiency: "90%"
  experience: "4 anos"
  details: "Estruturação modular de roteamento HTTP, tratamento global de exceções, Express middleware e CORS control."

REST_APIs:
  level: "Especialista"
  proficiency: "95%"
  experience: "4 anos"
  details: "Modelagem semântica de payloads, versionamento de rotas, paginações e documentações estruturadas (Swagger/OpenAPI)."

GraphQL:
  level: "Avançado"
  proficiency: "85%"
  experience: "3 anos"
  details: "Apollo Server e Apollo Client, escrita de schema-first resolvers, data loaders para prevenção de queries N+1 e schemas stitching."`
  },
  'skills/observability.yml': {
    name: 'observability.yml',
    path: 'skills/observability.yml',
    language: 'yaml',
    content: `# [Observabilidade & Monitoramento]
# Garantia de resiliência através de métricas ativas, alertas dinâmicos e centralização.

Grafana:
  level: "Avançado"
  proficiency: "90%"
  experience: "3 anos"
  details: "Construção de dashboards avançados corporativos, definição de SLIs/SLOs, alertas em canais de chat via Alertmanager."

AWS_CloudWatch:
  level: "Avançado"
  proficiency: "90%"
  experience: "4 anos"
  details: "Agregação de logs do ECS/EKS via FluentBit, logs insights queries, alarmes de consumo de faturamento e limites de banda."

Prometheus:
  level: "Avançado"
  proficiency: "85%"
  experience: "3 anos"
  details: "Definição de jobs de scraping de métricas de microsserviços Node.js, escrita de queries PromQL complexas."`
  },
  'skills/databases.yml': {
    name: 'databases.yml',
    path: 'skills/databases.yml',
    language: 'yaml',
    content: `# [Bancos de Dados Relacionais SQL & NoSQL]
# Armazenamento estruturado de dados, replicação de volumes e integridade.

PostgreSQL:
  level: "Avançado"
  proficiency: "85%"
  experience: "4 anos"
  details: "Tratamento de queries complexas indexadas, otimização de joins, isolamento de transações ACID e triggers relacionais."

SQL_Server:
  level: "Intermediário"
  proficiency: "75%"
  experience: "3 anos"
  details: "Criação de stored procedures, otimização básica baseada no plano de execução e view modeling."

MongoDB:
  level: "Intermediário"
  proficiency: "75%"
  experience: "3 anos"
  details: "Criação de coleções dinâmicas de documentos, agregação pipeline nativa e índices compostos."

AWS_RDS:
  level: "Avançado"
  proficiency: "90%"
  experience: "4 anos"
  details: "Setup de instâncias relacionais RDS, alta disponibilidade Multi-AZ, Read Replicas e rotinas de backups automatizados."`
  },
  'skills/security_os.yml': {
    name: 'security_os.yml',
    path: 'skills/security_os.yml',
    language: 'yaml',
    content: `# [Sistemas Operacionais & Segurança de Redes]
# Hardening de servidores, VPNs estruturadas e governança de acessos de segurança.

IAM_Security:
  level: "Avançado"
  proficiency: "95%"
  experience: "4 anos"
  details: "Controle restritivo baseado em IAM roles para resources, políticas de privilégio mínimo e IAM Identity Center."

Linux_Shell:
  level: "Especialista"
  proficiency: "95%"
  experience: "6 anos"
  details: "Administração Linux, automação de scripts complexos em Bash, monitoramento de IOPS/load e hardening do SO."

VPC_VPN_Networking:
  level: "Avançado"
  proficiency: "90%"
  experience: "4 anos"
  details: "Dimensionamento de redes CIDR públicas/privadas, NAT Gateways redundantes, VPNs site-to-site e controle de Security Groups."

Windows_Server:
  level: "Intermediário"
  proficiency: "60%"
  experience: "2 anos"
  details: "Configurações básicas de SO, manipulação de logs e deploy em IIS."`
  },
  'README.md': {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    content: `# Bernardo Villanova - Workspace Profissional

Bem-vindo ao meu editor de código simulado! 
Este espaço foi criado para contar a minha história profissional de forma interativa com base nas minhas experiências reais de carreira.

## Como navegar:
- 📁 **career/**: Navegue pela minha linha do tempo profissional real (2020 a 2024+).
  - Conforme você abre e scrolla cada arquivo, o progresso da jornada é atualizado de forma reativa na barra de status abaixo.
  - Comentários destacados com \`Marco\` apontam datas marcantes de contratação ou premiação.
- 📁 **skills/**: Veja os detalhes do meu stack técnico mapeados em arquivos YAML estruturados.
- 💡 **Dica**: Passe o cursor sobre tecnologias chave no código (como \`Kubernetes\`, \`Docker\`, \`AWS\`, \`Terraform\`) para ler sobre minha proficiência e anos de prática!

👤 **Autor**: Bernardo Villanova de Santana
✉️ **Contato**: bernardo.villasantana@gmail.com`
  }
}

const activeFileKey = ref('career/2026.ts')
const openTabs = ref<string[]>(['README.md', 'career/2026.ts', 'skills/containers.yml'])
const explorerOpen = ref(true)
const careerFolderOpen = ref(true)
const skillsFolderOpen = ref(true)
const scrollProgress = ref(0)
const editorContainer = ref<HTMLElement | null>(null)

const currentFile = computed(() => filesDb[activeFileKey.value])

// VSCode Journey Visualizer Parallax State
const isRunningCode = ref(false)
const isCompiling = ref(false)
const compilationLogs = ref<string[]>([])
const timelineScrollTop = ref(0)

const handleTimelineScroll = (e: Event) => {
  const target = e.target as HTMLElement
  timelineScrollTop.value = target.scrollTop
}

const runCode = async () => {
  if (isCompiling.value || isRunningCode.value) return
  
  isCompiling.value = true
  compilationLogs.value = []
  
  const currentFileName = filesDb[activeFileKey.value]?.name || 'workspace.ts'
  const logs = [
    `$ ts-node career/${currentFileName}`,
    `[INFO] Initializing typescript engine...`,
    `[INFO] Compiling program nodes for ${currentFileName}...`,
    `[INFO] Loading Bernardo Villanova's Professional Journey Database...`,
    `[INFO] Parsing academic milestones, experience, awards & certifications...`,
    `[SUCCESS] Program compiled with 0 errors. Launching visualizer...`
  ]
  
  for (let i = 0; i < logs.length; i++) {
    await new Promise(resolve => setTimeout(resolve, i === logs.length - 1 ? 500 : 200))
    compilationLogs.value.push(logs[i])
  }
  
  isCompiling.value = false
  isRunningCode.value = true
}

const timelineData = [
  {
    year: 2020,
    bgTop: 100,
    category: 'Academia',
    icon: BookOpen,
    title: 'ETEC - Técnico em Desenvolvimento de Sistemas',
    subtitle: 'Início dos Estudos',
    desc: 'Iniciei o curso técnico em Desenvolvimento de Sistemas. Tive meu primeiro contato com AWS, Android Studio, Java e algoritmos em si, com estudos de caráter exploratório.',
    bulletPoints: [],
    colorClass: 'bg-teal-500 border-teal-500/25 text-teal-400'
  },
  {
    year: 2021,
    bgTop: 450,
    category: 'Experiência',
    icon: Briefcase,
    title: 'FL Group - Tech',
    subtitle: 'DevOps Developer',
    desc: 'Trabalhei configurando ambientes de desenvolvimento e homologação Linux, provisionando buckets S3, servidores EC2 e gerenciando permissões no IAM.',
    bulletPoints: [
      'Montagem de imagens Docker e Docker Compose',
      'Pipeline de CI/CD automatizado via Jenkins e CodePipeline',
      'Automações escritas em Shell Script (Bash)',
      'Ingresso no Bacharelado em Sistemas de Informação na FHO'
    ],
    colorClass: 'bg-brand-orange border-brand-orange/25 text-brand-orange'
  },
  {
    year: 2022,
    bgTop: 800,
    category: 'Internacional',
    icon: Cpu,
    title: 'EZOps.cloud',
    subtitle: 'DevOps Engineer (EUA)',
    desc: 'Atuei de forma remota para equipes de Orlando, FL, com foco em comunicação direta com clientes internacionais para alinhar requisitos e apresentar soluções de infraestrutura na nuvem AWS.',
    bulletPoints: [
      'Comunicação direta e reuniões com clientes globais para alinhamento de requisitos técnicos',
      'Arquitetar e provisionar ambientes de nuvem (AWS) usando IaC (CloudFormation e Terraform)',
      'Revisão e implementação de melhores práticas de segurança de acesso IAM e redes VPC',
      'Integração e automação de deploys em pipelines ágeis internacionais'
    ],
    colorClass: 'bg-blue-500 border-blue-500/25 text-blue-400'
  },
  {
    year: 2023,
    bgTop: 1150,
    category: 'Freelance',
    icon: Cpu,
    title: 'Freelancer Internacional',
    subtitle: 'DevOps Engineer Freelancer (EUA)',
    desc: 'Gerenciei infraestrutura em nuvem AWS de alta disponibilidade sediada em New Jersey, EUA, utilizando Terraform e Kubernetes.',
    bulletPoints: [
      'Terraform modularizado e isolado por subnets, VPCs e Security Groups',
      'Configuração de Kubernetes (EKS) com manifests de implantação, rollouts and alta disponibilidade',
      'Práticas de GitOps baseadas em revisão por PR e rollbacks controlados',
      'Monitoramento em tempo real com Prometheus e Grafana'
    ],
    colorClass: 'bg-[#c678dd] border-[#c678dd]/25 text-[#c678dd]'
  },
  {
    year: 2024,
    bgTop: 1500,
    category: 'Experiência',
    icon: Briefcase,
    title: 'Yeb Inteligência de Mercado',
    subtitle: 'Full Stack Dev → DevOps Jr',
    desc: 'Iniciei como Desenvolvedor Full Stack construindo APIs Node/GraphQL e layouts React/Vue. Em Julho, assumi como DevOps Júnior cuidando do monitoramento e troubleshooting AWS.',
    bulletPoints: [
      'Desenvolvimento de APIs em Node.js (Express, GraphQL)',
      'Views corporativas reativas com Vue 3, React e Next.js',
      'Início do monitoramento de ambientes e clusters EKS/ECS na AWS',
      'Criação de scripts operacionais Shell/Bash para automação'
    ],
    honors: [
      '1° Lugar na XX Maratona FHO de Programação (4° ano)',
      '3° Lugar na XX Maratona FHO de Programação (Geral)'
    ],
    colorClass: 'bg-green-500 border-green-500/25 text-green-400'
  },
  {
    year: 2025,
    bgTop: 1850,
    category: 'Experiência',
    icon: Briefcase,
    title: 'Yeb Inteligência de Mercado',
    subtitle: 'Engenheiro DevOps Pleno (Promoção)',
    desc: 'Fui promovido a DevOps Pleno, assumindo a liderança de governança AWS, design de IaC Terraform e padronização global de pipelines CI/CD.',
    bulletPoints: [
      'Governança AWS e IaC modular com Terraform',
      'Desenho de pipelines robustas (GitHub Actions reusable workflows)',
      'Graduação em Sistemas de Informação concluída na FHO (Dezembro 2025)'
    ],
    colorClass: 'bg-emerald-500 border-emerald-500/25 text-emerald-400'
  },
  {
    year: 2026,
    bgTop: 2200,
    category: 'Experiência',
    icon: Briefcase,
    title: 'Yeb Inteligência de Mercado',
    subtitle: 'Engenheiro DevOps Pleno (Atualmente)',
    desc: 'Responsabilidade atual focada em Platform Engineering (simplificação de deploy dos times), redução de faturamento AWS (FinOps) e auditorias de acessos IAM.',
    bulletPoints: [
      'Implementação de soluções internas de Platform Engineering',
      'Políticas restritivas de redes VPC/NAT e governança de acessos IAM',
      'Mentoria ativa de estagiários e desenvolvedores back-end'
    ],
    colorClass: 'bg-cyan-500 border-cyan-500/25 text-cyan-400'
  }
]

// Web Audio API sound effect on file click
const playFileOpenSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(520, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.08)
    
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch (err) {
    // Silently ignore audio block warnings
  }
}

const selectFile = (key: string) => {
  activeFileKey.value = key
  if (!openTabs.value.includes(key)) {
    openTabs.value.push(key)
  }
  playFileOpenSound()
  scrollProgress.value = 0
  nextTick(() => {
    if (editorContainer.value) {
      editorContainer.value.scrollTop = 0
    }
  })
}

const closeTab = (key: string, e: Event) => {
  e.stopPropagation()
  openTabs.value = openTabs.value.filter(tab => tab !== key)
  if (activeFileKey.value === key && openTabs.value.length > 0) {
    activeFileKey.value = openTabs.value[openTabs.value.length - 1]
  }
}

// Watch for file updates triggered globally (from FilesApp.vue double click)
watch(() => store.activeVSCodeFileKey, (newVal) => {
  if (newVal && filesDb[newVal]) {
    selectFile(newVal)
  }
})

// Scroll handlers for timeline updating
const handleEditorScroll = () => {
  if (editorContainer.value) {
    const el = editorContainer.value
    const maxScroll = el.scrollHeight - el.clientHeight
    if (maxScroll > 0) {
      scrollProgress.value = el.scrollTop / maxScroll
    } else {
      scrollProgress.value = 0
    }
  }
}

// Timeline calculations
const timelineProgress = computed(() => {
  const fileKey = activeFileKey.value
  const careerFiles: Record<string, { min: number, max: number, year: string }> = {
    'career/2020.ts': { min: 0, max: 15, year: '2020' },
    'career/2021.ts': { min: 15, max: 30, year: '2021' },
    'career/2022.ts': { min: 30, max: 45, year: '2022' },
    'career/2023.ts': { min: 45, max: 60, year: '2023' },
    'career/2024.ts': { min: 60, max: 75, year: '2024' },
    'career/2025.ts': { min: 75, max: 90, year: '2025' },
    'career/2026.ts': { min: 90, max: 100, year: '2026' }
  }

  const fileConfig = careerFiles[fileKey]
  if (!fileConfig) return null

  const progress = fileConfig.min + scrollProgress.value * (fileConfig.max - fileConfig.min)
  return {
    year: fileConfig.year,
    percentage: Math.min(Math.max(Math.round(progress), 0), 100)
  }
})

// Simulated Git Blame logic
const getBlameInfo = (filePath: string, lineNumber: number): BlameInfo => {
  if (filePath.startsWith('career/2020')) {
    return { author: 'você', time: '6 anos atrás', message: 'feat: adicionar primeiros scripts Bash' }
  } else if (filePath.startsWith('career/2021')) {
    return { author: 'você', time: '5 anos atrás', message: 'feat: provisionar primeiro EC2 na AWS' }
  } else if (filePath.startsWith('career/2022')) {
    if (lineNumber <= 5) {
      return { author: 'você', time: '4 anos atrás', message: 'feat: configurar cluster EKS' }
    } else {
      return { author: 'você', time: '4 anos atrás', message: 'feat: adicionar helm charts' }
    }
  } else if (filePath.startsWith('career/2023')) {
    return { author: 'você', time: '3 anos atrás', message: 'feat: migrar IaC para Terraform Cloud' }
  } else if (filePath.startsWith('career/2024')) {
    return { author: 'você', time: '2 anos atrás', message: 'feat: ingressar na Yeb e rodar pipelines Docker' }
  } else if (filePath.startsWith('career/2025')) {
    return { author: 'você', time: '1 ano atrás', message: 'feat: promoção a devops pleno e formatar modularização terraform' }
  } else if (filePath.startsWith('career/2026')) {
    return { author: 'você', time: 'atualmente', message: 'feat: gerenciar platform engineering, finops e monitoramento' }
  } else if (filePath.startsWith('skills/')) {
    return { author: 'você', time: '1 ano atrás', message: 'docs: mapear niveis de proficiencia' }
  } else {
    return { author: 'você', time: '1 ano atrás', message: 'docs: criar apresentacao do workspace' }
  }
}

// Tokenizer mapping classes
const getTokenClass = (type: string) => {
  switch (type) {
    case 'keyword': return 'text-[#c678dd] font-bold'
    case 'string': return 'text-[#98c379]'
    case 'comment': return 'text-[#5c6370] italic'
    case 'type': return 'text-[#61afef]'
    case 'variable': return 'text-[#e06c75]'
    case 'number': return 'text-[#d19a66]'
    case 'operator': return 'text-[#56b6c2]'
    default: return 'text-[#abb2bf]'
  }
}

const getTokenMiniClass = (type: string) => {
  switch (type) {
    case 'keyword': return 'bg-[#c678dd] opacity-70'
    case 'string': return 'bg-[#98c379] opacity-70'
    case 'comment': return 'bg-[#5c6370] opacity-40'
    case 'type': return 'bg-[#61afef] opacity-70'
    case 'variable': return 'bg-[#e06c75] opacity-70'
    case 'tech': return 'bg-teal-400 opacity-90'
    case 'number': return 'bg-[#d19a66] opacity-70'
    case 'operator': return 'bg-[#56b6c2] opacity-70'
    default: return 'bg-gray-600 opacity-40'
  }
}

// Line Tokenizer
const tokenizeLine = (lineText: string, language: string): Token[] => {
  const tokens: Token[] = []
  if (!lineText) {
    return [{ text: ' ', type: 'plain' }]
  }

  let regex: RegExp
  if (language === 'yaml') {
    regex = /(#.*)|("[^"]*"|'[^']*')|(\b\d+\b)|(\b[a-zA-Z_$-][a-zA-Z0-9_$-]*\b)(?=\s*:)|(\b[a-zA-Z_$-][a-zA-Z0-9_$-]*\b)|([{}()\[\];.,+\-*\/%=&|^!<>?:])|(\s+)/g
  } else if (language === 'markdown') {
    regex = /(^#+.*)|(^\s*[\-\*\+]\s+|^\s*\d+\.\s+)|(`[^`]+`)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)|(\[[^\]]+\]\([^)]+\))|(\s+)/g
  } else {
    regex = /(\/\/.*)|("[^"]*"|'[^']*'|`[^`]*`)|(\b\d+\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)|([{}()\[\];.,+\-*\/%=&|^!<>?:])|(\s+)/g
  }

  const matches = lineText.matchAll(regex)
  let lastIndex = 0

  for (const match of matches) {
    const matchText = match[0]
    const index = match.index || 0

    if (index > lastIndex) {
      tokens.push({ text: lineText.substring(lastIndex, index), type: 'plain' })
    }

    const [
      _,
      commentMatch,
      stringMatch,
      numberMatch,
      yamlKeyMatch,
      wordMatch,
      operatorMatch
    ] = match

    if (commentMatch) {
      tokens.push({ text: matchText, type: 'comment' })
    } else if (stringMatch) {
      tokens.push({ text: matchText, type: 'string' })
    } else if (numberMatch) {
      tokens.push({ text: matchText, type: 'number' })
    } else if (yamlKeyMatch !== undefined && language === 'yaml') {
      tokens.push({ text: matchText, type: 'keyword' })
    } else {
      const textLower = matchText.toLowerCase()
      let techKey = textLower.replace(/[\._-]/g, '')
      if (techKey === 'k8s') techKey = 'kubernetes'
      
      if (techDb[techKey]) {
        tokens.push({
          text: matchText,
          type: 'tech',
          techInfo: techDb[techKey]
        })
      } else if (wordMatch) {
        const keywords = [
          'const', 'let', 'var', 'function', 'return', 'if', 'else',
          'import', 'export', 'interface', 'type', 'from', 'class',
          'extends', 'new', 'await', 'async', 'default', 'true', 'false'
        ]
        if (keywords.includes(matchText)) {
          tokens.push({ text: matchText, type: 'keyword' })
        } else if (/^[A-Z][a-zA-Z0-9_$]*$/.test(matchText)) {
          tokens.push({ text: matchText, type: 'type' })
        } else {
          tokens.push({ text: matchText, type: 'variable' })
        }
      } else if (operatorMatch) {
        tokens.push({ text: matchText, type: 'operator' })
      } else {
        tokens.push({ text: matchText, type: 'plain' })
      }
    }

    lastIndex = index + matchText.length
  }

  if (lastIndex < lineText.length) {
    tokens.push({ text: lineText.substring(lastIndex), type: 'plain' })
  }

  return tokens
}

// Aligns code token array output
const tokenizedLines = computed<CodeLine[]>(() => {
  const file = currentFile.value
  if (!file) return []

  const rawLines = file.content.split('\n')
  return rawLines.map((lineText, idx) => {
    const lineNumber = idx + 1
    const blame = getBlameInfo(file.path, lineNumber)

    // Milestone year check
    const milestoneRegex = /^\/\/\s*\[(\d{4})\]/
    const milestoneMatch = lineText.match(milestoneRegex)
    const isMilestone = !!milestoneMatch
    const milestoneYear = milestoneMatch ? milestoneMatch[1] : ''

    const tokens = tokenizeLine(lineText, file.language)

    return {
      lineNumber,
      blame,
      isMilestone,
      milestoneYear,
      tokens
    }
  })
})
</script>

<template>
  <div class="flex-grow flex h-full bg-[#181824] text-gray-300 font-mono text-xs select-none relative overflow-hidden">
    
    <!-- Activity Bar -->
    <div class="w-12 bg-[#1e1e2f] border-r border-[#181824] flex flex-col items-center py-4 gap-5 shrink-0">
      <button
        class="text-gray-400 hover:text-white cursor-pointer transition p-1"
        :class="explorerOpen ? 'text-brand-orange hover:text-brand-orange-light' : ''"
        @click="explorerOpen = !explorerOpen"
        title="Explorador de Arquivos"
      >
        <Files class="w-5 h-5" />
      </button>
      <button class="text-gray-500 hover:text-gray-300 cursor-pointer transition p-1" title="Pesquisar (Decorativo)"><Search class="w-5 h-5" /></button>
      <button class="text-gray-500 hover:text-gray-300 cursor-pointer transition p-1" title="Controle de Código (Decorativo)"><GitBranch class="w-5 h-5" /></button>
      <div class="flex-grow"></div>
      <button class="text-gray-500 hover:text-gray-300 cursor-pointer transition p-1" title="Configurações"><Settings class="w-5 h-5" /></button>
    </div>

    <!-- Sidebar File Explorer -->
    <div v-if="explorerOpen" class="w-[200px] bg-[#1a1a26]/90 border-r border-white/5 flex flex-col shrink-0">
      <div class="p-3 uppercase text-[10px] font-bold tracking-wider text-gray-500 flex justify-between items-center">
        <span>Explorador</span>
      </div>
      
      <!-- Workspace Tree -->
      <div class="px-1 text-xs select-none">
        <div class="flex items-center gap-1 py-1.5 px-2 text-gray-200 font-bold tracking-wide">
          <ChevronDown class="w-3.5 h-3.5 text-gray-500" />
          <span class="truncate">portfolio-os</span>
        </div>

        <!-- Folder career/ -->
        <div class="pl-2">
          <div
            class="flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition hover:bg-white/5 text-gray-200"
            @click="careerFolderOpen = !careerFolderOpen"
          >
            <component :is="careerFolderOpen ? ChevronDown : ChevronRight" class="w-3 h-3 text-gray-500 shrink-0" />
            <span class="text-amber-400 font-bold shrink-0 text-sm leading-none">&#x1F5C1;</span>
            <span class="font-medium">career</span>
          </div>

          <!-- Files in career/ -->
          <div v-show="careerFolderOpen" class="pl-3.5 flex flex-col border-l border-white/5 ml-3 mt-0.5">
            <div
              v-for="fileKey in Object.keys(filesDb).filter(k => k.startsWith('career/'))"
              :key="fileKey"
              class="flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition hover:bg-white/5"
              :class="activeFileKey === fileKey ? 'bg-brand-orange/10 text-brand-orange-light font-semibold border-r-2 border-brand-orange' : 'text-gray-400 hover:text-gray-200'"
              @click="selectFile(fileKey)"
            >
              <FileCode class="w-3.5 h-3.5 text-[#519aba] shrink-0" />
              <span class="truncate">{{ filesDb[fileKey].name }}</span>
            </div>
          </div>
        </div>

        <!-- Folder skills/ -->
        <div class="pl-2 mt-1">
          <div
            class="flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition hover:bg-white/5 text-gray-200"
            @click="skillsFolderOpen = !skillsFolderOpen"
          >
            <component :is="skillsFolderOpen ? ChevronDown : ChevronRight" class="w-3 h-3 text-gray-500 shrink-0" />
            <span class="text-blue-400 font-bold shrink-0 text-sm leading-none">&#x1F5C1;</span>
            <span class="font-medium">skills</span>
          </div>

          <!-- Files in skills/ -->
          <div v-show="skillsFolderOpen" class="pl-3.5 flex flex-col border-l border-white/5 ml-3 mt-0.5">
            <div
              v-for="fileKey in Object.keys(filesDb).filter(k => k.startsWith('skills/'))"
              :key="fileKey"
              class="flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition hover:bg-white/5"
              :class="activeFileKey === fileKey ? 'bg-brand-orange/10 text-brand-orange-light font-semibold border-r-2 border-brand-orange' : 'text-gray-400 hover:text-gray-200'"
              @click="selectFile(fileKey)"
            >
              <FileText class="w-3.5 h-3.5 text-[#eceb8e] shrink-0" />
              <span class="truncate">{{ filesDb[fileKey].name }}</span>
            </div>
          </div>
        </div>

        <!-- README.md File -->
        <div class="pl-2 mt-1">
          <div
            class="flex items-center gap-2 py-1 px-5 rounded cursor-pointer transition hover:bg-white/5"
            :class="activeFileKey === 'README.md' ? 'bg-brand-orange/10 text-brand-orange-light font-semibold border-r-2 border-brand-orange' : 'text-gray-400 hover:text-gray-200'"
            @click="selectFile('README.md')"
          >
            <FileText class="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span class="truncate">README.md</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Main Panel -->
    <div class="flex-grow flex flex-col bg-[#1e1e2e] min-w-0 select-text">
      <!-- Tabs Bar -->
      <div class="h-9 bg-[#1a1a26] flex border-b border-black/20 overflow-x-auto select-none shrink-0 justify-between items-center pr-3">
        <div class="flex overflow-x-auto h-full">
          <div
            v-for="tab in openTabs"
            :key="tab"
            class="flex items-center gap-2 px-3 border-r border-black/20 h-full cursor-pointer transition text-xs font-sans"
            :class="activeFileKey === tab ? 'bg-[#1e1e2e] text-white border-t-2 border-t-brand-orange' : 'bg-black/20 text-gray-500 hover:bg-black/10 hover:text-gray-300'"
            @click="activeFileKey = tab"
          >
            <component :is="tab.endsWith('.ts') ? FileCode : FileText" class="w-3.5 h-3.5" :class="tab.endsWith('.ts') ? 'text-[#519aba]' : tab.endsWith('.yml') ? 'text-[#eceb8e]' : 'text-teal-400'" />
            <span class="truncate max-w-[120px]">{{ filesDb[tab]?.name || tab }}</span>
            <button
              class="hover:bg-white/10 rounded w-4 h-4 flex items-center justify-center text-[10px] text-gray-500 font-bold ml-1 hover:text-white"
              @click="closeTab(tab, $event)"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Run Play Button -->
        <button
          v-if="currentFile && currentFile.language === 'typescript'"
          @click="runCode"
          class="flex items-center justify-center w-7 h-7 rounded hover:bg-white/10 text-[#98c379] transition select-none cursor-pointer shrink-0"
          title="Executar código (Rodar Linha do Tempo)"
        >
          <Play class="w-4 h-4 fill-[#98c379] stroke-none" />
        </button>
      </div>

      <!-- Compiling Stage Output -->
      <div v-if="isCompiling" class="flex-grow bg-[#0f0f17] flex flex-col font-mono p-6 text-green-400 text-xs sm:text-sm select-text overflow-y-auto leading-relaxed">
        <div class="flex items-center gap-2 mb-4 text-[#98c379] border-b border-[#98c379]/20 pb-2 select-none">
          <Terminal class="w-4 h-4" />
          <span class="font-bold">COMPILAÇÃO & EXECUÇÃO DO PORTFÓLIO</span>
        </div>
        <div v-for="(log, idx) in compilationLogs" :key="idx" class="whitespace-pre-wrap select-text">
          <span v-if="log.startsWith('$')" class="text-white font-bold">{{ log }}</span>
          <span v-else-if="log.includes('[SUCCESS]')" class="text-[#98c379] font-bold">{{ log }}</span>
          <span v-else-if="log.includes('[INFO]')" class="text-blue-400">{{ log }}</span>
          <span v-else>{{ log }}</span>
        </div>
        <div class="mt-4 flex items-center gap-2 select-none">
          <span class="w-2 h-4 bg-green-400 animate-pulse inline-block"></span>
          <span class="text-gray-500 text-xs">Compilando módulos do kernel do portfólio...</span>
        </div>
      </div>

      <!-- Parallax Timeline Visualizer View -->
      <div v-else-if="isRunningCode" class="flex-grow bg-[#0f0f16] flex flex-col relative overflow-hidden select-text">
        <!-- Visualizer Top Navigation Bar -->
        <div class="h-10 border-b border-white/5 bg-[#141420] px-4 flex items-center justify-between shrink-0 select-none z-30">
          <div class="flex items-center gap-2">
            <Cpu class="w-4 h-4 text-brand-orange animate-spin-slow" />
            <span class="text-gray-200 text-xs font-bold tracking-wide font-sans">Bernardo Journey Visualizer v1.0.0</span>
          </div>
          <button
            @click="isRunningCode = false"
            class="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition font-sans text-xs border border-white/10 cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
            <span>Voltar ao Editor</span>
          </button>
        </div>

        <!-- Parallax Scrollable Timeline Canvas -->
        <div
          class="flex-grow overflow-y-auto relative select-text scroll-smooth"
          @scroll="handleTimelineScroll"
        >
          <!-- LAYER 1: Deep Space Parallax Background -->
          <div
            class="absolute inset-0 pointer-events-none z-0 transition-transform duration-75 ease-out"
            :style="{
              transform: `translateY(${timelineScrollTop * 0.25}px)`
            }"
          >
            <!-- Glowing stars & radial grid backdrops -->
            <div class="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
            <!-- Large floating nebula clouds -->
            <div class="absolute top-[10%] left-[20%] w-96 h-96 bg-brand-orange/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div class="absolute top-[50%] right-[10%] w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div class="absolute top-[80%] left-[30%] w-96 h-96 bg-[#c678dd]/5 rounded-full blur-[100px] pointer-events-none"></div>
          </div>

          <!-- LAYER 2: Year floating labels (aligned in sync with cards) -->
          <div
            class="absolute inset-x-0 pointer-events-none z-10"
          >
            <div
              v-for="node in timelineData"
              :key="'bg-year-' + node.year"
              class="absolute left-1/2 -translate-x-1/2 text-[100px] sm:text-[140px] font-black text-white/[0.015] font-mono leading-none select-none"
              :style="{
                top: (node.bgTop + 100) + 'px'
              }"
            >
              {{ node.year }}
            </div>
          </div>

          <!-- LAYER 3: Interactive Timeline Foreground Cards -->
          <div class="relative z-20 max-w-2xl mx-auto px-6 py-20" style="height: 2600px;">
            
            <!-- Connection Line down the center -->
            <div class="absolute left-1/2 -translate-x-1/2 top-20 bottom-20 w-0.5 bg-gradient-to-b from-brand-orange via-teal-500 to-[#c678dd]"></div>

            <div
              v-for="(item, idx) in timelineData"
              :key="idx"
              class="absolute w-full flex transition-all duration-700"
              :class="[
                idx % 2 === 0 ? 'justify-start' : 'justify-end',
                timelineScrollTop + 450 > item.bgTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              ]"
              :style="{
                top: item.bgTop + 'px'
              }"
            >
              <!-- Glowing circle center connector -->
              <div
                class="absolute left-1/2 -translate-x-1/2 top-6 w-5 h-5 rounded-full border-4 border-[#0f0f16] shadow-lg transition-transform duration-300 hover:scale-125 z-30"
                :class="item.colorClass"
              ></div>

              <!-- Card Wrapper -->
              <div class="w-[85%] sm:w-[45%] bg-[#141420]/80 backdrop-blur-md border border-white/5 rounded-xl p-5 shadow-2xl hover:border-brand-orange/40 hover:shadow-brand-orange/5 transition-all duration-300 group">
                
                <!-- Card Header -->
                <div class="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 select-none">
                  <div class="flex items-center gap-2">
                    <component :is="item.icon" class="w-4 h-4 text-brand-orange-light" />
                    <span class="text-white text-xs font-bold font-sans uppercase tracking-wider">{{ item.category }}</span>
                  </div>
                  <span class="text-xs font-mono font-bold bg-brand-orange/10 text-brand-orange-light px-2 py-0.5 rounded leading-none">
                    {{ item.year }}
                  </span>
                </div>

                <!-- Card Body -->
                <h3 class="text-sm font-bold text-gray-100 mb-1 group-hover:text-brand-orange-light transition-colors leading-snug">{{ item.title }}</h3>
                <h4 class="text-[11px] text-teal-400 font-semibold mb-2 leading-none">{{ item.subtitle }}</h4>
                <p class="text-gray-400 text-[10px] leading-relaxed mb-3">{{ item.desc }}</p>

                <!-- Technical tags / bullets -->
                <div v-if="item.bulletPoints && item.bulletPoints.length" class="flex flex-col gap-1.5">
                  <div
                    v-for="(bullet, bIdx) in item.bulletPoints"
                    :key="bIdx"
                    class="text-[9px] text-gray-400 flex gap-1.5 items-start leading-relaxed"
                  >
                    <span class="text-teal-400 select-none mt-0.5">•</span>
                    <span>{{ bullet }}</span>
                  </div>
                </div>

                <!-- Awards / Honors Section -->
                <div v-if="item.honors && item.honors.length" class="mt-3 pt-2.5 border-t border-white/5 flex flex-col gap-1.5 select-none">
                  <div class="flex items-center gap-1.5 text-[#eceb8e]">
                    <Award class="w-3.5 h-3.5 shrink-0" />
                    <span class="text-[9px] font-bold uppercase tracking-wider font-sans">Premiações / Conquistas</span>
                  </div>
                  <div
                    v-for="(honor, hIdx) in item.honors"
                    :key="hIdx"
                    class="text-[9px] text-[#eceb8e]/90 bg-[#eceb8e]/5 px-2 py-1 rounded border border-[#eceb8e]/10 leading-snug"
                  >
                    {{ honor }}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- Main Editor Container (Lines + Code + Minimap) -->
      <div v-else class="flex-grow flex overflow-hidden select-text relative">
        <div
          ref="editorContainer"
          class="flex-grow p-3 overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed text-[#abb2bf] select-text scroll-smooth"
          @scroll="handleEditorScroll"
        >
          <div v-if="currentFile" class="flex flex-col select-text pb-12 min-w-max">
            <!-- Floating banner to prompt running code -->
            <div v-if="currentFile.language === 'typescript'" class="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3.5 mb-5 mr-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs select-none">
              <div class="flex items-center gap-2.5">
                <span class="relative flex h-2.5 w-2.5 shrink-0">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div class="leading-relaxed">
                  <span class="text-emerald-400 font-bold uppercase tracking-wider font-sans mr-2">Dica Executável:</span>
                  <span class="text-gray-200">Este arquivo TypeScript contém a história profissional compilável! Clique no botão de execução para abrir o visualizador de linha do tempo interativo com efeito Parallax.</span>
                </div>
              </div>
              <button
                @click="runCode"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-md shadow-md shadow-emerald-600/10 transition duration-150 text-[10px] uppercase font-sans cursor-pointer flex items-center gap-1.5 border-none outline-none self-end sm:self-center shrink-0"
              >
                <Play class="w-3.5 h-3.5 fill-white stroke-none" />
                <span>Rodar Código</span>
              </button>
            </div>
            
            <!-- Code Lines rendering -->
            <div
              v-for="line in tokenizedLines"
              :key="line.lineNumber"
              class="flex select-text relative group hover:bg-white/[0.02] py-0.5"
            >
              <!-- Blame hover data column -->
              <div class="w-[180px] text-[10px] text-gray-500/40 select-none shrink-0 pr-4 text-right cursor-default opacity-0 group-hover:opacity-100 transition-opacity duration-150 truncate">
                {{ line.blame.author }} · {{ line.blame.time }} · "{{ line.blame.message }}"
              </div>

              <!-- Line Number column -->
              <div class="w-9 text-right pr-3.5 text-gray-600 select-none shrink-0 border-r border-white/5">
                {{ line.lineNumber }}
              </div>

              <!-- Line Code Content column -->
              <div class="pl-4 flex-grow whitespace-pre select-text flex items-center relative" :class="line.isMilestone ? 'bg-brand-orange/5 border-l-2 border-brand-orange py-0.5 my-0.5 pl-3' : ''">
                <!-- Milestone Label -->
                <span v-if="line.isMilestone" class="mr-2 text-[9px] bg-brand-orange text-black font-extrabold px-1 rounded select-none uppercase tracking-wider">
                  Marco {{ line.milestoneYear }}
                </span>

                <!-- Tokens rendering -->
                <template v-for="(token, tokenIdx) in line.tokens" :key="tokenIdx">
                  <!-- Tech interactive hover tooltip -->
                  <span
                    v-if="token.type === 'tech'"
                    class="text-teal-400 font-semibold cursor-pointer underline decoration-dotted decoration-teal-400/40 relative group/tooltip select-text"
                  >
                    {{ token.text }}
                    <!-- Tooltip Card -->
                    <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-[#141420] border border-teal-500/30 text-gray-200 text-xxs p-3 rounded-lg shadow-2xl hidden group-hover/tooltip:block z-50 pointer-events-none select-none font-sans leading-normal whitespace-normal">
                      <span class="block font-bold text-teal-400 text-[10px] uppercase tracking-wider pb-1 border-b border-white/5">{{ token.techInfo?.name }}</span>
                      <span class="block mt-1.5 font-semibold text-[10px]">Proficiência: <span class="text-white font-mono">{{ token.techInfo?.level }}</span></span>
                      <span class="block text-[10px]">Tempo: <span class="text-white font-mono">{{ token.techInfo?.years }}</span></span>
                      <p class="text-gray-400 mt-1 text-[9px] leading-relaxed">{{ token.techInfo?.description }}</p>
                    </span>
                  </span>

                  <!-- Standard tokens -->
                  <span v-else :class="getTokenClass(token.type)" class="select-text">{{ token.text }}</span>
                </template>
              </div>
            </div>

          </div>
          <div v-else class="flex-grow flex flex-col items-center justify-center text-gray-500 gap-2 h-full">
            <FileText class="w-12 h-12 stroke-[1]" />
            <span>Selecione um arquivo no Explorador para visualizar</span>
          </div>
        </div>

        <!-- Minimap (Right side) -->
        <div v-if="currentFile" class="w-16 bg-[#161621] border-l border-white/5 flex flex-col overflow-hidden select-none shrink-0 text-[2px] leading-[3px] p-1 font-mono text-[#5c6370] opacity-40 hover:opacity-85 transition-opacity relative">
          <!-- Scroll viewport overlay selector -->
          <div
            class="absolute left-0 right-0 bg-white/5 border border-white/10 pointer-events-none transition-all duration-100"
            :style="{
              top: (scrollProgress * 70) + '%',
              height: '25%'
            }"
          ></div>
          <!-- Minimap Code representation -->
          <div v-for="line in tokenizedLines" :key="'mini-' + line.lineNumber" class="truncate h-1 flex gap-0.5">
            <template v-for="(token, tokenIdx) in line.tokens" :key="tokenIdx">
              <span :class="getTokenMiniClass(token.type)">{{ token.text.replace(/[^\s]/g, '█') }}</span>
            </template>
          </div>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="h-6 bg-brand-orange/10 border-t border-white/5 px-3 flex items-center justify-between text-[10px] text-gray-400 shrink-0 font-sans">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1 text-brand-orange font-bold uppercase tracking-wider"><Check class="w-3.5 h-3.5" /> Ready</span>
          <span class="flex items-center gap-1"><GitBranch class="w-3 h-3 text-gray-500" /> main*</span>
          
          <!-- Career timeline progress bar indicator -->
          <template v-if="timelineProgress">
            <span class="text-gray-600 select-none">|</span>
            <div class="flex items-center gap-2 select-none">
              <span class="font-bold text-gray-300 uppercase select-none">Progresso da Linha do Tempo:</span>
              <span class="font-mono bg-brand-orange/20 text-brand-orange-light px-1.5 py-0.5 rounded leading-none text-[9px] select-none font-bold">
                Jornada {{ timelineProgress.year }} ({{ timelineProgress.percentage }}%)
              </span>
              <div class="w-24 bg-white/5 h-1.5 rounded overflow-hidden select-none border border-white/5">
                <div class="bg-brand-orange h-full rounded transition-all duration-150" :style="{ width: timelineProgress.percentage + '%' }"></div>
              </div>
            </div>
          </template>
        </div>
        <div class="flex items-center gap-3 select-none">
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span class="uppercase font-bold text-brand-orange tracking-wider">{{ currentFile?.language || 'Plain Text' }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Scrollbar Custom styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #1a1a26;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

.select-text-safe {
  user-select: text !important;
  -webkit-user-select: text !important;
}

/* Tooltip custom overrides */
.text-xxs {
  font-size: 9px;
}
</style>
