import { Timestamp } from 'firebase/firestore'
import type {
  AppNotification,
  AppUser,
  CommunityGroup,
  ConnectionRequest,
  Conversation,
  EmployerReview,
  Message,
  Post,
  Shift,
  ShiftApplication,
  WorkHistoryEntry,
} from '@/models'
import { ACCOMMODATION_NEEDS, EMPLOYER_RATING_TAGS, WORK_HISTORY_TAGS } from '@/models'

/** Synthetic guest session uid (matches previewStore). */
export const GUEST_UID = 'guest-preview'

const DEMO_COMPANY = 'Axol Work Company'

function at(msFromNow: number): Timestamp {
  return Timestamp.fromDate(new Date(Date.now() + msFromNow))
}
function hours(n: number) {
  return n * 60 * 60 * 1000
}
function days(n: number) {
  return n * 24 * 60 * 60 * 1000
}

function convId(a: string, b: string) {
  return [a, b].sort().join('_')
}

/** Other demo employers Prospects browse / message. */
export const DEMO_EMPLOYERS: AppUser[] = [
  {
    uid: 'demo-employer-harbor',
    displayName: 'Maya Chen',
    role: 'employer',
    headline: 'Axol Work Factory',
    workHistoryTags: [],
    connectionCount: 12,
    isVerifiedEmployed: false,
    verifiedEmployerUIDs: [],
    selectedCity: 'San Francisco',
    accommodationTags: [],
    accommodationNeeds: [],
    blockedUIDs: [],
    hasCompletedEmployerProfile: true,
    employerProfile: {
      companyName: 'Axol Work Factory',
      workplaceAddress: '88 Pier St, San Francisco',
      allowsNoiseCancelingHeadphones: true,
      offersSeatedWorkstations: true,
      offersStructuredNonverbalTraining: false,
    },
  },
  {
    uid: 'demo-employer-grove',
    displayName: 'Jordan Lee',
    role: 'employer',
    headline: 'Axol Work Kitchen',
    workHistoryTags: [],
    connectionCount: 8,
    isVerifiedEmployed: false,
    verifiedEmployerUIDs: [],
    selectedCity: 'Oakland',
    accommodationTags: [],
    accommodationNeeds: [],
    blockedUIDs: [],
    hasCompletedEmployerProfile: true,
    employerProfile: {
      companyName: 'Axol Work Kitchen',
      workplaceAddress: '210 Grove Ave, Oakland',
      allowsNoiseCancelingHeadphones: true,
      offersSeatedWorkstations: false,
      offersStructuredNonverbalTraining: true,
    },
  },
]

/** Demo Prospects Recruiters scout / review. */
export const DEMO_PROSPECTS: AppUser[] = [
  {
    uid: 'demo-seeker-alex',
    displayName: 'Alex Rivera',
    role: 'seeker',
    headline: 'Reliable morning shifts · quiet workspace preferred',
    workHistoryTags: [WORK_HISTORY_TAGS[2]!, WORK_HISTORY_TAGS[1]!],
    connectionCount: 6,
    isVerifiedEmployed: true,
    verifiedEmployerUIDs: ['demo-employer-harbor'],
    selectedCity: 'San Francisco',
    accommodationTags: [ACCOMMODATION_NEEDS[3]!, ACCOMMODATION_NEEDS[5]!],
    accommodationNeeds: [ACCOMMODATION_NEEDS[3]!, ACCOMMODATION_NEEDS[5]!],
    blockedUIDs: [],
    hasCompletedSeekerProfile: true,
  },
  {
    uid: 'demo-seeker-sam',
    displayName: 'Sam Okonkwo',
    role: 'seeker',
    headline: 'Kitchen & stock experience · flexible evenings',
    workHistoryTags: [WORK_HISTORY_TAGS[0]!, WORK_HISTORY_TAGS[5]!],
    connectionCount: 4,
    isVerifiedEmployed: false,
    verifiedEmployerUIDs: [],
    selectedCity: 'Oakland',
    accommodationTags: [ACCOMMODATION_NEEDS[1]!, ACCOMMODATION_NEEDS[2]!],
    accommodationNeeds: [ACCOMMODATION_NEEDS[1]!, ACCOMMODATION_NEEDS[2]!],
    blockedUIDs: [],
    hasCompletedSeekerProfile: true,
  },
  {
    uid: 'demo-seeker-riley',
    displayName: 'Riley Nguyen',
    role: 'seeker',
    headline: 'Warehouse packing · written instructions help',
    workHistoryTags: [WORK_HISTORY_TAGS[3]!, WORK_HISTORY_TAGS[4]!],
    connectionCount: 3,
    isVerifiedEmployed: true,
    verifiedEmployerUIDs: [GUEST_UID],
    selectedCity: 'San Francisco',
    accommodationTags: [ACCOMMODATION_NEEDS[2]!, ACCOMMODATION_NEEDS[4]!],
    accommodationNeeds: [ACCOMMODATION_NEEDS[2]!, ACCOMMODATION_NEEDS[4]!],
    blockedUIDs: [],
    hasCompletedSeekerProfile: true,
  },
]

export const DEMO_USERS_BY_UID: Record<string, AppUser> = Object.fromEntries(
  [...DEMO_EMPLOYERS, ...DEMO_PROSPECTS].map((u) => [u.uid, u]),
)

export function getDemoUser(uid: string): AppUser | null {
  return DEMO_USERS_BY_UID[uid] ?? null
}

export function isDemoUid(uid: string | undefined | null): boolean {
  return !!uid && (uid === GUEST_UID || uid.startsWith('demo-'))
}

export function searchDemoUsers(term: string): AppUser[] {
  const t = term.trim().toLowerCase()
  if (!t) return [...DEMO_EMPLOYERS, ...DEMO_PROSPECTS]
  return [...DEMO_EMPLOYERS, ...DEMO_PROSPECTS].filter((u) => {
    const company = u.employerProfile?.companyName?.toLowerCase() ?? ''
    return (
      u.displayName.toLowerCase().includes(t) ||
      company.includes(t) ||
      u.headline.toLowerCase().includes(t)
    )
  })
}

/** Open marketplace shifts Prospects browse. */
export const DEMO_OPEN_SHIFTS: Shift[] = [
  {
    id: 'demo-shift-harbor-1',
    employerUID: 'demo-employer-harbor',
    employerName: 'Axol Work Factory',
    title: 'Morning stock associate',
    description:
      'Restock produce and dry goods before open. Written checklist provided. Quiet early shift with clear routine.',
    address: '88 Pier St',
    city: 'San Francisco',
    payRate: '$22/hr',
    startTime: at(days(1) + hours(7)),
    endTime: at(days(1) + hours(12)),
    accommodationTags: [ACCOMMODATION_NEEDS[3]!, ACCOMMODATION_NEEDS[5]!, ACCOMMODATION_NEEDS[2]!],
    status: 'open',
  },
  {
    id: 'demo-shift-grove-1',
    employerUID: 'demo-employer-grove',
    employerName: 'Axol Work Kitchen',
    title: 'Prep cook - afternoon',
    description:
      'Veg prep and station setup. Structured nonverbal training available. Seated breaks are fine.',
    address: '210 Grove Ave',
    city: 'Oakland',
    payRate: '$24/hr',
    startTime: at(days(2) + hours(13)),
    endTime: at(days(2) + hours(18)),
    accommodationTags: [ACCOMMODATION_NEEDS[1]!, ACCOMMODATION_NEEDS[2]!, ACCOMMODATION_NEEDS[5]!],
    status: 'open',
  },
  {
    id: 'demo-shift-axol-1',
    employerUID: GUEST_UID,
    employerName: DEMO_COMPANY,
    title: 'Front desk greeter',
    description:
      'Welcome guests, hand out badges, and point people to rooms. Headphones OK. Flexible start within a 30-minute window.',
    address: '123 Market St',
    city: 'San Francisco',
    payRate: '$23/hr',
    startTime: at(days(3) + hours(9)),
    endTime: at(days(3) + hours(14)),
    accommodationTags: [ACCOMMODATION_NEEDS[3]!, ACCOMMODATION_NEEDS[4]!, ACCOMMODATION_NEEDS[1]!],
    status: 'open',
  },
  {
    id: 'demo-shift-harbor-2',
    employerUID: 'demo-employer-harbor',
    employerName: 'Axol Work Factory',
    title: 'Evening shelf reset',
    description: 'Light lifting under 20 lbs. Predictable aisle-by-aisle checklist.',
    address: '88 Pier St',
    city: 'San Francisco',
    payRate: '$21/hr',
    startTime: at(days(4) + hours(17)),
    endTime: at(days(4) + hours(21)),
    accommodationTags: [ACCOMMODATION_NEEDS[0]!, ACCOMMODATION_NEEDS[5]!],
    status: 'open',
  },
]

/** Shifts owned by the guest Recruiter. */
export const DEMO_EMPLOYER_SHIFTS: Shift[] = [
  DEMO_OPEN_SHIFTS.find((s) => s.id === 'demo-shift-axol-1')!,
  {
    id: 'demo-shift-axol-2',
    employerUID: GUEST_UID,
    employerName: DEMO_COMPANY,
    title: 'Warehouse packer',
    description: 'Pack small orders with a written SOP. Seated packing station available.',
    address: '123 Market St',
    city: 'San Francisco',
    payRate: '$22/hr',
    startTime: at(days(5) + hours(10)),
    endTime: at(days(5) + hours(16)),
    accommodationTags: [ACCOMMODATION_NEEDS[1]!, ACCOMMODATION_NEEDS[2]!],
    status: 'open',
  },
  {
    id: 'demo-shift-axol-3',
    employerUID: GUEST_UID,
    employerName: DEMO_COMPANY,
    title: 'Weekend cleanup crew',
    description: 'Already filled. Sample of a completed listing.',
    address: '123 Market St',
    city: 'San Francisco',
    payRate: '$20/hr',
    startTime: at(-days(2)),
    endTime: at(-days(2) + hours(4)),
    accommodationTags: [ACCOMMODATION_NEEDS[0]!],
    status: 'filled',
  },
]

/** Applications when previewing as Prospect. */
export const DEMO_SEEKER_APPLICATIONS: ShiftApplication[] = [
  {
    id: 'demo-app-seeker-1',
    shiftID: 'demo-shift-harbor-1',
    shiftTitle: 'Morning stock associate',
    employerUID: 'demo-employer-harbor',
    employerName: 'Axol Work Factory',
    seekerUID: GUEST_UID,
    seekerName: 'Guest Prospect',
    status: 'viewed',
    submittedAt: at(-days(1)),
  },
  {
    id: 'demo-app-seeker-2',
    shiftID: 'demo-shift-grove-1',
    shiftTitle: 'Prep cook - afternoon',
    employerUID: 'demo-employer-grove',
    employerName: 'Axol Work Kitchen',
    seekerUID: GUEST_UID,
    seekerName: 'Guest Prospect',
    status: 'submitted',
    submittedAt: at(-hours(8)),
  },
  {
    id: 'demo-app-seeker-3',
    shiftID: 'demo-shift-axol-past',
    shiftTitle: 'Event setup helper',
    employerUID: 'demo-employer-harbor',
    employerName: 'Axol Work Factory',
    seekerUID: GUEST_UID,
    seekerName: 'Guest Prospect',
    status: 'accepted',
    submittedAt: at(-days(5)),
    respondedAt: at(-days(4)),
  },
]

/** Applications when previewing as Recruiter. */
export const DEMO_EMPLOYER_APPLICATIONS: ShiftApplication[] = [
  {
    id: 'demo-app-emp-1',
    shiftID: 'demo-shift-axol-1',
    shiftTitle: 'Front desk greeter',
    employerUID: GUEST_UID,
    employerName: DEMO_COMPANY,
    seekerUID: 'demo-seeker-alex',
    seekerName: 'Alex Rivera',
    status: 'submitted',
    submittedAt: at(-hours(6)),
  },
  {
    id: 'demo-app-emp-2',
    shiftID: 'demo-shift-axol-1',
    shiftTitle: 'Front desk greeter',
    employerUID: GUEST_UID,
    employerName: DEMO_COMPANY,
    seekerUID: 'demo-seeker-sam',
    seekerName: 'Sam Okonkwo',
    status: 'viewed',
    submittedAt: at(-days(1)),
  },
  {
    id: 'demo-app-emp-3',
    shiftID: 'demo-shift-axol-2',
    shiftTitle: 'Warehouse packer',
    employerUID: GUEST_UID,
    employerName: DEMO_COMPANY,
    seekerUID: 'demo-seeker-riley',
    seekerName: 'Riley Nguyen',
    status: 'accepted',
    submittedAt: at(-days(3)),
    respondedAt: at(-days(2)),
  },
]

export function demoConnectionsFor(role: 'seeker' | 'employer'): ConnectionRequest[] {
  if (role === 'seeker') {
    return [
      {
        id: `${GUEST_UID}_demo-employer-harbor`,
        fromUID: GUEST_UID,
        toUID: 'demo-employer-harbor',
        otherUserName: 'Axol Work Factory',
        status: 'accepted',
      },
      {
        id: `${GUEST_UID}_demo-seeker-alex`,
        fromUID: 'demo-seeker-alex',
        toUID: GUEST_UID,
        otherUserName: 'Alex Rivera',
        status: 'accepted',
      },
      {
        id: `${GUEST_UID}_demo-employer-grove`,
        fromUID: GUEST_UID,
        toUID: 'demo-employer-grove',
        otherUserName: 'Axol Work Kitchen',
        status: 'pending',
      },
      {
        id: `demo-seeker-sam_${GUEST_UID}`,
        fromUID: 'demo-seeker-sam',
        toUID: GUEST_UID,
        otherUserName: 'Sam Okonkwo',
        status: 'pending',
      },
    ]
  }
  return [
    {
      id: `${GUEST_UID}_demo-seeker-alex`,
      fromUID: GUEST_UID,
      toUID: 'demo-seeker-alex',
      otherUserName: 'Alex Rivera',
      status: 'accepted',
    },
    {
      id: `${GUEST_UID}_demo-seeker-riley`,
      fromUID: 'demo-seeker-riley',
      toUID: GUEST_UID,
      otherUserName: 'Riley Nguyen',
      status: 'accepted',
    },
    {
      id: `${GUEST_UID}_demo-seeker-sam`,
      fromUID: GUEST_UID,
      toUID: 'demo-seeker-sam',
      otherUserName: 'Sam Okonkwo',
      status: 'pending',
    },
  ]
}

export const DEMO_POSTS: Post[] = [
  {
    id: 'demo-post-1',
    authorUID: 'demo-seeker-alex',
    authorName: 'Alex Rivera',
    text: 'Anyone else prefer written shift checklists? Axol Work Factory had a great one today.',
    createdAt: at(-hours(5)),
    visibility: 'everyone',
    likeCount: 4,
    commentCount: 1,
  },
  {
    id: 'demo-post-2',
    authorUID: 'demo-employer-grove',
    authorName: 'Axol Work Kitchen',
    text: 'We’re hiring afternoon prep cooks in Oakland. Structured training and seated breaks available.',
    createdAt: at(-days(1)),
    visibility: 'everyone',
    likeCount: 7,
    commentCount: 2,
  },
  {
    id: 'demo-post-3',
    authorUID: 'demo-seeker-sam',
    authorName: 'Sam Okonkwo',
    text: 'Tip: ask about noise levels before you apply. Saved me a rough first day last month.',
    createdAt: at(-days(2)),
    visibility: 'everyone',
    likeCount: 11,
    commentCount: 0,
  },
]

export const DEMO_GROUPS: CommunityGroup[] = [
  {
    id: 'demo-group-quiet',
    name: 'Quiet workspace tips',
    groupDescription: 'Share what helps you focus on noisy floors and open kitchens.',
    creatorUID: 'demo-seeker-alex',
    creatorName: 'Alex Rivera',
    memberUIDs: ['demo-seeker-alex', 'demo-seeker-sam', GUEST_UID],
    memberCount: 3,
    createdAt: at(-days(20)),
  },
  {
    id: 'demo-group-inclusive',
    name: 'Inclusive hiring practices',
    groupDescription: 'Recruiters comparing accommodation wording that actually works.',
    creatorUID: 'demo-employer-harbor',
    creatorName: 'Axol Work Factory',
    memberUIDs: ['demo-employer-harbor', 'demo-employer-grove'],
    memberCount: 2,
    createdAt: at(-days(14)),
  },
]

export function demoNotificationsFor(role: 'seeker' | 'employer'): AppNotification[] {
  if (role === 'seeker') {
    return [
      {
        id: 'demo-notif-1',
        recipientUID: GUEST_UID,
        actorUID: 'demo-employer-harbor',
        actorName: 'Axol Work Factory',
        kind: 'applicationAccepted',
        message: 'Axol Work Factory accepted your application for Event setup helper.',
        targetID: 'demo-app-seeker-3',
        isRead: false,
        createdAt: at(-hours(3)),
      },
      {
        id: 'demo-notif-2',
        recipientUID: GUEST_UID,
        actorUID: 'demo-seeker-alex',
        actorName: 'Alex Rivera',
        kind: 'connectionAccepted',
        message: 'Alex Rivera accepted your reach out.',
        isRead: false,
        createdAt: at(-hours(10)),
      },
      {
        id: 'demo-notif-3',
        recipientUID: GUEST_UID,
        actorUID: 'demo-employer-grove',
        actorName: 'Axol Work Kitchen',
        kind: 'message',
        message: 'Axol Work Kitchen sent you a message.',
        targetID: convId(GUEST_UID, 'demo-employer-grove'),
        isRead: true,
        createdAt: at(-days(1)),
      },
    ]
  }
  return [
    {
      id: 'demo-notif-e1',
      recipientUID: GUEST_UID,
      actorUID: 'demo-seeker-alex',
      actorName: 'Alex Rivera',
      kind: 'connectionRequest',
      message: 'Alex Rivera applied to Front desk greeter.',
      targetID: 'demo-app-emp-1',
      isRead: false,
      createdAt: at(-hours(2)),
    },
    {
      id: 'demo-notif-e2',
      recipientUID: GUEST_UID,
      actorUID: 'demo-seeker-riley',
      actorName: 'Riley Nguyen',
      kind: 'workHistoryVerified',
      message: 'Riley Nguyen requested work-history verification.',
      isRead: false,
      createdAt: at(-hours(12)),
    },
    {
      id: 'demo-notif-e3',
      recipientUID: GUEST_UID,
      actorUID: 'demo-seeker-sam',
      actorName: 'Sam Okonkwo',
      kind: 'message',
      message: 'Sam Okonkwo sent you a message.',
      targetID: convId(GUEST_UID, 'demo-seeker-sam'),
      isRead: true,
      createdAt: at(-days(1)),
    },
  ]
}

export function demoConversationsFor(role: 'seeker' | 'employer'): Conversation[] {
  if (role === 'seeker') {
    const other = 'demo-employer-grove'
    return [
      {
        id: convId(GUEST_UID, other),
        participantUIDs: [GUEST_UID, other],
        participantNames: {
          [GUEST_UID]: 'Guest Prospect',
          [other]: 'Axol Work Kitchen',
        },
        lastMessage: 'Happy to answer questions about the prep cook shift.',
        lastMessageAt: at(-hours(4)),
        lastSenderUID: other,
        lastReadAt: { [GUEST_UID]: at(-days(2)) },
      },
      {
        id: convId(GUEST_UID, 'demo-seeker-alex'),
        participantUIDs: [GUEST_UID, 'demo-seeker-alex'],
        participantNames: {
          [GUEST_UID]: 'Guest Prospect',
          'demo-seeker-alex': 'Alex Rivera',
        },
        lastMessage: 'Welcome! The quiet-workspace group is helpful.',
        lastMessageAt: at(-days(1)),
        lastSenderUID: 'demo-seeker-alex',
        lastReadAt: { [GUEST_UID]: at(-days(1)) },
      },
    ]
  }
  const other = 'demo-seeker-sam'
  return [
    {
      id: convId(GUEST_UID, other),
      participantUIDs: [GUEST_UID, other],
      participantNames: {
        [GUEST_UID]: DEMO_COMPANY,
        [other]: 'Sam Okonkwo',
      },
      lastMessage: 'Thanks for reviewing my application!',
      lastMessageAt: at(-hours(5)),
      lastSenderUID: other,
      lastReadAt: { [GUEST_UID]: at(-days(1)) },
    },
    {
      id: convId(GUEST_UID, 'demo-seeker-alex'),
      participantUIDs: [GUEST_UID, 'demo-seeker-alex'],
      participantNames: {
        [GUEST_UID]: DEMO_COMPANY,
        'demo-seeker-alex': 'Alex Rivera',
      },
      lastMessage: 'I can do the 9am greeter shift.',
      lastMessageAt: at(-hours(9)),
      lastSenderUID: 'demo-seeker-alex',
      lastReadAt: { [GUEST_UID]: at(-hours(8)) },
    },
  ]
}

export const DEMO_MESSAGES: Record<string, Message[]> = {
  [convId(GUEST_UID, 'demo-employer-grove')]: [
    {
      id: 'demo-msg-1',
      senderUID: 'demo-employer-grove',
      senderName: 'Axol Work Kitchen',
      text: 'Thanks for applying to afternoon prep. Any questions about the kitchen?',
      createdAt: at(-hours(6)),
      reactions: {},
    },
    {
      id: 'demo-msg-2',
      senderUID: GUEST_UID,
      senderName: 'Guest Prospect',
      text: 'Is the checklist written, or mostly verbal during training?',
      createdAt: at(-hours(5)),
      reactions: {},
    },
    {
      id: 'demo-msg-3',
      senderUID: 'demo-employer-grove',
      senderName: 'Axol Work Kitchen',
      text: 'Happy to answer questions about the prep cook shift.',
      createdAt: at(-hours(4)),
      reactions: {},
    },
  ],
  [convId(GUEST_UID, 'demo-seeker-alex')]: [
    {
      id: 'demo-msg-a1',
      senderUID: 'demo-seeker-alex',
      senderName: 'Alex Rivera',
      text: 'Welcome! The quiet-workspace group is helpful.',
      createdAt: at(-days(1)),
      reactions: {},
    },
  ],
  [convId(GUEST_UID, 'demo-seeker-sam')]: [
    {
      id: 'demo-msg-s1',
      senderUID: 'demo-seeker-sam',
      senderName: 'Sam Okonkwo',
      text: 'Thanks for reviewing my application!',
      createdAt: at(-hours(5)),
      reactions: {},
    },
  ],
}

export const DEMO_SEEKER_WORK_HISTORY: WorkHistoryEntry[] = [
  {
    id: 'demo-wh-1',
    seekerUID: GUEST_UID,
    seekerName: 'Guest Prospect',
    employerUID: 'demo-employer-harbor',
    employerName: 'Axol Work Factory',
    jobTitle: 'Stock associate',
    startDate: at(-days(120)),
    endDate: at(-days(30)),
    status: 'verified',
    requestedAt: at(-days(40)),
    respondedAt: at(-days(38)),
  },
  {
    id: 'demo-wh-2',
    seekerUID: GUEST_UID,
    seekerName: 'Guest Prospect',
    employerUID: 'demo-employer-grove',
    employerName: 'Axol Work Kitchen',
    jobTitle: 'Prep cook',
    startDate: at(-days(20)),
    endDate: null,
    status: 'pending',
    requestedAt: at(-days(2)),
  },
]

export const DEMO_VERIFICATION_REQUESTS: WorkHistoryEntry[] = [
  {
    id: 'demo-wh-req-1',
    seekerUID: 'demo-seeker-riley',
    seekerName: 'Riley Nguyen',
    employerUID: GUEST_UID,
    employerName: DEMO_COMPANY,
    jobTitle: 'Packer',
    startDate: at(-days(90)),
    endDate: at(-days(10)),
    status: 'pending',
    requestedAt: at(-hours(12)),
  },
  {
    id: 'demo-wh-req-2',
    seekerUID: 'demo-seeker-alex',
    seekerName: 'Alex Rivera',
    employerUID: GUEST_UID,
    employerName: DEMO_COMPANY,
    jobTitle: 'Greeter',
    startDate: at(-days(60)),
    endDate: null,
    status: 'pending',
    requestedAt: at(-days(1)),
  },
]

export const DEMO_REVIEWS_FOR_GUEST_EMPLOYER: EmployerReview[] = [
  {
    id: 'demo-rev-1',
    employerUID: GUEST_UID,
    reviewerUID: 'demo-seeker-riley',
    reviewerName: 'Riley Nguyen',
    ratingTags: [EMPLOYER_RATING_TAGS[1]!, EMPLOYER_RATING_TAGS[2]!, EMPLOYER_RATING_TAGS[5]!],
    optionalNote: 'Clear expectations and a quiet corner when I needed it.',
    createdAt: at(-days(7)),
  },
]

export function demoGroup(id: string): CommunityGroup | null {
  return DEMO_GROUPS.find((g) => g.id === id) ?? null
}
