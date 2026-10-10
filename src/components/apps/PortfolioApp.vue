<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWindowStore } from '../../stores/windowStore'
import DotPattern from '../ui/DotPattern.vue'
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  ShieldCheck,
  Copy,
  Check,
  Star,
  Mail,
  ChevronDown,
  Coffee,
  BookOpen,
  Film,
  Sparkles,
  GitBranch,
  Wrench,
  GraduationCap,
  Trophy
} from 'lucide-vue-next'

// Official SVGs imported directly from assets
import k8sSvg from '../../assets/tech/kubernetes.svg'
import awsSvg from '../../assets/tech/aws.svg'
import tfSvg from '../../assets/tech/terraform.svg'
import dockerSvg from '../../assets/tech/docker.svg'
import linuxSvg from '../../assets/tech/linux.svg'
import bashSvg from '../../assets/tech/bash.svg'
import ghSvg from '../../assets/tech/githubactions.svg'
import argoSvg from '../../assets/tech/argocd.svg'
import promSvg from '../../assets/tech/prometheus.svg'
import grafSvg from '../../assets/tech/grafana.svg'
import nodeSvg from '../../assets/tech/nodejs.svg'
import pySvg from '../../assets/tech/python.svg'
import jenkinsSvg from '../../assets/tech/jenkins.svg'

const store = useWindowStore()

// Language State: 'pt' | 'en'
const currentLang = ref<'pt' | 'en'>('pt')
const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'pt' ? 'en' : 'pt'
}

// Browser Chrome State
const browserUrl = ref('https://bernos.com.br')
const isReloading = ref(false)
const copiedUrl = ref(false)
const copiedEmail = ref(false)

const handleReload = () => {
  isReloading.value = true
  setTimeout(() => {
    isReloading.value = false
  }, 600)
}

const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(browserUrl.value)
    copiedUrl.value = true
    setTimeout(() => {
      copiedUrl.value = false
    }, 2000)
  } catch {
    copiedUrl.value = true
    setTimeout(() => (copiedUrl.value = false), 2000)
  }
}

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText('bernardo.villasantana@gmail.com')
    copiedEmail.value = true
    setTimeout(() => {
      copiedEmail.value = false
    }, 2000)
  } catch {
    copiedEmail.value = true
    setTimeout(() => (copiedEmail.value = false), 2000)
  }
}

const openMailApp = () => {
  store.openWindow('mail')
}

// ==========================================
// VERTICAL SECTION SLIDE ENGINE (11 SLIDES)
// ==========================================
// Slides: Hero (0), Stack (1), 2021..2026 (2..7), Cases (8), Education (9), Contact (10)
const sectionIds = [
  'hero',
  'stack',
  'flow-2021',
  'flow-2022',
  'flow-2023',
  'flow-2024',
  'flow-2025',
  'flow-2026',
  'cases',
  'education',
  'contact'
]

const activeSectionIndex = ref(0)
const activeSection = computed(() => sectionIds[activeSectionIndex.value])

const scrollToSectionIndex = (index: number) => {
  if (index < 0 || index >= sectionIds.length) return
  activeSectionIndex.value = index
}

const nextSection = () => {
  if (activeSectionIndex.value < sectionIds.length - 1) {
    scrollToSectionIndex(activeSectionIndex.value + 1)
  }
}

const prevSection = () => {
  if (activeSectionIndex.value > 0) {
    scrollToSectionIndex(activeSectionIndex.value - 1)
  }
}

// Wheel momentum suppression: 1 gesture = exactly 1 section transition
let isLocked = false
let unlockTimeout: ReturnType<typeof setTimeout> | null = null

const handleWheel = (e: WheelEvent) => {
  e.preventDefault()

  if (isLocked) {
    if (unlockTimeout) clearTimeout(unlockTimeout)
    unlockTimeout = setTimeout(() => {
      isLocked = false
    }, 220)
    return
  }

  if (Math.abs(e.deltaY) < 15) return

  isLocked = true

  if (e.deltaY > 0) {
    nextSection()
  } else {
    prevSection()
  }

  if (unlockTimeout) clearTimeout(unlockTimeout)
  unlockTimeout = setTimeout(() => {
    isLocked = false
  }, 750)
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
    e.preventDefault()
    nextSection()
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault()
    prevSection()
  }
}

let touchStartY = 0
let touchStartTime = 0

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length > 0) {
    touchStartY = e.touches[0].clientY
    touchStartTime = Date.now()
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  if (e.changedTouches.length === 0) return
  const touchEndY = e.changedTouches[0].clientY
  const deltaY = touchStartY - touchEndY
  const duration = Date.now() - touchStartTime

  if (Math.abs(deltaY) > 45 && duration < 600) {
    if (deltaY > 0) {
      nextSection()
    } else {
      prevSection()
    }
  }
}

// ==========================================
// TECH STACK SHOWCASE (COMPACT, CRISP & BALANCED)
// ==========================================
interface TechItem {
  name: string
  category: string
  description: string
  icon: string
}

const techItems = computed<TechItem[]>(() => {
  const isPt = currentLang.value === 'pt'
  return [
    {
      name: 'Kubernetes',
      category: isPt ? 'Orquestração' : 'Orchestration',
      description: isPt
        ? 'Operação diária de clusters em produção, manifests declarativos, pods e ingress.'
        : 'Daily production cluster management, manifests, pods, and runtime resilience.',
      icon: k8sSvg
    },
    {
      name: 'AWS Cloud',
      category: isPt ? 'Nuvem' : 'Cloud Infra',
      description: isPt
        ? 'EC2, EKS, VPC, S3, IAM Identity Center, Route 53 e CloudWatch.'
        : 'Full cloud architecture with EC2, EKS, VPC, S3, IAM, and CloudWatch.',
      icon: awsSvg
    },
    {
      name: 'Terraform',
      category: 'IaC Modular',
      description: isPt
        ? 'Módulos reutilizáveis, automação declarativa e controle de tfstate remoto no S3.'
        : 'Modular reusable IaC templates and safe remote S3 tfstate locks.',
      icon: tfSvg
    },
    {
      name: 'Docker',
      category: 'Containers',
      description: isPt
        ? 'Builds multi-stage, padronização de imagens e Docker Compose.'
        : 'Lightweight multi-stage builds and Docker Compose developer environments.',
      icon: dockerSvg
    },
    {
      name: 'Linux',
      category: isPt ? 'Sistema Operacional' : 'OS & Hardening',
      description: isPt
        ? 'Debian, Arch / CachyOS, administração via terminal, systemd e redes.'
        : 'Debian, Arch / CachyOS, terminal administration, systemd, and networking.',
      icon: linuxSvg
    },
    {
      name: 'Bash Scripting',
      category: isPt ? 'Automação' : 'Automation',
      description: isPt
        ? 'Scripts de rotinas, sanitização de dados e ferramentas CLI.'
        : 'Automated maintenance routines, helper scripts, and CLI utilities.',
      icon: bashSvg
    },
    {
      name: 'GitHub Actions',
      category: 'CI/CD Pipelines',
      description: isPt
        ? 'Workflows reutilizáveis, validação de segurança, build e deploy.'
        : 'Reusable corporate workflows, security scanning, lint, and deploy.',
      icon: ghSvg
    },
    {
      name: 'ArgoCD',
      category: 'GitOps Delivery',
      description: isPt
        ? 'Sincronização contínua declarativa entre Git e clusters Kubernetes.'
        : 'Declarative GitOps sync between Git and live Kubernetes clusters.',
      icon: argoSvg
    },
    {
      name: 'Prometheus',
      category: isPt ? 'Métricas' : 'Metrics',
      description: isPt
        ? 'Coleta em série temporal, saúde de pods e regras ativas de alerta.'
        : 'Time-series metric scraping, pod telemetry, and proactive alert rules.',
      icon: promSvg
    },
    {
      name: 'Grafana',
      category: isPt ? 'Observabilidade' : 'Observability',
      description: isPt
        ? 'Dashboards em tempo real para monitoramento de infraestrutura.'
        : 'Interactive infrastructure dashboards and operational system telemetries.',
      icon: grafSvg
    },
    {
      name: 'Node.js',
      category: 'APIs & Backend',
      description: isPt
        ? 'APIs RESTful e GraphQL performáticas conectadas a microsserviços.'
        : 'Performant RESTful and GraphQL API services for cloud microservices.',
      icon: nodeSvg
    },
    {
      name: 'Python',
      category: isPt ? 'Scripts & Cloud' : 'Scripts & Cloud',
      description: isPt
        ? 'Scripts operacionais, AWS boto3 SDK e manipulação de infraestrutura.'
        : 'Cloud automation scripts and AWS boto3 SDK infrastructure tooling.',
      icon: pySvg
    }
  ]
})

// ==========================================
// CAREER JOURNEY DATA (2021 — 2026)
// ==========================================
interface CareerContactItem {
  name: string
  desc: string
  icon: string
}

interface FlowNode {
  id: string
  year: string
  step: string
  role: string
  company: string
  location: string
  period: string
  tag: string
  isCurrent?: boolean
  description: string
  stackItems: CareerContactItem[]
}

const flowchartNodes = computed<FlowNode[]>(() => {
  const isPt = currentLang.value === 'pt'

  if (isPt) {
    return [
      {
        id: 'flow-2021',
        year: '2021',
        step: '01',
        role: 'DevOps Developer',
        company: 'FL Group - Tech',
        location: 'Rio Claro, SP',
        period: 'Dez 2021 — Nov 2022',
        tag: 'Primeiro Emprego em Tecnologia',
        description:
          'Primeira oportunidade profissional na área de tecnologia, iniciando diretamente como DevOps. Administração de servidores Linux, criação de imagens Docker, esteiras CI/CD com Jenkins e primeiros recursos na nuvem AWS (EC2 e S3).',
        stackItems: [
          { name: 'Docker & Containers', desc: 'Construção de Dockerfiles e ambientes isolados.', icon: dockerSvg },
          { name: 'Jenkins CI', desc: 'Construção de esteiras automatizadas de integração contínua.', icon: jenkinsSvg },
          { name: 'AWS Cloud (EC2, S3)', desc: 'Provisionamento de instâncias, storage e IAM na nuvem.', icon: awsSvg },
          { name: 'Servidores Linux', desc: 'Administração de sistemas Debian/Ubuntu via linha de comando.', icon: linuxSvg }
        ]
      },
      {
        id: 'flow-2022',
        year: '2022',
        step: '02',
        role: 'DevOps Engineer',
        company: 'EZOps.cloud',
        location: 'Remoto',
        period: 'Nov 2022 — Abr 2023',
        tag: 'Contrato Internacional',
        description:
          'Atuação remota para equipes nos Estados Unidos, alinhando requisitos técnicos diretamente com clientes globais em inglês. Automação de infraestrutura em nuvem AWS utilizando Terraform e CloudFormation, segurança IAM e redes VPC.',
        stackItems: [
          { name: 'Terraform (IaC Modular)', desc: 'Infraestrutura como Código com tfstate remoto seguro no S3.', icon: tfSvg },
          { name: 'AWS VPC & Networking', desc: 'Subnets públicas/privadas, route tables e security groups.', icon: awsSvg },
          { name: 'Bash Scripting', desc: 'Scripts de validação e bootstrap de instâncias.', icon: bashSvg }
        ]
      },
      {
        id: 'flow-2023',
        year: '2023',
        step: '03',
        role: 'DevOps Freelancer',
        company: 'Cliente dos EUA',
        location: 'Remoto',
        period: 'Abr 2023 — Dez 2023',
        tag: 'Kubernetes & GitOps',
        description:
          'Sustentação de infraestrutura em nuvem para operação internacional remota. Operação de clusters Kubernetes (EKS), manifests declarativos, rollouts controlados com ArgoCD e monitoramento em tempo real com Prometheus e Grafana.',
        stackItems: [
          { name: 'Kubernetes (EKS)', desc: 'Orquestração de pods, services, ingress e resolução de incidentes.', icon: k8sSvg },
          { name: 'ArgoCD (GitOps)', desc: 'Sincronização contínua declarativa de estado do Git ao cluster.', icon: argoSvg },
          { name: 'Prometheus', desc: 'Coleta em série temporal e métricas de pods sob carga.', icon: promSvg },
          { name: 'Grafana Dashboards', desc: 'Painéis em tempo real de saúde dos nós e microsserviços.', icon: grafSvg }
        ]
      },
      {
        id: 'flow-2024',
        year: '2024',
        step: '04',
        role: 'Full Stack → DevOps Jr',
        company: 'Yeb Inteligência de Mercado',
        location: 'Híbrido',
        period: 'Jan 2024 — Dez 2024',
        tag: 'Full Stack & Cloud',
        description:
          'Desenvolvimento de APIs com Node.js e GraphQL integrado à sustentação de serviços na AWS (ECS Fargate). Conquista do 1º Lugar na XX Maratona FHO de Programação.',
        stackItems: [
          { name: 'Node.js & GraphQL', desc: 'APIs performáticas integradas a microsserviços.', icon: nodeSvg },
          { name: 'AWS ECS Fargate', desc: 'Containers serverless gerenciados e balanceamento de carga.', icon: awsSvg },
          { name: 'Python Scripts', desc: 'Automações auxiliares para migração e rotinas de backend.', icon: pySvg }
        ]
      },
      {
        id: 'flow-2025',
        year: '2025',
        step: '05',
        role: 'DevOps Pleno',
        company: 'Yeb Inteligência de Mercado',
        location: 'Híbrido',
        period: 'Jan 2025 — Out 2026',
        tag: 'Promoção a Pleno & Graduação',
        description:
          'Promoção para DevOps Pleno. Padronização de esteiras de CI/CD no GitHub Actions com workflows reutilizáveis, governança e otimização de recursos AWS, e conclusão do Bacharelado em Sistemas de Informação na FHO.',
        stackItems: [
          { name: 'GitHub Actions Reutilizáveis', desc: 'Workflows padronizados corporativos de build, lint e deploy.', icon: ghSvg },
          { name: 'Governança AWS', desc: 'Otimização de NAT Gateways, VPC Endpoints e controle de acessos.', icon: awsSvg },
          { name: 'IaC em Produção', desc: 'Módulos Terraform refinados com isolamento de ambientes.', icon: tfSvg }
        ]
      },
      {
        id: 'flow-2026',
        year: '2026',
        step: '06',
        role: 'Analista DevOps',
        company: 'Casa do Construtor',
        location: 'Rio Claro, SP / Híbrido',
        period: 'Out 2026 — Atual',
        tag: 'Em Andamento / Atual',
        isCurrent: true,
        description:
          'Atuação em andamento como Analista DevOps. Foco na sustentação da infraestrutura em nuvem, esteiras de automação e Kubernetes.',
        stackItems: [
          { name: 'Kubernetes Corporativo', desc: 'Operação diária de clusters e estabilidade de serviços.', icon: k8sSvg },
          { name: 'Esteiras de Automação', desc: 'Manutenção e evolução de pipelines contínuas.', icon: ghSvg },
          { name: 'Nuvem & Infraestrutura', desc: 'Monitoramento contínuo e sustentação de ambientes.', icon: awsSvg }
        ]
      }
    ]
  } else {
    return [
      {
        id: 'flow-2021',
        year: '2021',
        step: '01',
        role: 'DevOps Developer',
        company: 'FL Group - Tech',
        location: 'Rio Claro, SP - Brazil',
        period: 'Dec 2021 — Nov 2022',
        tag: 'First Professional Tech Role',
        description:
          'First professional opportunity in technology, starting directly as DevOps. Linux server administration, Docker containerization, Jenkins CI/CD pipelines, and initial cloud resources on AWS (EC2 and S3).',
        stackItems: [
          { name: 'Docker & Containers', desc: 'Building Dockerfiles and isolated runtime environments.', icon: dockerSvg },
          { name: 'Jenkins CI', desc: 'Automated integration and continuous delivery pipelines.', icon: jenkinsSvg },
          { name: 'AWS Cloud (EC2, S3)', desc: 'Cloud server provisioning, storage buckets, and IAM.', icon: awsSvg },
          { name: 'Linux Systems', desc: 'Debian/Ubuntu terminal administration and shell scripts.', icon: linuxSvg }
        ]
      },
      {
        id: 'flow-2022',
        year: '2022',
        step: '02',
        role: 'DevOps Engineer',
        company: 'EZOps.cloud',
        location: 'Remote',
        period: 'Nov 2022 — Apr 2023',
        tag: 'International Contract',
        description:
          'Remote contract working with teams based in the United States, collaborating directly in English. Automated AWS cloud infrastructure using Terraform and CloudFormation, IAM security, and VPC networking.',
        stackItems: [
          { name: 'Terraform (Modular IaC)', desc: 'Infrastructure as Code with safe remote S3 state locks.', icon: tfSvg },
          { name: 'AWS VPC & Networking', desc: 'Public/private subnets, routing tables, and security groups.', icon: awsSvg },
          { name: 'Bash Scripting', desc: 'Instance initialization and environment automation scripts.', icon: bashSvg }
        ]
      },
      {
        id: 'flow-2023',
        year: '2023',
        step: '03',
        role: 'DevOps Freelancer',
        company: 'US Client',
        location: 'Remote',
        period: 'Apr 2023 — Dec 2023',
        tag: 'Kubernetes & GitOps',
        description:
          'Cloud infrastructure operations for remote international production. Running Kubernetes (EKS) clusters, declarative manifests, controlled deployments with ArgoCD, and real-time observability with Prometheus and Grafana.',
        stackItems: [
          { name: 'Kubernetes (EKS)', desc: 'Orchestrating pods, services, ingress, and production troubleshooting.', icon: k8sSvg },
          { name: 'ArgoCD (GitOps)', desc: 'Continuous declarative synchronization from Git to Kubernetes.', icon: argoSvg },
          { name: 'Prometheus', desc: 'Time-series metric collection and pod telemetry under load.', icon: promSvg },
          { name: 'Grafana Dashboards', desc: 'Real-time observability panels for nodes and microservices.', icon: grafSvg }
        ]
      },
      {
        id: 'flow-2024',
        year: '2024',
        step: '04',
        role: 'Full Stack → DevOps Jr',
        company: 'Yeb Market Intelligence',
        location: 'Hybrid',
        period: 'Jan 2024 — Dec 2024',
        tag: 'Full Stack & Cloud',
        description:
          'Node.js and GraphQL API development tied with cloud maintenance on AWS (ECS Fargate). Won 1st Place in the XX FHO Programming Marathon.',
        stackItems: [
          { name: 'Node.js & GraphQL', desc: 'High-throughput APIs designed for cloud microservices.', icon: nodeSvg },
          { name: 'AWS ECS Fargate', desc: 'Serverless containers behind application load balancers.', icon: awsSvg },
          { name: 'Python Scripts', desc: 'Backend routine tooling and data automation scripts.', icon: pySvg }
        ]
      },
      {
        id: 'flow-2025',
        year: '2025',
        step: '05',
        role: 'DevOps Pleno',
        company: 'Yeb Market Intelligence',
        location: 'Hybrid',
        period: 'Jan 2025 — Oct 2026',
        tag: 'Promotion & Degree Completion',
        description:
          'Promoted to DevOps Pleno. Standardized CI/CD pipelines in GitHub Actions with reusable workflows, cloud governance and resource optimization on AWS, and completed the Bachelor in Information Systems at FHO.',
        stackItems: [
          { name: 'Reusable GitHub Actions', desc: 'Standardized workflows for build, lint, and automated delivery.', icon: ghSvg },
          { name: 'AWS Governance', desc: 'NAT Gateway optimizations, VPC Endpoints, and access policies.', icon: awsSvg },
          { name: 'Production IaC', desc: 'Refined Terraform modules with strict environment segregation.', icon: tfSvg }
        ]
      },
      {
        id: 'flow-2026',
        year: '2026',
        step: '06',
        role: 'DevOps Analyst',
        company: 'Casa do Construtor',
        location: 'Rio Claro, SP / Hybrid',
        period: 'Oct 2026 — Present',
        tag: 'Current / Ongoing',
        isCurrent: true,
        description:
          'Current ongoing role as DevOps Analyst. Focused on cloud infrastructure maintenance, automation pipelines, and Kubernetes.',
        stackItems: [
          { name: 'Enterprise Kubernetes', desc: 'Daily cluster management and service reliability.', icon: k8sSvg },
          { name: 'Automation Pipelines', desc: 'Evolving and maintaining continuous deployment pipelines.', icon: ghSvg },
          { name: 'Cloud Infrastructure', desc: 'Continuous monitoring and cloud resilience engineering.', icon: awsSvg }
        ]
      }
    ]
  }
})

// ==========================================
// TRANSLATION DICTIONARY (UI & LABELS)
// ==========================================
const t = computed(() => {
  const isPt = currentLang.value === 'pt'
  if (isPt) {
    return {
      tabTitle: 'Bernardo Villanova · DevOps at Casa do Construtor',
      role: 'DevOps at Casa do Construtor',
      badge: 'Rio Claro, SP · DevOps & Cloud Native',
      bio: 'Sou o Bernardo, um carinha apaixonado por tecnologia, Kubernetes, AWS, bons livros, filmes e muito café!',
      heroFocusTag: 'Foco de Atuação',
      heroFocusText: 'Kubernetes, AWS, Terraform (IaC) e Automação de CI/CD.',
      ctaContact: 'Entrar em Contato',
      navHome: 'Início',
      navStack: 'Tecnologias',
      navCases: 'Projetos & Feitos',
      navEducation: 'Formação & Prêmios',
      navContact: 'Contato',
      stackCategoryPrefix: '// 02 · STACK TÉCNICO',
      stackTitle: 'O que utilizo no meu dia a dia',
      stackSubtitle:
        'Ferramentas e tecnologias que utilizo na prática para construir e manter sistemas estáveis, escaláveis e automatizados.',
      careerTitle: 'Minha Carreira',
      careerSubtitle:
        'A cada rolagem, a linha do tempo avança um ano destacando as tecnologias introduzidas e o contexto real de cada etapa.',
      techIntroduced: 'Tecnologias & Ferramentas Introduzidas em',
      scrollIndicator: 'Role para navegar pela história',
      scrollDownFromHero: 'Role para ver Tecnologias',
      scrollDownFromStack: 'Role para ver Minha Carreira',
      finopsCategoryPrefix: '// 03 · PROJETOS & FEITOS',
      finopsTitle: 'Projetos & Feitos',
      finopsSubtitle: 'Aplicações em produção, trabalho de conclusão de curso (TCC) e engenharia de nuvem.',
      caseTccTitle: 'TCC: Plataforma Fitness (fitness-front & fitness-back)',
      caseTccDesc:
        'Plataforma full-stack de gestão e acompanhamento físico para academias desenvolvida como Trabalho de Conclusão de Curso (TCC) no Bacharelado em Sistemas de Informação. Permite criação de fichas estruturadas com divisões musculares e acompanhamento de evolução dos alunos. SPA desacoplada consumindo API REST conteinerizada.',
      case1Title: 'Otimização na AWS: Roteamento Inteligente & Custos',
      case1Desc:
        'Eliminação de cobranças desnecessárias de tráfego em NAT Gateways com VPC Gateway Endpoints para S3 e DynamoDB, rightsizing de instâncias e desligamento de ambientes de teste fora do expediente.',
      case2Title: 'bernOS: Desktop Web Eficiente',
      case2Desc:
        'Este sistema operacional web roda na AWS consumindo recursos mínimos com runtime Bun, protegido e distribuído via Cloudflare CDN na borda com HTTPS e DNS seguro.',
      eduCategoryPrefix: '// 04 · FORMAÇÃO ACADÊMICA & CONQUISTAS',
      eduTitle: 'Educação & Prêmios Técnicos',
      eduLinuxSchool: 'LINUXtips',
      eduLinuxPeriod: 'Out 2025',
      eduLinuxTitle: 'Certificação Linux Admin',
      eduLinuxDesc:
        'Administração sólida de sistemas GNU/Linux em ambientes de produção, processos, systemd, particionamento, permissões POSIX, redes e automação de servidores.',
      eduLinuxPhotoCaption: 'Com Jeferson Fernando (Fundador do LINUXtips)',
      eduLinuxPhotoTag: 'LINUXtips Local Brasil · São Paulo',
      edu1School: 'FHO - Fundação Hermínio Ometto',
      edu1Period: '2021 — 2025',
      edu1Title: 'Bacharelado em Sistemas de Informação',
      edu1Desc:
        'Graduação concluída em Dezembro de 2025. Sólida fundamentação em redes de computadores, arquitetura de sistemas distribuídos, banco de dados e algoritmos.',
      edu2School: 'Maratona de Programação FHO',
      edu2Period: '2024',
      edu2Title: '1º Lugar (4º Ano) & 3º Lugar Geral',
      edu2Desc:
        'Resolução de desafios complexos sob limite de tempo e memória. Demonstração prática de raciocínio lógico rápido e algoritmos.',
      contactCategoryPrefix: '// 05 · CONTATO DIRETO',
      chatTitle: 'Vamos bater um papo?',
      chatSubtitle: 'Seja para falar sobre Kubernetes, infraestrutura corporativa, livros, filmes ou café.',
      copyBtn: 'Copiar E-mail',
      copiedBtn: 'E-mail Copiado!',
      openMailBtn: 'Enviar Mensagem',
      dailySetup: 'Daily Driver:',
      constructionTitle: 'OPERAÇÃO ATIVA & EM ANDAMENTO',
      constructionSubtitle: 'Sustentação contínua da infraestrutura na Casa do Construtor'
    }
  } else {
    return {
      tabTitle: 'Bernardo Villanova · DevOps at Casa do Construtor',
      role: 'DevOps at Casa do Construtor',
      badge: 'Rio Claro, SP · DevOps & Cloud Native',
      bio: "I'm Bernardo, a tech enthusiast passionate about Kubernetes, AWS, good books, movies, and a lot of coffee!",
      heroFocusTag: 'Core Focus',
      heroFocusText: 'Kubernetes, AWS, Terraform (IaC), and CI/CD Automation.',
      ctaContact: 'Contact Me',
      navHome: 'Home',
      navStack: 'Technologies',
      navCases: 'Projects & Achievements',
      navEducation: 'Education & Awards',
      navContact: 'Contact',
      stackCategoryPrefix: '// 02 · TECH STACK',
      stackTitle: 'What I use on a daily basis',
      stackSubtitle:
        'Production tools and technologies I master to build reliable, scalable, and automated cloud infrastructure.',
      careerTitle: 'Career Journey',
      careerSubtitle:
        'With each scroll, the timeline advances one year highlighting real engineering contexts and mastered tooling.',
      techIntroduced: 'Technologies & Tools Introduced in',
      scrollIndicator: 'Scroll to navigate timeline',
      scrollDownFromHero: 'Scroll to view Technologies',
      scrollDownFromStack: 'Scroll to view Career Journey',
      finopsCategoryPrefix: '// 03 · PROJECTS & ACHIEVEMENTS',
      finopsTitle: 'Projects & Achievements',
      finopsSubtitle: 'Production systems, university capstone project (TCC), and cloud architecture.',
      caseTccTitle: 'Capstone: Fitness Platform (fitness-front & fitness-back)',
      caseTccDesc:
        'Full-stack fitness management and workout tracking platform engineered as University Capstone (TCC) for the B.S. in Information Systems. Empowers personal trainers to design custom workout divisions and track student athletic progress. Decoupled Vue.js SPA consuming a containerized Node.js/MongoDB REST API.',
      case1Title: 'AWS Optimization: Smart Routing & Cost Hygiene',
      case1Desc:
        'Eliminating excess NAT Gateway data processing costs using VPC Gateway Endpoints for S3 and DynamoDB, RDS rightsizing, and automated instance shutdowns outside work hours.',
      case2Title: 'bernOS: Lightweight Web Desktop',
      case2Desc:
        'This desktop web operating system runs on AWS with minimal memory overhead powered by Bun runtime, protected and delivered globally through Cloudflare Edge CDN with HTTPS and DNS.',
      eduCategoryPrefix: '// 04 · ACADEMIC BACKGROUND & AWARDS',
      eduTitle: 'Education & Technical Awards',
      eduLinuxSchool: 'LINUXtips',
      eduLinuxPeriod: 'Oct 2025',
      eduLinuxTitle: 'Linux Admin Certification',
      eduLinuxDesc:
        'Enterprise-grade GNU/Linux administration, automation, systemd lifecycle, POSIX networking, permissions, and production server operations.',
      eduLinuxPhotoCaption: 'With Jeferson Fernando (LINUXtips Founder)',
      eduLinuxPhotoTag: 'LINUXtips Local Brasil · São Paulo',
      edu1School: 'FHO - Hermínio Ometto University',
      edu1Period: '2021 — 2025',
      edu1Title: 'Bachelor of Science in Information Systems',
      edu1Desc:
        'Graduated in December 2025. Solid foundation in computer networking, distributed systems architecture, databases, and algorithms.',
      edu2School: 'FHO Programming Marathon',
      edu2Period: '2024',
      edu2Title: '1st Place (Senior Year) & 3rd Place Overall',
      edu2Desc:
        'Solved algorithmic challenges under strict memory and time limits. Demonstrated swift analytical logic and debugging.',
      contactCategoryPrefix: '// 05 · DIRECT CONTACT',
      chatTitle: "Let's connect?",
      chatSubtitle:
        'Whether to talk about Kubernetes, cloud infrastructure, share book recommendations, movies, or coffee.',
      copyBtn: 'Copy Email',
      copiedBtn: 'Email Copied!',
      openMailBtn: 'Send Message',
      dailySetup: 'Daily Driver:',
      constructionTitle: 'ACTIVE OPERATION & ONGOING',
      constructionSubtitle: 'Continuous infrastructure operations at Casa do Construtor'
    }
  }
})

// Navigation bookmark tabs
const navBookmarks = computed(() => [
  { id: 'hero', label: t.value.navHome, targetIndex: 0 },
  { id: 'stack', label: t.value.navStack, targetIndex: 1 },
  { id: 'flow-2021', label: '2021 (FL Group)', targetIndex: 2 },
  { id: 'flow-2022', label: '2022 (EZOps)', targetIndex: 3 },
  { id: 'flow-2023', label: '2023 (Freelance)', targetIndex: 4 },
  { id: 'flow-2024', label: '2024 (Yeb)', targetIndex: 5 },
  { id: 'flow-2025', label: '2025 (Pleno)', targetIndex: 6 },
  { id: 'flow-2026', label: '2026 (Casa do Construtor)', targetIndex: 7 },
  { id: 'cases', label: t.value.navCases, targetIndex: 8 },
  { id: 'education', label: t.value.navEducation, targetIndex: 9 },
  { id: 'contact', label: t.value.navContact, targetIndex: 10 }
])
</script>

<template>
  <div
    class="w-full h-full font-sans flex flex-col overflow-hidden select-text relative outline-none transition-colors duration-300"
    :class="store.theme === 'light' ? 'bg-[#fbfbfd] text-zinc-900' : 'bg-[#0a0a0d] text-zinc-200'"
    tabindex="0"
    @keydown="handleKeyDown"
  >
    <!-- ========================================== -->
    <!-- BROWSER CHROME (Safari / Arc Style)        -->
    <!-- ========================================== -->
    <header
      class="border-b flex flex-col shrink-0 select-none z-40 transition-colors duration-300"
      :class="store.theme === 'light' ? 'bg-[#f5f5f7] border-black/[0.1]' : 'bg-[#101117] border-white/[0.08]'"
    >
      <!-- Top Tab Strip -->
      <div
        class="h-9 px-3 flex items-center justify-between border-b"
        :class="store.theme === 'light' ? 'border-black/[0.06]' : 'border-white/[0.04]'"
      >
        <div class="flex items-center gap-1.5 h-full pt-1">
          <div
            class="h-8 px-3.5 rounded-t-lg border-t border-x flex items-center gap-2 text-xs font-medium shadow-xs"
            :class="store.theme === 'light'
              ? 'bg-white text-zinc-900 border-black/10'
              : 'bg-[#171822] text-zinc-100 border-white/10'"
          >
            <Globe class="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span class="truncate max-w-[280px]">{{ t.tabTitle }}</span>
          </div>
        </div>

        <!-- Language Switcher Icon -->
        <div class="flex items-center gap-3">
          <button
            @click="toggleLanguage"
            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition cursor-pointer font-mono"
            :class="store.theme === 'light'
              ? 'bg-black/[0.05] hover:bg-black/[0.1] border border-black/10 text-zinc-800'
              : 'bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-200'"
            :title="currentLang === 'pt' ? 'Mudar para Inglês' : 'Switch to Portuguese'"
          >
            <span>{{ currentLang === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN' }}</span>
            <span class="text-[10px]" :class="store.theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'">| {{ currentLang === 'pt' ? 'Mudar p/ EN' : 'Switch to PT' }}</span>
          </button>
        </div>
      </div>

      <!-- Navigation & Omnibar -->
      <div
        class="h-11 px-3 sm:px-4 flex items-center gap-2 sm:gap-3"
        :class="store.theme === 'light' ? 'bg-[#f0f0f3]' : 'bg-[#13141c]'"
      >
        <div
          class="flex items-center gap-1 shrink-0"
          :class="store.theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'"
        >
          <button
            class="p-1.5 rounded-md transition cursor-pointer"
            :class="store.theme === 'light' ? 'hover:bg-black/10 hover:text-zinc-900' : 'hover:bg-white/10 hover:text-zinc-100'"
            title="Seção Anterior"
            @click="prevSection"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <button
            class="p-1.5 rounded-md transition cursor-pointer"
            :class="store.theme === 'light' ? 'hover:bg-black/10 hover:text-zinc-900' : 'hover:bg-white/10 hover:text-zinc-100'"
            title="Próxima Seção"
            @click="nextSection"
          >
            <ArrowRight class="w-4 h-4" />
          </button>
          <button
            class="p-1.5 rounded-md transition cursor-pointer"
            :class="[
              store.theme === 'light' ? 'hover:bg-black/10 hover:text-zinc-900' : 'hover:bg-white/10 hover:text-zinc-100',
              isReloading ? 'text-sky-500' : ''
            ]"
            title="Recarregar"
            @click="handleReload"
          >
            <RotateCw class="w-4 h-4" :class="isReloading ? 'animate-spin' : ''" />
          </button>
          <button
            class="p-1.5 rounded-md transition cursor-pointer hidden md:flex"
            :class="store.theme === 'light' ? 'hover:bg-black/10 hover:text-zinc-900' : 'hover:bg-white/10 hover:text-zinc-100'"
            title="Ir para o topo"
            @click="scrollToSectionIndex(0)"
          >
            <Home class="w-4 h-4" />
          </button>
        </div>

        <!-- Address Bar Pill -->
        <div
          class="flex-grow flex items-center rounded-lg px-3 py-1.5 transition text-xs group"
          :class="store.theme === 'light'
            ? 'bg-white border border-black/15 shadow-2xs hover:border-black/25'
            : 'bg-[#191a24] hover:bg-[#1d1f2b] border border-white/[0.08] hover:border-white/[0.14]'"
        >
          <ShieldCheck class="w-3.5 h-3.5 text-emerald-500 shrink-0 mr-2" />
          <span class="text-emerald-600 font-mono text-[11px] select-none mr-0.5">https://</span>
          <span
            class="font-mono text-[11px] truncate flex-grow"
            :class="store.theme === 'light' ? 'text-zinc-900 font-medium' : 'text-zinc-100'"
          >bernos.com.br</span>
          <span
            class="font-mono text-[11px] hidden sm:inline mr-2"
            :class="store.theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'"
          >#{{ activeSection }}</span>

          <div class="flex items-center gap-1 shrink-0 ml-2">
            <button
              @click="copyUrl"
              class="p-1 rounded transition cursor-pointer flex items-center gap-1 text-[10px]"
              :class="store.theme === 'light' ? 'hover:bg-black/10 text-zinc-600' : 'hover:bg-white/10 text-zinc-400'"
              title="Copiar URL"
            >
              <Check v-if="copiedUrl" class="w-3.5 h-3.5 text-emerald-500" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span v-if="copiedUrl" class="text-emerald-500 font-sans hidden sm:inline">Copiado</span>
            </button>
            <button
              class="p-1 rounded hover:text-amber-500 transition cursor-pointer"
              :class="store.theme === 'light' ? 'hover:bg-black/10 text-zinc-500' : 'hover:bg-white/10 text-zinc-400'"
              title="Favoritar"
            >
              <Star class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Contact Button -->
        <div class="flex items-center gap-1 shrink-0">
          <button
            @click="openMailApp"
            class="px-3 py-1.5 rounded-md font-semibold transition text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
            :class="store.theme === 'light'
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'"
          >
            <Mail class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ t.ctaContact }}</span>
          </button>
        </div>
      </div>

      <!-- Quick Section Bookmarks Bar -->
      <nav
        class="h-8 px-4 border-t flex items-center gap-1.5 overflow-x-auto text-[11px] font-medium scrollbar-none"
        :class="store.theme === 'light' ? 'bg-[#e8e8eb] border-black/[0.06] text-zinc-600' : 'bg-[#0c0d12] border-white/[0.04] text-zinc-400'"
      >
        <button
          v-for="nav in navBookmarks"
          :key="nav.id"
          @click="scrollToSectionIndex(nav.targetIndex)"
          class="px-2.5 py-0.5 rounded-md transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
          :class="activeSectionIndex === nav.targetIndex
            ? (store.theme === 'light' ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-black/10' : 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30')
            : (store.theme === 'light' ? 'hover:bg-black/[0.05] hover:text-zinc-900' : 'hover:bg-white/[0.06] hover:text-zinc-200')"
        >
          <span>{{ nav.label }}</span>
        </button>
      </nav>
    </header>

    <!-- ========================================== -->
    <!-- FLOATING VERTICAL SLIDE INDICATOR (RIGHT)  -->
    <!-- ========================================== -->
    <div
      class="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center gap-2 backdrop-blur-md p-2 rounded-full border shadow-2xl transition-colors"
      :class="store.theme === 'light' ? 'bg-white/80 border-black/10' : 'bg-black/50 border-white/10'"
    >
      <button
        v-for="(id, idx) in sectionIds"
        :key="id"
        @click="scrollToSectionIndex(idx)"
        class="group relative flex items-center justify-center p-0.5 cursor-pointer transition-all duration-300"
        :title="id"
      >
        <span
          class="w-2.5 h-2.5 rounded-full transition-all duration-300"
          :class="activeSectionIndex === idx
            ? 'bg-amber-400 scale-125'
            : (store.theme === 'light' ? 'bg-black/20 hover:bg-black/50' : 'bg-white/20 hover:bg-white/50')"
        ></span>
        <span
          class="absolute right-7 px-2.5 py-1 rounded border text-[11px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg"
          :class="store.theme === 'light' ? 'bg-white border-black/10 text-zinc-800' : 'bg-zinc-900 border-white/10 text-zinc-300'"
        >
          {{ id }}
        </span>
      </button>
    </div>

    <!-- ========================================== -->
    <!-- SECTION-BY-SECTION FULLPAGE CONTAINER      -->
    <!-- ========================================== -->
    <div
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      class="flex-grow overflow-hidden relative z-10 h-full w-full select-text transition-colors duration-300"
      :class="store.theme === 'light' ? 'bg-[#fbfbfd]' : 'bg-[#0a0a0d]'"
    >
      <!-- Modern DotPattern Background Layer with Radial Mask -->
      <DotPattern
        :width="20"
        :height="20"
        :cx="1"
        :cy="1"
        :cr="1"
        class="opacity-30 [mask-image:radial-gradient(ellipse_at_center,white_35%,transparent_85%)]"
        :class="store.theme === 'light' ? 'fill-zinc-400' : 'fill-zinc-500'"
      />

      <!-- Parallax Ambient Depth Glows -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          class="absolute -top-32 left-1/4 w-[750px] h-[500px] rounded-full blur-[160px] transition-transform duration-700 ease-out"
          :class="store.theme === 'light' ? 'bg-amber-500/[0.04]' : 'bg-amber-500/[0.03]'"
          :style="{ transform: `translateY(${activeSectionIndex * -35}px)` }"
        ></div>
        <div
          class="absolute top-[45%] -right-20 w-[650px] h-[550px] rounded-full blur-[170px] transition-transform duration-700 ease-out"
          :class="store.theme === 'light' ? 'bg-sky-500/[0.03]' : 'bg-sky-500/[0.02]'"
          :style="{ transform: `translateY(${activeSectionIndex * 30}px)` }"
        ></div>
      </div>

      <!-- Slides Track -->
      <div
        class="w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform flex flex-col"
        :style="{ transform: `translateY(-${activeSectionIndex * 100}%)` }"
      >

        <!-- ========================================== -->
        <!-- SLIDE 0: HERO                              -->
        <!-- ========================================== -->
        <section
          id="hero"
          class="w-full h-full shrink-0 flex flex-col justify-start sm:justify-center px-6 sm:px-12 lg:px-16 py-6 sm:py-8 overflow-y-auto relative select-text"
        >
          <div
            class="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 transition-all duration-700 ease-out my-auto"
            :class="activeSectionIndex === 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-20 translate-y-6 scale-[0.98] pointer-events-none'"
          >
            <!-- Left Column: Bio & Identity -->
            <div class="lg:col-span-7 flex flex-col items-start gap-5">
              <div
                class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono tracking-wider"
                :class="store.theme === 'light' ? 'border-emerald-600/30 bg-emerald-50 text-emerald-700' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'"
              >
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{{ t.badge }}</span>
              </div>

              <div class="flex flex-col gap-1.5">
                <h1
                  class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight"
                  :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'"
                >
                  Bernardo Villanova de Santana
                </h1>
                <p
                  class="text-lg sm:text-xl font-medium font-mono flex items-center gap-2"
                  :class="store.theme === 'light' ? 'text-amber-600' : 'text-amber-300'"
                >
                  <span>{{ t.role }}</span>
                </p>
              </div>

              <!-- Authentic Bio -->
              <p
                class="text-sm sm:text-base leading-relaxed max-w-xl font-normal"
                :class="store.theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'"
              >
                {{ t.bio }}
              </p>

              <!-- Interest Chips -->
              <div class="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-medium">
                <span
                  class="px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-2xs"
                  :class="store.theme === 'light' ? 'bg-white border-zinc-200/90 text-zinc-800' : 'bg-white/[0.04] border-white/[0.08] text-zinc-300'"
                >
                  <Coffee class="w-4 h-4 text-amber-500" />
                  <span>{{ currentLang === 'pt' ? 'Muito Café' : 'Lots of Coffee' }}</span>
                </span>
                <span
                  class="px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-2xs"
                  :class="store.theme === 'light' ? 'bg-white border-zinc-200/90 text-zinc-800' : 'bg-white/[0.04] border-white/[0.08] text-zinc-300'"
                >
                  <BookOpen class="w-4 h-4 text-sky-500" />
                  <span>{{ currentLang === 'pt' ? 'Bons Livros' : 'Good Books' }}</span>
                </span>
                <span
                  class="px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-2xs"
                  :class="store.theme === 'light' ? 'bg-white border-zinc-200/90 text-zinc-800' : 'bg-white/[0.04] border-white/[0.08] text-zinc-300'"
                >
                  <Film class="w-4 h-4 text-purple-500" />
                  <span>{{ currentLang === 'pt' ? 'Filmes' : 'Movies' }}</span>
                </span>
                <span
                  class="px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-2xs"
                  :class="store.theme === 'light' ? 'bg-white border-zinc-200/90 text-zinc-800' : 'bg-white/[0.04] border-white/[0.08] text-zinc-300'"
                >
                  <img :src="k8sSvg" class="w-4 h-4 object-contain" alt="Kubernetes" />
                  <span>Kubernetes</span>
                </span>
                <span
                  class="px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-2xs"
                  :class="store.theme === 'light' ? 'bg-white border-zinc-200/90 text-zinc-800' : 'bg-white/[0.04] border-white/[0.08] text-zinc-300'"
                >
                  <img :src="awsSvg" class="w-4 h-4 object-contain" alt="AWS" />
                  <span>AWS Cloud</span>
                </span>
              </div>

              <!-- CTA (Apenas contato, limpo) -->
              <div class="flex items-center gap-3 pt-2">
                <button
                  @click="openMailApp"
                  class="px-6 py-3 rounded-xl border font-semibold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2.5 shadow-md"
                  :class="store.theme === 'light'
                    ? 'bg-amber-500 text-white hover:bg-amber-600 border-amber-600'
                    : 'bg-white/[0.07] hover:bg-white/[0.14] border-white/10 text-white'"
                >
                  <Mail class="w-4 h-4 text-amber-300" />
                  <span>{{ t.ctaContact }}</span>
                </button>
              </div>
            </div>

            <!-- Right Column: Bernardo at Google + Core Focus -->
            <div class="lg:col-span-5 flex flex-col gap-4">
              <!-- Photo Frame (Bernardo no Google com a estátua G visível) -->
              <div
                class="rounded-2xl border overflow-hidden shadow-2xl relative group transition-all"
                :class="store.theme === 'light' ? 'border-zinc-200/90 bg-white shadow-black/10' : 'border-white/10 bg-[#12131b] shadow-black/50'"
              >
                <div class="relative w-full aspect-[4/5] max-h-[350px] sm:max-h-[390px] overflow-hidden bg-black/5 flex items-center justify-center">
                  <img
                    src="/images/bern-google.png"
                    alt="Bernardo Villanova no Google Campus"
                    class="w-full h-full object-cover object-[center_38%] transition-transform duration-500 group-hover:scale-105"
                  />
                  <div class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 to-transparent pointer-events-none"></div>
                  <!-- Location / Context Pill -->
                  <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
                    <span class="font-mono text-[11px] font-medium px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20">
                      📍 Google Campus · São Paulo
                    </span>
                  </div>
                </div>
              </div>

              <!-- SOBER CARD COM FOCO -->
              <div
                class="rounded-2xl border p-4 sm:p-5 flex flex-col justify-center gap-2 shadow-lg backdrop-blur-md"
                :class="store.theme === 'light'
                  ? 'bg-white/95 border-zinc-200/90 text-zinc-900 shadow-md'
                  : 'bg-[#12131b]/95 border-white/10 text-white'"
              >
                <div class="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5" :class="store.theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'">
                  <span class="text-amber-500 font-bold">// </span>
                  <span>{{ t.heroFocusTag }}</span>
                </div>
                <p class="font-semibold text-sm sm:text-base leading-snug" :class="store.theme === 'light' ? 'text-zinc-900' : 'text-white'">
                  {{ t.heroFocusText }}
                </p>
              </div>
            </div>
          </div>

          <button
            @click="nextSection"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 transition text-xs cursor-pointer"
          >
            <span>{{ t.scrollDownFromHero }}</span>
            <ChevronDown class="w-4 h-4 animate-bounce" />
          </button>
        </section>

        <!-- ========================================== -->
        <!-- SLIDE 1: TECNOLOGIAS (COMPACTO & SEM CORTE)-->
        <!-- ========================================== -->
        <section
          id="stack"
          class="w-full h-full shrink-0 flex flex-col justify-start sm:justify-center px-6 sm:px-12 lg:px-16 py-4 sm:py-6 overflow-y-auto relative select-text"
        >
          <div
            class="w-full max-w-6xl mx-auto flex flex-col gap-3.5 sm:gap-4 relative z-10 transition-all duration-700 ease-out my-auto"
            :class="activeSectionIndex === 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-20 translate-y-6 scale-[0.98] pointer-events-none'"
          >
            <div class="flex flex-col gap-1 border-b pb-2.5" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/[0.08]'">
              <div class="text-[11px] font-mono uppercase tracking-wider font-semibold" :class="store.theme === 'light' ? 'text-amber-600' : 'text-amber-400'">
                {{ t.stackCategoryPrefix }}
              </div>
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
                {{ t.stackTitle }}
              </h2>
              <p class="text-xs sm:text-sm max-w-3xl leading-relaxed" :class="store.theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'">
                {{ t.stackSubtitle }}
              </p>
            </div>

            <!-- Responsive Grid: 1 column on mobile (no clipping), 2 cols on tablet, 4 cols on desktop -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
              <div
                v-for="item in techItems"
                :key="item.name"
                class="p-3 sm:p-3 rounded-xl border transition-all flex items-center sm:items-start gap-3 group shadow-2xs hover:shadow-sm"
                :class="store.theme === 'light'
                  ? 'bg-white border-zinc-200/90 hover:border-zinc-300 text-zinc-900'
                  : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20 text-white'"
              >
                <!-- Compact SVG Icon Container -->
                <div
                  class="w-10 h-10 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center p-2 sm:p-1.5 shrink-0 group-hover:scale-105 transition-transform"
                  :class="store.theme === 'light' ? 'bg-zinc-100 border border-zinc-200' : 'bg-black/50 border border-white/10'"
                >
                  <img :src="item.icon" class="w-full h-full object-contain" :alt="item.name" />
                </div>

                <div class="flex flex-col min-w-0 flex-grow">
                  <div class="flex items-center justify-between gap-1.5">
                    <span class="font-bold text-sm sm:text-sm truncate" :class="store.theme === 'light' ? 'text-zinc-950 group-hover:text-amber-600' : 'text-white group-hover:text-amber-300'">
                      {{ item.name }}
                    </span>
                    <span
                      class="text-[10px] sm:text-[9px] font-mono px-2 py-0.5 rounded shrink-0"
                      :class="store.theme === 'light' ? 'bg-zinc-100 text-zinc-600 border border-zinc-200' : 'bg-white/[0.05] text-zinc-400 border border-white/[0.06]'"
                    >
                      {{ item.category }}
                    </span>
                  </div>
                  <p class="text-xs sm:text-[11px] leading-snug line-clamp-2 mt-0.5" :class="store.theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-500">
              <span>{{ t.scrollDownFromStack }}</span>
              <ChevronDown class="w-3.5 h-3.5 animate-bounce" />
            </div>
          </div>
        </section>

        <!-- ======================================================= -->
        <!-- SLIDES 2 A 7: MINHA CARREIRA (2021 A 2026)              -->
        <!-- ======================================================= -->
        <section
          v-for="(node, nodeIdx) in flowchartNodes"
          :key="node.id"
          :id="node.id"
          class="w-full h-full shrink-0 flex flex-col justify-start sm:justify-center px-6 sm:px-12 lg:px-16 py-6 sm:py-8 overflow-y-auto relative select-text"
        >
          <div
            class="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 transition-all duration-700 ease-out my-auto"
            :class="activeSectionIndex === (nodeIdx + 2) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-20 translate-y-6 scale-[0.98] pointer-events-none'"
          >
            <!-- Mobile Stepper Pill (Compact, saves vertical screen space on mobile) -->
            <div
              class="sm:hidden flex items-center justify-between px-3.5 py-2.5 rounded-xl border shadow-2xs"
              :class="store.theme === 'light' ? 'bg-white border-zinc-200/90 text-zinc-900' : 'bg-white/[0.04] border-white/10 text-white'"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-6 h-6 rounded-full bg-amber-400 text-zinc-950 font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                  {{ node.step }}
                </span>
                <span class="font-mono font-bold text-sm" :class="store.theme === 'light' ? 'text-amber-600' : 'text-amber-400'">
                  {{ node.year }}
                </span>
                <span class="text-xs truncate max-w-[140px]" :class="store.theme === 'light' ? 'text-zinc-700 font-medium' : 'text-zinc-300'">
                  {{ node.role }}
                </span>
              </div>
              <span class="text-[10px] font-mono text-zinc-400 shrink-0 ml-2">
                {{ currentLang === 'pt' ? 'Etapa' : 'Step' }} {{ node.step }}/06
              </span>
            </div>

            <!-- Desktop Left Column: Stepper da Linha do Tempo (hidden on small mobile) -->
            <div class="hidden sm:flex lg:col-span-4 flex-col gap-4">
              <div class="flex flex-col gap-1 pb-3 border-b" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/[0.08]'">
                <div class="text-xs font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5" :class="store.theme === 'light' ? 'text-amber-600' : 'text-amber-400'">
                  <GitBranch class="w-4 h-4" />
                  <span>{{ t.careerTitle }}</span>
                </div>
                <div class="text-base font-bold" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
                  {{ currentLang === 'pt' ? 'Etapa' : 'Step' }} {{ node.step }} {{ currentLang === 'pt' ? 'de' : 'of' }} 06 · {{ node.year }}
                </div>
              </div>

              <!-- Rail Vertical com Conexões Nítidas -->
              <div class="flex flex-col pl-2 py-1">
                <div
                  v-for="(stepItem, sIdx) in flowchartNodes"
                  :key="stepItem.year"
                  class="flex flex-col"
                >
                  <div
                    @click="scrollToSectionIndex(sIdx + 2)"
                    class="flex items-center gap-3.5 py-1.5 cursor-pointer group"
                  >
                    <div
                      class="w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-all shrink-0"
                      :class="sIdx === nodeIdx
                        ? 'bg-amber-400 text-zinc-950 border-amber-300 scale-110 shadow-md font-extrabold'
                        : sIdx < nodeIdx
                        ? (store.theme === 'light' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40')
                        : (store.theme === 'light' ? 'bg-zinc-100 text-zinc-500 border-zinc-200 group-hover:text-zinc-900' : 'bg-white/[0.04] text-zinc-500 border-white/10 group-hover:text-zinc-300')"
                    >
                      <Check v-if="sIdx < nodeIdx" class="w-3.5 h-3.5 text-emerald-500" />
                      <span v-else>{{ stepItem.step }}</span>
                    </div>

                    <div class="flex items-center gap-2 text-sm">
                      <span
                        class="font-mono font-bold transition"
                        :class="sIdx === nodeIdx
                          ? (store.theme === 'light' ? 'text-amber-600' : 'text-amber-300')
                          : (store.theme === 'light' ? 'text-zinc-500' : 'text-zinc-400')"
                      >
                        {{ stepItem.year }}
                      </span>
                      <span
                        class="text-xs sm:text-sm truncate max-w-[200px]"
                        :class="sIdx === nodeIdx
                          ? (store.theme === 'light' ? 'text-zinc-950 font-bold' : 'text-white font-semibold')
                          : (store.theme === 'light' ? 'text-zinc-500' : 'text-zinc-500')"
                      >
                        {{ stepItem.role }}
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="sIdx < flowchartNodes.length - 1"
                    class="ml-3.5 w-0.5 h-3.5 transition-colors"
                    :class="sIdx < nodeIdx
                      ? (store.theme === 'light' ? 'bg-emerald-400' : 'bg-emerald-500/50')
                      : sIdx === nodeIdx ? 'bg-amber-400' : (store.theme === 'light' ? 'bg-zinc-200' : 'bg-white/10')"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Right Column: Card Detalhado do Ano -->
            <div
              class="lg:col-span-8 rounded-3xl border p-6 sm:p-9 flex flex-col justify-between relative overflow-hidden backdrop-blur-md shadow-2xl transition-colors"
              :class="store.theme === 'light'
                ? 'bg-white/95 border-zinc-200/90 text-zinc-900 shadow-xl'
                : 'bg-[#0e1017]/95 border-white/[0.1] text-zinc-100'"
            >
              <!-- Watermark Year Background -->
              <div
                class="absolute -right-3 -bottom-6 text-8xl sm:text-9xl font-black font-mono select-none pointer-events-none"
                :class="store.theme === 'light' ? 'text-black/[0.03]' : 'text-white/[0.03]'"
              >
                {{ node.year }}
              </div>

              <!-- ============================================== -->
              <!-- CASO ESPECÍFICO 2026: VISUAL MECÂNICO ENGRENAGEM -->
              <!-- ============================================== -->
              <div v-if="node.isCurrent" class="flex flex-col gap-5 relative z-10">
                <!-- Header Badge -->
                <div class="flex items-center justify-between border-b pb-3.5" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/[0.08]'">
                  <div class="flex items-center gap-2">
                    <span
                      class="text-xs font-mono font-bold px-2.5 py-1 rounded-md border"
                      :class="store.theme === 'light' ? 'text-amber-700 bg-amber-50 border-amber-300' : 'text-amber-400 bg-amber-400/10 border-amber-400/25'"
                    >
                      {{ node.year }}
                    </span>
                    <span class="text-xs font-mono" :class="store.theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'">· {{ node.period }}</span>
                  </div>

                  <span
                    class="text-xs font-mono px-3 py-1 rounded-full border flex items-center gap-1.5 font-semibold"
                    :class="store.theme === 'light' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'"
                  >
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {{ node.tag }}
                  </span>
                </div>

                <div class="flex flex-col gap-1">
                  <h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
                    {{ node.role }}
                  </h3>
                  <div class="text-sm sm:text-base font-mono font-semibold" :class="store.theme === 'light' ? 'text-amber-600' : 'text-amber-300'">
                    {{ node.company }}
                  </div>
                </div>

                <p class="text-sm sm:text-base leading-relaxed max-w-2xl" :class="store.theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'">
                  {{ node.description }}
                </p>

                <!-- PAINEL EM CONSTRUÇÃO / ENGRENAGEM GRANDE -->
                <div
                  class="relative w-full rounded-2xl border p-6 sm:p-7 overflow-hidden shadow-xl mt-2"
                  :class="store.theme === 'light'
                    ? 'bg-gradient-to-br from-amber-50/70 via-white to-sky-50/40 border-amber-300/80'
                    : 'bg-gradient-to-br from-[#12141f] to-[#0c0d14] border-amber-500/25'"
                >
                  <!-- Blueprint Grid Background -->
                  <div class="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                  <!-- Engrenagens Mecânicas Animadas Grandes -->
                  <div class="absolute -right-10 -bottom-10 pointer-events-none opacity-25 sm:opacity-35 flex items-center justify-center">
                    <svg class="w-56 h-56 sm:w-72 sm:h-72 text-amber-500 animate-[spin_24s_linear_infinite]" viewBox="0 0 100 100" fill="currentColor">
                      <circle cx="50" cy="50" r="16" fill="transparent" stroke="currentColor" stroke-width="4" />
                      <circle cx="50" cy="50" r="6" />
                      <path d="M47 4h6v12h-6zM47 84h6v12h-6zM4 47h12v6H4zM84 47h12v6H84zM19 19l4.5-4.5 8.5 8.5-4.5 4.5zM68 68l4.5-4.5 8.5 8.5-4.5 4.5zM19 81l4.5 4.5 8.5-8.5-4.5-4.5zM68 32l4.5 4.5 8.5-8.5-4.5-4.5z" />
                    </svg>
                    <svg class="w-32 h-32 sm:w-40 sm:h-40 text-sky-500 -ml-16 -mt-16 animate-[spin_12s_linear_infinite_reverse]" viewBox="0 0 100 100" fill="currentColor">
                      <circle cx="50" cy="50" r="12" fill="transparent" stroke="currentColor" stroke-width="3" />
                      <circle cx="50" cy="50" r="4" />
                      <path d="M46 6h8v10h-8zM46 84h8v10h-8zM6 46h10v8H6zM84 46h10v8H84zM20 20l6-6 7 7-6 6zM73 73l6-6 7 7-6 6zM20 80l6 6 7-7-6-6zM73 27l6 6 7-7-6-6z" />
                    </svg>
                  </div>

                  <!-- Conteúdo do Painel de Operação Ativa -->
                  <div class="relative z-10 flex flex-col gap-3">
                    <div
                      class="flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-wider"
                      :class="store.theme === 'light' ? 'text-amber-800' : 'text-amber-300'"
                    >
                      <Wrench class="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{{ t.constructionTitle }}</span>
                    </div>

                    <p class="text-xs sm:text-sm max-w-lg leading-relaxed" :class="store.theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'">
                      {{ t.constructionSubtitle }}
                    </p>

                    <!-- Badges com logos oficiais na Casa do Construtor -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                      <div
                        v-for="stk in node.stackItems"
                        :key="stk.name"
                        class="p-2.5 rounded-xl border flex items-center gap-2.5 backdrop-blur-xs"
                        :class="store.theme === 'light' ? 'bg-white/80 border-zinc-200/90 shadow-2xs' : 'bg-black/40 border-white/10'"
                      >
                        <img :src="stk.icon" class="w-6 h-6 object-contain shrink-0" :alt="stk.name" />
                        <div class="flex flex-col">
                          <span class="font-bold text-xs" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">{{ stk.name }}</span>
                          <span class="text-[10px] leading-tight" :class="store.theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'">{{ stk.desc }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ============================================== -->
              <!-- ANOS ANTERIORES (2021 A 2025): DOSSIÊ CLARO     -->
              <!-- ============================================== -->
              <div v-else class="flex flex-col gap-5 relative z-10">
                <!-- Header Badge -->
                <div class="flex items-center justify-between border-b pb-3.5" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/[0.08]'">
                  <div class="flex items-center gap-2">
                    <span
                      class="text-xs font-mono font-bold px-2.5 py-1 rounded-md border"
                      :class="store.theme === 'light' ? 'text-amber-700 bg-amber-50 border-amber-300' : 'text-amber-400 bg-amber-400/10 border-amber-400/25'"
                    >
                      {{ node.year }}
                    </span>
                    <span class="text-xs font-mono" :class="store.theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'">· {{ node.period }}</span>
                  </div>
                  <span
                    class="text-xs font-mono px-2.5 py-1 rounded-md border"
                    :class="store.theme === 'light' ? 'bg-zinc-100 border-zinc-200 text-zinc-700' : 'bg-white/[0.04] border-white/[0.08] text-zinc-300'"
                  >
                    {{ node.location }}
                  </span>
                </div>

                <!-- Role & Company -->
                <div class="flex flex-col gap-1">
                  <h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
                    {{ node.role }}
                  </h3>
                  <div class="text-sm sm:text-base font-mono font-semibold" :class="store.theme === 'light' ? 'text-amber-600' : 'text-amber-300'">
                    {{ node.company }}
                  </div>
                </div>

                <p class="text-sm sm:text-base leading-relaxed max-w-2xl" :class="store.theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'">
                  {{ node.description }}
                </p>

                <!-- Tecnologias com SVGs Oficiais -->
                <div class="flex flex-col gap-3 pt-3 border-t" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/[0.08]'">
                  <div class="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2" :class="store.theme === 'light' ? 'text-amber-700' : 'text-amber-300'">
                    <Sparkles class="w-4 h-4 text-amber-500" />
                    <span>{{ t.techIntroduced }} {{ node.year }}:</span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      v-for="fc in node.stackItems"
                      :key="fc.name"
                      class="p-3.5 rounded-xl border transition-all flex items-start gap-3 shadow-2xs"
                      :class="store.theme === 'light' ? 'bg-white border-zinc-200/90 hover:border-zinc-300' : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'"
                    >
                      <div
                        class="w-9 h-9 rounded-lg border flex items-center justify-center p-1.5 shrink-0"
                        :class="store.theme === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-black/40 border-white/10'"
                      >
                        <img :src="fc.icon" class="w-full h-full object-contain" :alt="fc.name" />
                      </div>
                      <div class="flex flex-col gap-0.5">
                        <span class="font-bold text-xs sm:text-sm" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">{{ fc.name }}</span>
                        <p class="text-xs leading-snug" :class="store.theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'">{{ fc.desc }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Rodapé de Scroll Discreto -->
              <div class="flex items-center justify-between pt-4 border-t relative z-10 text-xs font-mono mt-5 text-zinc-500" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/[0.08]'">
                <span>{{ t.scrollIndicator }}</span>
                <ChevronDown class="w-4 h-4 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- SLIDE 8: PROJETOS & FEITOS                 -->
        <!-- ========================================== -->
        <section
          id="cases"
          class="w-full h-full shrink-0 flex flex-col justify-start sm:justify-center px-6 sm:px-12 lg:px-16 py-6 sm:py-8 overflow-y-auto relative select-text"
        >
          <div
            class="w-full max-w-6xl mx-auto flex flex-col gap-5 relative z-10 transition-all duration-700 ease-out my-auto"
            :class="activeSectionIndex === 8 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-20 translate-y-6 scale-[0.98] pointer-events-none'"
          >
            <div class="flex flex-col gap-1 border-b pb-3" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/[0.08]'">
              <div class="text-xs font-mono uppercase tracking-wider font-semibold" :class="store.theme === 'light' ? 'text-amber-600' : 'text-amber-400'">
                {{ t.finopsCategoryPrefix }}
              </div>
              <h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
                {{ t.finopsTitle }}
              </h2>
              <p class="text-xs sm:text-sm max-w-3xl leading-relaxed" :class="store.theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'">
                {{ t.finopsSubtitle }}
              </p>
            </div>

            <!-- Featured TCC Card -->
            <div
              class="p-5 sm:p-6 rounded-2xl border transition-all flex flex-col gap-3 shadow-lg"
              :class="store.theme === 'light'
                ? 'bg-white border-zinc-200/90 hover:border-amber-500/40'
                : 'bg-white/[0.03] border-white/[0.08] hover:border-amber-500/30'"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-mono uppercase font-bold tracking-wider text-amber-500">
                  Trabalho de Conclusão de Curso (TCC) · FHO
                </span>
                <span class="text-xs font-mono px-2.5 py-0.5 rounded-md border" :class="store.theme === 'light' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'">
                  Full Stack & Arquitetura
                </span>
              </div>
              <h3 class="text-base sm:text-lg font-bold" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
                {{ t.caseTccTitle }}
              </h3>
              <p class="text-xs sm:text-sm leading-relaxed" :class="store.theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'">
                {{ t.caseTccDesc }}
              </p>
              <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t" :class="store.theme === 'light' ? 'border-black/5' : 'border-white/[0.04]'">
                <div class="flex flex-wrap gap-2 text-[11px] font-mono text-zinc-500">
                  <span class="px-2 py-0.5 rounded" :class="store.theme === 'light' ? 'bg-zinc-100 text-zinc-700' : 'bg-white/[0.04]'">Vue.js</span>
                  <span class="px-2 py-0.5 rounded" :class="store.theme === 'light' ? 'bg-zinc-100 text-zinc-700' : 'bg-white/[0.04]'">Node.js</span>
                  <span class="px-2 py-0.5 rounded" :class="store.theme === 'light' ? 'bg-zinc-100 text-zinc-700' : 'bg-white/[0.04]'">Express</span>
                  <span class="px-2 py-0.5 rounded" :class="store.theme === 'light' ? 'bg-zinc-100 text-zinc-700' : 'bg-white/[0.04]'">MongoDB</span>
                  <span class="px-2 py-0.5 rounded" :class="store.theme === 'light' ? 'bg-zinc-100 text-zinc-700' : 'bg-white/[0.04]'">Docker</span>
                </div>
                <div class="flex items-center gap-2">
                  <a
                    href="https://github.com/BernardoVillanova/fitness-front"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-3 py-1 rounded-lg border text-xs font-medium transition flex items-center gap-1.5"
                    :class="store.theme === 'light' ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'"
                  >
                    <span>fitness-front</span>
                    <ExternalLink class="w-3 h-3 text-zinc-400" />
                  </a>
                  <a
                    href="https://github.com/BernardoVillanova/fitness-back"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-3 py-1 rounded-lg border text-xs font-medium transition flex items-center gap-1.5"
                    :class="store.theme === 'light' ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'"
                  >
                    <span>fitness-back</span>
                    <ExternalLink class="w-3 h-3 text-zinc-400" />
                  </a>
                </div>
              </div>
            </div>

            <!-- Two Sub-projects: AWS FinOps & bernOS -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div
                class="p-5 sm:p-6 rounded-2xl border transition-all flex flex-col gap-3 shadow-md"
                :class="store.theme === 'light'
                  ? 'bg-white border-zinc-200/90 hover:border-emerald-500/40'
                  : 'bg-white/[0.03] border-white/[0.08] hover:border-emerald-500/30'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono uppercase font-bold tracking-wider text-emerald-600">AWS Cloud</span>
                  <span class="text-xs font-mono px-2.5 py-0.5 rounded-md border" :class="store.theme === 'light' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'">Eficiência</span>
                </div>
                <h3 class="text-sm sm:text-base font-bold" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">{{ t.case1Title }}</h3>
                <p class="text-xs leading-relaxed" :class="store.theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'">
                  {{ t.case1Desc }}
                </p>
                <div class="flex flex-wrap gap-2 pt-2 border-t text-[10px] font-mono text-zinc-500 mt-auto" :class="store.theme === 'light' ? 'border-black/5' : 'border-white/[0.04]'">
                  <span class="px-2 py-0.5 rounded" :class="store.theme === 'light' ? 'bg-zinc-100 text-zinc-700' : 'bg-white/[0.04]'">VPC Endpoints</span>
                  <span class="px-2 py-0.5 rounded" :class="store.theme === 'light' ? 'bg-zinc-100 text-zinc-700' : 'bg-white/[0.04]'">NAT Optimization</span>
                  <span class="px-2 py-0.5 rounded" :class="store.theme === 'light' ? 'bg-zinc-100 text-zinc-700' : 'bg-white/[0.04]'">RDS Rightsizing</span>
                </div>
              </div>

              <div
                class="p-5 sm:p-6 rounded-2xl border transition-all flex flex-col gap-3 shadow-md"
                :class="store.theme === 'light'
                  ? 'bg-white border-zinc-200/90 hover:border-sky-500/40'
                  : 'bg-white/[0.03] border-white/[0.08] hover:border-sky-500/30'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono uppercase font-bold tracking-wider text-sky-600">Architecture</span>
                  <span class="text-xs font-mono px-2.5 py-0.5 rounded-md border" :class="store.theme === 'light' ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-sky-500/10 text-sky-300 border-sky-500/20'">Production</span>
                </div>
                <h3 class="text-sm sm:text-base font-bold" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">{{ t.case2Title }}</h3>
                <p class="text-xs leading-relaxed" :class="store.theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'">
                  {{ t.case2Desc }}
                </p>
                <div class="flex flex-wrap gap-2 pt-2 border-t text-[10px] font-mono text-zinc-500 mt-auto" :class="store.theme === 'light' ? 'border-black/5' : 'border-white/[0.04]'">
                  <span class="px-2 py-0.5 rounded" :class="store.theme === 'light' ? 'bg-zinc-100 text-zinc-700' : 'bg-white/[0.04]'">Bun Runtime</span>
                  <span class="px-2 py-0.5 rounded" :class="store.theme === 'light' ? 'bg-zinc-100 text-zinc-700' : 'bg-white/[0.04]'">Cloudflare Edge CDN</span>
                  <span class="px-2 py-0.5 rounded" :class="store.theme === 'light' ? 'bg-zinc-100 text-zinc-700' : 'bg-white/[0.04]'">Vue 3 SPA</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- SLIDE 9: FORMAÇÃO & PRÊMIOS                -->
        <!-- ========================================== -->
        <section
          id="education"
          class="w-full h-full shrink-0 flex flex-col justify-start sm:justify-center px-6 sm:px-12 lg:px-16 py-6 sm:py-8 overflow-y-auto relative select-text"
        >
          <div
            class="w-full max-w-6xl mx-auto flex flex-col gap-5 relative z-10 transition-all duration-700 ease-out my-auto"
            :class="activeSectionIndex === 9 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-20 translate-y-6 scale-[0.98] pointer-events-none'"
          >
            <div class="flex flex-col gap-1 border-b pb-3" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/[0.08]'">
              <div class="text-xs font-mono uppercase tracking-wider font-semibold" :class="store.theme === 'light' ? 'text-amber-600' : 'text-amber-400'">
                {{ t.eduCategoryPrefix }}
              </div>
              <h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
                {{ t.eduTitle }}
              </h2>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
              <!-- Left Column: Credenciais Oficiais (Linux Admin, FHO, Maratona) -->
              <div class="lg:col-span-7 flex flex-col gap-3.5 sm:gap-4">
                <!-- Credencial 1: Certificação Linux Admin (LINUXtips) -->
                <div
                  class="p-4 sm:p-5 rounded-2xl border flex items-start gap-4 shadow-xs transition-all"
                  :class="store.theme === 'light' ? 'bg-white border-zinc-200/90 hover:border-zinc-300' : 'bg-white/[0.03] border-white/[0.08] hover:border-white/15'"
                >
                  <div
                    class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center p-2 shrink-0 border"
                    :class="store.theme === 'light' ? 'bg-amber-50 border-amber-200/80 text-amber-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'"
                  >
                    <img :src="linuxSvg" class="w-full h-full object-contain" alt="Linux" />
                  </div>
                  <div class="flex flex-col gap-1 min-w-0 flex-grow">
                    <div class="flex items-center justify-between font-mono text-xs">
                      <span class="font-bold text-amber-500">{{ t.eduLinuxSchool }}</span>
                      <span :class="store.theme === 'light' ? 'text-zinc-600 font-bold' : 'text-zinc-400'">{{ t.eduLinuxPeriod }}</span>
                    </div>
                    <span class="font-bold text-sm sm:text-base" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-zinc-100'">
                      {{ t.eduLinuxTitle }}
                    </span>
                    <p class="text-xs leading-relaxed" :class="store.theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'">
                      {{ t.eduLinuxDesc }}
                    </p>
                  </div>
                </div>

                <!-- Credencial 2: FHO Bacharelado -->
                <div
                  class="p-4 sm:p-5 rounded-2xl border flex items-start gap-4 shadow-xs transition-all"
                  :class="store.theme === 'light' ? 'bg-white border-zinc-200/90 hover:border-zinc-300' : 'bg-white/[0.03] border-white/[0.08] hover:border-white/15'"
                >
                  <div
                    class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center p-2 shrink-0 border"
                    :class="store.theme === 'light' ? 'bg-sky-50 border-sky-200/80 text-sky-600' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'"
                  >
                    <GraduationCap class="w-5 h-5" />
                  </div>
                  <div class="flex flex-col gap-1 min-w-0 flex-grow">
                    <div class="flex items-center justify-between font-mono text-xs">
                      <span class="font-bold" :class="store.theme === 'light' ? 'text-zinc-900' : 'text-white'">{{ t.edu1School }}</span>
                      <span :class="store.theme === 'light' ? 'text-amber-600 font-bold' : 'text-amber-400'">{{ t.edu1Period }}</span>
                    </div>
                    <span class="font-bold text-sm sm:text-base" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-zinc-100'">
                      {{ t.edu1Title }}
                    </span>
                    <p class="text-xs leading-relaxed" :class="store.theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'">
                      {{ t.edu1Desc }}
                    </p>
                  </div>
                </div>

                <!-- Credencial 3: Maratona de Programação -->
                <div
                  class="p-4 sm:p-5 rounded-2xl border flex items-start gap-4 shadow-xs transition-all"
                  :class="store.theme === 'light' ? 'bg-white border-zinc-200/90 hover:border-zinc-300' : 'bg-white/[0.03] border-white/[0.08] hover:border-white/15'"
                >
                  <div
                    class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center p-2 shrink-0 border"
                    :class="store.theme === 'light' ? 'bg-emerald-50 border-emerald-200/80 text-emerald-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'"
                  >
                    <Trophy class="w-5 h-5" />
                  </div>
                  <div class="flex flex-col gap-1 min-w-0 flex-grow">
                    <div class="flex items-center justify-between font-mono text-xs">
                      <span class="font-bold" :class="store.theme === 'light' ? 'text-zinc-900' : 'text-white'">{{ t.edu2School }}</span>
                      <span :class="store.theme === 'light' ? 'text-amber-600 font-bold' : 'text-amber-400'">{{ t.edu2Period }}</span>
                    </div>
                    <span class="font-bold text-sm sm:text-base" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-zinc-100'">
                      {{ t.edu2Title }}
                    </span>
                    <p class="text-xs leading-relaxed" :class="store.theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'">
                      {{ t.edu2Desc }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Right Column: Foto Polaroid "como se fosse algo jogado" do LINUXtips Local -->
              <div class="lg:col-span-5 flex flex-col items-center justify-center pt-2 sm:pt-4">
                <div
                  class="relative max-w-[280px] sm:max-w-[310px] w-full p-3 sm:p-3.5 pb-4 sm:pb-5 rounded-2xl shadow-2xl transition-all duration-300 hover:rotate-0 -rotate-1 sm:-rotate-2 border group select-none"
                  :class="store.theme === 'light'
                    ? 'bg-white border-zinc-300/80 shadow-zinc-400/30'
                    : 'bg-[#151722] border-white/15 shadow-black/80'"
                >
                  <!-- Visual Tape Effect -->
                  <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-amber-400/30 backdrop-blur-xs border border-amber-400/40 rotate-1 shadow-2xs rounded-xs pointer-events-none"></div>

                  <!-- Polaroid Photo Frame -->
                  <div class="w-full aspect-[3/4] rounded-xl overflow-hidden bg-black/10 border relative shadow-inner" :class="store.theme === 'light' ? 'border-zinc-200' : 'border-white/10'">
                    <img
                      src="/images/bern-linuxtips.png"
                      alt="Bernardo com Jeferson Fernando no LINUXtips Local Brasil"
                      class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                    <span class="absolute bottom-2 left-2.5 right-2.5 font-mono text-[10px] text-white/90">
                      {{ t.eduLinuxPhotoTag }}
                    </span>
                  </div>

                  <!-- Caption under photo -->
                  <div class="pt-3 px-1 flex flex-col gap-0.5">
                    <span class="font-bold text-xs sm:text-sm tracking-tight" :class="store.theme === 'light' ? 'text-zinc-900' : 'text-white'">
                      {{ t.eduLinuxPhotoCaption }}
                    </span>
                    <span class="text-[11px] font-mono text-zinc-500">
                      São Paulo · Evento Presencial
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- SLIDE 10: CONTATO DIRETO                   -->
        <!-- ========================================== -->
        <section
          id="contact"
          class="w-full h-full shrink-0 flex flex-col justify-start sm:justify-center px-6 sm:px-12 lg:px-16 py-6 sm:py-8 overflow-y-auto relative select-text"
        >
          <div
            class="w-full max-w-5xl mx-auto flex flex-col gap-6 relative z-10 transition-all duration-700 ease-out my-auto"
            :class="activeSectionIndex === 10 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-20 translate-y-6 scale-[0.98] pointer-events-none'"
          >
            <div class="flex flex-col gap-1.5 border-b pb-4" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/[0.08]'">
              <div class="text-xs font-mono uppercase tracking-wider font-semibold" :class="store.theme === 'light' ? 'text-amber-600' : 'text-amber-400'">
                {{ t.contactCategoryPrefix }}
              </div>
              <h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
                {{ t.chatTitle }}
              </h2>
              <p class="text-sm sm:text-base max-w-2xl leading-relaxed" :class="store.theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'">
                {{ t.chatSubtitle }}
              </p>
            </div>

            <div
              class="p-6 sm:p-8 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl"
              :class="store.theme === 'light' ? 'bg-white border-zinc-200/90 text-zinc-900' : 'bg-white/[0.03] border-white/[0.08]'"
            >
              <div class="flex items-center gap-4 sm:gap-5">
                <div class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-md shrink-0">
                  <img src="/images/bern-laptop.png" alt="Bernardo Villanova" class="w-full h-full object-cover object-top" />
                  <span class="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2" :class="store.theme === 'light' ? 'border-white' : 'border-[#121318]'"></span>
                </div>
                <div class="flex flex-col gap-1 min-w-0">
                  <span class="text-xs font-mono uppercase text-zinc-500">Bernardo Villanova</span>
                  <span class="text-base sm:text-xl font-bold font-mono truncate" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">bernardo.villasantana@gmail.com</span>
                  <span class="text-xs text-zinc-500">Rio Claro, SP · DevOps & Platform Engineer</span>
                </div>
              </div>

              <div class="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
                <button
                  @click="copyEmail"
                  class="px-5 py-3 rounded-xl border font-mono text-xs sm:text-sm transition cursor-pointer flex items-center gap-2"
                  :class="store.theme === 'light'
                    ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-white'"
                >
                  <Check v-if="copiedEmail" class="w-4 h-4 text-emerald-500" />
                  <Copy v-else class="w-4 h-4" />
                  <span>{{ copiedEmail ? t.copiedBtn : t.copyBtn }}</span>
                </button>
                <button
                  @click="openMailApp"
                  class="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-lg"
                >
                  <Mail class="w-4 h-4" />
                  <span>{{ t.openMailBtn }}</span>
                </button>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono pt-4 border-t text-zinc-500" :class="store.theme === 'light' ? 'border-black/5' : 'border-white/[0.06]'">
              <div class="flex items-center gap-2">
                <span>{{ t.dailySetup }} CachyOS · Fish Shell · Neovim · Café ☕</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 128, 128, 0.35);
}
</style>
