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
        key?: string
        name?: string
        model?: string
      }> }>('/v1/agents')

      const mapped: Agent[] = (result.agents ?? []).map((a) => ({
        id: a.id,
        key: a.key ?? a.id,
        name: a.name ?? 'Unnamed',
        model: a.model ?? 'unknown',
        status: 'idle' as const,
      }))

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
