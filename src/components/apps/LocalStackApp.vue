<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useWindowStore } from '../../stores/windowStore'
import {
  Search,
  List,
  TerminalSquare,
  LayoutGrid,
  X,
  ChevronRight,
  Loader2,
  Check,
  Server,
  Code,
  Box,
  Database,
  HardDrive,
  Globe,
  Workflow,
  Zap,
  Shield,
  Key,
  Lock,
  UserCheck,
  Mail,
  Activity,
  Cpu,
  Share2,
  Copy,
  CheckCheck,
  RefreshCw,
  Cloud
} from 'lucide-vue-next'

const store = useWindowStore()

// ---------- types ----------
interface TerraformResource {
  id: number
  service_name: string
  resource_key: string
  aws_category: string
  icon_color: string
  is_pro: number
  curiosity_title: string
  curiosity_content: string
  display_order: number
  column_position: number
}

// ---------- state ----------
const services = ref<TerraformResource[]>([])
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list' | 'terminal'>('grid')
const selectedService = ref<TerraformResource | null>(null)
const drawerOpen = ref(false)
const isDeploying = ref(false)
const deployedIds = ref<Set<number>>(new Set())
const deployComplete = ref(false)
const showToast = ref(false)
const copied = ref(false)
const miniTermInput = ref('')
const miniTermHistory = ref<{ type: 'input' | 'output' | 'error'; text: string }[]>([])
const miniTermBody = ref<HTMLElement | null>(null)

// ---------- deploy order (services that have resource_key) ----------
const deployOrder = computed(() => {
  return services.value
    .filter(s => s.resource_key)
    .sort((a, b) => a.column_position - b.column_position || a.display_order - b.display_order)
})

// ---------- grouped by column → category ----------
interface CategoryGroup {
  category: string
  items: TerraformResource[]
}
interface ColumnGroup {
  column: number
  categories: CategoryGroup[]
}

const columns = computed<ColumnGroup[]>(() => {
  const cols: Map<number, Map<string, TerraformResource[]>> = new Map()
  const filtered = filteredServices.value
  for (const svc of filtered) {
    if (!cols.has(svc.column_position)) cols.set(svc.column_position, new Map())
    const catMap = cols.get(svc.column_position)!
    if (!catMap.has(svc.aws_category)) catMap.set(svc.aws_category, [])
    catMap.get(svc.aws_category)!.push(svc)
  }
  const result: ColumnGroup[] = []
  for (const [col, catMap] of [...cols.entries()].sort((a, b) => a[0] - b[0])) {
    const categories: CategoryGroup[] = []
    for (const [cat, items] of catMap.entries()) {
      categories.push({ category: cat, items: items.sort((a, b) => a.display_order - b.display_order) })
    }
    result.push({ column: col, categories })
  }
  return result
})

const filteredServices = computed(() => {
  if (!searchQuery.value.trim()) return services.value
  const q = searchQuery.value.toLowerCase()
  return services.value.filter(s =>
    s.service_name.toLowerCase().includes(q) ||
    s.aws_category.toLowerCase().includes(q) ||
    s.curiosity_title.toLowerCase().includes(q) ||
    s.curiosity_content.toLowerCase().includes(q)
  )
})

const servicesWithCuriosity = computed(() => services.value.filter(s => s.curiosity_content))

// ---------- Clean Vector Icon Mapping ----------
const getServiceIcon = (name: string) => {
  switch (name) {
    case 'EC2': return Server
    case 'Lambda': return Code
    case 'ECS':
    case 'ECR': return Box
    case 'S3':
    case 'Backup': return HardDrive
    case 'DynamoDB':
    case 'RDS':
    case 'ElastiCache':
    case 'Timestream': return Database
    case 'Route 53': return Globe
    case 'API Gateway':
    case 'AppSync':
    case 'Step Functions': return Workflow
    case 'EventBridge': return Zap
    case 'SQS':
    case 'SES': return Mail
    case 'Cognito': return UserCheck
    case 'Secrets Manager': return Key
    case 'KMS': return Lock
    case 'IAM': return Shield
    case 'CloudWatch':
    case 'CloudWatch Logs':
    case 'CloudTrail': return Activity
    case 'SageMaker': return Cpu
    case 'Kinesis':
    case 'Kafka':
    case 'Glue':
    case 'Athena': return Share2
    default: return Cloud
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Compute': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    case 'Storage': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    case 'Database': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    case 'Networking & Content Delivery': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    case 'Security Identity Compliance': return 'text-red-400 bg-red-500/10 border-red-500/20'
    case 'Application Integration': return 'text-pink-400 bg-pink-500/10 border-pink-500/20'
    case 'Management & Governance': return 'text-sky-400 bg-sky-500/10 border-sky-500/20'
    case 'Analytics': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
  }
}

// ---------- fetch ----------
async function fetchServices() {
  try {
    const res = await fetch('/api/terraform')
    services.value = await res.json()
  } catch {
    console.error('[LocalStack] Failed to fetch terraform resources')
  }
}

// ---------- deploy animation ----------
async function runDeployAnimation() {
  if (deployComplete.value || isDeploying.value) return
  isDeploying.value = true
  for (const svc of deployOrder.value) {
    await new Promise(r => setTimeout(r, 160 + Math.random() * 80))
    deployedIds.value.add(svc.id)
  }
  for (const svc of services.value) {
    deployedIds.value.add(svc.id)
  }
  isDeploying.value = false
  deployComplete.value = true
  showToast.value = true
  store.localstackStatus = 'running'
  setTimeout(() => { showToast.value = false }, 3500)
}

function redeployAll() {
  deployedIds.value.clear()
  deployComplete.value = false
  runDeployAnimation()
}

function isDeployed(id: number) {
  return deployedIds.value.has(id)
}

// ---------- drawer ----------
function openDrawer(svc: TerraformResource) {
  if (!svc.curiosity_content) return
  selectedService.value = svc
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
  setTimeout(() => { selectedService.value = null }, 200)
}

function nextService() {
  if (!selectedService.value) return
  const list = servicesWithCuriosity.value
  const idx = list.findIndex(s => s.id === selectedService.value!.id)
  const next = list[(idx + 1) % list.length]
  selectedService.value = next
}

const copySnippet = (text: string) => {
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// ---------- mini terminal ----------
function scrollMiniTerm() {
  nextTick(() => {
    if (miniTermBody.value) miniTermBody.value.scrollTop = miniTermBody.value.scrollHeight
  })
}

function executePresetCommand(cmd: string) {
  miniTermInput.value = cmd
  handleMiniTermCommand()
}

function handleMiniTermCommand() {
  const cmd = miniTermInput.value.trim()
  if (!cmd) return
  miniTermHistory.value.push({ type: 'input', text: `$ ${cmd}` })
  const normalized = cmd.toLowerCase().replace(/\s+/g, ' ')

  if (normalized.startsWith('aws s3 ls')) {
    const storage = services.value.filter(s => s.aws_category === 'Storage' && s.curiosity_content)
    if (storage.length) {
      const lines = storage.map(s => `  2026-10-09 00:00:00  s3://${s.service_name.toLowerCase().replace(/\s/g, '-')}/  (${s.curiosity_title})`).join('\n')
      miniTermHistory.value.push({ type: 'output', text: lines })
    } else {
      miniTermHistory.value.push({ type: 'output', text: '(no buckets found)' })
    }
  } else if (normalized.startsWith('aws lambda list-functions')) {
    const compute = services.value.filter(s => s.aws_category === 'Compute' && s.curiosity_content)
    if (compute.length) {
      const lines = compute.map(s => `  arn:aws:lambda:us-east-1:000000000000:function/${s.service_name.toLowerCase().replace(/\s/g, '-')}  [Runtime: nodejs20.x]`).join('\n')
      miniTermHistory.value.push({ type: 'output', text: lines })
    } else {
      miniTermHistory.value.push({ type: 'output', text: '(no functions found)' })
    }
  } else if (normalized.startsWith('aws iam list-roles')) {
    const sec = services.value.filter(s => s.aws_category === 'Security Identity Compliance' && s.curiosity_content)
    if (sec.length) {
      const lines = sec.map(s => `  arn:aws:iam::000000000000:role/${s.service_name.toLowerCase().replace(/\s/g, '-')}  (Policy: AdministratorAccess)`).join('\n')
      miniTermHistory.value.push({ type: 'output', text: lines })
    } else {
      miniTermHistory.value.push({ type: 'output', text: '(no roles found)' })
    }
  } else if (normalized === 'clear') {
    miniTermHistory.value = []
  } else if (normalized === 'help') {
    miniTermHistory.value.push({
      type: 'output',
      text: 'Available awslocal commands:\n  aws s3 ls\n  aws lambda list-functions\n  aws iam list-roles\n  clear\n  help'
    })
  } else {
    miniTermHistory.value.push({ type: 'error', text: `An error occurred: command '${cmd}' not supported in emulated us-east-1 endpoint` })
  }

  miniTermInput.value = ''
  scrollMiniTerm()
}

// ---------- lifecycle ----------
onMounted(async () => {
  await fetchServices()
  if (services.value.length > 0 && !deployComplete.value && !isDeploying.value) {
    setTimeout(() => runDeployAnimation(), 400)
  }
})

watch(
  [() => store.windows.find(w => w.id === 'localstack')?.isOpen, () => services.value.length],
  ([isOpen, count]) => {
    if (isOpen && count > 0 && !deployComplete.value && !isDeploying.value) {
      setTimeout(() => runDeployAnimation(), 400)
    }
  }
)
</script>

<template>
  <div class="w-full h-full bg-[#0c0d12] flex flex-col overflow-hidden text-zinc-300 font-sans select-none relative">
    
    <!-- Header Bar (Modern Dark Studio Console) -->
    <div class="h-12 bg-[#090a0e] border-b border-white/[0.08] flex items-center justify-between px-3.5 sm:px-4 shrink-0 gap-3">
      
      <!-- Left: Logo & Engine Meta -->
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Cloud class="w-4 h-4 stroke-[2]" />
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-zinc-100 tracking-tight">LocalStack Studio</span>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              v4.2.0
            </span>
          </div>
          <span class="text-[10px] text-zinc-500 font-mono hidden sm:inline">us-east-1 · local endpoint</span>
        </div>
      </div>

      <!-- Center: View Switcher -->
      <div class="flex items-center bg-white/[0.04] p-1 rounded-lg border border-white/[0.06] text-xs">
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer"
          :class="viewMode === 'grid' ? 'bg-white/10 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'"
          @click="viewMode = 'grid'"
        >
          <LayoutGrid class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Grid</span>
        </button>
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer"
          :class="viewMode === 'list' ? 'bg-white/10 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'"
          @click="viewMode = 'list'"
        >
          <List class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Lista</span>
        </button>
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer"
          :class="viewMode === 'terminal' ? 'bg-white/10 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'"
          @click="viewMode = 'terminal'"
        >
          <TerminalSquare class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Terminal</span>
        </button>
      </div>

      <!-- Right: Action Buttons -->
      <div class="flex items-center gap-2">
        <button
          v-if="!isDeploying"
          @click="redeployAll"
          class="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-md transition cursor-pointer"
          title="Reaplicar Terraform"
        >
          <RefreshCw class="w-3 h-3" />
          <span class="hidden md:inline">Reaplicar</span>
        </button>
      </div>
    </div>

    <!-- Search & Filter Ribbon -->
    <div v-if="viewMode !== 'terminal'" class="px-4 py-2 bg-[#090a0e]/60 border-b border-white/[0.06] flex items-center justify-between gap-3 shrink-0">
      <div class="relative flex-grow max-w-md">
        <Search class="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filtrar por serviço, categoria ou tag..."
          class="w-full bg-[#12131b] border border-white/[0.06] focus:border-amber-500/40 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition"
        />
      </div>
      <div class="text-[11px] text-zinc-500 font-mono hidden sm:flex items-center gap-2">
        <span>Total: <strong class="text-zinc-300">{{ filteredServices.length }}</strong> recursos</span>
        <span>·</span>
        <span class="text-emerald-400 font-medium">{{ deployedIds.size }} provisionados</span>
      </div>
    </div>

    <!-- Toast notification -->
    <Transition name="fade">
      <div
        v-if="showToast"
        class="absolute top-16 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-emerald-950/80 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs shadow-xl backdrop-blur-md"
      >
        <Check class="w-3.5 h-3.5 text-emerald-400" />
        <span>Terraform apply completo: {{ deployOrder.length }} recursos ativos!</span>
      </div>
    </Transition>

    <!-- Main Content Area -->
    <div class="flex-grow overflow-auto p-4 relative">
      
      <!-- GRID VIEW -->
      <template v-if="viewMode === 'grid'">
        <div v-if="filteredServices.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="col in columns"
            :key="col.column"
            class="flex flex-col gap-4"
          >
            <div
              v-for="catGroup in col.categories"
              :key="catGroup.category"
              class="flex flex-col gap-2"
            >
              <!-- Category Header -->
              <div class="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-white/[0.06] pb-1 px-1">
                <span>{{ catGroup.category }}</span>
                <span class="font-mono text-[9px] text-zinc-500">{{ catGroup.items.length }}</span>
              </div>

              <!-- Service Cards -->
              <div class="flex flex-col gap-1.5">
                <div
                  v-for="svc in catGroup.items"
                  :key="svc.id"
                  @click="openDrawer(svc)"
                  class="group flex items-center justify-between p-2 rounded-xl border transition-all duration-150 cursor-pointer"
                  :class="[
                    selectedService?.id === svc.id && drawerOpen
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : 'bg-[#11131a] hover:bg-[#161822] border-white/[0.06] hover:border-white/15 text-zinc-300'
                  ]"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <!-- Vector Service Icon -->
                    <div
                      class="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-colors"
                      :class="getCategoryColor(svc.aws_category)"
                    >
                      <component :is="getServiceIcon(svc.service_name)" class="w-3.5 h-3.5 stroke-[2]" />
                    </div>

                    <!-- Service info -->
                    <div class="flex flex-col min-w-0">
                      <div class="flex items-center gap-1.5 truncate">
                        <span class="text-xs font-medium text-zinc-200 group-hover:text-white truncate">{{ svc.service_name }}</span>
                        <span v-if="svc.is_pro" class="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 leading-none">
                          Pro
                        </span>
                      </div>
                      <span class="text-[10px] text-zinc-500 font-mono truncate">{{ svc.resource_key || 'aws_resource' }}</span>
                    </div>
                  </div>

                  <!-- Status Dot / Deploy spinner -->
                  <div class="flex items-center pl-2 shrink-0">
                    <Loader2 v-if="!isDeployed(svc.id) && isDeploying" class="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span
                      v-else-if="isDeployed(svc.id)"
                      class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                      title="Ativo / Deployed"
                    ></span>
                    <span v-else class="w-2 h-2 rounded-full bg-zinc-600" title="Standby"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center h-64 text-zinc-500 gap-2">
          <Search class="w-8 h-8 text-zinc-600" />
          <p class="text-xs">Nenhum recurso encontrado para "{{ searchQuery }}"</p>
        </div>
      </template>

      <!-- LIST VIEW -->
      <template v-else-if="viewMode === 'list'">
        <div v-if="filteredServices.length > 0" class="flex flex-col gap-1.5 max-w-4xl mx-auto">
          <div
            v-for="svc in filteredServices"
            :key="svc.id"
            @click="openDrawer(svc)"
            class="flex items-center justify-between p-2.5 rounded-xl border bg-[#11131a] hover:bg-[#161822] border-white/[0.06] hover:border-white/15 transition-all duration-150 cursor-pointer group"
            :class="selectedService?.id === svc.id && drawerOpen ? 'border-amber-500/40 bg-amber-500/10' : ''"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
                :class="getCategoryColor(svc.aws_category)"
              >
                <component :is="getServiceIcon(svc.service_name)" class="w-4 h-4 stroke-[2]" />
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold text-zinc-200 group-hover:text-white">{{ svc.service_name }}</span>
                  <span v-if="svc.is_pro" class="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">Pro</span>
                </div>
                <span class="text-[10px] text-zinc-500 font-mono truncate">{{ svc.resource_key || 'aws_resource' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <span class="text-[11px] text-zinc-400 font-mono hidden sm:inline">{{ svc.aws_category }}</span>
              <div class="flex items-center gap-2">
                <span
                  v-if="isDeployed(svc.id)"
                  class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active
                </span>
                <span
                  v-else-if="isDeploying"
                  class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5"
                >
                  <Loader2 class="w-3 h-3 animate-spin" />
                  Creating
                </span>
                <ChevronRight class="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition" />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center h-64 text-zinc-500 gap-2">
          <Search class="w-8 h-8 text-zinc-600" />
          <p class="text-xs">Nenhum serviço listado para a busca.</p>
        </div>
      </template>

      <!-- TERMINAL VIEW -->
      <template v-else-if="viewMode === 'terminal'">
        <div class="h-full bg-[#08090d] rounded-xl border border-white/[0.08] flex flex-col overflow-hidden font-mono text-xs shadow-2xl">
          <!-- Terminal Titlebar -->
          <div class="h-8 bg-[#0e1017] border-b border-white/[0.06] px-3 flex items-center justify-between text-zinc-400 select-none">
            <span class="flex items-center gap-1.5 text-[11px]">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              awslocal CLI — endpoint: http://localhost:4566
            </span>
            <div class="flex items-center gap-2 text-[10px]">
              <span class="text-zinc-500">Região: us-east-1</span>
            </div>
          </div>

          <!-- Quick Command Preset Chips -->
          <div class="px-3 py-1.5 bg-[#0b0c12] border-b border-white/[0.04] flex items-center gap-2 overflow-x-auto select-none">
            <span class="text-[10px] text-zinc-500 shrink-0">Comandos rápidos:</span>
            <button
              v-for="cmd in ['aws s3 ls', 'aws lambda list-functions', 'aws iam list-roles', 'help', 'clear']"
              :key="cmd"
              @click="executePresetCommand(cmd)"
              class="px-2 py-0.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 rounded text-[10px] transition cursor-pointer shrink-0 font-mono"
            >
              {{ cmd }}
            </button>
          </div>

          <!-- Terminal Output Body -->
          <div ref="miniTermBody" class="flex-grow p-4 overflow-y-auto space-y-2 select-text leading-relaxed text-zinc-300">
            <div class="text-zinc-500 text-[11px] pb-2 border-b border-white/[0.04]">
              LocalStack 4.2.0 Emulation Engine.<br />
              Digite comandos da AWS CLI (usando o alias awslocal) ou clique nos atalhos acima.
            </div>

            <div v-for="(entry, idx) in miniTermHistory" :key="idx" class="whitespace-pre-wrap">
              <span v-if="entry.type === 'input'" class="text-amber-400 font-semibold">{{ entry.text }}</span>
              <pre v-else-if="entry.type === 'output'" class="text-emerald-400 font-mono text-[11px]">{{ entry.text }}</pre>
              <span v-else class="text-red-400 font-mono text-[11px]">{{ entry.text }}</span>
            </div>
          </div>

          <!-- Terminal Input Row -->
          <div class="p-2.5 bg-[#0a0b10] border-t border-white/[0.06] flex items-center gap-2">
            <span class="text-emerald-400 font-bold select-none text-xs">awslocal $</span>
            <input
              v-model="miniTermInput"
              type="text"
              class="flex-grow bg-transparent text-zinc-200 outline-none text-xs font-mono placeholder-zinc-600"
              placeholder="Digite um comando (ex: aws s3 ls)..."
              @keydown.enter="handleMiniTermCommand"
            />
          </div>
        </div>
      </template>

    </div>

    <!-- Detail Drawer (Slide-in Inspect Panel) -->
    <Transition name="drawer">
      <div
        v-if="drawerOpen && selectedService"
        class="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#0c0d12]/95 border-l border-white/10 shadow-2xl backdrop-blur-2xl z-[100] flex flex-col select-text"
      >
        <!-- Drawer Header -->
        <div class="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
              :class="getCategoryColor(selectedService.aws_category)"
            >
              <component :is="getServiceIcon(selectedService.service_name)" class="w-5 h-5 stroke-[2]" />
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-semibold text-white">{{ selectedService.service_name }}</h3>
                <span v-if="selectedService.is_pro" class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Pro Feature
                </span>
              </div>
              <span class="text-[11px] text-zinc-400 font-mono">{{ selectedService.aws_category }}</span>
            </div>
          </div>

          <button
            @click="closeDrawer"
            class="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Drawer Body -->
        <div class="flex-grow p-4 overflow-y-auto flex flex-col gap-4 text-xs leading-relaxed">
          
          <!-- Resource Identifier Card -->
          <div class="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex flex-col gap-2">
            <span class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Identificador Terraform</span>
            <div class="flex items-center justify-between gap-2">
              <code class="text-zinc-200 font-mono text-xs bg-black/40 px-2 py-1 rounded border border-white/[0.04] truncate flex-grow">
                {{ selectedService.resource_key || 'aws_' + selectedService.service_name.toLowerCase() }}
              </code>
              <button
                @click="copySnippet(selectedService.resource_key || selectedService.service_name)"
                class="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                title="Copiar recurso"
              >
                <CheckCheck v-if="copied" class="w-3.5 h-3.5 text-emerald-400" />
                <Copy v-else class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Trivia / Curiosity Section -->
          <div class="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 flex flex-col gap-2">
            <div class="flex items-center gap-1.5 text-amber-400 font-medium text-xs">
              <Zap class="w-3.5 h-3.5" />
              <span>{{ selectedService.curiosity_title || 'Nota de Infraestrutura' }}</span>
            </div>
            <p class="text-zinc-300 text-[11px] leading-relaxed">
              {{ selectedService.curiosity_content }}
            </p>
          </div>

          <!-- CLI Quick Run Tip -->
          <div class="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex flex-col gap-2">
            <span class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Consulta Local via Terminal</span>
            <code class="text-[11px] font-mono text-emerald-400 bg-black/50 p-2 rounded border border-white/[0.04]">
              awslocal {{ selectedService.service_name.toLowerCase() }} describe
            </code>
          </div>

        </div>

        <!-- Drawer Footer -->
        <div class="p-3.5 border-t border-white/[0.08] flex justify-between items-center bg-[#090a0e]">
          <span class="text-[10px] text-zinc-500 font-mono">Status: Emulado em us-east-1</span>
          <button
            @click="nextService"
            class="flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-white px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/10 transition cursor-pointer"
          >
            <span>Próximo</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
  opacity: 0.9;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
