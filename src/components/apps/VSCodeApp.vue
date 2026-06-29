<script setup lang="ts">
import { ref, computed } from 'vue'
import { Files, Search, Settings, FileText, ChevronDown, Check } from 'lucide-vue-next'

interface EditorFile {
  name: string
  language: string
  content: string
}

const files: Record<string, EditorFile> = {
  'about_me.md': {
    name: 'about_me.md',
    language: 'markdown',
    content: `# Bernardo Villanova de Santana
## DevOps Pleno | Cloud Computing | Full Stack Developer

### Contato
- Email: bernardo.villasantana@gmail.com
- Localização: Rio Claro, SP, Brasil
- LinkedIn: linkedin.com/in/bernardo-villanova-de-santana
- GitHub: github.com/bernardovillanova

### Resumo
Engenheiro DevOps Pleno com mais de 4 anos de experiência prática
focada em Cloud Computing (AWS), Automação de Infraestrutura (Terraform)
e desenvolvimento de software (Node.js/Vue/React). Dedicado a criar
ambientes resilientes, seguros e altamente observáveis.
`
  },
  'skills.json': {
    name: 'skills.json',
    language: 'json',
    content: `{
  "cloud": [
    "AWS (EC2, EKS, ECS, S3, RDS, Route53, IAM, VPC)",
    "Google Cloud Platform (GCP)",
    "Microsoft Azure"
  ],
  "infrastructureAsCode": {
    "primary": "Terraform",
    "secondary": "CloudFormation"
  },
  "containers": ["Docker", "Kubernetes", "Amazon ECS"],
  "ci_cd": ["GitHub Actions", "Jenkins", "AWS CodePipeline"],
  "observability": ["Grafana", "CloudWatch", "Prometheus"],
  "development": {
    "languages": ["TypeScript", "JavaScript", "Node.js", "Shell Script"],
    "frameworks": ["Vue 3", "React", "Next.js", "Express", "GraphQL"]
  }
}`
  },
  'experience.yaml': {
    name: 'experience.yaml',
    language: 'yaml',
    content: `experiences:
  - role: "Engenheiro DevOps (Pleno)"
    company: "Yeb Inteligência de Mercado"
    location: "Rio Claro, SP"
    period: "Fev 2025 - Atual"
    details:
      - "Gestão e evolução de infraestrutura AWS usando Terraform"
      - "Liderança técnica na modernização de pipelines CI/CD"
      - "Observabilidade avançada com Grafana e CloudWatch"
      - "Mentoria técnica para estagiários e desenvolvedores"

  - role: "Engenheiro DevOps (Júnior)"
    company: "Yeb Inteligência de Mercado"
    period: "Jul 2024 - Fev 2025"
    details:
      - "Monitoramento de infraestrutura AWS e resposta a incidentes"
      - "Automação de processos operacionais com scripts Bash"

  - role: "Desenvolvedor Full Stack"
    company: "Yeb Inteligência de Mercado"
    period: "Fev 2024 - Jul 2024"
    details:
      - "Construção de APIs Rest e GraphQL com Node.js/Express"
      - "Views responsivas em Vue 3, React e Next.js"`
  }
}

const activeFileKey = ref('about_me.md')
const openTabs = ref<string[]>(['about_me.md', 'skills.json'])
const explorerOpen = ref(true)

const currentFile = computed(() => files[activeFileKey.value])

const selectFile = (key: string) => {
  activeFileKey.value = key
  if (!openTabs.value.includes(key)) {
    openTabs.value.push(key)
  }
}

const closeTab = (key: string, e: Event) => {
  e.stopPropagation()
  openTabs.value = openTabs.value.filter(tab => tab !== key)
  if (activeFileKey.value === key && openTabs.value.length > 0) {
    activeFileKey.value = openTabs.value[openTabs.value.length - 1]
  }
}
</script>

<template>
  <div class="flex-grow flex h-full bg-[#181818] text-gray-300 font-mono text-xs select-none">
    
    <!-- Activity Bar -->
    <div class="w-12 bg-[#333333]/30 border-r border-[#1e1e1e] flex flex-col items-center py-4 gap-6 shrink-0">
      <button class="text-white hover:text-white/80 cursor-pointer" :class="explorerOpen ? 'text-brand-orange' : ''" @click="explorerOpen = !explorerOpen">
        <Files class="w-5 h-5" />
      </button>
      <button class="hover:text-white cursor-pointer"><Search class="w-5 h-5" /></button>
      <div class="flex-grow"></div>
      <button class="hover:text-white cursor-pointer"><Settings class="w-5 h-5" /></button>
    </div>

    <!-- Sidebar File Explorer -->
    <div v-if="explorerOpen" class="w-[200px] bg-[#1e1e1e]/60 border-r border-[#252526] flex flex-col shrink-0">
      <div class="p-3 uppercase text-[10px] font-bold tracking-wider text-gray-400">Explorador</div>
      
      <!-- Folder node -->
      <div class="px-2">
        <div class="flex items-center gap-1 py-1 text-gray-200 font-semibold cursor-pointer">
          <ChevronDown class="w-4 h-4 text-gray-400" />
          <span class="truncate">portfolio-workspace</span>
        </div>

        <div class="pl-4 flex flex-col gap-0.5">
          <div
            v-for="(file, key) in files"
            :key="key"
            class="flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition hover:bg-white/5"
            :class="activeFileKey === key ? 'bg-brand-orange/10 text-brand-orange-light font-semibold' : 'text-gray-400 hover:text-gray-200'"
            @click="selectFile(key)"
          >
            <FileText class="w-3.5 h-3.5" :class="activeFileKey === key ? 'text-brand-orange' : 'text-gray-500'" />
            <span class="truncate">{{ file.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Panel -->
    <div class="flex-grow flex flex-col bg-[#1e1e1e]">
      <!-- Tab Bar -->
      <div class="h-9 bg-[#252526]/80 flex border-b border-[#1e1e1e] overflow-x-auto select-none shrink-0">
        <div
          v-for="tab in openTabs"
          :key="tab"
          class="flex items-center gap-2 px-3 border-r border-[#252526] h-full cursor-pointer transition text-xs font-sans"
          :class="activeFileKey === tab ? 'bg-[#1e1e1e] text-white border-t border-t-brand-orange' : 'bg-[#2d2d2d]/30 text-gray-400 hover:bg-[#2d2d2d]/10'"
          @click="activeFileKey = tab"
        >
          <FileText class="w-3.5 h-3.5 text-brand-orange" />
          <span>{{ tab }}</span>
          <button
            class="hover:bg-white/10 rounded w-4 h-4 flex items-center justify-center text-[10px] text-gray-400 font-bold ml-1 hover:text-white"
            @click="closeTab(tab, $event)"
          >
            ×
          </button>
        </div>
      </div>

      <!-- Editor Content -->
      <div v-if="currentFile" class="flex-grow p-4 overflow-auto font-mono text-sm leading-relaxed text-[#d4d4d4] select-text">
        <pre class="whitespace-pre-wrap font-mono select-text select-text-safe">{{ currentFile.content }}</pre>
      </div>
      <div v-else class="flex-grow flex flex-col items-center justify-center text-gray-500 gap-2">
        <FileText class="w-12 h-12 stroke-[1]" />
        <span>Selecione um arquivo no Explorador para visualizar</span>
      </div>

      <!-- Status Bar -->
      <div class="h-6 bg-brand-orange/10 border-t border-[#2d2d2d] px-3 flex items-center justify-between text-[10px] text-gray-400 shrink-0 font-sans">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1 text-brand-orange font-semibold"><Check class="w-3 h-3" /> Ready</span>
          <span>main*</span>
        </div>
        <div class="flex items-center gap-3">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span class="uppercase font-semibold text-brand-orange">{{ currentFile?.language || 'Plain Text' }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.select-text-safe {
  user-select: text !important;
  -webkit-user-select: text !important;
}
</style>
