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
        zIndex: 10,
        x: 100,
        y: 100,
        width: 750,
        height: 480,
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
        title: 'Files',
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
        x: 380,
        y: 180,
        width: 440,
        height: 290,
        minWidth: 380,
        minHeight: 240,
      },
      {
        id: 'spotify',
        title: 'Spotify',
        icon: 'music',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        x: 350,
        y: 180,
        width: 820,
        height: 500,
        minWidth: 500,
        minHeight: 350,
      }
    ] as WindowState[],
    maxZIndex: 10,
    activeWindowId: 'terminal' as string | null
  }),
  actions: {
    openWindow(id: string) {
      const win = this.windows.find(w => w.id === id)
      if (win) {
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
