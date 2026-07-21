import { format, formatDistanceToNowStrict, isToday, isYesterday } from 'date-fns'
import type { Timestamp } from 'firebase/firestore'

/** Firestore Timestamp | Date | null -> Date | null (safe). */
export function toDate(ts: Timestamp | Date | null | undefined): Date | null {
  if (!ts) return null
  if (ts instanceof Date) return ts
  if (typeof (ts as Timestamp).toDate === 'function') return (ts as Timestamp).toDate()
  return null
}

/** "3m", "2h", "5d" — compact relative time. */
export function relativeTime(ts: Timestamp | Date | null | undefined): string {
  const d = toDate(ts)
  if (!d) return ''
  return formatDistanceToNowStrict(d, { addSuffix: false })
    .replace(/ seconds?/, 's')
    .replace(/ minutes?/, 'm')
    .replace(/ hours?/, 'h')
    .replace(/ days?/, 'd')
    .replace(/ months?/, 'mo')
    .replace(/ years?/, 'y')
}

/** Conversation/message timestamp: time today, "Yesterday", else date. */
export function messageTime(ts: Timestamp | Date | null | undefined): string {
  const d = toDate(ts)
  if (!d) return ''
  if (isToday(d)) return format(d, 'h:mm a')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

/** Full date, e.g. "Jul 21, 2026". */
export function fullDate(ts: Timestamp | Date | null | undefined): string {
  const d = toDate(ts)
  return d ? format(d, 'MMM d, yyyy') : ''
}

/** Shift time range, e.g. "Jul 21, 9:00 AM – 5:00 PM". */
export function shiftRange(
  start: Timestamp | Date | null | undefined,
  end: Timestamp | Date | null | undefined,
): string {
  const s = toDate(start)
  const e = toDate(end)
  if (!s) return ''
  const startStr = format(s, 'MMM d, h:mm a')
  if (!e) return startStr
  const sameDay = format(s, 'yyyy-MM-dd') === format(e, 'yyyy-MM-dd')
  return `${startStr} – ${format(e, sameDay ? 'h:mm a' : 'MMM d, h:mm a')}`
}

/** For datetime-local inputs. */
export function toInputDateTime(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm")
}
