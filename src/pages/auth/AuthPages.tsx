import {
  ArrowRight, Eye, EyeOff, LockKeyhole, Mail, MessageCircle, ShieldCheck, Sparkles,
} from 'lucide-react'
import { z } from 'zod'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService, type AuthResult } from '../../services/authService'
import { saveCurrentProfile } from '../../services/profileService'

type Notice = { tone: 'error' | 'info' | 'success'; text: string }

function AuthTitle({ kicker, title, description }: { kicker: string; title: string; description: string }) {
  return (
    <div className="auth-title">
      <span className="auth-kicker">{kicker}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}

function AuthNotice({ notice }: { notice: Notice | null }) {
  if (!notice) return null
  return <div className={`auth-notice auth-notice--${notice.tone}`} role={notice.tone === 'error' ? 'alert' : 'status'}>{notice.text}</div>
}

function AuthField({ label, name, type = 'text', placeholder, autoComplete, icon, trailing, ...props }: {
  label: string
  name: string
  type?: string
  placeholder: string
  autoComplete?: string
  icon: ReactNode
  trailing?: ReactNode
  required?: boolean
  minLength?: number
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  value?: string
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <span className="auth-field__control">
        <i>{icon}</i>
        <input name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} {...props} />
        {trailing}
      </span>
    </label>
  )
}

function PasswordInput({ label, name, visible, onToggle, placeholder, autoComplete, onChange, value, minLength }: {
  label: string
  name: string
  visible: boolean
  onToggle: () => void
  placeholder: string
  autoComplete: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  value?: string
  minLength?: number
}) {
  return (
    <AuthField
      label={label}
      name={name}
      type={visible ? 'text' : 'password'}
      placeholder={placeholder}
      autoComplete={autoComplete}
      icon={<LockKeyhole size={15} />}
      onChange={onChange}
      value={value}
      minLength={minLength}
      required
      trailing={
        <button className="auth-password-toggle" type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={onToggle}>
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
    />
  )
}

function handleAuthResult(result: AuthResult, navigate: ReturnType<typeof useNavigate>, nextPath: string, setNotice: (notice: Notice) => void, identifier?: string) {
  if (!result.ok) {
    setNotice({ tone: 'error', text: result.message })
    return
  }
  if (result.profile) {
    saveCurrentProfile({
      displayName: result.profile.displayName,
      email: result.profile.email,
      phone: result.profile.phone ?? '',
    })
  }
  if (result.next === 'authenticated') {
    if (result.mode === 'demo') {
      setNotice({ tone: 'info', text: 'Demo profile active for this tab only. No password or authentication token was stored.' })
    }
    navigate(nextPath, { replace: true })
    return
  }
  if (result.next === 'verify-email') navigate(`/verify-email?email=${encodeURIComponent(identifier ?? '')}`)
  else if (result.next === 'verify-phone') navigate(`/verify-phone?phone=${encodeURIComponent(identifier ?? '')}`)
  else if (result.next === 'reset-sent') setNotice({ tone: 'success', text: 'If an account exists, password recovery instructions have been sent.' })
}

function useReturnPath(defaultPath = '/dashboard') {
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo')
  return returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : defaultPath
}

export function LoginPage() {
  const [mode, setMode] = useState<'email' | 'phone'>('email')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const nextPath = useReturnPath()

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    const schema = z.object({ email: z.string().email('Enter a valid email address.'), password: z.string().min(1, 'Enter your password.') })
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      setNotice({ tone: 'error', text: parsed.error.issues[0]?.message ?? 'Check your email and password.' })
      return
    }
    setBusy(true)
    try {
      handleAuthResult(await authService.loginWithPassword(parsed.data), navigate, nextPath, setNotice)
    } catch (error) {
      console.error('Sign-in service failed.', error)
      setNotice({ tone: 'error', text: 'Sign-in could not be completed. Try again later.' })
    } finally {
      setBusy(false)
    }
  }

  async function signInWithGoogle() {
    setNotice(null)
    try {
      handleAuthResult(await authService.loginWithGoogle(), navigate, nextPath, setNotice)
    } catch (error) {
      console.error('Google sign-in service failed.', error)
      setNotice({ tone: 'error', text: 'Google sign-in could not be completed. Try again later.' })
    }
  }

  async function requestPhoneCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    const parsed = z.object({ phone: z.string().trim().min(7, 'Enter a valid phone number.') }).safeParse(Object.fromEntries(new FormData(event.currentTarget)))
    if (!parsed.success) {
      setNotice({ tone: 'error', text: parsed.error.issues[0]?.message ?? 'Enter your phone number.' })
      return
    }
    setBusy(true)
    try {
      handleAuthResult(await authService.requestPhoneCode(parsed.data.phone), navigate, nextPath, setNotice)
    } catch (error) {
      console.error('Phone sign-in service failed.', error)
      setNotice({ tone: 'error', text: 'Phone sign-in could not be completed. Try again later.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-card">
      <AuthTitle kicker="WELCOME BACK" title="Good to have you here." description="Sign in to continue your search and stay close to your reports." />
      <div className="auth-method-tabs" role="tablist" aria-label="Sign-in method">
        <button type="button" role="tab" aria-selected={mode === 'email'} className={mode === 'email' ? 'is-active' : ''} onClick={() => { setMode('email'); setNotice(null) }}><Mail size={14} /> Email</button>
        <button type="button" role="tab" aria-selected={mode === 'phone'} className={mode === 'phone' ? 'is-active' : ''} onClick={() => { setMode('phone'); setNotice(null) }}><MessageCircle size={14} /> Phone</button>
      </div>
      {mode === 'email' ? (
        <>
          <button type="button" className="auth-google-button" onClick={signInWithGoogle}><GoogleMark /> Continue with Google</button>
          <div className="auth-divider"><span>OR WITH EMAIL</span></div>
          <form className="auth-form" onSubmit={login} noValidate>
            <div className="auth-demo-note">Demo access only: passwords are not checked or saved. Sign-up profile details are held in memory until this tab reloads.</div>
            <AuthField label="Email address" name="email" type="email" placeholder="you@example.com" autoComplete="email" icon={<Mail size={15} />} required />
            <PasswordInput label="Password" name="password" visible={passwordVisible} onToggle={() => setPasswordVisible((value) => !value)} placeholder="Your password" autoComplete="current-password" />
            <div className="auth-form-meta"><span>Keep your details private.</span><Link to="/forgot-password">Forgot password?</Link></div>
            <AuthNotice notice={notice} />
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Connecting…' : 'Sign in'} <ArrowRight size={16} /></button>
          </form>
        </>
      ) : (
        <form className="auth-form auth-phone-form" onSubmit={requestPhoneCode} noValidate>
          <div className="auth-method-hint"><MessageCircle size={16} /><span>Receive a one-time verification code by SMS. Phone sign-in remains unavailable until the authentication service is connected.</span></div>
          <AuthField label="Phone number" name="phone" type="tel" placeholder="+1 555 000 0000" autoComplete="tel" icon={<MessageCircle size={15} />} required />
          <AuthNotice notice={notice} />
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Connecting…' : 'Send verification code'} <ArrowRight size={16} /></button>
        </form>
      )}
      <p className="auth-switch">New to LostLink? <Link to={`/signup?returnTo=${encodeURIComponent(nextPath)}`}>Create an account <ArrowRight size={13} /></Link></p>
      <p className="auth-legal"><ShieldCheck size={13} /> Your account and contact details stay private.</p>
    </div>
  )
}

export function SignupPage() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmationVisible, setConfirmationVisible] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const nextPath = useReturnPath('/profile')

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    const schema = z.object({
      displayName: z.string().trim().min(2, 'Enter at least two characters for your name.'),
      email: z.string().email('Enter a valid email address.'),
      phone: z.string().trim(),
      password: z.string().min(8, 'Use at least 8 characters for your password.').regex(/[A-Za-z]/, 'Add at least one letter.').regex(/[0-9]/, 'Add at least one number.'),
      confirmPassword: z.string(),
      terms: z.literal('on', { errorMap: () => ({ message: 'Please agree to the privacy and terms notice.' }) }),
    }).superRefine((data, context) => {
      if (data.password !== data.confirmPassword) context.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Your passwords do not match.' })
    })
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      setNotice({ tone: 'error', text: parsed.error.issues[0]?.message ?? 'Check your details and try again.' })
      return
    }

    const details = {
      displayName: parsed.data.displayName,
      email: parsed.data.email,
      ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
      password: parsed.data.password,
    }
    setBusy(true)
    try {
      handleAuthResult(await authService.signUp(details), navigate, nextPath, setNotice, parsed.data.email)
    } catch (error) {
      console.error('Registration service failed.', error)
      setNotice({ tone: 'error', text: 'Account creation could not be completed. Try again later.' })
    } finally {
      setBusy(false)
    }
  }

  const passwordScore = [passwordValue.length >= 8, /[A-Z]/.test(passwordValue), /[a-z]/.test(passwordValue), /[0-9]/.test(passwordValue), /[^A-Za-z0-9]/.test(passwordValue)].filter(Boolean).length

  return (
    <div className="auth-card auth-card--signup">
      <AuthTitle kicker="JOIN YOUR COMMUNITY" title="Let’s bring things back." description="Create an account to report, follow updates, and make safe connections." />
      <form className="auth-form" onSubmit={signUp} noValidate>
        <div className="auth-demo-note">Demo mode: your name, email, and optional phone will appear on your Profile for this tab only. Your password is never saved.</div>
        <AuthField label="Your name" name="displayName" placeholder="How should we call you?" autoComplete="name" icon={<Sparkles size={15} />} required />
        <AuthField label="Email address" name="email" type="email" placeholder="you@example.com" autoComplete="email" icon={<Mail size={15} />} required />
        <AuthField label="Phone number" name="phone" type="tel" placeholder="Optional · +1 555 000 0000" autoComplete="tel" icon={<MessageCircle size={15} />} />
        <PasswordInput label="Create a password" name="password" visible={passwordVisible} onToggle={() => setPasswordVisible((value) => !value)} placeholder="At least 8 characters" autoComplete="new-password" value={passwordValue} onChange={(event) => setPasswordValue(event.target.value)} minLength={8} />
        <div className="auth-password-strength" aria-label={`Password strength ${passwordScore} of 5`}>
          <span>{[1, 2, 3, 4, 5].map((bar) => <i key={bar} className={passwordScore >= bar ? `strength-${passwordScore}` : ''} />)}</span>
          <small>{passwordValue ? passwordScore < 3 ? 'Add length, a number, and mixed case.' : passwordScore < 5 ? 'Getting stronger' : 'Strong password' : 'Use letters, numbers, and 8+ characters.'}</small>
        </div>
        <PasswordInput label="Confirm password" name="confirmPassword" visible={confirmationVisible} onToggle={() => setConfirmationVisible((value) => !value)} placeholder="Type it once more" autoComplete="new-password" />
        <label className="auth-consent"><input type="checkbox" name="terms" required /><span>I agree to use LostLink safely and understand my contact details aren’t shown publicly.</span></label>
        <AuthNotice notice={notice} />
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Connecting…' : 'Create account'} <ArrowRight size={16} /></button>
      </form>
      <p className="auth-switch">Already have an account? <Link to={`/login?returnTo=${encodeURIComponent(nextPath)}`}>Sign in <ArrowRight size={13} /></Link></p>
    </div>
  )
}

export function ForgotPasswordPage() {
  const [notice, setNotice] = useState<Notice | null>(null)
  const [busy, setBusy] = useState(false)

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    const parsed = z.object({ email: z.string().email('Enter the email address you registered with.') }).safeParse(Object.fromEntries(new FormData(event.currentTarget)))
    if (!parsed.success) {
      setNotice({ tone: 'error', text: parsed.error.issues[0]?.message ?? 'Enter a valid email address.' })
      return
    }
    setBusy(true)
    try {
      const result = await authService.requestPasswordReset(parsed.data.email)
      setNotice(result.ok ? { tone: 'success', text: 'If an account exists, recovery instructions have been sent.' } : { tone: 'error', text: result.message })
    } catch (error) {
      console.error('Password recovery service failed.', error)
      setNotice({ tone: 'error', text: 'Password recovery could not be completed. Try again later.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-card">
      <AuthTitle kicker="A FRESH START" title="Reset your password." description="Enter your account email. If recovery is connected, we’ll send a secure reset link." />
      <form className="auth-form auth-form--spaced" onSubmit={requestReset} noValidate>
        <AuthField label="Email address" name="email" type="email" placeholder="you@example.com" autoComplete="email" icon={<Mail size={15} />} required />
        <AuthNotice notice={notice} />
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Connecting…' : 'Send reset link'} <ArrowRight size={16} /></button>
      </form>
      <p className="auth-switch"><Link to="/login">Back to sign in <ArrowRight size={13} /></Link></p>
    </div>
  )
}

export function VerificationPage({ method }: { method: 'email' | 'phone' }) {
  const [params] = useSearchParams()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [busy, setBusy] = useState(false)
  const [identifier, setIdentifier] = useState(params.get(method) ?? '')
  const navigate = useNavigate()
  const isEmail = method === 'email'

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    const schema = isEmail
      ? z.object({ identifier: z.string().email('Enter the email address to verify.'), code: z.string().trim().min(4, 'Enter your verification code.') })
      : z.object({ identifier: z.string().trim().min(7, 'Enter a valid phone number.'), code: z.string().trim().min(4, 'Enter your verification code.') })
    const parsed = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)))
    if (!parsed.success) {
      setNotice({ tone: 'error', text: parsed.error.issues[0]?.message ?? 'Check the verification details.' })
      return
    }
    setBusy(true)
    try {
      const result = isEmail
        ? await authService.verifyEmail(parsed.data.identifier, parsed.data.code)
        : await authService.verifyPhone(parsed.data.identifier, parsed.data.code)
      if (result.ok && result.next === 'authenticated') navigate('/dashboard', { replace: true })
      else if (!result.ok) setNotice({ tone: 'error', text: result.message })
      else setNotice({ tone: 'info', text: 'Verification is complete. Continue to sign in.' })
    } catch (error) {
      console.error('Verification service failed.', error)
      setNotice({ tone: 'error', text: 'Verification could not be completed. Try again later.' })
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setNotice(null)
    try {
      const validatedIdentifier = isEmail
        ? z.string().email('Enter the email address to verify.').safeParse(identifier)
        : z.string().trim().min(7, 'Enter a valid phone number.').safeParse(identifier)
      if (!validatedIdentifier.success) {
        setNotice({ tone: 'error', text: validatedIdentifier.error.issues[0]?.message ?? 'Enter your contact detail.' })
        return
      }
      const result = isEmail
        ? await authService.requestEmailVerification(identifier)
        : await authService.requestPhoneCode(identifier)
      setNotice(result.ok ? { tone: 'success', text: 'A new code has been requested.' } : { tone: 'error', text: result.message })
    } catch (error) {
      console.error('Verification resend failed.', error)
      setNotice({ tone: 'error', text: 'A new code could not be requested. Try again later.' })
    }
  }

  return (
    <div className="auth-card">
      <AuthTitle
        kicker={isEmail ? 'ONE LAST STEP' : 'SECURE CONNECTION'}
        title={isEmail ? 'Verify your email.' : 'Verify your phone.'}
        description={isEmail ? 'Enter the code from your email to finish setting up your account.' : 'Enter the one-time code sent to your phone.'}
      />
      <form className="auth-form auth-form--spaced" onSubmit={verify} noValidate>
        <AuthField label={isEmail ? 'Email address' : 'Phone number'} name="identifier" type={isEmail ? 'email' : 'tel'} placeholder={isEmail ? 'you@example.com' : '+1 555 000 0000'} autoComplete={isEmail ? 'email' : 'tel'} icon={isEmail ? <Mail size={15} /> : <MessageCircle size={15} />} value={identifier} onChange={(event) => setIdentifier(event.target.value)} required />
        <AuthField label="Verification code" name="code" placeholder="Enter your code" autoComplete="one-time-code" icon={<ShieldCheck size={15} />} required />
        <AuthNotice notice={notice} />
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Verify'} <ArrowRight size={16} /></button>
      </form>
      <button type="button" className="auth-resend" onClick={resend}>Resend code</button>
      <p className="auth-switch"><Link to="/login">Return to sign in <ArrowRight size={13} /></Link></p>
    </div>
  )
}

function GoogleMark() {
  return <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z" /><path fill="#FF3D00" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.9 1.3-4.2 2-6.8 2-5.3 0-9.8-3.6-11.4-8.4H5.7v5.3A20 20 0 0 0 24 44Z" /><path fill="#4CAF50" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.7a20 20 0 0 0 0 17.8l6.9-5.3Z" /><path fill="#1976D2" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.7 15.1l6.9 5.3C14.2 15.6 18.7 12 24 12Z" /></svg>
}
