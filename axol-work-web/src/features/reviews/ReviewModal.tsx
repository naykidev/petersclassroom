import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { usePreviewStore } from '@/stores/previewStore'
import { EMPLOYER_RATING_TAGS } from '@/models'
import { Button, Modal, SelectChip, TextArea } from '@/components/ui'
import { createEmployerReview } from './api'

/** Seeker leaves a tag-based review for an employer. */
export function ReviewModal({
  employerUID,
  employerName,
  onClose,
}: {
  employerUID: string
  employerName: string
  onClose: () => void
}) {
  const { user } = useAuthStore()
  const me = user!
  const [tags, setTags] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const toggle = (v: string) =>
    setTags((l) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]))

  async function save() {
    if (!tags.length) return
    if (usePreviewStore.getState().requireAccount('Create a free account to leave a review.')) return
    setSaving(true)
    try {
      await createEmployerReview({
        employerUID,
        reviewer: { uid: me.uid, name: me.displayName },
        ratingTags: tags,
        optionalNote: note,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Review ${employerName}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={!tags.length}>
            Submit review
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-fg">What went well?</p>
          <div className="flex flex-wrap gap-2">
            {EMPLOYER_RATING_TAGS.map((t) => (
              <SelectChip key={t} label={t} selected={tags.includes(t)} onToggle={() => toggle(t)} />
            ))}
          </div>
        </div>
        <TextArea
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={280}
          hint="Up to 280 characters"
        />
      </div>
    </Modal>
  )
}
