import { defineStore } from 'pinia'

export interface WindowState {
  id: string
  title: string
  icon: string
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
}

export const useWindowStore = defineStore('window', {
  state: () => ({
    windows: [
      {
        id: 'terminal',
        title: 'Terminal',
        icon: 'terminal',
        isOpen: true, // Auto open on first load
        isMinimized: false,
        isMaximized: false,
        zIndex: 5,
        x: 75,
        y: 80,
        width: 630,
        height: 560,
        minWidth: 400,
        minHeight: 300,
      },
      {
        id: 'vscode',
        title: 'Visual Studio Code',
        icon: 'code',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        x: 150,
        y: 80,
        width: 900,
        height: 550,
        minWidth: 600,
        minHeight: 400,
      },
      {
        id: 'files',
        title: 'Finder',
        icon: 'folder',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        x: 200,
        y: 120,
        width: 800,
        height: 500,
        minWidth: 500,
        minHeight: 350,
      },
      {
        id: 'mail',
        title: 'Contato',
        icon: 'mail',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        x: 320,
        y: 80,
        width: 460,
        height: 550,
        minWidth: 420,
        minHeight: 500,
      },
      {
        id: 'gallery',
        title: 'Fotos',
        icon: 'image',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        x: 240,
        y: 80,
        width: 880,
        height: 580,
        minWidth: 520,
        minHeight: 380,
      },
      {
        id: 'settings',
        title: 'Configurações',
        icon: 'settings',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        x: 240,
        y: 80,
        width: 820,
        height: 560,
        minWidth: 540,
        minHeight: 420,
      },
      {
        id: 'spotify',
        title: 'Music Player',
        icon: 'music',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        x: 350,
        y: 180,
        width: 980,
        height: 580,
        minWidth: 500,
        minHeight: 350,
      },
      {
        id: 'localstack',
        title: 'LocalStack Desktop',
        icon: 'cloud',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        x: 120,
        y: 60,
        width: 960,
        height: 580,
        minWidth: 700,
        minHeight: 450,
      },
      {
        id: 'portfolio',
        title: 'Navegador — bernos.com.br',
        icon: 'globe',
        isOpen: true, // Auto open on first load alongside terminal
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        x: 725,
        y: 50,
        width: 1120,
        height: 760,
        minWidth: 500,
        minHeight: 400,
      },
      {
        id: 'trash',
        title: 'Lixeira',
        icon: 'trash',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        x: 200,
        y: 120,
        width: 760,
        height: 480,
        minWidth: 500,
        minHeight: 350,
      }
    ] as WindowState[],
    maxZIndex: 10,
    activeWindowId: 'terminal' as string | null,
    filesCurrentPath: ['Home'] as string[],
    filesActiveCategory: 'all' as string,
    photosOpenTrigger: 0 as number,
    activeVSCodeFileKey: 'README.md' as string,
    localstackStatus: 'idle' as 'idle' | 'running' | 'stopped',
    powerState: 'running' as 'running' | 'shutting_down' | 'off' | 'restarting' | 'booting',
    showPowerDialog: false as boolean,
    theme: (typeof window !== 'undefined' ? (localStorage.getItem('bernos_theme') as 'dark' | 'light') : null) || 'dark'
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      if (typeof window !== 'undefined') {
        localStorage.setItem('bernos_theme', this.theme)
        if (this.theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    },
    setTheme(theme: 'dark' | 'light') {
      this.theme = theme
      if (typeof window !== 'undefined') {
        localStorage.setItem('bernos_theme', this.theme)
        if (this.theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    },
    openPowerDialog() {
      this.showPowerDialog = true
    },
    closePowerDialog() {
      this.showPowerDialog = false
    },
    triggerShutdown() {
      this.showPowerDialog = false
      this.powerState = 'shutting_down'
      setTimeout(() => {
        this.windows.forEach(w => {
          w.isOpen = false
        })
        this.activeWindowId = null
        this.powerState = 'off'
      }, 2000)
    },
    triggerRestart() {
      this.showPowerDialog = false
      this.powerState = 'restarting'
      setTimeout(() => {
        this.powerState = 'booting'
        setTimeout(() => {
          this.resetWindowsToDefault()
          this.powerState = 'running'
        }, 1800)
      }, 1600)
    },
    powerOn() {
      this.powerState = 'booting'
      setTimeout(() => {
        this.resetWindowsToDefault()
        this.powerState = 'running'
      }, 1800)
    },
    resetWindowsToDefault() {
      this.windows.forEach(w => {
        if (w.id === 'terminal') {
          w.isOpen = true
          w.isMinimized = false
          w.zIndex = 5
          w.x = 75
          w.y = 80
          w.width = 630
          w.height = 560
        } else if (w.id === 'portfolio') {
          w.isOpen = true
          w.isMinimized = false
          w.zIndex = 10
          w.x = 725
          w.y = 50
          w.width = 1120
          w.height = 760
        } else {
          w.isOpen = false
          w.isMinimized = false
          w.zIndex = 1
        }
      })
      this.activeWindowId = 'portfolio'
      this.maxZIndex = 10
      this.layoutInitialWindows()
    },
    layoutInitialWindows() {
      if (typeof window === 'undefined') return
      const screenW = window.innerWidth
      const screenH = window.innerHeight
      if (screenW >= 1200) {
        const term = this.windows.find(w => w.id === 'terminal')
        const port = this.windows.find(w => w.id === 'portfolio')
        if (term && port) {
          const termW = Math.min(640, Math.max(460, Math.floor((screenW - 130) * 0.36)))
          const gap = 20
          const termX = 75
          const portX = termX + termW + gap
          const portW = Math.max(560, screenW - portX - 35)

          term.x = termX
          term.y = 75
          term.width = termW
          term.height = Math.min(580, screenH - 160)

          port.x = portX
          port.y = 50
          port.width = portW
          port.height = Math.min(780, screenH - 120)
        }
      }
    },
    openPhotosInFinder() {
      this.filesActiveCategory = 'media'
      this.photosOpenTrigger++
      this.filesCurrentPath = ['bernardo', 'Fotos & Eventos']
      this.openWindow('files')
    },
    openWindow(id: string) {
      const win = this.windows.find(w => w.id === id)
      if (win) {
        if (id === 'mail') {
          win.width = 460
          win.height = 550
          win.minWidth = 420
          win.minHeight = 500
          win.isMaximized = false
          if (typeof window !== 'undefined') {
            win.x = Math.max(20, Math.floor((window.innerWidth - win.width) / 2))
            win.y = Math.max(50, Math.floor((window.innerHeight - win.height) / 2) - 20)
          }
        } else if (id === 'settings') {
          win.width = Math.max(win.width, 820)
          win.height = Math.max(win.height, 560)
        } else if (id === 'trash') {
          win.width = Math.max(win.width, 760)
          win.height = Math.max(win.height, 480)
        }
        win.isOpen = true
        win.isMinimized = false
        this.focusWindow(id)
      }
    },
    closeWindow(id: string) {
      const win = this.windows.find(w => w.id === id)
      if (win) {
        win.isOpen = false
        if (this.activeWindowId === id) {
          // Find next open window to focus
          const openWindows = this.windows.filter(w => w.isOpen && !w.isMinimized)
          if (openWindows.length > 0) {
            const nextFocus = openWindows.reduce((max, w) => w.zIndex > max.zIndex ? w : max, openWindows[0])
            this.activeWindowId = nextFocus.id
          } else {
            this.activeWindowId = null
          }
        }
      }
    },
    minimizeWindow(id: string) {
      const win = this.windows.find(w => w.id === id)
      if (win) {
        win.isMinimized = true
        if (this.activeWindowId === id) {
          // Move focus to the next active window
          const openWindows = this.windows.filter(w => w.isOpen && !w.isMinimized && w.id !== id)
          if (openWindows.length > 0) {
            const nextFocus = openWindows.reduce((max, w) => w.zIndex > max.zIndex ? w : max, openWindows[0])
            this.activeWindowId = nextFocus.id
          } else {
            this.activeWindowId = null
          }
        }
      }
    },
    toggleMaximizeWindow(id: string) {
      const win = this.windows.find(w => w.id === id)
      if (win) {
        win.isMaximized = !win.isMaximized
        this.focusWindow(id)
      }
    },
    focusWindow(id: string) {
      const win = this.windows.find(w => w.id === id)
      if (win && win.isOpen) {
        win.isMinimized = false
        this.maxZIndex += 1
        win.zIndex = this.maxZIndex
        this.activeWindowId = id
      }
    },
    updatePosition(id: string, x: number, y: number) {
      const win = this.windows.find(w => w.id === id)
      if (win) {
        win.x = x
        win.y = y
      }
    },
    updateSize(id: string, width: number, height: number) {
      const win = this.windows.find(w => w.id === id)
      if (win) {
        win.width = Math.max(width, win.minWidth)
        win.height = Math.max(height, win.minHeight)
      }
    }
  }
})
