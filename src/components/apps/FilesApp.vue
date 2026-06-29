<script setup lang="ts">
import { ref } from 'vue'
import { useWindowStore } from '../../stores/windowStore'
import { Folder, FileText, ChevronRight, Home, ArrowLeft } from 'lucide-vue-next'

interface FileNode {
  name: string
  type: 'folder' | 'file'
  size?: string
  contentKey?: string // For opening in VSCode
}

const store = useWindowStore()
const currentPath = ref<string[]>(['Home'])
const selectedItem = ref<FileNode | null>(null)

// Flat mock directories
const directories: Record<string, FileNode[]> = {
  'Home': [
    { name: 'Documents', type: 'folder' },
    { name: 'Projects', type: 'folder' },
    { name: 'ContactInfo.txt', type: 'file', size: '1 KB', contentKey: 'about_me.md' }
  ],
  'Home > Documents': [
    { name: 'Bernardo_CV.pdf', type: 'file', size: '245 KB' },
    { name: 'about_me.md', type: 'file', size: '1.2 KB', contentKey: 'about_me.md' },
    { name: 'skills.json', type: 'file', size: '640 B', contentKey: 'skills.json' }
  ],
  'Home > Projects': [
    { name: 'Terraform-AWS-IaC', type: 'folder' },
    { name: 'PipelineWithActions', type: 'folder' },
    { name: 'experience.yaml', type: 'file', size: '1.5 KB', contentKey: 'experience.yaml' }
  ],
  'Home > Projects > Terraform-AWS-IaC': [
    { name: 'main.tf', type: 'file', size: '4 KB', contentKey: 'skills.json' },
    { name: 'variables.tf', type: 'file', size: '2 KB', contentKey: 'skills.json' },
    { name: 'README.md', type: 'file', size: '5 KB', contentKey: 'about_me.md' }
  ],
  'Home > Projects > PipelineWithActions': [
    { name: 'ci-cd.yaml', type: 'file', size: '3 KB', contentKey: 'experience.yaml' },
    { name: 'package.json', type: 'file', size: '1 KB', contentKey: 'skills.json' }
  ]
}

const getCurrentFiles = () => {
  const pathKey = currentPath.value.join(' > ')
  return directories[pathKey] || []
}

const navigateToFolder = (folderName: string) => {
  currentPath.value.push(folderName)
  selectedItem.value = null
}

const navigateBack = () => {
  if (currentPath.value.length > 1) {
    currentPath.value.pop()
    selectedItem.value = null
  }
}

const handleItemClick = (item: FileNode) => {
  selectedItem.value = item
}

const handleItemDblClick = (item: FileNode) => {
  if (item.type === 'folder') {
    navigateToFolder(item.name)
  } else if (item.type === 'file') {
    if (item.contentKey) {
      // Open file in VSCode app window
      store.openWindow('vscode')
    } else {
      alert(`Visualizando arquivo: ${item.name}`)
    }
  }
}

const selectSidebarShortcut = (path: string[]) => {
  currentPath.value = [...path]
  selectedItem.value = null
}
</script>

<template>
  <div class="flex-grow flex h-full bg-[#16141a]/95 text-gray-300 font-sans text-xs select-none">
    
    <!-- Sidebar shortcuts -->
    <div class="w-[180px] bg-black/20 border-r border-white/5 p-3 flex flex-col gap-5 shrink-0">
      <div>
        <p class="text-gray-500 uppercase font-bold tracking-wider text-[9px] mb-2 px-2">Acesso Rápido</p>
        <ul class="flex flex-col gap-1">
          <li
            class="flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition hover:bg-white/5 hover:text-white"
            :class="currentPath.length === 1 && currentPath[0] === 'Home' ? 'bg-brand-orange/10 text-brand-orange-light font-semibold' : ''"
            @click="selectSidebarShortcut(['Home'])"
          >
            <Home class="w-4 h-4 text-brand-orange" />
            <span>Início (Home)</span>
          </li>
          <li
            class="flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition hover:bg-white/5 hover:text-white"
            :class="currentPath.join(' > ') === 'Home > Documents' ? 'bg-brand-orange/10 text-brand-orange-light font-semibold' : ''"
            @click="selectSidebarShortcut(['Home', 'Documents'])"
          >
            <Folder class="w-4 h-4 text-amber-400" />
            <span>Documentos</span>
          </li>
          <li
            class="flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition hover:bg-white/5 hover:text-white"
            :class="currentPath.join(' > ') === 'Home > Projects' ? 'bg-brand-orange/10 text-brand-orange-light font-semibold' : ''"
            @click="selectSidebarShortcut(['Home', 'Projects'])"
          >
            <Folder class="w-4 h-4 text-blue-400" />
            <span>Projetos</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Main Explorer Section -->
    <div class="flex-grow flex flex-col min-w-0">
      
      <!-- Toolbar / Navigation Breadcrumbs -->
      <div class="h-10 border-b border-white/5 px-4 flex items-center gap-3 bg-black/10 shrink-0">
        <button
          class="p-1 rounded hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
          :disabled="currentPath.length <= 1"
          @click="navigateBack"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>

        <div class="flex items-center gap-1 text-[11px] text-gray-400 overflow-x-auto py-1">
          <template v-for="(node, idx) in currentPath" :key="idx">
            <ChevronRight v-if="idx > 0" class="w-3.5 h-3.5 shrink-0" />
            <span
              class="hover:text-white cursor-pointer truncate font-medium max-w-[100px]"
              :class="idx === currentPath.length - 1 ? 'text-gray-200 font-semibold' : ''"
              @click="currentPath = currentPath.slice(0, idx + 1)"
            >
              {{ node }}
            </span>
          </template>
        </div>
      </div>

      <!-- Main Directory Contents -->
      <div class="flex-grow flex overflow-hidden">
        <!-- Files Grid -->
        <div class="flex-grow p-4 overflow-y-auto">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div
              v-for="item in getCurrentFiles()"
              :key="item.name"
              class="flex flex-col items-center p-3 rounded-lg border border-transparent transition cursor-pointer hover:bg-white/5"
              :class="selectedItem?.name === item.name ? 'bg-brand-orange/10 border-brand-orange/20 text-brand-orange' : 'text-gray-300'"
              @click="handleItemClick(item)"
              @dblclick="handleItemDblClick(item)"
            >
              <Folder v-if="item.type === 'folder'" class="w-10 h-10 text-amber-400 stroke-[1.5] filter drop-shadow-md mb-2" />
              <FileText v-else class="w-10 h-10 text-brand-orange stroke-[1.5] filter drop-shadow-md mb-2" />
              
              <span class="text-center font-medium text-xs break-all max-h-8 overflow-hidden select-none">
                {{ item.name }}
              </span>
            </div>
            <div v-if="getCurrentFiles().length === 0" class="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 gap-1.5">
              <Folder class="w-10 h-10 stroke-[1]" />
              <span>Esta pasta está vazia</span>
            </div>
          </div>
        </div>

        <!-- Detail Sidebar (Right) -->
        <div v-if="selectedItem" class="w-[200px] border-l border-white/5 bg-black/10 p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
          <div class="flex flex-col items-center text-center gap-2 border-b border-white/5 pb-4">
            <Folder v-if="selectedItem.type === 'folder'" class="w-14 h-14 text-amber-400" />
            <FileText v-else class="w-14 h-14 text-brand-orange" />
            <span class="font-semibold text-gray-200 text-xs break-all">{{ selectedItem.name }}</span>
            <span class="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full capitalize">{{ selectedItem.type }}</span>
          </div>

          <div class="flex flex-col gap-2.5 text-[10px] leading-tight text-gray-400">
            <div v-if="selectedItem.size" class="flex justify-between">
              <span>Tamanho:</span>
              <span class="text-gray-200 font-mono">{{ selectedItem.size }}</span>
            </div>
            <div class="flex justify-between">
              <span>Modificado:</span>
              <span class="text-gray-200">Hoje</span>
            </div>
            <div v-if="selectedItem.contentKey" class="text-brand-orange text-center font-semibold mt-3 p-1.5 border border-brand-orange/20 bg-brand-orange/5 rounded hover:bg-brand-orange/10 cursor-pointer" @click="handleItemDblClick(selectedItem)">
              Editar no VSCode
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
