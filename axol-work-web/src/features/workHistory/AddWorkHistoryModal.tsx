import { useState } from 'react'
import { Search, Check } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import type { AppUser } from '@/models'
import { Avatar, Button, Input, Modal } from '@/components/ui'
import { searchUsersByName } from '@/features/users/api'
import { requestWorkHistory } from './api'

/**
 * Seeker adds a job and requests verification from a real employer account
 * (searched by name so the employerUID is correct and verification works).
 */
export function AddWorkHistoryModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore()
  const me = user!
  const [employer, setEmployer] = useState<AppUser | null>(null)
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<AppUser[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [jobTitle, setJobTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [current, setCurrent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function search(e: React.FormEvent) {
    e.preventDefault()
    setSearching(true)
    try {
      const r = await searchUsersByName(term)
      setResults(r.filter((u) => u.role === 'employer'))
    } finally {
      setSearching(false)
    }
  }

  const canSubmit = employer && jobTitle.trim() && start && (current || end)

  async function submit() {
    if (!employer || !canSubmit) return
    setSubmitting(true)
    try {
      await requestWorkHistory({
        seeker: { uid: me.uid, name: me.displayName },
        employer: { uid: employer.uid, name: employer.employerProfile?.companyName ?? employer.displayName },
        jobTitle,
        startDate: new Date(start),
        endDate: current ? null : new Date(end),
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Add work history"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={submitting} disabled={!canSubmit}>
            Request verification
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {employer ? (
          <div className="flex items-center justify-between rounded-btn border border-border p-2">
            <div className="flex items-center gap-2">
              <Avatar name={employer.employerProfile?.companyName ?? employer.displayName} size="sm" />
              <span className="font-semibold text-fg">
                {employer.employerProfile?.companyName ?? employer.displayName}
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setEmployer(null)}>
              Change
            </Button>
          </div>
        ) : (
          <div>
            <form onSubmit={search} className="flex gap-2">
              <Input placeholder="Search employer by name…" value={term} onChange={(e) => setTerm(e.target.value)} className="flex-1" />
              <Button type="submit" loading={searching}>
                <Search className="h-4 w-4" aria-hidden />
              </Button>
            </form>
            {results && (
              <ul className="mt-2 flex flex-col gap-1">
                {results.length === 0 && <li className="text-sm text-fg-muted">No employers found.</li>}
                {results.map((u) => (
                  <li key={u.uid}>
                    <button
                      onClick={() => setEmployer(u)}
                      className="flex w-full items-center gap-2 rounded-btn p-2 text-left hover:bg-muted"
                    >
                      <Avatar name={u.employerProfile?.companyName ?? u.displayName} size="sm" />
                      <span className="text-sm text-fg">{u.employerProfile?.companyName ?? u.displayName}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Input label="Job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start date" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input label="End date" type="date" value={end} onChange={(e) => setEnd(e.target.value)} disabled={current} />
        </div>
        <label className="flex items-center gap-2 text-sm text-fg">
          <input type="checkbox" className="h-4 w-4 accent-brand" checked={current} onChange={(e) => setCurrent(e.target.checked)} />
          <Check className="h-4 w-4 text-brand" aria-hidden /> I currently work here
        </label>
      </div>
    </Modal>
  )
}
