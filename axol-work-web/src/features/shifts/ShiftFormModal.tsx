import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import type { Shift } from '@/models'
import { ACCOMMODATION_NEEDS, CITIES } from '@/models'
import { Button, Input, Modal, Select, SelectChip, TextArea } from '@/components/ui'
import { toDate, toInputDateTime } from '@/utils/format'
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
  const [tags, setTags] = useState<string[]>(shift?.accommodationTags ?? [])

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
    if (shift) await updateShift(shift.id, input)
    else await createShift({ uid: me.uid, name: me.employerProfile?.companyName ?? me.displayName }, input)
    onClose()
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
          <Button onClick={onSubmit} loading={isSubmitting}>
            {shift ? 'Save changes' : 'Post shift'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <TextArea label="Description" error={errors.description?.message} {...register('description')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Address" error={errors.address?.message} {...register('address')} />
          <Select label="City" options={CITIES} placeholder="Select a city" error={errors.city?.message} {...register('city')} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Pay rate" placeholder="$20/hr" error={errors.payRate?.message} {...register('payRate')} />
          <Input label="Start" type="datetime-local" error={errors.startTime?.message} {...register('startTime')} />
          <Input label="End" type="datetime-local" error={errors.endTime?.message} {...register('endTime')} />
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
