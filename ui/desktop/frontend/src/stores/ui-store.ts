import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  theme: 'dark' | 'light'
  sidebarOpen: boolean
  sidebarWidth: number
  onboarded: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  completeOnboarding: () => void
  resetOnboarding: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      sidebarWidth: 260,
      onboarded: false,
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarWidth: (width) =>
        set({ sidebarWidth: width }),
      completeOnboarding: () =>
        set({ onboarded: true }),
      resetOnboarding: () =>
        set({ onboarded: false }),
    }),
    {
      name: 'goclaw-ui',
      partialize: (s) => ({
        theme: s.theme,
        sidebarOpen: s.sidebarOpen,
        sidebarWidth: s.sidebarWidth,
        onboarded: s.onboarded,
      }),
    }
  )
)
