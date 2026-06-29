<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useWindowStore } from '../../stores/windowStore'

interface HistoryItem {
  type: 'input' | 'output' | 'error' | 'boot' | 'neofetch'
  text: string
}

const terminalHistory = ref<HistoryItem[]>([])
const currentInput = ref('')
const commandHistory = ref<string[]>([])
const historyIndex = ref(-1)
const terminalBody = ref<HTMLElement | null>(null)
const isBooting = ref(true)

// Vim Mode states
const isVimMode = ref(false)
const vimInput = ref('')
const vimCommandError = ref('')
const vimInputField = ref<HTMLInputElement | null>(null)

// Sudo Prompt states
const isSudoPrompt = ref(false)

const windowStore = useWindowStore()

const bootLines = [
  'Initializing BernOS kernel v6.2.9-cachyos...',
  'Checking hardware devices... OK',
  'CPU: AMD Ryzen 9 5900X (12 cores, 24 threads) @ 4.20GHz',
  'GPU: NVIDIA RTX 4070 Ti (12GB VRAM)',
  'RAM: 32GB DDR5 5600MHz',
  'Storage: NVMe SSD 1TB (ext4 /dev/nvme0n1p2)',
  'SQLite database file: /var/lib/bernos/bernos.db loaded.',
  'Starting system services... OK',
  'Network: Connected to gateway 192.168.1.1 (DNS: 1.1.1.1)',
  'Loading Noctalia DE graphics shell...',
  'Welcome to Bernardo\'s Portfolio OS!',
  'Type "help" for a list of available commands.',
  '-------------------------------------------------------'
]

const runBootSequence = async () => {
  for (let i = 0; i < bootLines.length; i++) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 30))
    terminalHistory.value.push({ type: 'boot', text: bootLines[i] })
    scrollToBottom()
  }
  isBooting.value = false
  printNeofetch()
  scrollToBottom()
}

const printNeofetch = () => {
  terminalHistory.value.push({ type: 'neofetch', text: '' })
  terminalHistory.value.push({ type: 'output', text: '\nSistema pronto. Digite \'help\' para ver os comandos.' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (terminalBody.value) {
      terminalBody.value.scrollTop = terminalBody.value.scrollHeight
    }
  })
}

// Vim Mode handlers
const enterVimMode = () => {
  isVimMode.value = true
  vimInput.value = ''
  vimCommandError.value = ''
  nextTick(() => {
    if (vimInputField.value) {
      vimInputField.value.focus()
    }
  })
}

const handleVimCommand = () => {
  const cmd = vimInput.value.trim()
  if (cmd === ':q' || cmd === 'q' || cmd === ':q!' || cmd === 'q!') {
    isVimMode.value = false
    terminalHistory.value.push({ type: 'output', text: '[Vim] Editor fechado. Retornando ao shell.' })
    scrollToBottom()
    nextTick(() => {
      // Focus terminal input
      const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement
      if (inputEl) inputEl.focus()
    })
  } else {
    vimCommandError.value = `E492: Not an editor command: ${cmd}`
    vimInput.value = ''
    setTimeout(() => {
      vimCommandError.value = ''
    }, 2000)
  }
}

const cancelVimCommand = () => {
  vimInput.value = ''
  vimCommandError.value = ''
}

// Sudo hire-me animation
const runHireMeSequence = async () => {
  const hireLines = [
    'Authenticating...',
    'Access granted.',
    'Starting hiring pipeline...',
    '[1/4] Preparing offer letter... OK',
    '[2/4] Initializing background check... OK',
    '[3/4] Generating contract... OK',
    '[4/4] Finalizing onboarding... OK',
    '',
    'Parabéns! Bernardo Villanova foi contratado! 🎉',
    'Entre em contato pelo email bernardo.villasantana@gmail.com para formalizar a proposta.'
  ]
  
  for (let i = 0; i < hireLines.length; i++) {
    await new Promise(resolve => setTimeout(resolve, i === 8 ? 600 : Math.random() * 300 + 100))
    terminalHistory.value.push({ type: 'output', text: hireLines[i] })
    scrollToBottom()
  }
}

const handleCommand = () => {
  const cmd = currentInput.value.trim()
  if (!cmd) return

  // Add to command history
  commandHistory.value.push(cmd)
  historyIndex.value = commandHistory.value.length
  
  // Handle password prompt input
  if (isSudoPrompt.value) {
    terminalHistory.value.push({ type: 'input', text: `[sudo] password for guest: *******` })
    isSudoPrompt.value = false
    currentInput.value = ''
    runHireMeSequence()
    return
  }

  // Print user prompt
  terminalHistory.value.push({ type: 'input', text: `guest@bernos:~$ ${cmd}` })

  const commandNormalized = cmd.trim().toLowerCase().replace(/\s+/g, ' ')
  const args = commandNormalized.split(' ')
  const primaryCmd = args[0]

  switch (primaryCmd) {
    case 'help':
      terminalHistory.value.push({
        type: 'output',
        text: `COMANDOS DISPONÍVEIS:
  - help             → lista todos os comandos
  - whoami           → apresentação pessoal narrativa
  - skills           → stack técnico organizado por categoria
  - experience       → histórico profissional
  - projects         → lista projetos (integra com Files)
  - contact          → email, linkedin, github
  - kubectl get pods → lista experiências de trabalho como pods K8s
  - docker ps        → lista experiências de trabalho como containers Docker
  - terraform plan   → inicia o módulo LocalStack de curiosidades
  - clear            → limpa o terminal

Easter eggs:
  - vim portfolio     → abre o portfólio em um editor Vim interativo
  - git log --oneline → exibe histórico de commits do portfólio
  - sudo hire-me      → inicia o pipeline de contratação`
      })
      break
    case 'whoami':
      terminalHistory.value.push({
        type: 'output',
        text: `Bernardo Villanova de Santana
DevOps | Cloud | Kubernetes | Docker | IaC | CI & CD | Node | Full Stack

Olá, sou Bernardo, DevOps Engineer com mais de 4 anos de experiência prática em cloud computing, automação de infraestrutura e pipelines CI/CD, atuando principalmente com AWS, Terraform e Kubernetes.
Tenho foco em construir e manter ambientes escaláveis, resilientes e seguros, utilizando boas práticas de infraestrutura como código (IaC) e automação de processos. Ao longo da minha trajetória, atuei na administração de ambientes críticos, melhoria contínua de pipelines e implementação de observabilidade para suporte à tomada de decisão e rápida resposta a incidentes.
Também possuo conhecimento em Azure e Azure DevOps, ampliando minha visão multi-cloud. Tenho perfil analítico, colaborativo e orientado à melhoria contínua, sempre buscando aumentar a eficiência operacional, confiabilidade dos sistemas e maturidade da cultura DevOps.`
      })
      break
    case 'skills':
      terminalHistory.value.push({
        type: 'output',
        text: `STACK TÉCNICO ORGANIZADO POR CATEGORIA:

[☁️ Cloud & IaC]
  • AWS (EC2, EKS, ECS, S3, RDS, IAM, VPC, CloudWatch)
  • Azure & Azure DevOps (Multi-cloud vision)
  • GCP (Google Cloud Platform)
  • Terraform (Principal), CloudFormation

[ Orquestração & Containers]
  • Kubernetes (EKS/AKS, Helm, ArgoCD)
  • Docker (Dockerfiles, Docker Compose, Multi-stage)
  • AWS ECS / Fargate

[🔄 CI/CD & Automação]
  • GitHub Actions (workflows reutilizáveis, self-hosted runners)
  • Jenkins
  • AWS CodePipeline, CodeBuild, CodeCommit
  • Linux Admin & Shell Scripting (Bash)

[ Observabilidade & Monitoramento]
  • Grafana & Prometheus
  • AWS CloudWatch & X-Ray
  • Logs centralizados e troubleshooting avançado

[💻 Programação & Web]
  • Node.js, Express, REST APIs, GraphQL (Apollo)
  • Vue.js, React.js, Next.js, JavaScript (ES6+), TypeScript
  • Bancos de dados: PostgreSQL, SQL Server, MongoDB, AWS RDS`
      })
      break
    case 'experience':
      terminalHistory.value.push({
        type: 'output',
        text: `HISTÓRICO PROFISSIONAL:

  1. Engenheiro DevOps Pleno (Fev 2025 - Atual) | Yeb Inteligência de Mercado
     - Gestão completa de ambientes AWS, IaC (Terraform/CloudFormation), criação e otimização de pipelines CI/CD, observabilidade (Grafana/CloudWatch), Platform Engineering, APIs Node.js/GraphQL.
  2. Engenheiro DevOps Júnior (Jul 2024 - Fev 2025) | Yeb Inteligência de Mercado
     - Monitoramento/observabilidade AWS, suporte a incident response, automação de rotinas operacionais (Shell), sustentação Node.js/GraphQL.
  3. Desenvolvedor Full Stack (Fev 2024 - Jul 2024) | Yeb Inteligência de Mercado
     - Desenvolvimento e manutenção de APIs REST/GraphQL (Node.js/Express) e views front-end (Vue, React, Next.js).
  4. Engenheiro DevOps Freelancer (Abr 2023 - Dez 2023) | Projeto Internacional (New Jersey, EUA)
     - Infra AWS com Terraform (módulos versionados), CI/CD end-to-end, práticas GitOps (PR review e rollbacks), Docker e Kubernetes.
  5. DevOps Engineer (Nov 2022 - Abr 2023) | EZOps.cloud (Orlando, FL, EUA)
     - Arquitetura AWS com IaC (Terraform/CloudFormation), automação de releases CI/CD, e melhores práticas de segurança.
  6. DevOps Developer (Dez 2021 - Nov 2022) | FL Group - Tech
     - Linux Admin, Jenkins/CodePipeline, Docker/Kubernetes, provisionamento AWS (S3, EC2, IAM) e Shell Scripting.

Dica: Experimente rodar 'kubectl get pods' ou 'docker ps' para ver as experiências em formatos de infraestrutura!`
      })
      break
    case 'projects':
      {
        const isOpen = args.includes('--open') || args.includes('-o')
        let output = `PROJETOS ENCONTRADOS (Home > Projects):
  📁 Terraform-AWS-IaC         - Módulos IaC para AWS escaláveis
  📁 PipelineWithActions       - Pipelines robustos de CI/CD para EKS
  📄 experience.yaml           - Ficha profissional estruturada`

        if (isOpen) {
          output += `\n\nAbrindo Gerenciador de Arquivos... Navegando para Home > Projects.`
          windowStore.filesCurrentPath = ['Home', 'Projects']
          windowStore.openWindow('files')
        } else {
          output += `\n\nDica: Digite 'projects --open' ou 'projects -o' para abrir essa pasta no Gerenciador de Arquivos.`
        }
        terminalHistory.value.push({ type: 'output', text: output })
      }
      break
    case 'contact':
      terminalHistory.value.push({
        type: 'output',
        text: `INFORMAÇÕES DE CONTATO:
  - Email: bernardo.villasantana@gmail.com
  - LinkedIn: linkedin.com/in/bernardo-villanova-de-santana
  - GitHub: github.com/bernardovillanova
  - Cidade: Rio Claro, SP, Brasil`
      })
      break
    case 'kubectl':
      if (args[1] === 'get' && args[2] === 'pods') {
        terminalHistory.value.push({
          type: 'output',
          text: `NAME                                     READY   STATUS      RESTARTS   AGE
yeb-devops-pleno-5f87b8d96-zxcvb         1/1     Running     0          1y4mo
yeb-devops-junior-6d8b9c78d-asdfg        1/1     Completed   0          1y11mo
yeb-fullstack-7f9a8b6c4-qwert            1/1     Completed   0          2y4mo
intl-freelance-devops-8c9d0e1f2-lkjhg    1/1     Completed   0          3y2mo
ezops-devops-9e8d7c6b5-poiuy             1/1     Completed   0          3y7mo
fl-group-devops-9f8e7d6c5-mnbvc          1/1     Completed   0          4y6mo`
        })
      } else {
        terminalHistory.value.push({
          type: 'error',
          text: `Erro: Comando kubectl inválido. Tente 'kubectl get pods'`
        })
      }
      break
    case 'docker':
      if (args[1] === 'ps') {
        terminalHistory.value.push({
          type: 'output',
          text: `CONTAINER ID   IMAGE                               COMMAND                  CREATED         STATUS                     PORTS     NAMES
a1b2c3d4e5f6   yeb/devops-pleno:latest             "/entrypoint.sh..."      16 months ago   Up 16 months                         yeb-devops-pleno
b2c3d4e5f6a1   yeb/devops-junior:latest            "/entrypoint.sh..."      23 months ago   Exited (0) 16 months ago             yeb-devops-junior
c3d4e5f6a1b2   yeb/fullstack:latest                "/entrypoint.sh..."      28 months ago   Exited (0) 23 months ago             yeb-fullstack
d4e5f6a1b2c3   intl/freelance-devops:latest        "/entrypoint.sh..."      38 months ago   Exited (0) 30 months ago             intl-freelance-devops
e5f6a1b2c3d4   ezops/devops:latest                 "/entrypoint.sh..."      43 months ago   Exited (0) 37 months ago             ezops-devops
f6a1b2c3d4e5   fl-group/devops:latest              "/entrypoint.sh..."      54 months ago   Exited (0) 43 months ago             fl-group-devops`
        })
      } else {
        terminalHistory.value.push({
          type: 'error',
          text: `Erro: Comando docker inválido. Tente 'docker ps'`
        })
      }
      break
    case 'terraform':
      if (args[1] === 'plan') {
        terminalHistory.value.push({
          type: 'output',
          text: `Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # localstack_curiosity.coffee_consumption will be created
  + resource "localstack_curiosity" "coffee_consumption" {
      + id       = (known after apply)
      + level    = "unlimited ☕"
      + type     = "Dark Roast"
      + effect   = "Increases code quality and speed"
    }

  # localstack_curiosity.editor_preference will be created
  + resource "localstack_curiosity" "editor_preference" {
      + id       = (known after apply)
      + editor   = "Neovim / Vim"
      + comment  = "I use Vim btw"
    }

  # localstack_curiosity.caffeine_converter will be created
  + resource "localstack_curiosity" "caffeine_converter" {
      + id       = (known after apply)
      + input    = "Coffee"
      + output   = "DevOps Pipelines & Clean Code"
    }

  # localstack_curiosity.home_office_setup will be created
  + resource "localstack_curiosity" "home_office_setup" {
      + id       = (known after apply)
      + monitors = 2
      + OS       = "CachyOS / Arch Linux"
      + audio    = "Synthwave/Metal playlist active"
    }

Plan: 4 to add, 0 to change, 0 to destroy.

─────────────────────────────────────────────────────────────────────────────────────────────

Note: You didn't use the -out option to save this plan, so Terraform can't guarantee to take exactly these actions if you run "terraform apply".`
        })
      } else {
        terminalHistory.value.push({
          type: 'error',
          text: `Erro: Comando terraform inválido. Tente 'terraform plan'`
        })
      }
      break
    case 'git':
      if (args[1] === 'log' && args[2] === '--oneline') {
        terminalHistory.value.push({
          type: 'output',
          text: `a1b2c3d [HEAD] feat: add custom neofetch and interactive terminal apps
f3d2e1c feat: docker and kubectl pod-like experience tracking
e4c3b2a feat: add terraform plan curiosities module
d5b4a3c refactor: refine Noctalia DE graphics and window manager
c6a5b4d feat: add vscode, spotify, and mail components
b7a6f5e feat: initialize BernOS kernel with custom boot sequence`
        })
      } else {
        terminalHistory.value.push({
          type: 'error',
          text: `Erro: Comando git inválido. Tente 'git log --oneline'`
        })
      }
      break
    case 'vim':
      if (args[1] === 'portfolio') {
        enterVimMode()
      } else {
        terminalHistory.value.push({
          type: 'error',
          text: `Erro: Arquivo não encontrado. Tente 'vim portfolio'`
        })
      }
      break
    case 'sudo':
      if (args[1] === 'hire-me') {
        isSudoPrompt.value = true
      } else {
        terminalHistory.value.push({
          type: 'error',
          text: `Erro: Comando sudo inválido. Tente 'sudo hire-me'`
        })
      }
      break
    case 'clear':
      terminalHistory.value = []
      break
    case 'neofetch':
      printNeofetch()
      break
    default:
      terminalHistory.value.push({
        type: 'error',
        text: `Command not found: "${cmd}". Type "help" for a list of available commands.`
      })
  }

  currentInput.value = ''
  scrollToBottom()
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (historyIndex.value > 0) {
      historyIndex.value--
      currentInput.value = commandHistory.value[historyIndex.value]
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (historyIndex.value < commandHistory.value.length - 1) {
      historyIndex.value++
      currentInput.value = commandHistory.value[historyIndex.value]
    } else {
      historyIndex.value = commandHistory.value.length
      currentInput.value = ''
    }
  }
}

onMounted(() => {
  runBootSequence()
})
</script>

<template>
  <div class="flex-grow flex flex-col font-mono text-sm leading-relaxed p-4 h-full bg-[#07000d]/95 relative overflow-hidden select-text select-text-safe">
    <!-- Mock Vim editor -->
    <div v-if="isVimMode" class="flex-grow flex flex-col h-full text-gray-300 relative select-text">
      <div class="flex-grow overflow-y-auto pr-1 select-text leading-tight text-xs sm:text-sm">
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">1</span><span class="text-brand-orange-light font-bold select-text">Bernardo Villanova - DevOps Pleno</span></div>
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">2</span><span class="text-gray-500 select-text">=================================</span></div>
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">3</span><span></span></div>
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">4</span><span class="text-blue-400 font-semibold select-text">  [Contato]</span></div>
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">5</span><span class="select-text">  Email: bernardo.villasantana@gmail.com</span></div>
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">6</span><span class="select-text">  GitHub: github.com/bernardovillanova</span></div>
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">7</span><span class="text-blue-400 hover:underline select-text">  LinkedIn: linkedin.com/in/bernardo-villanova-de-santana</span></div>
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">8</span><span></span></div>
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">9</span><span class="text-blue-400 font-semibold select-text">  [Stack]</span></div>
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">10</span><span class="select-text">  Kubernetes | AWS | Terraform | CI/CD | Node.js | Vue.js</span></div>
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">11</span><span></span></div>
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">12</span><span class="text-blue-400 font-semibold select-text">  [Instruções do Vim]</span></div>
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">13</span><span class="select-text">  Pressione ':q' e depois [Enter] para sair do Vim.</span></div>
        <div class="flex select-text"><span class="text-gray-600 mr-4 select-none w-6 text-right">14</span><span></span></div>
        <div v-for="n in 10" :key="n" class="flex select-none text-blue-500/50"><span class="mr-4 w-6 text-right">~</span><span></span></div>
      </div>
      <!-- Vim Status and Command line -->
      <div class="mt-auto flex flex-col shrink-0 select-none">
        <div class="bg-gray-800 text-gray-900 px-2 py-0.5 font-bold flex justify-between text-xs select-none">
          <span>portfolio.txt [Read Only]</span>
          <span>14/14 100%</span>
        </div>
        <div class="flex items-center text-gray-300 font-mono text-xs sm:text-sm bg-black/40 px-2 py-1 select-text">
          <span v-if="vimCommandError" class="text-red-400 font-semibold select-text">{{ vimCommandError }}</span>
          <template v-else>
            <span class="select-none">:</span>
            <input
              v-model="vimInput"
              type="text"
              class="bg-transparent text-gray-200 outline-none border-none p-0 flex-grow font-mono text-xs sm:text-sm select-text"
              ref="vimInputField"
              @keydown.enter="handleVimCommand"
              @keydown.esc="cancelVimCommand"
              autofocus
            />
          </template>
        </div>
      </div>
    </div>

    <!-- Boot and Command history screen -->
    <div v-else ref="terminalBody" class="flex-grow overflow-y-auto pr-1 flex flex-col gap-1 select-text">
      
      <div v-for="(item, idx) in terminalHistory" :key="idx" class="whitespace-pre-wrap select-text">
        <template v-if="item.type === 'boot'">
          <span class="text-gray-400 select-text">{{ item.text }}</span>
        </template>
        <template v-else-if="item.type === 'input'">
          <span class="text-brand-orange font-semibold select-text">{{ item.text }}</span>
        </template>
        <template v-else-if="item.type === 'output'">
          <span class="text-gray-300 select-text">{{ item.text }}</span>
        </template>
        <template v-else-if="item.type === 'neofetch'">
          <div class="flex flex-col lg:flex-row gap-4 lg:gap-8 py-2 select-text text-[11px] sm:text-xs leading-normal font-mono shrink-0 overflow-x-auto">
            <!-- BERNOS ASCII Art -->
            <pre class="text-brand-orange font-bold select-text leading-tight shrink-0 font-mono">
  ██████╗ ███████╗██████╗ ███╗   ██╗ ██████╗ ███████╗
  ██╔══██╗██╔════╝██╔══██╗████╗  ██║██╔═══██╗██╔════╝
  ██████╔╝█████╗  ██████╔╝██╔██╗ ██║██║   ██║███████╗
  ██╔══██╗██╔══╝  ██╔══██╗██║╚██╗██║██║   ██║╚════██║
  ██████╔╝███████╗██║  ██║██║ ╚████║╚██████╔╝███████║
  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝</pre>
            <!-- Stats -->
            <div class="flex flex-col gap-0.5 select-text font-mono text-gray-300">
              <div><span class="text-brand-orange-light font-semibold">name:</span> Bernardo Villanova</div>
              <div><span class="text-brand-orange-light font-semibold">role:</span> DevOps Engineer · Pleno</div>
              <div><span class="text-brand-orange-light font-semibold">stack:</span> K8s · AWS · Terraform · CI/CD</div>
              <div><span class="text-brand-orange-light font-semibold">os:</span> bernOS (baseado em CachyOS)</div>
              <div><span class="text-brand-orange-light font-semibold">uptime:</span> ~4 anos de experiência</div>
              <div><span class="text-brand-orange-light font-semibold">shell:</span> bash + zsh + vim btw</div>
              <div><span class="text-brand-orange-light font-semibold">github:</span> github.com/bernardovillanova</div>
              <div class="flex flex-wrap gap-1 mt-1 items-center">
                <span class="text-red-500 font-bold">████</span>
                <span class="text-green-500 font-bold">████</span>
                <span class="text-yellow-500 font-bold">████</span>
                <span class="text-blue-500 font-bold">████</span>
                <span class="text-pink-500 font-bold">████</span>
                <span class="text-brand-orange-light font-semibold ml-2">coffee:</span> unlimited ☕
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'error'">
          <span class="text-red-400 select-text">{{ item.text }}</span>
        </template>
      </div>

      <!-- Current Input Prompt -->
      <div v-if="!isBooting" class="flex items-center gap-2 mt-2 shrink-0 select-text w-full">
        <span class="text-brand-orange font-semibold shrink-0 select-text">
          {{ isSudoPrompt ? '[sudo] password for guest: ' : 'guest@bernos:~$ ' }}
        </span>
        <div class="relative flex-grow flex items-center select-text">
          <input
            v-model="currentInput"
            :type="isSudoPrompt ? 'password' : 'text'"
            class="w-full bg-transparent text-gray-200 outline-none border-none p-0 select-text select-text-safe font-mono"
            autofocus
            @keydown.enter="handleCommand"
            @keydown="handleKeydown"
            ref="inputField"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Allow standard text selection specifically inside the terminal outputs */
.select-text-safe {
  user-select: text !important;
  -webkit-user-select: text !important;
}
</style>
