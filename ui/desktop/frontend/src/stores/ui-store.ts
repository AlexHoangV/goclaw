import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  theme: 'dark' | 'light'
  sidebarOpen: boolean
  sidebarWidth: number
  toggleTheme: () => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      sidebarWidth: 260,
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarWidth: (width) =>
        set({ sidebarWidth: width }),
    }),
    {
      name: 'goclaw-ui',
      partialize: (s) => ({
        theme: s.theme,
        sidebarOpen: s.sidebarOpen,
        sidebarWidth: s.sidebarWidth,
      }),
    }
  )
)
