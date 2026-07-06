import { describe, expect, it } from 'vitest'

import { isProviderSetupErrorMessage } from './provider-setup-errors'

describe('isProviderSetupErrorMessage', () => {
  it('matches generic missing-provider copy', () => {
    expect(isProviderSetupErrorMessage('No inference provider configured. Run `loki model` to choose one.')).toBe(
      true
    )
    expect(isProviderSetupErrorMessage('No inference provider is configured.')).toBe(true)
    expect(isProviderSetupErrorMessage('No Loki provider is configured.')).toBe(true)
    expect(isProviderSetupErrorMessage('set an API key (OPENROUTER_API_KEY) in ~/.loki/.env')).toBe(true)
  })

  it('does not match non-provider runtime failures', () => {
    expect(
      isProviderSetupErrorMessage('Selected runtime is not available. setup.status reports configured credentials.')
    ).toBe(false)
  })

  it('returns false for empty input', () => {
    expect(isProviderSetupErrorMessage('')).toBe(false)
    expect(isProviderSetupErrorMessage(null)).toBe(false)
    expect(isProviderSetupErrorMessage(undefined)).toBe(false)
  })
})
