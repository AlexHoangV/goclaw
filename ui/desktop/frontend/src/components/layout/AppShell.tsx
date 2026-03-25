import { useUiStore } from '../../stores/ui-store'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const sidebarWidth = useUiStore((s) => s.sidebarWidth)

  return (
    <div className="h-dvh flex flex-col bg-surface-primary overflow-hidden">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        {sidebarOpen && (
          <Sidebar style={{ width: sidebarWidth }} />
        )}
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
