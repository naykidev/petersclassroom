import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { reportContent } from '@/features/users/api'
import type { ReportTargetType } from '@/models'
import { Button, Modal, TextArea } from '@/components/ui'

const REASONS = [
  'Harassment or bullying',
  'Hate speech or discrimination',
  'Spam or scam',
  'Misinformation',
  'Inappropriate content',
  'Other',
]

export function ReportModal({
  open,
  onClose,
  targetType,
  targetID,
}: {
  open: boolean
  onClose: () => void
  targetType: ReportTargetType
  targetID: string
}) {
  const { user } = useAuthStore()
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    if (!user || !reason) return
    setSubmitting(true)
    try {
      await reportContent({
        reporterUID: user.uid,
        targetType,
        targetID,
        reason: detail ? `${reason}: ${detail}` : reason,
      })
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  function close() {
    setReason('')
    setDetail('')
    setDone(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={`Report this ${targetType}`}
      footer={
        !done && (
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button variant="danger" onClick={submit} loading={submitting} disabled={!reason}>
              Submit report
            </Button>
          </>
        )
      }
    >
      {done ? (
        <p className="text-sm text-fg">
          Thanks — your report has been submitted for review.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-fg">Reason</legend>
            <div className="flex flex-col gap-1">
              {REASONS.map((r) => (
                <label key={r} className="flex min-h-touch items-center gap-2 rounded-btn px-2 hover:bg-muted">
                  <input
                    type="radio"
                    name="report-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="h-4 w-4 accent-brand"
                  />
                  <span className="text-sm text-fg">{r}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <TextArea
            label="Additional detail (optional)"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
          />
        </div>
      )}
    </Modal>
  )
}
