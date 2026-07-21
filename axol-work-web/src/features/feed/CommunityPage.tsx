import { PageHeader } from '@/components/PageHeader'
import { Feed } from './Feed'

export function CommunityPage() {
  return (
    <div>
      <PageHeader title="Community" subtitle="Share updates and connect with others" />
      <Feed groupID={null} />
    </div>
  )
}
