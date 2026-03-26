import { useState, useEffect, useCallback } from 'react'
import { getApiClient } from '../lib/api'
import type { ProviderData, ProviderInput } from '../types/provider'

export function useProviders() {
  const [providers, setProviders] = useState<ProviderData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProviders = useCallback(async () => {
    try {
      const res = await getApiClient().get<{ providers: ProviderData[] | null }>('/v1/providers')
      setProviders(res.providers ?? [])
    } catch (err) {
      console.error('Failed to fetch providers:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProviders() }, [fetchProviders])

  const createProvider = useCallback(async (input: ProviderInput) => {
    const res = await getApiClient().post<ProviderData>('/v1/providers', input)
    setProviders((prev) => [...prev, res])
    return res
  }, [])

  const updateProvider = useCallback(async (id: string, input: Partial<ProviderInput>) => {
    const res = await getApiClient().put<ProviderData>(`/v1/providers/${id}`, input)
    setProviders((prev) => prev.map((p) => p.id === id ? res : p))
    return res
  }, [])

  const deleteProvider = useCallback(async (id: string) => {
    await getApiClient().delete(`/v1/providers/${id}`)
    setProviders((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const verifyProvider = useCallback(async (input: { provider_type: string; api_base?: string; api_key?: string }) => {
    return getApiClient().post<{ success: boolean; error?: string; models?: string[] }>('/v1/providers/verify', input)
  }, [])

  return { providers, loading, fetchProviders, createProvider, updateProvider, deleteProvider, verifyProvider }
}
