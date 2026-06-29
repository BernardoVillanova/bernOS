<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useWindowStore } from '../../stores/windowStore'
import { Search, Home, List, TerminalSquare, LayoutGrid, X, ChevronRight, Loader2, Check } from 'lucide-vue-next'

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
    s.curiosity_title.toLowerCase().includes(q) ||
    s.curiosity_content.toLowerCase().includes(q)
  )
})

const servicesWithCuriosity = computed(() => services.value.filter(s => s.curiosity_content))

// ---------- icon emoji mapping ----------
const serviceIcon: Record<string, string> = {
  'AppSync': '🔗', 'API Gateway': '🌐', 'SQS': '📨', 'SNS': '📢', 'Step Functions': '🔀', 'EventBridge': '⚡',
  'EC2': '🖥️', 'Lambda': 'λ', 'ECS': '🐳', 'ECR': '📦',
  'CloudFormation': '📋', 'CloudWatch Logs': '📄', 'CloudWatch': '📊', 'Systems Manager': '⚙️', 'CloudTrail': '🔍',
  'SES': '✉️',
  'Cognito': '🔐', 'Secrets Manager': '🔑', 'KMS': '🛡️', 'IAM': '👤',
  'S3': '🪣', 'Backup': '💾',
  'SageMaker': '🧠',
  'DynamoDB': '📀', 'RDS': '🗄️', 'ElastiCache': '⚡', 'Timestream': '⏱️',
  'Athena': '🔎', 'Kinesis': '🌊', 'Kafka': '📬', 'Glue': '🧩', 'Route 53': '🌍'
}

// ---------- icon color class ----------
const iconColorClass = (color: string) => {
  const map: Record<string, string> = {
    orange: 'ls-icon-orange',
    pink: 'ls-icon-pink',
    purple: 'ls-icon-purple',
    blue: 'ls-icon-blue',
    red: 'ls-icon-red',
    indigo: 'ls-icon-indigo'
  }
  return map[color] || 'ls-icon-purple'
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
    await new Promise(r => setTimeout(r, 280 + Math.random() * 120))
    deployedIds.value.add(svc.id)
  }
  // Also mark all services without resource_key
  for (const svc of services.value) {
    deployedIds.value.add(svc.id)
  }
  isDeploying.value = false
  deployComplete.value = true
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 4000)
}

function isDeployed(id: number) {
  return deployedIds.value.has(id)
}

// ---------- drawer ----------
function openDrawer(svc: TerraformResource) {
  if (!deployComplete.value) return
  if (!svc.curiosity_content) return
  selectedService.value = svc
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
  setTimeout(() => { selectedService.value = null }, 300)
}

function nextService() {
  if (!selectedService.value) return
  const list = servicesWithCuriosity.value
  const idx = list.findIndex(s => s.id === selectedService.value!.id)
  const next = list[(idx + 1) % list.length]
  selectedService.value = next
}

// ---------- mini terminal ----------
function scrollMiniTerm() {
  nextTick(() => {
    if (miniTermBody.value) miniTermBody.value.scrollTop = miniTermBody.value.scrollHeight
  })
}

function handleMiniTermCommand() {
  const cmd = miniTermInput.value.trim()
  if (!cmd) return
  miniTermHistory.value.push({ type: 'input', text: `$ ${cmd}` })
  const normalized = cmd.toLowerCase().replace(/\s+/g, ' ')

  if (normalized.startsWith('aws s3 ls')) {
    const storage = services.value.filter(s => s.aws_category === 'Storage' && s.curiosity_content)
    if (storage.length) {
      const lines = storage.map(s => `  s3://${s.service_name.toLowerCase().replace(/\s/g, '-')}/  →  ${s.curiosity_title}`).join('\n')
      miniTermHistory.value.push({ type: 'output', text: lines })
    } else {
      miniTermHistory.value.push({ type: 'output', text: '(no buckets found)' })
    }
  } else if (normalized.startsWith('aws lambda list-functions')) {
    const compute = services.value.filter(s => s.aws_category === 'Compute' && s.curiosity_content)
    if (compute.length) {
      const lines = compute.map(s => `  arn:aws:lambda:us-east-1:${s.service_name.toLowerCase().replace(/\s/g, '-')}  →  ${s.curiosity_title}`).join('\n')
      miniTermHistory.value.push({ type: 'output', text: lines })
    } else {
      miniTermHistory.value.push({ type: 'output', text: '(no functions found)' })
    }
  } else if (normalized.startsWith('aws iam list-roles')) {
    const sec = services.value.filter(s => s.aws_category === 'Security Identity Compliance' && s.curiosity_content)
    if (sec.length) {
      const lines = sec.map(s => `  arn:aws:iam::role/${s.service_name.toLowerCase().replace(/\s/g, '-')}  →  ${s.curiosity_title}`).join('\n')
      miniTermHistory.value.push({ type: 'output', text: lines })
    } else {
      miniTermHistory.value.push({ type: 'output', text: '(no roles found)' })
    }
  } else if (normalized === 'clear') {
    miniTermHistory.value = []
  } else if (normalized === 'help') {
    miniTermHistory.value.push({ type: 'output', text: 'Available commands:\n  aws s3 ls\n  aws lambda list-functions\n  aws iam list-roles\n  clear\n  help' })
  } else {
    miniTermHistory.value.push({ type: 'error', text: `An error occurred: command not found in this region` })
  }

  miniTermInput.value = ''
  scrollMiniTerm()
}

// ---------- lifecycle ----------
onMounted(async () => {
  await fetchServices()
  // Trigger deploy animation right after services are loaded (window is already open at this point)
  if (services.value.length > 0 && !deployComplete.value && !isDeploying.value) {
    setTimeout(() => runDeployAnimation(), 600)
  }
})

// Fallback: Watch for window re-open or late data load to trigger deploy animation
watch(
  [() => store.windows.find(w => w.id === 'localstack')?.isOpen, () => services.value.length],
  ([isOpen, count]) => {
    if (isOpen && count > 0 && !deployComplete.value && !isDeploying.value) {
      setTimeout(() => runDeployAnimation(), 600)
    }
  }
)
</script>

<template>
  <div class="ls-root">
    <!-- Header Bar -->
    <div class="ls-header">
      <div class="ls-header-left">
        <div class="ls-logo">
          <span class="ls-logo-icon">4L</span>
        </div>
        <span class="ls-header-title">Container Resources</span>
      </div>
      <div class="ls-header-nav">
        <button
          class="ls-nav-btn"
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
          title="Grid View"
        >
          <Home :size="16" />
        </button>
        <button
          class="ls-nav-btn"
          :class="{ active: viewMode === 'list' }"
          @click="viewMode = 'list'"
          title="List View"
        >
          <List :size="16" />
        </button>
        <button
          class="ls-nav-btn"
          :class="{ active: viewMode === 'terminal' }"
          @click="viewMode = 'terminal'"
          title="Terminal"
        >
          <TerminalSquare :size="16" />
        </button>
        <button
          class="ls-nav-btn"
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
          title="Grid"
        >
          <LayoutGrid :size="16" />
        </button>
      </div>
      <div class="ls-header-right">
        <span class="ls-back-text">← Back to Containers</span>
      </div>
    </div>

    <!-- Search bar -->
    <div class="ls-search-bar">
      <Search :size="14" class="ls-search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Type to search..."
        class="ls-search-input"
      />
    </div>

    <!-- Toast notification -->
    <Transition name="toast">
      <div v-if="showToast" class="ls-toast">
        <Check :size="16" class="text-emerald-400" />
        <span>Apply complete! {{ deployOrder.length }} added.</span>
      </div>
    </Transition>

    <!-- Main content area -->
    <div class="ls-body">
      <!-- Grid View -->
      <template v-if="viewMode === 'grid'">
        <div class="ls-grid" v-if="filteredServices.length > 0">
          <div
            v-for="col in columns"
            :key="col.column"
            class="ls-column"
          >
            <div
              v-for="catGroup in col.categories"
              :key="catGroup.category"
              class="ls-category-group"
            >
              <div class="ls-category-label">{{ catGroup.category }}</div>
              <div
                v-for="svc in catGroup.items"
                :key="svc.id"
                class="ls-service-item"
                :class="{
                  'ls-pending': !isDeployed(svc.id) && isDeploying,
                  'ls-active': selectedService?.id === svc.id && drawerOpen,
                  'ls-has-curiosity': !!svc.curiosity_content && deployComplete
                }"
                @click="openDrawer(svc)"
              >
                <div class="ls-service-icon" :class="[iconColorClass(svc.icon_color), { 'ls-icon-pending': !isDeployed(svc.id) && isDeploying }]">
                  <template v-if="!isDeployed(svc.id) && isDeploying">
                    <Loader2 :size="18" class="animate-spin text-gray-500" />
                  </template>
                  <template v-else>
                    <span class="ls-emoji">{{ serviceIcon[svc.service_name] || '☁️' }}</span>
                  </template>
                </div>
                <span
                  class="ls-service-name"
                  :class="{ 'ls-name-pending': !isDeployed(svc.id) && isDeploying }"
                >{{ svc.service_name }}</span>
                <span v-if="svc.is_pro" class="ls-pro-badge">(Pro)</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="ls-no-results">
          <p>Nenhum serviço encontrado.</p>
          <p class="ls-no-results-hint">Tente "xadrez", "kubernetes", "vim", "pipeline"...</p>
        </div>
      </template>

      <!-- List View -->
      <template v-if="viewMode === 'list'">
        <div class="ls-list" v-if="filteredServices.length > 0">
          <div
            v-for="svc in filteredServices"
            :key="svc.id"
            class="ls-list-item"
            :class="{
              'ls-active': selectedService?.id === svc.id && drawerOpen,
              'ls-has-curiosity': !!svc.curiosity_content && deployComplete
            }"
            @click="openDrawer(svc)"
          >
            <div class="ls-service-icon ls-icon-sm" :class="iconColorClass(svc.icon_color)">
              <span class="ls-emoji">{{ serviceIcon[svc.service_name] || '☁️' }}</span>
            </div>
            <span class="ls-service-name">{{ svc.service_name }}</span>
            <span class="ls-list-category">{{ svc.aws_category }}</span>
            <span v-if="svc.is_pro" class="ls-pro-badge">(Pro)</span>
            <ChevronRight v-if="svc.curiosity_content" :size="14" class="ls-list-arrow" />
          </div>
        </div>
        <div v-else class="ls-no-results">
          <p>Nenhum serviço encontrado.</p>
          <p class="ls-no-results-hint">Tente "xadrez", "kubernetes", "vim", "pipeline"...</p>
        </div>
      </template>

      <!-- Mini Terminal View -->
      <template v-if="viewMode === 'terminal'">
        <div class="ls-mini-terminal">
          <div class="ls-mini-term-header">
            <span class="ls-mini-term-title">LocalStack CLI — us-east-1</span>
          </div>
          <div ref="miniTermBody" class="ls-mini-term-body">
            <div class="ls-mini-term-welcome">
              <span class="text-gray-500">Welcome to LocalStack CLI. Type 'help' for available commands.</span>
            </div>
            <div
              v-for="(entry, i) in miniTermHistory"
              :key="i"
              :class="{
                'ls-term-input': entry.type === 'input',
                'ls-term-output': entry.type === 'output',
                'ls-term-error': entry.type === 'error'
              }"
            >
              <pre class="ls-term-pre">{{ entry.text }}</pre>
            </div>
          </div>
          <div class="ls-mini-term-prompt">
            <span class="text-emerald-400">awslocal $</span>
            <input
              v-model="miniTermInput"
              type="text"
              class="ls-mini-term-input"
              placeholder="aws s3 ls"
              @keydown.enter="handleMiniTermCommand"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Detail Drawer -->
    <Transition name="drawer">
      <div v-if="drawerOpen && selectedService" class="ls-drawer-overlay" @click.self="closeDrawer">
        <div class="ls-drawer">
          <button class="ls-drawer-close" @click="closeDrawer">
            <X :size="18" />
          </button>
          <div class="ls-drawer-header">
            <div class="ls-drawer-icon" :class="iconColorClass(selectedService.icon_color)">
              <span class="ls-emoji-lg">{{ serviceIcon[selectedService.service_name] || '☁️' }}</span>
            </div>
            <h3 class="ls-drawer-title">{{ selectedService.service_name }}</h3>
            <span class="ls-drawer-category">{{ selectedService.aws_category }}</span>
          </div>
          <div class="ls-drawer-divider"></div>
          <div class="ls-drawer-body">
            <p class="ls-drawer-curiosity">{{ selectedService.curiosity_content }}</p>
          </div>
          <div class="ls-drawer-divider"></div>
          <div class="ls-drawer-footer">
            <button class="ls-drawer-next" @click="nextService">
              Ver próximo serviço
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ═══════════════════ ROOT ═══════════════════ */
.ls-root {
  width: 100%;
  height: 100%;
  background: #1a1f35;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
}

/* ═══════════════════ HEADER ═══════════════════ */
.ls-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #16192e;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.ls-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ls-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ls-logo-icon {
  color: #fff;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: -0.5px;
}
.ls-header-title {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 600;
}
.ls-header-nav {
  display: flex;
  gap: 2px;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
  padding: 2px;
}
.ls-nav-btn {
  width: 32px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}
.ls-nav-btn:hover {
  color: #e2e8f0;
  background: rgba(255,255,255,0.06);
}
.ls-nav-btn.active {
  color: #e2e8f0;
  background: rgba(99, 102, 241, 0.2);
}
.ls-header-right {
  display: flex;
  align-items: center;
}
.ls-back-text {
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s;
}
.ls-back-text:hover {
  color: #a5b4fc;
}

/* ═══════════════════ SEARCH ═══════════════════ */
.ls-search-bar {
  display: flex;
  align-items: center;
  margin: 10px 16px 6px;
  padding: 8px 12px;
  background: #252b45;
  border-radius: 6px;
  gap: 8px;
  flex-shrink: 0;
}
.ls-search-icon { color: #6b7280; flex-shrink: 0; }
.ls-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e2e8f0;
  font-size: 13px;
  font-family: inherit;
}
.ls-search-input::placeholder { color: #4b5563; }

/* ═══════════════════ TOAST ═══════════════════ */
.ls-toast {
  position: absolute;
  top: 56px;
  right: 16px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #6ee7b7;
  font-size: 13px;
  font-weight: 500;
  backdrop-filter: blur(8px);
}
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.4s ease-in; }
.toast-enter-from { opacity: 0; transform: translateY(-12px) scale(0.95); }
.toast-leave-to { opacity: 0; transform: translateY(-8px); }

/* ═══════════════════ BODY ═══════════════════ */
.ls-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 16px 16px;
}
.ls-body::-webkit-scrollbar { width: 4px; }
.ls-body::-webkit-scrollbar-track { background: transparent; }
.ls-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

/* ═══════════════════ GRID VIEW ═══════════════════ */
.ls-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px 16px;
}
.ls-column {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ls-category-group {
  margin-bottom: 12px;
}
.ls-category-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 6px 4px 4px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  margin-bottom: 2px;
}
.ls-service-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: default;
  transition: all 0.2s;
  border-left: 2px solid transparent;
}
.ls-service-item.ls-has-curiosity {
  cursor: pointer;
}
.ls-service-item.ls-has-curiosity:hover {
  background: rgba(255,255,255,0.05);
}
.ls-service-item.ls-active {
  background: rgba(99, 102, 241, 0.15);
  border-left-color: #818cf8;
}
.ls-service-item.ls-pending {
  opacity: 0.5;
}

/* ═══════════════════ SERVICE ICON ═══════════════════ */
.ls-service-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}
.ls-icon-sm {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}
.ls-icon-pending {
  background: #2a2f48 !important;
}
.ls-icon-orange { background: #f97316; }
.ls-icon-pink { background: #ec4899; }
.ls-icon-red { background: #ef4444; }
.ls-icon-purple { background: #8b5cf6; }
.ls-icon-blue { background: #3b82f6; }
.ls-icon-indigo { background: #6366f1; }

.ls-emoji, .ls-emoji-lg {
  font-size: 16px;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
}
.ls-emoji-lg { font-size: 28px; }

/* ═══════════════════ SERVICE NAME / BADGES ═══════════════════ */
.ls-service-name {
  font-size: 14px;
  color: #e2e8f0;
  font-weight: 400;
  white-space: nowrap;
  transition: color 0.3s;
}
.ls-name-pending {
  color: #4b5563;
}
.ls-pro-badge {
  border: 1px solid #6b7280;
  color: #9ca3af;
  font-size: 10px;
  border-radius: 20px;
  padding: 1px 7px;
  white-space: nowrap;
  line-height: 1.4;
}

/* ═══════════════════ LIST VIEW ═══════════════════ */
.ls-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.ls-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: default;
  transition: all 0.2s;
  border-left: 2px solid transparent;
}
.ls-list-item.ls-has-curiosity { cursor: pointer; }
.ls-list-item.ls-has-curiosity:hover { background: rgba(255,255,255,0.05); }
.ls-list-item.ls-active {
  background: rgba(99, 102, 241, 0.15);
  border-left-color: #818cf8;
}
.ls-list-category {
  color: #6b7280;
  font-size: 11px;
  margin-left: auto;
  white-space: nowrap;
}
.ls-list-arrow {
  color: #4b5563;
  flex-shrink: 0;
}

/* ═══════════════════ NO RESULTS ═══════════════════ */
.ls-no-results {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  font-size: 14px;
}
.ls-no-results-hint {
  margin-top: 8px;
  color: #4b5563;
  font-size: 12px;
  font-style: italic;
}

/* ═══════════════════ MINI TERMINAL ═══════════════════ */
.ls-mini-terminal {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0d1117;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
}
.ls-mini-term-header {
  padding: 8px 12px;
  background: #161b22;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.ls-mini-term-title {
  color: #8b949e;
  font-size: 12px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.ls-mini-term-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
}
.ls-mini-term-body::-webkit-scrollbar { width: 4px; }
.ls-mini-term-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
.ls-mini-term-welcome { margin-bottom: 8px; }
.ls-term-input { color: #c9d1d9; margin-bottom: 2px; }
.ls-term-output { color: #8b949e; margin-bottom: 6px; }
.ls-term-error { color: #f85149; margin-bottom: 6px; }
.ls-term-pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  font-size: inherit;
}
.ls-mini-term-prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #161b22;
  border-top: 1px solid rgba(255,255,255,0.06);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
}
.ls-mini-term-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #c9d1d9;
  font-family: inherit;
  font-size: inherit;
}
.ls-mini-term-input::placeholder { color: #484f58; }

/* ═══════════════════ DRAWER ═══════════════════ */
.ls-drawer-overlay {
  position: absolute;
  inset: 0;
  z-index: 40;
  background: rgba(0,0,0,0.25);
}
.ls-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  background: #1e2340;
  border-left: 1px solid rgba(139, 92, 246, 0.3);
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(0,0,0,0.4);
  overflow-y: auto;
}
.ls-drawer-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: rgba(255,255,255,0.06);
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.ls-drawer-close:hover {
  background: rgba(255,255,255,0.1);
  color: #e2e8f0;
}
.ls-drawer-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 24px 16px;
}
.ls-drawer-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ls-drawer-title {
  color: #f1f5f9;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}
.ls-drawer-category {
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.ls-drawer-divider {
  height: 1px;
  background: rgba(255,255,255,0.06);
  margin: 0 24px;
}
.ls-drawer-body {
  flex: 1;
  padding: 20px 24px;
}
.ls-drawer-curiosity {
  color: #d1d5db;
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
}
.ls-drawer-footer {
  padding: 16px 24px 20px;
}
.ls-drawer-next {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  justify-content: center;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.08);
  color: #a5b4fc;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.ls-drawer-next:hover {
  background: rgba(139, 92, 246, 0.18);
  border-color: rgba(139, 92, 246, 0.5);
}

/* ═══════════════════ DRAWER TRANSITION ═══════════════════ */
.drawer-enter-active { transition: all 0.3s ease-out; }
.drawer-leave-active { transition: all 0.25s ease-in; }
.drawer-enter-from .ls-drawer { transform: translateX(100%); }
.drawer-leave-to .ls-drawer { transform: translateX(100%); }
.drawer-enter-from { opacity: 0; }
.drawer-leave-to { opacity: 0; }
</style>
