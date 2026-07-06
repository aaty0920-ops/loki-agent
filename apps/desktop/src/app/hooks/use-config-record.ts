import { useQuery } from '@tanstack/react-query'

import { getLokiConfigRecord } from '@/loki'
import { queryClient, writeCache } from '@/lib/query-client'
import type { LokiConfigRecord } from '@/types/loki'

// One shared cache for the whole profile config record (`GET /api/config`).
// Every settings surface (MCP, model, config) reads and writes through this key
// so a save in one shows in the others, and revisiting a tab paints the cache
// instead of blanking on a fresh fetch.
//
// Distinct from session/hooks/use-loki-config.ts, which is side-effecting —
// it pushes personality/cwd/voice/… into the session stores for live chat.
export const LOKI_CONFIG_KEY = ['loki-config-record'] as const

// staleTime 0 → serve cache instantly, background-revalidate on every mount.
export const useLokiConfigRecord = () =>
  useQuery({ queryKey: LOKI_CONFIG_KEY, queryFn: getLokiConfigRecord, staleTime: 0 })

export const setLokiConfigCache = writeCache<LokiConfigRecord>(LOKI_CONFIG_KEY)

export const invalidateLokiConfig = () => queryClient.invalidateQueries({ queryKey: LOKI_CONFIG_KEY })
