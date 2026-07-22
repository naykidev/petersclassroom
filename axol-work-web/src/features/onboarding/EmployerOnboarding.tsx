import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { Button, Input } from '@/components/ui'

const schema = z.object({
  companyName: z.string().min(2, 'Enter your company name.'),
  workplaceAddress: z.string().min(3, 'Enter your workplace address.'),
  allowsNoiseCancelingHeadphones: z.boolean(),
  offersSeatedWorkstations: z.boolean(),
  offersStructuredNonverbalTraining: z.boolean(),
})
type Values = z.infer<typeof schema>

const TOGGLES: {
  key: keyof Pick<
    Values,
    | 'allowsNoiseCancelingHeadphones'
    | 'offersSeatedWorkstations'
    | 'offersStructuredNonverbalTraining'
  >
  label: string
  desc: string
}[] = [
  {
    key: 'allowsNoiseCancelingHeadphones',
    label: 'Noise-canceling headphones allowed',
    desc: 'Workers may wear headphones on the job.',
  },
  {
    key: 'offersSeatedWorkstations',
    label: 'Seated workstations available',
    desc: 'Roles that can be done seated are offered.',
  },
  {
    key: 'offersStructuredNonverbalTraining',
    label: 'Structured / non-verbal training',
    desc: 'Written or visual training beyond verbal instruction.',
  },
]

export function EmployerOnboarding() {
  const { user, updateUser, logOut } = useAuthStore()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: user?.employerProfile?.companyName ?? '',
      workplaceAddress: user?.employerProfile?.workplaceAddress ?? '',
      allowsNoiseCancelingHeadphones:
        user?.employerProfile?.allowsNoiseCancelingHeadphones ?? false,
      offersSeatedWorkstations: user?.employerProfile?.offersSeatedWorkstations ?? false,
      offersStructuredNonverbalTraining:
        user?.employerProfile?.offersStructuredNonverbalTraining ?? false,
    },
  })

  const onSubmit = handleSubmit(async (v) => {
    await updateUser({
      headline: v.companyName,
      employerProfile: v,
      hasCompletedEmployerProfile: true,
    })
  })

  return (
    <main className="min-h-screen bg-page p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-title-2 text-fg">Set up your company</h1>
          <p className="mt-1 text-fg-muted">
            Tell Prospects what accommodations you offer.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-card bg-card border border-border shadow-card p-6 flex flex-col gap-5"
          noValidate
        >
          <Input
            label="Company name"
            error={errors.companyName?.message}
            {...register('companyName')}
          />
          <Input
            label="Workplace address"
            error={errors.workplaceAddress?.message}
            {...register('workplaceAddress')}
          />

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-semibold text-fg mb-1">
              Accommodations offered
            </legend>
            {TOGGLES.map((t) => {
              const checked = watch(t.key)
              return (
                <label
                  key={t.key}
                  className="flex cursor-pointer items-start gap-3 rounded-btn border border-border p-3 hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 accent-brand"
                    checked={checked}
                    onChange={(e) => setValue(t.key, e.target.checked)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-fg">{t.label}</span>
                    <span className="block text-caption text-fg-muted">{t.desc}</span>
                  </span>
                </label>
              )
            })}
          </fieldset>

          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" onClick={() => logOut()}>
              Log out
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Finish setup
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
