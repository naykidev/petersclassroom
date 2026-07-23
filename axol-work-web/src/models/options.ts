/**
 * Reference option lists — tags/needs match the iOS app.
 * Cities are major US metros nationwide, plus a catch-all.
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
  // West
  'Seattle',
  'Portland',
  'San Francisco',
  'Oakland',
  'San Jose',
  'Sacramento',
  'Los Angeles',
  'San Diego',
  'Las Vegas',
  'Phoenix',
  'Denver',
  'Salt Lake City',
  // Midwest
  'Minneapolis',
  'Chicago',
  'Detroit',
  'Indianapolis',
  'Columbus',
  'Kansas City',
  'St. Louis',
  // South
  'Dallas',
  'Houston',
  'Austin',
  'San Antonio',
  'New Orleans',
  'Nashville',
  'Atlanta',
  'Charlotte',
  'Raleigh',
  'Miami',
  'Tampa',
  'Orlando',
  // Northeast / Mid-Atlantic
  'Boston',
  'New York City',
  'Philadelphia',
  'Pittsburgh',
  'Washington, DC',
  'Baltimore',
  // Catch-all
  'Other / not listed',
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
