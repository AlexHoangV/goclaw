import { useAgents } from '../../hooks/use-agents'
import { useSessions } from '../../hooks/use-sessions'
import { AgentAvatar } from '../agents/AgentAvatar'

interface SidebarSectionProps {
  title: string
  count?: string
  children: React.ReactNode
}

function SidebarSection({ title, count, children }: SidebarSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          {title}
        </span>
        {count !== undefined && (
          <span className="text-[10px] text-text-muted bg-surface-tertiary px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

interface NavItemProps {
  label: string
  count: number
}

function NavItem({ label, count }: NavItemProps) {
  return (
    <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors text-left">
      <span>{label}</span>
      {count > 0 && (
        <span className="text-[11px] text-text-muted bg-surface-tertiary px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  )
}

interface SidebarProps {
  style?: React.CSSProperties
}

export function Sidebar({ style }: SidebarProps) {
  const { agents, selectedAgentId, selectAgent } = useAgents()
  const { sessions, activeSessionKey, setActiveSession, createSession } = useSessions()

  return (
    <aside
      className="bg-surface-secondary border-r border-border flex flex-col shrink-0 overflow-hidden"
      style={style}
    >
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <SidebarSection title="Agents" count={`${agents.length}`}>
          {agents.length === 0 ? (
            <p className="text-xs text-text-muted px-2 py-1">No agents yet</p>
          ) : (
            agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => selectAgent(agent.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left ${
                  selectedAgentId === agent.id
                    ? 'bg-surface-tertiary text-text-primary border-l-[3px] border-accent pl-[5px]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary'
                }`}
              >
                <AgentAvatar name={agent.name} status={agent.status} size="sm" />
                <span className="truncate flex-1 text-xs font-medium">{agent.name}</span>
              </button>
            ))
          )}
        </SidebarSection>

        {selectedAgentId && (
          <SidebarSection title="Sessions" count={`${sessions.length}`}>
            {sessions.length === 0 ? (
              <p className="text-xs text-text-muted px-2 py-1">No sessions yet</p>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.key}
                  onClick={() => setActiveSession(session.key)}
                  className={`w-full flex flex-col px-2 py-1.5 rounded-md text-left transition-colors ${
                    activeSessionKey === session.key
                      ? 'text-accent bg-surface-tertiary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary'
                  }`}
                >
                  <span className="text-xs truncate font-medium">{session.title}</span>
                  <span className="text-[10px] text-text-muted">
                    {new Date(session.lastMessageAt).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </SidebarSection>
        )}

        <SidebarSection title="Resources">
          <NavItem label="MCPs" count={0} />
          <NavItem label="Skills" count={0} />
          <NavItem label="Tools" count={0} />
          <NavItem label="Crons" count={0} />
        </SidebarSection>
      </div>

      <div className="p-3 border-t border-border">
        <button
          onClick={createSession}
          className="w-full py-2 px-3 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          + New Chat
        </button>
      </div>
    </aside>
  )
}
