'use client'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import {
  FileText,
  User,
  LogOut,
  Play,
  CheckCircle2,
  AlertCircle,
  Info,
  RotateCcw,
  Mail,
} from 'lucide-react'
import { useState, useEffect } from 'react'

// Fixed inbox for the email-in workflow (Doklady_v9_AI_Extract).
const INTAKE_EMAIL = 'posli@pictusweb.com'

type RunState =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'resetting' }
  | { kind: 'success'; count: number; email: string; note?: string }
  | { kind: 'nothing' }
  | { kind: 'reset-done'; count: number }
  | { kind: 'error'; message: string }

const PicDocsWorkspace = () => {
  const { data: session } = useSession()
  const t = useTranslations('PicDocs')
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'
  const [state, setState] = useState<RunState>({ kind: 'idle' })
  const [ctx, setCtx] = useState<{
    organizationName: string | null
    userName: string | null
    userEmail: string | null
    recipientEmail: string | null
  } | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/picdocs/context')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setCtx(data)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleRun = async () => {
    setState({ kind: 'running' })
    try {
      const res = await fetch('/api/picdocs/run', { method: 'POST' })
      const data = await res.json().catch(() => ({}))

      if (res.status === 429) {
        setState({
          kind: 'error',
          message: data.code === 'doklado_rate_limited' ? t('dokladoBusyMsg') : t('rateLimitMsg'),
        })
        return
      }
      if (!res.ok) {
        setState({ kind: 'error', message: t('errorMsg') })
        return
      }
      if (data.status === 'nothing') {
        setState({ kind: 'nothing' })
        return
      }
      setState({
        kind: 'success',
        count: data.processedCount ?? 0,
        email: data.recipientEmail ?? '',
        note: data.note,
      })
    } catch {
      setState({ kind: 'error', message: t('errorMsg') })
    }
  }

  const handleReset = async () => {
    setState({ kind: 'resetting' })
    try {
      const res = await fetch('/api/picdocs/reset', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.status === 429) {
        setState({
          kind: 'error',
          message: data.code === 'doklado_rate_limited' ? t('dokladoBusyMsg') : t('rateLimitMsg'),
        })
        return
      }
      if (!res.ok) {
        setState({ kind: 'error', message: t('errorMsg') })
        return
      }
      setState({ kind: 'reset-done', count: data.reset ?? 0 })
    } catch {
      setState({ kind: 'error', message: t('errorMsg') })
    }
  }

  const isRunning = state.kind === 'running'
  const isResetting = state.kind === 'resetting'
  const isBusy = isRunning || isResetting

  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk">
      {/* Header */}
      <header className="bg-pictus-onyx900/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 text-pictus-white">
              <div className="w-8 h-8 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-xl flex items-center justify-center">
                <FileText size={18} className="text-pictus-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Pictusweb</h1>
                <p className="text-lg text-pictus-lime hidden sm:block">PicDocs</p>
              </div>
            </Link>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-pictus-white">
                <User size={16} className="shrink-0" />
                <div className="text-right leading-tight">
                  {ctx?.organizationName && (
                    <div className="text-sm font-semibold truncate max-w-[220px]">
                      {ctx.organizationName}
                    </div>
                  )}
                  <div className="text-sm text-gray-400 truncate max-w-[220px]">
                    {ctx?.userName || session?.user?.name}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm sm:text-lg text-pictus-white hover:text-red-400 transition-colors px-2 sm:px-3 py-2 rounded-full hover:bg-red-500/10 shrink-0"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{locale.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="py-10 sm:py-16 text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Image
              src="/pictus/pictus-icon.png"
              width={56}
              height={56}
              alt="Pictusweb"
              priority
              className="h-10 w-10 sm:h-14 sm:w-14 shrink-0"
            />
            <h1 className="text-4xl sm:text-6xl font-extrabold text-pictus-white leading-[0.95]">
              {t('workspaceTitle')}
            </h1>
          </div>
          {ctx && (
            <p className="text-sm text-gray-300 mb-2">
              <span className="text-gray-400">{t('orgLabel')}:</span>{' '}
              <span className="font-semibold text-pictus-white">{ctx.organizationName}</span>
              <span className="text-gray-500"> · </span>
              <span className="text-gray-400">{t('userLabel')}:</span> {ctx.userName}
              {ctx.userEmail ? <span className="text-gray-400"> ({ctx.userEmail})</span> : null}
            </p>
          )}
          <p className="text-base text-gray-400 mb-8">{t('workflowsIntro')}</p>

          {/* Workflow 1 — scan in Doklado, process here */}
          <div className="text-left bg-white/5 border border-white/10 rounded-2xl px-5 py-5 max-w-xl mx-auto mb-6">
            <div className="flex items-center gap-2 mb-3 text-pictus-lime">
              <FileText className="h-5 w-5 shrink-0" />
              <h2 className="text-lg font-semibold">{t('flow1Title')}</h2>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300 mb-4">
              <li>{t('howStep1')}</li>
              <li>{t('howStep2')}</li>
              <li>{t('howStep3')}</li>
            </ol>
            {ctx?.recipientEmail && (
              <p className="text-sm text-gray-300 mb-4 flex items-start gap-2">
                <Mail className="h-4 w-4 shrink-0 mt-0.5 text-pictus-lime" />
                <span>{t('flow1Recipient', { email: ctx.recipientEmail })}</span>
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRun}
                disabled={isBusy}
                className="inline-flex items-center gap-3 px-6 py-3 bg-pictus-lime text-pictus-black rounded-full text-base font-semibold hover:bg-pictus-lime600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <span className="w-5 h-5 border-2 border-pictus-black/30 border-t-pictus-black rounded-full animate-spin" />
                    {t('running')}
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    {t('runButton')}
                  </>
                )}
              </button>

              {/* Testing-only: reset exported documents so they can be reprocessed */}
              <button
                onClick={handleReset}
                disabled={isBusy}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-pictus-white border border-white/15 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-gray-500/40 border-t-gray-300 rounded-full animate-spin" />
                    {t('resetting')}
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    {t('resetButton')}
                  </>
                )}
              </button>
            </div>

            {/* Result banners */}
            <div className="mt-6">
              {state.kind === 'success' && (
                <div className="bg-pictus-lime/15 border border-pictus-lime/40 text-pictus-lime px-5 py-4 rounded-2xl flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p>{t('successMsg', { count: state.count, email: state.email })}</p>
                    {state.note && <p className="text-sm text-gray-300 mt-1">{state.note}</p>}
                  </div>
                </div>
              )}

              {state.kind === 'nothing' && (
                <div className="bg-white/5 border border-white/15 text-gray-200 px-5 py-4 rounded-2xl flex items-center gap-3">
                  <Info className="h-5 w-5 shrink-0" />
                  <p>{t('nothingMsg')}</p>
                </div>
              )}

              {state.kind === 'reset-done' && (
                <div className="bg-white/5 border border-white/15 text-gray-200 px-5 py-4 rounded-2xl flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 shrink-0" />
                  <p>{t('resetDoneMsg', { count: state.count })}</p>
                </div>
              )}

              {state.kind === 'error' && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-200 px-5 py-4 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>{state.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Workflow 2 — send a scan by email */}
          <div className="text-left bg-white/5 border border-white/10 rounded-2xl px-5 py-5 max-w-xl mx-auto">
            <div className="flex items-center gap-2 mb-3 text-pictus-lime">
              <Mail className="h-5 w-5 shrink-0" />
              <h2 className="text-lg font-semibold">{t('flow2Title')}</h2>
            </div>
            <p className="text-sm text-gray-300 mb-2">
              {t('flow2Desc', {
                userEmail: ctx?.userEmail || session?.user?.email || '',
                intakeEmail: INTAKE_EMAIL,
              })}
            </p>
            <p className="text-sm text-gray-300 mb-2">{t('flow2Result')}</p>
            <p className="text-xs text-gray-500">{t('flow2Note')}</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PicDocsWorkspace
