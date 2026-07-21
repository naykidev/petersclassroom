import { Target, Send, UserPlus, type LucideIcon } from 'lucide-react'
import type { UserRole } from '@/models'

/**
 * Connection-action copy, themed to Axol's scouting vibe. The verb depends on
 * who is initiating (roles are stored as seeker/employer; the UI nouns are
 * Prospect/Recruiter):
 *   Recruiter -> Prospect : "Scout"
 *   Prospect  -> Recruiter: "Express interest"
 *   same-role / peer / mentor: "Reach out"
 *
 * `verb`      — idle button label
 * `sentLabel` — button label once the request is pending (outgoing)
 * `Icon`      — button icon
 * `toast`     — confirmation shown to the initiator after clicking
 * `notify`    — notification message delivered to the other party
 */
export interface ConnectionCopy {
  verb: string
  sentLabel: string
  Icon: LucideIcon
  toast: (targetName: string) => string
  notify: (actorName: string) => string
}

/** Neutral label once the connection is mutual (deliberately not "Connected"). */
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
      toast: (n) => `You scouted ${n}. They'll be notified you're interested.`,
      notify: (a) => `${a} scouted you — a recruiter is interested in your profile`,
    }
  }
  // Prospect reaching toward a Recruiter.
  if (actorRole === 'seeker' && targetRole === 'employer') {
    return {
      verb: 'Express interest',
      sentLabel: 'Interest sent',
      Icon: Send,
      toast: (n) => `Interest sent to ${n}.`,
      notify: (a) => `${a} expressed interest in connecting with you`,
    }
  }
  // Same-role or peer/mentor networking.
  return {
    verb: 'Reach out',
    sentLabel: 'Request sent',
    Icon: UserPlus,
    toast: (n) => `You reached out to ${n}.`,
    notify: (a) => `${a} reached out to connect with you`,
  }
}
