import { useEffect, useCallback, useRef } from 'react'
import { getApiClient } from '../lib/api'
import { useAgentStore } from '../stores/agent-store'
import type { Agent } from '../stores/agent-store'

export function useAgents() {
  const { agents, selectedAgentId, setAgents, selectAgent } = useAgentStore()
  const api = getApiClient()
  const didAutoSelect = useRef(false)

  const fetchAgents = useCallback(async () => {
    if (!api) return
    try {
      const result = await api.get<{ agents: Array<{
        id: string
        agent_key: string
        display_name?: string
        model?: string
        provider?: string
        other_config?: Record<string, unknown> | null
      }> }>('/v1/agents')

      const mapped: Agent[] = (result.agents ?? []).map((a) => {
        const otherCfg = a.other_config ?? {}
        return {
          id: a.id,
          key: a.agent_key,
          name: a.display_name || a.agent_key,
          model: a.model ?? 'unknown',
          status: 'online' as const,
          emoji: typeof otherCfg.emoji === 'string' ? otherCfg.emoji : undefined,
        }
      })

      setAgents(mapped)
      return mapped
    } catch (err) {
      console.error('Failed to fetch agents:', err)
      return []
    }
  }, [api, setAgents])

  // Fetch once on mount
  useEffect(() => {
    fetchAgents().then((mapped) => {
      if (!didAutoSelect.current && mapped && mapped.length > 0) {
        didAutoSelect.current = true
        selectAgent(mapped[0].id)
      }
    })
  }, [fetchAgents, selectAgent])

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null

  return {
    agents,
    selectedAgent,
    selectedAgentId,
    selectAgent,
    refreshAgents: fetchAgents,
  }
}
