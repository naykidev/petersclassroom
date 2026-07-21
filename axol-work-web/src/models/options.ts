/**
 * Reference option lists — hardcoded to match the iOS app exactly.
 * These are user-facing display strings AND the stored raw values, so keep
 * them verbatim.
 */

export const WORK_HISTORY_TAGS = [
  'Worked in a kitchen',
  'Stocked shelves',
  'Customer service',
  'Warehouse or packing',
  'Cleaning or janitorial',
  'Food prep or assembly',
  'Landscaping or outdoor work',
  'Office or admin support',
] as const

export const CITIES = [
  'San Francisco',
  'Oakland',
  'San Jose',
  'Berkeley',
  'Los Angeles',
  'San Diego',
  'Sacramento',
  'Other nearby area',
] as const

export const AVAILABILITY_OPTIONS = [
  'Mornings',
  'Afternoons',
  'Evenings',
  'Weekends',
  'Overnight',
] as const

export const ACCOMMODATION_NEEDS = [
  "Can't lift over 20 lbs",
  'Need seated breaks',
  'Prefer written instructions over verbal',
  'Need quiet workspace',
  'Need flexible start times',
  'Prefer predictable routines',
] as const

export const EMPLOYER_RATING_TAGS = [
  'Break policy was clear',
  'Accommodations honored',
  'Training was structured',
  'Schedule was predictable',
  'Management was respectful',
  'Workspace was accessible',
  'Pay was on time',
] as const

export type WorkHistoryTag = (typeof WORK_HISTORY_TAGS)[number]
export type City = (typeof CITIES)[number]
export type AvailabilityOption = (typeof AVAILABILITY_OPTIONS)[number]
export type AccommodationNeed = (typeof ACCOMMODATION_NEEDS)[number]
export type EmployerRatingTag = (typeof EMPLOYER_RATING_TAGS)[number]
