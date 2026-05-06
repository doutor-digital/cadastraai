'use client'

import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FieldShellProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
  htmlFor?: string
}

export function FieldShell({ label, hint, error, required, className, children, htmlFor }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-[12px] font-medium text-white/65">
        {label}
        {required && <span className="text-cyan-400 ml-1">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-rose-300">{error}</p>
      ) : hint ? (
        <p className="text-xs text-white/45">{hint}</p>
      ) : null}
    </div>
  )
}

const inputBaseClass =
  'w-full px-4 h-12 rounded-2xl bg-[#0c0d10] border border-white/[0.05] text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15 transition-colors'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  containerClassName?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, hint, error, required, containerClassName, className, id, ...props }, ref) => {
    const inputId = id ?? `field-${label.replace(/\s+/g, '-').toLowerCase()}`
    return (
      <FieldShell label={label} hint={hint} error={error} required={required} className={containerClassName} htmlFor={inputId}>
        <input ref={ref} id={inputId} required={required} className={cn(inputBaseClass, className)} {...props} />
      </FieldShell>
    )
  },
)
TextInput.displayName = 'TextInput'

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
  containerClassName?: string
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, hint, error, required, options, placeholder, containerClassName, className, id, ...props }, ref) => {
    const inputId = id ?? `field-${label.replace(/\s+/g, '-').toLowerCase()}`
    return (
      <FieldShell label={label} hint={hint} error={error} required={required} className={containerClassName} htmlFor={inputId}>
        <select
          ref={ref}
          id={inputId}
          required={required}
          // colorScheme=dark makes the OS-rendered dropdown menu use dark colors so options aren't white-on-white.
          style={{ colorScheme: 'dark' }}
          className={cn(
            inputBaseClass,
            'cursor-pointer appearance-none pr-10 bg-no-repeat bg-[right_0.875rem_center]',
            className,
          )}
          {...{
            ...props,
            // Force a backgroundImage via inline style merging — easier than dealing with arbitrary classes
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </FieldShell>
    )
  },
)
SelectInput.displayName = 'SelectInput'

interface TextareaInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  error?: string
  containerClassName?: string
}

export const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  ({ label, hint, error, required, containerClassName, className, id, ...props }, ref) => {
    const inputId = id ?? `field-${label.replace(/\s+/g, '-').toLowerCase()}`
    return (
      <FieldShell label={label} hint={hint} error={error} required={required} className={containerClassName} htmlFor={inputId}>
        <textarea
          ref={ref}
          id={inputId}
          required={required}
          rows={3}
          className={cn(inputBaseClass, 'h-auto py-3 resize-y min-h-[88px]', className)}
          {...props}
        />
      </FieldShell>
    )
  },
)
TextareaInput.displayName = 'TextareaInput'

interface ToggleSwitchProps {
  label: string
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}

export function ToggleSwitch({ label, description, checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'group flex items-center justify-between w-full px-4 h-14 rounded-2xl border transition-colors',
        checked
          ? 'border-cyan-400/55 bg-cyan-400/[0.08]'
          : 'border-white/[0.05] bg-[#0c0d10] hover:border-white/[0.12]',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
      aria-pressed={checked}
    >
      <div className="text-left">
        <p className="text-[13px] font-medium text-white">{label}</p>
        {description && <p className="text-[11px] text-white/55 mt-0.5">{description}</p>}
      </div>
      <span
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-cyan-400' : 'bg-white/15',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}

interface SegmentedProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string; description?: string }[]
  onChange: (value: T) => void
  hint?: string
  required?: boolean
}

export function Segmented<T extends string>({ label, value, options, onChange, hint, required }: SegmentedProps<T>) {
  return (
    <FieldShell label={label} hint={hint} required={required}>
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => {
          const active = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                'flex flex-col items-start gap-0.5 px-4 py-3 rounded-2xl border text-left transition-colors',
                active
                  ? 'border-cyan-400/60 bg-cyan-400/[0.10]'
                  : 'border-white/[0.05] bg-[#0c0d10] hover:border-white/[0.12]',
              )}
              aria-pressed={active}
            >
              <span className="text-[14px] font-semibold text-white">{o.label}</span>
              {o.description && <span className="text-[12px] text-white/55">{o.description}</span>}
            </button>
          )
        })}
      </div>
    </FieldShell>
  )
}
