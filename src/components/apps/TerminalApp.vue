<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

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
    await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 50))
    terminalHistory.value.push({ type: 'boot', text: bootLines[i] })
    scrollToBottom()
  }
  isBooting.value = false
  printNeofetch()
  scrollToBottom()
}

const printNeofetch = () => {
  terminalHistory.value.push({ type: 'neofetch', text: '' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (terminalBody.value) {
      terminalBody.value.scrollTop = terminalBody.value.scrollHeight
    }
  })
}

const handleCommand = () => {
  const cmd = currentInput.value.trim()
  if (!cmd) return

  // Add to command history
  commandHistory.value.push(cmd)
  historyIndex.value = commandHistory.value.length
  
  // Print user prompt
  terminalHistory.value.push({ type: 'input', text: `guest@bernos:~$ ${cmd}` })

  const args = cmd.toLowerCase().split(' ')
  const primaryCmd = args[0]

  switch (primaryCmd) {
    case 'help':
      terminalHistory.value.push({
        type: 'output',
        text: `Available commands:
  - neofetch      Display system environment and info
  - about         Professional summary of Bernardo
  - skills        Show technical skills (Cloud, IaC, Dev, etc.)
  - experience    Professional career history
  - projects      Personal and open-source projects
  - contact       Get email, LinkedIn, and GitHub links
  - clear         Clear the terminal screen
  - help          Show this menu`
      })
      break
    case 'neofetch':
      printNeofetch()
      break
    case 'about':
      terminalHistory.value.push({
        type: 'output',
        text: `Bernardo Villanova de Santana
DevOps Pleno | Cloud Computing | Full Stack Developer

Resumo Profissional:
Atuo como DevOps Engineer com mais de 4 anos de experiência em automação de infraestrutura,
arquitetura de nuvem (AWS) e pipelines CI/CD. Tenho sólida vivência com Terraform, Docker,
Kubernetes, GitHub Actions, Jenkins, além de desenvolvimento backend em Node.js (GraphQL/REST)
e interfaces modernas em Vue.js e React. Trabalho para tornar sistemas escaláveis,
seguros e monitorados com ferramentas de observabilidade (Grafana/CloudWatch).`
      })
      break
    case 'skills':
      terminalHistory.value.push({
        type: 'output',
        text: `HABILIDADES TÉCNICAS:
  - Cloud: AWS (EC2, EKS, ECS, S3, RDS, IAM, VPC), GCP, Azure
  - IaC: Terraform, CloudFormation
  - Containers: Docker, Kubernetes, ECS
  - CI/CD: GitHub Actions, Jenkins, AWS CodePipeline, GitFlow
  - Observabilidade: Grafana, Prometheus, CloudWatch
  - Programação: Node.js, TypeScript, JavaScript (ES6+), Shell Script, Python
  - Front-end: Vue.js, React.js, Next.js, TailwindCSS
  - Bancos de dados: PostgreSQL, MongoDB, SQL Server, MySQL`
      })
      break
    case 'experience':
      terminalHistory.value.push({
        type: 'output',
        text: `EXPERIÊNCIA PROFISSIONAL:
  1. Engenheiro DevOps Pleno (2025 - Atual) | Yeb Inteligência de Mercado
     - Gestão completa de infraestrutura AWS, Terraform, liderança técnica em CI/CD, observabilidade (Grafana/CloudWatch).
  2. Engenheiro DevOps Júnior (2024 - 2025) | Yeb Inteligência de Mercado
     - Resposta a incidentes, observabilidade, monitoramento de serviços Node.js/GraphQL.
  3. Desenvolvedor Full Stack (2024) | Yeb Inteligência de Mercado
     - Manutenção de APIs Node.js/Express e views em Vue.js/React.
  4. Engenheiro DevOps Freelancer (2023) | Projeto Internacional (EUA)
     - Provedor AWS com Terraform modularizado, práticas GitOps, Docker e Kubernetes.
  5. DevOps Engineer (2022 - 2023) | EZOps.cloud (EUA)
     - Provisionamento de nuvem com CloudFormation/Terraform, CI/CD pipelines.`
      })
      break
    case 'projects':
      terminalHistory.value.push({
        type: 'output',
        text: `PROJETOS EM DESTAQUE:
  - Terraform IaC AWS: Módulos escaláveis para subnets, redes e orquestradores (GitHub)
  - PipelineWithActions: Templates de CI/CD contínuo via GitHub Actions integrados com EKS (GitHub)
  - Plataforma Fitness: Sistema Web completo integrado (Node.js, Vue 3, PostgreSQL) (GitHub)`
      })
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
    case 'clear':
      terminalHistory.value = []
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
    <!-- Boot and Command history screen -->
    <div ref="terminalBody" class="flex-grow overflow-y-auto pr-1 flex flex-col gap-1 select-text">
      
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
          <div class="flex flex-col sm:flex-row gap-6 py-2 select-text text-xs leading-normal font-mono shrink-0">
            <!-- Cat ASCII Art -->
            <pre class="text-brand-orange font-bold select-text leading-tight shrink-0">
   /\_/\
  ( o.o )
   > ^ <
  /     \
 (  | |  )
 (__|_|__)
            </pre>
            <!-- System Stats Info -->
            <div class="flex flex-col gap-0.5 select-text font-mono">
              <div class="select-text"><span class="text-brand-orange-light font-bold">guest@bernos.dev</span></div>
              <div class="text-gray-600 select-text">-----------------</div>
              <div class="select-text"><span class="text-brand-orange font-semibold">OS:</span> BernOS x86_64</div>
              <div class="select-text"><span class="text-brand-orange font-semibold">Kernel:</span> Bun 1.3.14 (Vite)</div>
              <div class="select-text"><span class="text-brand-orange font-semibold">Uptime:</span> 4 mins</div>
              <div class="select-text"><span class="text-brand-orange font-semibold">Shell:</span> Vue 3 / Pinia / Tailwind</div>
              <div class="select-text"><span class="text-brand-orange font-semibold">DE:</span> Noctalia Space Desktop</div>
              <div class="select-text"><span class="text-brand-orange font-semibold">WM:</span> OsWindowManager v1.0</div>
              <div class="select-text"><span class="text-brand-orange font-semibold">CPU:</span> DevOps Cloud Processor v4</div>
              <div class="select-text"><span class="text-brand-orange font-semibold">Terminal:</span> BunTerminal (xterm-256color)</div>
              <div class="select-text"><span class="text-brand-orange font-semibold">Author:</span> Bernardo Villanova</div>
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'error'">
          <span class="text-red-400 select-text">{{ item.text }}</span>
        </template>
      </div>

      <!-- Current Input Prompt -->
      <div v-if="!isBooting" class="flex items-center gap-2 mt-2 shrink-0 select-text">
        <span class="text-brand-orange font-semibold shrink-0 select-text">guest@bernos:~$</span>
        <div class="relative flex-grow flex items-center select-text">
          <input
            v-model="currentInput"
            type="text"
            class="w-full bg-transparent text-gray-200 outline-none border-none p-0 select-text select-text-safe"
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
