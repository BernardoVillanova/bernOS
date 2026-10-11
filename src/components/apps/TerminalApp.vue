<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
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

const isMobileDevice = () => {
  return typeof window !== 'undefined' && (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768)
}

// Vim Mode states
const isVimMode = ref(false)
const vimInput = ref('')
const vimCommandError = ref('')
const vimInputField = ref<HTMLInputElement | null>(null)
const inputField = ref<HTMLInputElement | null>(null)

// Sudo Prompt states
const isSudoPrompt = ref(false)
const sudoAction = ref('')

// htop Mode states
const isHtopMode = ref(false)
const selectedHtopRow = ref(0)
let htopTimer: ReturnType<typeof setInterval> | null = null

const htopCoresLeft = ref([
  { core: '0', pct: 45 },
  { core: '1', pct: 68 },
  { core: '2', pct: 32 },
  { core: '3', pct: 85 }
])

const htopCoresRight = ref([
  { core: '4', pct: 28 },
  { core: '5', pct: 54 },
  { core: '6', pct: 92 },
  { core: '7', pct: 41 }
])

const htopProcessList = ref([
  { pid: '1024', user: 'bern', virt: '1.8G', res: '340M', cpu: '18.4', mem: '4.2', time: '0:42.10', command: 'k8s-apiserver --secure-port=6443' },
  { pid: '1025', user: 'bern', virt: '1.2G', res: '280M', cpu: '14.2', mem: '3.8', time: '1:15.02', command: 'dockerd --bip=172.17.0.1/16' },
  { pid: '1026', user: 'bern', virt: '850M', res: '190M', cpu: '12.0', mem: '2.5', time: '0:18.40', command: 'terraform apply -auto-approve' },
  { pid: '1027', user: 'bern', virt: '780M', res: '160M', cpu: '9.5',  mem: '2.1', time: '0:54.12', command: 'grafana-server --config=/etc/grafana' },
  { pid: '1028', user: 'bern', virt: '620M', res: '140M', cpu: '8.1',  mem: '1.9', time: '0:39.80', command: 'prometheus --config.file=/etc/prom' },
  { pid: '1029', user: 'bern', virt: '210M', res: '95M',  cpu: '4.0',  mem: '1.2', time: '2:01.00', command: 'nvim ~/projects/bernos/' },
  { pid: '1030', user: 'root', virt: '180M', res: '60M',  cpu: '2.5',  mem: '0.8', time: '3:10.45', command: 'containerd --config /etc/containerd' },
  { pid: '1031', user: 'bern', virt: '120M', res: '45M',  cpu: '1.2',  mem: '0.5', time: '0:08.12', command: 'cachyos-kernel /vmlinuz-linux' }
])

const enterHtopMode = () => {
  isHtopMode.value = true
  selectedHtopRow.value = 0
  if (htopTimer) clearInterval(htopTimer)
  htopTimer = setInterval(() => {
    htopCoresLeft.value.forEach(c => {
      c.pct = Math.min(98, Math.max(12, Math.floor(c.pct + (Math.random() * 20 - 10))))
    })
    htopCoresRight.value.forEach(c => {
      c.pct = Math.min(98, Math.max(12, Math.floor(c.pct + (Math.random() * 20 - 10))))
    })
  }, 1000)
}

const exitHtop = () => {
  if (htopTimer) clearInterval(htopTimer)
  htopTimer = null
  isHtopMode.value = false
  terminalHistory.value.push({ type: 'output', text: '[htop] Terminado. Retornando ao shell.' })
  scrollToBottom()
  nextTick(() => {
    if (inputField.value) inputField.value.focus()
  })
}

// Terraform states
const tfInitDone = ref(false)
const tfPlanDone = ref(false)
const tfApplied = ref(false)
const isTfApplyPrompt = ref(false)
const isTfDestroyPrompt = ref(false)
const isTfRunning = ref(false)

const windowStore = useWindowStore()

const runBootSequence = async () => {
  const d = new Date()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const timeStr = d.toTimeString().split(' ')[0]
  const dateStr = `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${timeStr}`

  terminalHistory.value.push({
    type: 'output',
    text: `Last login: ${dateStr} on ttys001`
  })
  isBooting.value = false
  printNeofetch()
  scrollToBottom()
  nextTick(() => {
    if (!isMobileDevice() && inputField.value) inputField.value.focus()
  })
}

const printNeofetch = () => {
  terminalHistory.value.push({ type: 'neofetch', text: '' })
  terminalHistory.value.push({ type: 'output', text: '\nDigite \'help\' para ver a lista de comandos disponíveis.' })
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
      if (inputField.value) inputField.value.focus()
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

// Click and key focus handlers
const focusTerminalInput = () => {
  if (window.getSelection()?.toString()) return

  if (isVimMode.value) {
    if (vimInputField.value) {
      vimInputField.value.focus()
    }
  } else {
    if (inputField.value) {
      inputField.value.focus()
    }
  }
}

const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (windowStore.activeWindowId !== 'terminal') return

  if (isHtopMode.value) {
    if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape' || e.key === 'F10') {
      e.preventDefault()
      exitHtop()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (selectedHtopRow.value < htopProcessList.value.length - 1) {
        selectedHtopRow.value++
      }
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (selectedHtopRow.value > 0) {
        selectedHtopRow.value--
      }
      return
    }
    return
  }

  if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

  if (e.ctrlKey || e.metaKey || e.altKey) return

  focusTerminalInput()
}

watch(() => windowStore.activeWindowId, (newActiveId) => {
  if (newActiveId === 'terminal' && !isMobileDevice()) {
    focusTerminalInput()
  }
})

// Sudo apt update animation
const runAptUpdateSequence = async () => {
  const lines = [
    'Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease',
    'Get:2 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]',
    'Get:3 http://archive.ubuntu.com/ubuntu noble-updates InRelease [126 kB]',
    'Get:4 https://deb.bernos.dev/stable InRelease [4.820 B]',
    'Get:5 https://deb.bernos.dev/stable/main amd64 Packages [12.4 kB]',
    'Fetched 269 kB in 1s (210 kB/s)',
    'Reading package lists... Done',
    'Building dependency tree... Done',
    'Reading state information... Done',
    'All packages are up to date.'
  ]
  
  for (let i = 0; i < lines.length; i++) {
    await new Promise(resolve => setTimeout(resolve, i >= 6 ? 300 : Math.random() * 200 + 100))
    terminalHistory.value.push({ type: 'output', text: lines[i] })
    scrollToBottom()
  }
}

const handleCommand = async () => {
  const cmd = currentInput.value.trim()
  if (!cmd) return

  // Add to command history
  commandHistory.value.push(cmd)
  historyIndex.value = commandHistory.value.length
  
  // Handle password prompt input
  if (isSudoPrompt.value) {
    terminalHistory.value.push({ type: 'input', text: `[sudo] password for bernardo: *******` })
    isSudoPrompt.value = false
    currentInput.value = ''
    if (sudoAction.value === 'apt-update') {
      runAptUpdateSequence()
    }
    sudoAction.value = ''
    return
  }

  // Handle terraform apply prompt
  if (isTfApplyPrompt.value) {
    isTfApplyPrompt.value = false
    terminalHistory.value.push({ type: 'input', text: `  Enter a value: ${cmd}` })
    currentInput.value = ''
    if (cmd.toLowerCase() === 'yes') {
      isTfRunning.value = true
      const applyResources = [
        'aws_iam_role.principios',
        'aws_s3_bucket.origem',
        'aws_dynamodb_table.valores',
        'aws_lambda_function.hobbies',
        'aws_ec2_instance.sonhos',
        'aws_cloudwatch.aprendizados',
        'aws_sqs_queue.curiosidades',
        'aws_sns_topic.contato'
      ]
      terminalHistory.value.push({ type: 'output', text: '' })
      for (const res of applyResources) {
        terminalHistory.value.push({ type: 'output', text: `${res}: Creating...` })
        scrollToBottom()
        await new Promise(r => setTimeout(r, 250 + Math.random() * 200))
        terminalHistory.value.push({ type: 'output', text: `${res}: Creation complete after ${(Math.random() * 3 + 1).toFixed(0)}s` })
        scrollToBottom()
      }
      terminalHistory.value.push({ type: 'output', text: '' })
      terminalHistory.value.push({ type: 'output', text: `Apply complete! Resources: ${applyResources.length} added, 0 changed, 0 destroyed.` })
      terminalHistory.value.push({ type: 'output', text: '' })
      terminalHistory.value.push({ type: 'output', text: '[abrindo LocalStack Desktop...]' })
      scrollToBottom()
      tfApplied.value = true
      isTfRunning.value = false
      windowStore.localstackStatus = 'running'
      windowStore.openWindow('localstack')
    } else {
      terminalHistory.value.push({ type: 'output', text: 'Apply cancelled.' })
    }
    scrollToBottom()
    return
  }

  // Handle terraform destroy prompt
  if (isTfDestroyPrompt.value) {
    isTfDestroyPrompt.value = false
    terminalHistory.value.push({ type: 'input', text: `  Enter 'yes' to confirm: ${cmd}` })
    currentInput.value = ''
    if (cmd.toLowerCase() === 'yes') {
      isTfRunning.value = true
      const destroyResources = [
        'aws_sns_topic.contato',
        'aws_sqs_queue.curiosidades',
        'aws_cloudwatch.aprendizados',
        'aws_ec2_instance.sonhos',
        'aws_lambda_function.hobbies',
        'aws_dynamodb_table.valores',
        'aws_s3_bucket.origem',
        'aws_iam_role.principios'
      ]
      terminalHistory.value.push({ type: 'output', text: '' })
      for (const res of destroyResources) {
        terminalHistory.value.push({ type: 'output', text: `Destroying ${res}...` })
        scrollToBottom()
        await new Promise(r => setTimeout(r, 200 + Math.random() * 150))
      }
      terminalHistory.value.push({ type: 'output', text: 'aws_s3_bucket.origem: Still destroying... [3s]' })
      scrollToBottom()
      await new Promise(r => setTimeout(r, 800))
      terminalHistory.value.push({ type: 'output', text: '' })
      terminalHistory.value.push({ type: 'output', text: 'Destroy complete! But you can always run terraform apply again.' })
      terminalHistory.value.push({ type: 'output', text: 'Até a próxima. 👋' })
      scrollToBottom()
      isTfRunning.value = false
      tfApplied.value = false
      tfPlanDone.value = false
      tfInitDone.value = false
      windowStore.localstackStatus = 'stopped'
      windowStore.closeWindow('localstack')
    } else {
      terminalHistory.value.push({ type: 'output', text: 'Destroy cancelled.' })
    }
    scrollToBottom()
    return
  }

  // Print user prompt
  terminalHistory.value.push({ type: 'input', text: `bernardo@Bernardo-MacBook-Pro ~ % ${cmd}` })

  const commandNormalized = cmd.trim().toLowerCase().replace(/\s+/g, ' ')
  const args = commandNormalized.split(' ')
  const primaryCmd = args[0]

  switch (primaryCmd) {
    case 'help':
      terminalHistory.value.push({
        type: 'output',
        text: `COMANDOS DISPONÍVEIS:
  - help             → lista todos os comandos
  - htop             → monitor interativo de processos e recursos
  - whoami           → apresentação pessoal narrativa
  - skills           → stack técnico organizado por categoria
  - experience       → histórico profissional
  - projects         → lista projetos (integra com Files)
  - contact          → email, linkedin, github
  - kubectl get pods → lista experiências de trabalho como pods K8s
  - docker ps        → lista experiências de trabalho como containers Docker
  - terraform init   → inicializa o provedor AWS local
  - terraform plan   → mostra o plano de execução com recursos
  - terraform apply  → aplica e abre o LocalStack Desktop
  - terraform destroy → destrói os recursos e fecha o LocalStack
  - clear            → limpa o terminal

Easter eggs:
  - vim portfolio     → abre o portfólio em um editor Vim interativo`
      })
      break
    case 'htop':
      enterHtopMode()
      break
    case 'whoami':
      terminalHistory.value.push({
        type: 'output',
        text: `Bernardo Villanova de Santana
DevOps | Cloud | Kubernetes | Docker | IaC | CI & CD | Node | Full Stack

Olá, sou Bernardo, DevOps Engineer com mais de 5 anos de experiência prática em cloud computing, automação de infraestrutura e pipelines CI/CD, atuando principalmente com AWS, Terraform e Kubernetes.
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
      if (isTfRunning.value) {
        terminalHistory.value.push({ type: 'error', text: 'Terraform is already running. Please wait.' })
        break
      }
      if (args[1] === 'init') {
        isTfRunning.value = true
        currentInput.value = ''
        scrollToBottom()
        const initLines = [
          '',
          'Initializing the backend...',
          'Initializing provider plugins...',
          '- Finding hashicorp/aws versions matching "~> 5.0"...',
          '- Installing hashicorp/aws v5.31.0...',
          '- Installed hashicorp/aws v5.31.0 (signed by HashiCorp)',
          '',
          'Terraform has been successfully initialized!',
          '',
          'You may now begin working with Terraform. Try running "terraform plan" to see',
          'any changes that are required for your infrastructure.'
        ]
        for (const line of initLines) {
          await new Promise(r => setTimeout(r, 120 + Math.random() * 200))
          terminalHistory.value.push({ type: 'output', text: line })
          scrollToBottom()
        }
        tfInitDone.value = true
        isTfRunning.value = false
      } else if (args[1] === 'plan') {
        if (!tfInitDone.value) {
          terminalHistory.value.push({ type: 'error', text: 'Error: Terraform not initialized. Run "terraform init" first.' })
          break
        }
        isTfRunning.value = true
        currentInput.value = ''
        scrollToBottom()
        const planHeader = [
          '',
          'Terraform used the selected providers to generate the following',
          'execution plan. Resource actions are indicated with the following symbols:',
          '  + create',
          '',
          'Terraform will perform the following actions:',
          ''
        ]
        for (const line of planHeader) {
          await new Promise(r => setTimeout(r, 60 + Math.random() * 80))
          terminalHistory.value.push({ type: 'output', text: line })
          scrollToBottom()
        }
        const resources = [
          { key: 'aws_s3_bucket.origem', comment: 'minha-historia' },
          { key: 'aws_lambda_function.hobbies', comment: 'quem-sou-fora-do-trabalho' },
          { key: 'aws_dynamodb_table.valores', comment: 'o-que-me-move' },
          { key: 'aws_ec2_instance.sonhos', comment: 'onde-quero-chegar' },
          { key: 'aws_iam_role.principios', comment: 'como-trabalho' },
          { key: 'aws_cloudwatch.aprendizados', comment: 'o-que-aprendi' },
          { key: 'aws_sqs_queue.curiosidades', comment: 'fatos-aleatorios' },
          { key: 'aws_sns_topic.contato', comment: 'fale-comigo' }
        ]
        for (const res of resources) {
          await new Promise(r => setTimeout(r, 100 + Math.random() * 80))
          terminalHistory.value.push({ type: 'output', text: `  + ${res.key.padEnd(42)} # "${res.comment}"` })
          scrollToBottom()
        }
        const planFooter = [
          '',
          `Plan: ${resources.length} to add, 0 to change, 0 to destroy.`,
          '',
          '─────────────────────────────────────────────────────────────────────────',
          '',
          'Note: Run "terraform apply" to execute this plan.'
        ]
        for (const line of planFooter) {
          await new Promise(r => setTimeout(r, 50))
          terminalHistory.value.push({ type: 'output', text: line })
          scrollToBottom()
        }
        tfPlanDone.value = true
        isTfRunning.value = false
      } else if (args[1] === 'apply') {
        if (!tfPlanDone.value) {
          terminalHistory.value.push({ type: 'error', text: 'Error: No plan available. Run "terraform plan" first.' })
          break
        }
        if (tfApplied.value) {
          terminalHistory.value.push({ type: 'output', text: 'No changes. Infrastructure is up-to-date.' })
          break
        }
        terminalHistory.value.push({ type: 'output', text: `\nDo you want to perform these actions?\n  Terraform will perform these actions as described above.\n  Only 'yes' will be accepted to approve.\n\n  Enter a value: ` })
        isTfApplyPrompt.value = true
        scrollToBottom()
      } else if (args[1] === 'destroy') {
        if (!tfApplied.value) {
          terminalHistory.value.push({ type: 'error', text: 'Error: No resources to destroy. Run "terraform apply" first.' })
          break
        }
        terminalHistory.value.push({ type: 'output', text: `\nTerraform will destroy all your resources about me.\nAre you sure? This action cannot be undone.\n\nEnter 'yes' to confirm: ` })
        isTfDestroyPrompt.value = true
        scrollToBottom()
      } else {
        terminalHistory.value.push({
          type: 'error',
          text: `Uso: terraform <init|plan|apply|destroy>`
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
      {
        const sudoSubCmd = args.slice(1).join(' ')
        if (sudoSubCmd === 'apt update' || sudoSubCmd === 'apt-get update') {
          isSudoPrompt.value = true
          sudoAction.value = 'apt-update'
        } else {
          terminalHistory.value.push({
            type: 'error',
            text: `Erro: Comando sudo inválido. Tente 'sudo apt update'`
          })
        }
      }
      break
    case 'clear':
      terminalHistory.value = []
      break
    case 'ls':
      terminalHistory.value.push({
        type: 'output',
        text: 'boa, mas não tem nada'
      })
      break
    case 'shutdown':
    case 'restart':
      terminalHistory.value.push({
        type: 'output',
        text: 'ei, não vi graça nisso.'
      })
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
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  if (htopTimer) clearInterval(htopTimer)
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <div
    class="flex-grow flex flex-col font-mono text-sm leading-relaxed p-4 h-full relative overflow-hidden select-text select-text-safe transition-colors duration-300"
    :class="windowStore.theme === 'light' ? 'bg-white text-zinc-950' : 'bg-[#18181c] text-zinc-100'"
    @click="focusTerminalInput"
  >
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

    <!-- Mock htop monitor -->
    <div v-else-if="isHtopMode" class="flex-grow flex flex-col h-full text-zinc-200 font-mono text-xs select-text overflow-hidden">
      <!-- Top: CPU meters & Memory meters -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-white/10 shrink-0">
        <!-- Left: Cores 0-3 & Mem -->
        <div class="flex flex-col gap-1">
          <div v-for="m in htopCoresLeft" :key="m.core" class="flex items-center gap-1.5 text-[11px]">
            <span class="w-3 text-cyan-400 font-bold text-right">{{ m.core }}</span>
            <span class="text-zinc-500">[</span>
            <div class="flex-grow h-2 bg-white/5 rounded-xs overflow-hidden">
              <div class="h-full bg-emerald-400 rounded-xs transition-all duration-300" :style="{ width: `${m.pct}%` }"></div>
            </div>
            <span class="text-zinc-500">]</span>
            <span class="w-9 text-right text-zinc-300">{{ m.pct }}%</span>
          </div>
          <div class="flex items-center gap-1.5 text-[11px] pt-1">
            <span class="w-7 text-sky-400 font-bold">Mem</span>
            <span class="text-zinc-500">[</span>
            <div class="flex-grow h-2 bg-white/5 rounded-xs overflow-hidden">
              <div class="h-full bg-sky-400 rounded-xs" style="width: 28%"></div>
            </div>
            <span class="text-zinc-500">]</span>
            <span class="text-zinc-300 text-[10px]">1.24G/16.0G</span>
          </div>
        </div>

        <!-- Right: Cores 4-7 & Tasks/Uptime -->
        <div class="flex flex-col gap-1">
          <div v-for="m in htopCoresRight" :key="m.core" class="flex items-center gap-1.5 text-[11px]">
            <span class="w-3 text-cyan-400 font-bold text-right">{{ m.core }}</span>
            <span class="text-zinc-500">[</span>
            <div class="flex-grow h-2 bg-white/5 rounded-xs overflow-hidden">
              <div class="h-full bg-emerald-400 rounded-xs transition-all duration-300" :style="{ width: `${m.pct}%` }"></div>
            </div>
            <span class="text-zinc-500">]</span>
            <span class="w-9 text-right text-zinc-300">{{ m.pct }}%</span>
          </div>
          <div class="flex flex-col text-[10px] text-zinc-400 pt-0.5 leading-tight">
            <div>Tasks: <strong class="text-white">48</strong>, 8 thr; <strong class="text-emerald-400">2 running</strong></div>
            <div>Load average: <strong class="text-white">0.14 0.10 0.05</strong></div>
            <div>Uptime: <strong class="text-amber-300">~5 anos de experiência</strong></div>
          </div>
        </div>
      </div>

      <!-- Middle: Process list (table) -->
      <div class="flex-grow overflow-y-auto py-1 font-mono text-[11px]">
        <div class="bg-emerald-800 text-black font-bold px-1.5 py-0.5 grid grid-cols-12 text-[10px] select-none uppercase">
          <span class="col-span-1">PID</span>
          <span class="col-span-2">USER</span>
          <span class="col-span-1">PRI</span>
          <span class="col-span-1">NI</span>
          <span class="col-span-1">VIRT</span>
          <span class="col-span-1">RES</span>
          <span class="col-span-1">CPU%</span>
          <span class="col-span-1">MEM%</span>
          <span class="col-span-1">TIME+</span>
          <span class="col-span-2">Command</span>
        </div>
        <div
          v-for="(p, idx) in htopProcessList"
          :key="p.pid"
          class="px-1.5 py-0.5 grid grid-cols-12 text-[11px] hover:bg-white/5 cursor-pointer font-mono"
          :class="idx === selectedHtopRow ? 'bg-sky-900/60 text-white' : 'text-zinc-300'"
          @click="selectedHtopRow = idx"
        >
          <span class="col-span-1 text-zinc-400">{{ p.pid }}</span>
          <span class="col-span-2 text-zinc-400">{{ p.user }}</span>
          <span class="col-span-1 text-zinc-500">20</span>
          <span class="col-span-1 text-zinc-500">0</span>
          <span class="col-span-1 text-zinc-400">{{ p.virt }}</span>
          <span class="col-span-1 text-zinc-400">{{ p.res }}</span>
          <span class="col-span-1 font-bold text-emerald-400">{{ p.cpu }}</span>
          <span class="col-span-1 text-sky-400">{{ p.mem }}</span>
          <span class="col-span-1 text-zinc-400">{{ p.time }}</span>
          <span class="col-span-2 text-white truncate font-bold">{{ p.command }}</span>
        </div>
      </div>

      <!-- Bottom: htop function keys footer -->
      <div class="bg-black/80 border-t border-white/10 pt-1 mt-auto flex items-center justify-between text-[11px] select-none">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="px-1.5 py-0.5 bg-white/10 text-white rounded-xs">F1 Help</span>
          <span class="px-1.5 py-0.5 bg-white/10 text-white rounded-xs">F2 Setup</span>
          <span class="px-1.5 py-0.5 bg-white/10 text-white rounded-xs">F3 Search</span>
          <span class="px-1.5 py-0.5 bg-white/10 text-white rounded-xs">F5 Tree</span>
          <button @click="exitHtop" class="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded-xs font-bold transition cursor-pointer">
            F10 Quit (q)
          </button>
        </div>
        <span class="text-zinc-400 text-[10px]">Pressione <kbd class="text-amber-300 font-bold">q</kbd> para sair</span>
      </div>
    </div>

    <!-- Boot and Command history screen -->
    <div v-else ref="terminalBody" class="flex-grow overflow-y-auto pr-1 flex flex-col gap-1 select-text">
      
      <div v-for="(item, idx) in terminalHistory" :key="idx" class="whitespace-pre-wrap select-text">
        <template v-if="item.type === 'boot'">
          <span :class="windowStore.theme === 'light' ? 'text-zinc-500' : 'text-gray-400'" class="select-text">{{ item.text }}</span>
        </template>
        <template v-else-if="item.type === 'input'">
          <template v-if="item.text.startsWith('bernardo@Bernardo-MacBook-Pro ~ % ')">
            <span class="font-semibold select-text" :class="windowStore.theme === 'light' ? 'text-zinc-950' : 'text-white'">bernardo@Bernardo-MacBook-Pro</span>
            <span class="select-text" :class="windowStore.theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'"> ~ % </span>
            <span class="select-text font-normal" :class="windowStore.theme === 'light' ? 'text-zinc-900' : 'text-zinc-200'">{{ item.text.substring(34) }}</span>
          </template>
          <template v-else-if="item.text.startsWith('[sudo] password for bernardo: ')">
            <span class="font-semibold select-text" :class="windowStore.theme === 'light' ? 'text-zinc-600' : 'text-zinc-300'">[sudo] password for bernardo: </span>
            <span class="select-text font-normal" :class="windowStore.theme === 'light' ? 'text-zinc-900' : 'text-zinc-200'">{{ item.text.substring(30) }}</span>
          </template>
          <template v-else-if="item.text.startsWith('  Enter a value: ')">
            <span class="font-semibold select-text" :class="windowStore.theme === 'light' ? 'text-zinc-600' : 'text-zinc-300'">  Enter a value: </span>
            <span class="select-text font-normal" :class="windowStore.theme === 'light' ? 'text-zinc-900' : 'text-zinc-200'">{{ item.text.substring(17) }}</span>
          </template>
          <template v-else-if="item.text.startsWith('  Enter \'yes\' to confirm: ')">
            <span class="font-semibold select-text" :class="windowStore.theme === 'light' ? 'text-zinc-600' : 'text-zinc-300'">  Enter 'yes' to confirm: </span>
            <span class="select-text font-normal" :class="windowStore.theme === 'light' ? 'text-zinc-900' : 'text-zinc-200'">{{ item.text.substring(26) }}</span>
          </template>
          <template v-else>
            <span class="select-text font-normal" :class="windowStore.theme === 'light' ? 'text-zinc-900' : 'text-zinc-200'">{{ item.text }}</span>
          </template>
        </template>
        <template v-else-if="item.type === 'output'">
          <span class="select-text" :class="windowStore.theme === 'light' ? 'text-zinc-800' : 'text-gray-300'">{{ item.text }}</span>
        </template>
        <template v-else-if="item.type === 'neofetch'">
          <div class="flex flex-col lg:flex-row gap-4 lg:gap-8 py-2 select-text text-[11px] sm:text-xs leading-normal font-mono shrink-0 overflow-x-auto">
            <!-- BERNOS ASCII Art Banner -->
            <pre
              class="font-extrabold select-text leading-tight shrink-0 font-mono transition-colors duration-300"
              :class="windowStore.theme === 'light' ? 'text-amber-600' : 'text-amber-400'"
            >
  ██████╗ ███████╗██████╗ ███╗   ██╗ ██████╗ ███████╗
  ██╔══██╗██╔════╝██╔══██╗████╗  ██║██╔═══██╗██╔════╝
  ██████╔╝█████╗  ██████╔╝██╔██╗ ██║██║   ██║███████╗
  ██╔══██╗██╔══╝  ██╔══██╗██║╚██╗██║██║   ██║╚════██║
  ██████╔╝███████╗██║  ██║██║ ╚████║╚██████╔╝███████║
  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝</pre>
            <!-- Stats -->
            <div class="flex flex-col gap-0.5 select-text font-mono" :class="windowStore.theme === 'light' ? 'text-zinc-800' : 'text-gray-300'">
              <div><span class="font-bold text-sky-500">bernardo@Bernardo-MacBook-Pro</span></div>
              <div :class="windowStore.theme === 'light' ? 'text-zinc-400' : 'text-zinc-600'">--------------------------------</div>
              <div><span class="font-semibold text-sky-500">os:</span> bernOS (macOS Sequoia Edition / Darwin 24.0.0)</div>
              <div><span class="font-semibold text-sky-500">host:</span> MacBook Pro (16-inch, Nov 2024)</div>
              <div><span class="font-semibold text-sky-500">role:</span> Analista DevOps · Casa do Construtor</div>
              <div><span class="font-semibold text-sky-500">stack:</span> Kubernetes · AWS · Terraform · CI/CD</div>
              <div><span class="font-semibold text-sky-500">shell:</span> zsh 5.9 (x86_64-apple-darwin24.0)</div>
              <div><span class="font-semibold text-sky-500">uptime:</span> ~5 anos de experiência</div>
              <div><span class="font-semibold text-sky-500">github:</span> github.com/bernardovillanova</div>
              <div class="flex flex-wrap gap-1 mt-1.5 items-center">
                <span class="text-black dark:text-white font-bold">████</span>
                <span class="text-red-500 font-bold">████</span>
                <span class="text-green-500 font-bold">████</span>
                <span class="text-yellow-500 font-bold">████</span>
                <span class="text-blue-500 font-bold">████</span>
                <span class="text-purple-500 font-bold">████</span>
                <span class="text-cyan-500 font-bold">████</span>
                <span class="ml-2 text-[10px] font-semibold" :class="windowStore.theme === 'light' ? 'text-amber-700' : 'text-amber-300'">coffee: unlimited ☕</span>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'error'">
          <span class="select-text" :class="windowStore.theme === 'light' ? 'text-red-600' : 'text-red-400'">{{ item.text }}</span>
        </template>
      </div>

      <!-- Current Input Prompt -->
      <div v-if="!isBooting" class="flex items-center gap-1 mt-2 shrink-0 select-text w-full">
        <template v-if="isSudoPrompt">
          <span class="font-semibold shrink-0 select-text" :class="windowStore.theme === 'light' ? 'text-zinc-700' : 'text-gray-300'">[sudo] password for bernardo: </span>
        </template>
        <template v-else>
          <span class="font-semibold shrink-0 select-text" :class="windowStore.theme === 'light' ? 'text-zinc-950' : 'text-white'">bernardo@Bernardo-MacBook-Pro</span>
          <span class="shrink-0 select-text" :class="windowStore.theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'">~ %</span>
        </template>
        <div class="relative flex-grow flex items-center select-text ml-1.5">
          <input
            v-model="currentInput"
            :type="isSudoPrompt ? 'password' : 'text'"
            class="w-full bg-transparent outline-none border-none p-0 select-text select-text-safe font-mono"
            :class="windowStore.theme === 'light' ? 'text-zinc-950' : 'text-gray-100'"
            :autofocus="!isMobileDevice()"
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
