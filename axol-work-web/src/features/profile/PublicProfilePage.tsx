import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, MapPin, MessageSquare, Ban, Flag, Building2, Star } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import type { AppUser } from '@/models'
import { Avatar, Badge, Button, Card, Chip, EmptyState, Spinner } from '@/components/ui'
import { ReportModal } from '@/components/ReportModal'
import { getUser, blockUser, unblockUser } from '@/features/users/api'
import { getOrCreateConversation } from '@/features/messaging/api'
import { ConnectionButton } from '@/features/connections/ConnectionButton'
import { EmployerReviewsList } from '@/features/reviews/EmployerReviewsList'
import { ReviewModal } from '@/features/reviews/ReviewModal'

export function PublicProfilePage() {
  const { uid } = useParams()
  const { user, updateUser } = useAuthStore()
  const me = user!
  const navigate = useNavigate()
  const [profile, setProfile] = useState<AppUser | null | undefined>(undefined)
  const [reportOpen, setReportOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  useEffect(() => {
    if (!uid) return
    setProfile(undefined)
    getUser(uid).then((p) => setProfile(p))
  }, [uid])

  if (uid === me.uid) return <Navigate to="/profile" replace />

  const isBlocked = (me.blockedUIDs ?? []).includes(uid ?? '')

  if (profile === undefined) return <Spinner label="Loading profile" />
  if (profile === null)
    return <EmptyState icon={Ban} title="Profile not found" message="This user doesn’t exist." />

  const isEmployer = profile.role === 'employer'
  const displayName = isEmployer
    ? profile.employerProfile?.companyName ?? profile.displayName
    : profile.displayName

  async function message() {
    const id = await getOrCreateConversation(
      { uid: me.uid, name: me.displayName },
      { uid: profile!.uid, name: displayName },
    )
    navigate(`/messages/${id}`)
  }

  async function toggleBlock() {
    if (isBlocked) {
      await unblockUser(me.uid, profile!.uid)
      await updateUser({ blockedUIDs: (me.blockedUIDs ?? []).filter((b) => b !== profile!.uid) })
    } else {
      await blockUser(me.uid, profile!.uid)
      await updateUser({ blockedUIDs: [...(me.blockedUIDs ?? []), profile!.uid] })
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card elevated>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={displayName} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-title-2 text-fg">{displayName}</h1>
                {profile.isVerifiedEmployed && (
                  <Badge tone="success" icon={BadgeCheck}>
                    Verified
                  </Badge>
                )}
                {isEmployer && (
                  <Badge tone="brand" icon={Building2}>
                    Recruiter
                  </Badge>
                )}
              </div>
              {profile.headline && <p className="text-fg-muted">{profile.headline}</p>}
              <div className="mt-1 flex items-center gap-3 text-sm text-fg-muted">
                {profile.selectedCity && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden /> {profile.selectedCity}
                  </span>
                )}
                {!isEmployer && <span>{profile.connectionCount} in network</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ConnectionButton
            target={{ uid: profile.uid, displayName, role: profile.role }}
          />
          <Button variant="secondary" onClick={message}>
            <MessageSquare className="h-4 w-4" aria-hidden /> Message
          </Button>
          {/* Only verified employees may review (enforced by rules). */}
          {isEmployer &&
            me.role === 'seeker' &&
            (me.verifiedEmployerUIDs ?? []).includes(profile.uid) && (
              <Button variant="secondary" onClick={() => setReviewOpen(true)}>
                <Star className="h-4 w-4" aria-hidden /> Leave a review
              </Button>
            )}
          <Button variant="ghost" onClick={toggleBlock}>
            <Ban className="h-4 w-4" aria-hidden /> {isBlocked ? 'Unblock' : 'Block'}
          </Button>
          <Button variant="ghost" onClick={() => setReportOpen(true)}>
            <Flag className="h-4 w-4" aria-hidden /> Report
          </Button>
        </div>

        {isEmployer && profile.employerProfile && (
          <div className="mt-4">
            <p className="mb-2 text-caption font-semibold uppercase text-fg-muted">Accommodations</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.employerProfile.allowsNoiseCancelingHeadphones && <Chip>Headphones allowed</Chip>}
              {profile.employerProfile.offersSeatedWorkstations && <Chip>Seated workstations</Chip>}
              {profile.employerProfile.offersStructuredNonverbalTraining && <Chip>Structured training</Chip>}
            </div>
          </div>
        )}

        {profile.workHistoryTags.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-caption font-semibold uppercase text-fg-muted">Experience</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.workHistoryTags.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
          </div>
        )}
      </Card>

      {isEmployer && (
        <div className="mt-6">
          <h2 className="mb-3 text-headline text-fg">Reviews</h2>
          <EmployerReviewsList employerUID={profile.uid} />
        </div>
      )}

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} targetType="user" targetID={profile.uid} />
      {reviewOpen && (
        <ReviewModal employerUID={profile.uid} employerName={displayName} onClose={() => setReviewOpen(false)} />
      )}
    </div>
  )
}
