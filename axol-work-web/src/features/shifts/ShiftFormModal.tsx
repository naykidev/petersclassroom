import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import type { Shift } from '@/models'
import { ACCOMMODATION_NEEDS, CITIES } from '@/models'
import { Button, Input, Modal, Select, SelectChip, TextArea } from '@/components/ui'
import { toDate, toInputDateTime } from '@/utils/format'
import { canPostShifts } from '@/utils/employerVerification'
import { createShift, updateShift, type ShiftInput } from './api'
import { useState } from 'react'

const schema = z
  .object({
    title: z.string().min(2, 'Enter a title.'),
    description: z.string().min(5, 'Add a short description.'),
    address: z.string().min(3, 'Enter an address.'),
    city: z.string().min(1, 'Select a city.'),
    payRate: z.string().min(1, 'Enter a pay rate.'),
    startTime: z.string().min(1, 'Set a start time.'),
    endTime: z.string().min(1, 'Set an end time.'),
  })
  .refine((v) => new Date(v.endTime) > new Date(v.startTime), {
    message: 'End time must be after start time.',
    path: ['endTime'],
  })
type Values = z.infer<typeof schema>

export function ShiftFormModal({
  shift,
  onClose,
}: {
  shift?: Shift
  onClose: () => void
}) {
  const { user } = useAuthStore()
  const me = user!
  const pushToast = useToastStore((s) => s.push)
  const [tags, setTags] = useState<string[]>(shift?.accommodationTags ?? [])
  const [formError, setFormError] = useState<string | null>(null)
  const allowedToCreate = canPostShifts(me)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: shift
      ? {
          title: shift.title,
          description: shift.description,
          address: shift.address,
          city: shift.city,
          payRate: shift.payRate,
          startTime: toInputDateTime(toDate(shift.startTime) ?? new Date()),
          endTime: toInputDateTime(toDate(shift.endTime) ?? new Date()),
        }
      : { city: '' },
  })

  const onSubmit = handleSubmit(async (v) => {
    setFormError(null)
    if (!shift && !allowedToCreate) {
      const msg =
        'Axol Assist must verify your Recruiter account before you can post shifts. We usually review within two business days.'
      setFormError(msg)
      pushToast(msg, 'error')
      return
    }
    const input: ShiftInput = {
      title: v.title,
      description: v.description,
      address: v.address,
      city: v.city,
      payRate: v.payRate,
      startTime: new Date(v.startTime),
      endTime: new Date(v.endTime),
      accommodationTags: tags,
    }
    try {
      if (shift) await updateShift(shift.id, input)
      else
        await createShift(
          { uid: me.uid, name: me.employerProfile?.companyName ?? me.displayName },
          input,
        )
      pushToast(shift ? 'Shift saved.' : 'Shift posted.', 'success')
      onClose()
    } catch (e) {
      const msg =
        (e as { code?: string })?.code === 'permission-denied'
          ? 'You can’t post until Axol Assist verifies your Recruiter account.'
          : navigator.onLine === false
            ? 'You’re offline. Check your connection and try again.'
            : (e as Error)?.message || 'Couldn’t save the shift. Try again.'
      setFormError(msg)
      pushToast(msg, 'error')
    }
  })

  const toggle = (v: string) =>
    setTags((l) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]))

  return (
    <Modal
      open
      onClose={onClose}
      title={shift ? 'Edit shift' : 'Post a shift'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={isSubmitting} disabled={!shift && !allowedToCreate}>
            {shift ? 'Save changes' : 'Post shift'}
          </Button>
        </>
      }
    >
      {!shift && !allowedToCreate && (
        <p
          className="mb-4 rounded-btn border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-fg"
          role="status"
        >
          Verification pending. Axol Assist reviews Recruiter accounts before shifts go live. Email
          axolassist.business@gmail.com if you need a status check.
        </p>
      )}
      {formError && (
        <p
          className="mb-4 rounded-btn border border-danger/40 bg-danger/15 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {formError}
        </p>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <TextArea
          label="Description"
          error={errors.description?.message}
          {...register('description')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Address" error={errors.address?.message} {...register('address')} />
          <Select
            label="City"
            options={CITIES}
            placeholder="Select a city"
            error={errors.city?.message}
            {...register('city')}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Pay rate"
            placeholder="$20/hr"
            error={errors.payRate?.message}
            {...register('payRate')}
          />
          <Input
            label="Start"
            type="datetime-local"
            error={errors.startTime?.message}
            {...register('startTime')}
          />
          <Input
            label="End"
            type="datetime-local"
            error={errors.endTime?.message}
            {...register('endTime')}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-fg">Accommodations offered</p>
          <div className="flex flex-wrap gap-2">
            {ACCOMMODATION_NEEDS.map((t) => (
              <SelectChip key={t} label={t} selected={tags.includes(t)} onToggle={() => toggle(t)} />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}
