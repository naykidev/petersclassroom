import { Target, Send, UserPlus, type LucideIcon } from 'lucide-react'
import type { UserRole } from '@/models'

/**
 * Connection-action copy for Axol Work's scouting vibe.
 *
 * Roles are stored as `seeker` / `employer` (Firestore/iOS contract).
 * UI nouns are Prospect / Recruiter.
 *
 *   Recruiter → Prospect : "Scout"
 *   Prospect  → Recruiter: "Express interest"
 *   peer / same-role     : "Reach out"
 *
 * Deliberately never "Connect" — that's LinkedIn's word.
 */
export interface ConnectionCopy {
  /** Idle button label */
  verb: string
  /** Outgoing pending button label (before "· Pending") */
  sentLabel: string
  Icon: LucideIcon
  /** Toast shown to the initiator after they send the request */
  toast: (targetName: string) => string
  /** In-app notification message delivered to the other party */
  notify: (actorName: string) => string
}

/** Mutual / accepted state — avoids LinkedIn's "Connected". */
export const IN_NETWORK_LABEL = 'In your network'

export function connectionCopy(
  actorRole: UserRole,
  targetRole: UserRole,
): ConnectionCopy {
  // Recruiter scouting a Prospect.
  if (actorRole === 'employer' && targetRole === 'seeker') {
    return {
      verb: 'Scout',
      sentLabel: 'Scouted',
      Icon: Target,
      toast: (n) => `You scouted ${n}. They'll be notified.`,
      notify: (a) => `${a} scouted you — a recruiter is interested in your profile`,
    }
  }
  // Prospect signaling interest to a Recruiter.
  if (actorRole === 'seeker' && targetRole === 'employer') {
    return {
      verb: 'Express interest',
      sentLabel: 'Interest sent',
      Icon: Send,
      toast: (n) => `Interest sent to ${n}. They'll be notified.`,
      notify: (a) => `${a} expressed interest in working with you`,
    }
  }
  // Same-role or peer / mentorship networking.
  return {
    verb: 'Reach out',
    sentLabel: 'Request sent',
    Icon: UserPlus,
    toast: (n) => `You reached out to ${n}. They'll be notified.`,
    notify: (a) => `${a} reached out — they're interested in connecting`,
  }
}

/** Toast after the recipient accepts. */
export function acceptToast(otherName: string): string {
  return `${otherName} is now in your network.`
}

/** Notification to the original requester when accepted. */
export function acceptNotify(accepterName: string): string {
  return `${accepterName} is now in your network`
}
