import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Limit } from '../types'

const limits = atom({ plugin: 'usage-band', key: 'limits' } as const, [] as Limit[])
const contextPercent = atom({ plugin: 'usage-band', key: 'contextPercent' } as const, 0)

const LABELS: Record<string, string> = {
  five_hour: 'Session',
  seven_day: 'Semaine',
}

const SEGMENTS = 13

const hour = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return ' ( ' + d.toLocaleString('fr-CA', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) + ' )'
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    try {
      const u = await $.session.usage()
      await update($, limits, () => u.rateLimits.map(r => ({ ...r })))
      await update($, contextPercent, () => Math.round(u.context.percent ?? 0))
    } catch {}
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await update($, limits, () => e.rateLimits.map(r => ({ ...r })))
    await update($, contextPercent, () => Math.round(e.context.percent ?? 0))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, limits)
    if (e.props.hasSurvey || list.length === 0) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box justifyContent="space-between" paddingX={1} gap={4}>
        {list.map(r => {
          const pct = Math.max(0, Math.min(100, Math.round(r.percentUsed)))
          const isDraining = r.kind === 'seven_day'
          const shown = isDraining ? 100 - pct : pct
          const used = isDraining ? 100 - shown : shown
          const filled = Math.round((shown / 100) * SEGMENTS)
          const fill = used >= 90 ? 'error' : used >= 70 ? 'warning' : 'suggestion'
          return (
            <Box flexDirection="column" width="46%" gap={1}>
              <Box justifyContent="center">
                <Text bold>
                  {((LABELS[r.kind] ?? r.kind) + " " + pct + " %" + hour(r.resetsAt)).toLocaleUpperCase("fr-CA")}
                </Text>
              </Box>
              <Box borderStyle="round" borderColor="text" paddingX={1} width="100%" gap={1}>
                {Array.from({ length: SEGMENTS }, (_, i) => (
                  <Box flexGrow={1} backgroundColor={i < filled ? fill : 'promptBorder'}>
                    <Text> </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  })
}
