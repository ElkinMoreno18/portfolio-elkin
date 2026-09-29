import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { LangProvider, useLang } from '@/i18n'
import { Nav } from '@/site/Nav'
import { Footer } from '@/site/Footer'
import { siteCopy } from '@/site/copy'
import Home from '@/site/Home'

const ProjectPage = lazy(() => import('@/site/ProjectPage'))
const Admin = lazy(() => import('@/pages/admin'))
const NotFoundPage = lazy(() => import('@/site/NotFoundPage'))

function Shell() {
  const { pathname } = useLocation()
  const { pick } = useLang()
  const isAdmin = pathname.startsWith('/admin')
  const bare = isAdmin
  const isProject = /^\/(proyecto|project)\//.test(pathname)

  // La descripción sigue al idioma. En un proyecto la pone ProjectPage (su tagline).
  useEffect(() => {
    if (isProject) return
    document.querySelector('meta[name="description"]')?.setAttribute('content', pick(siteCopy.meta.description))
  }, [isProject, pick])

  // /admin no se enlaza desde el sitio ni se anuncia en robots.txt: basta con
  // que no se indexe si alguien llega a ella.
  useEffect(() => {
    if (!isAdmin) return
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [isAdmin])

  return (
    <>
      {!bare && (
        <a
          href="#main"
          data-skip-link
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-[6px] focus:bg-text focus:px-3 focus:py-2 focus:text-[14px] focus:text-bg"
        >
          {pick(siteCopy.nav.skip)}
        </a>
      )}
      {!bare && <Nav />}

      {/* tabIndex -1: destino del enlace de salto y de "volver arriba". */}
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div className="min-h-[70svh]" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/proyecto/:slug" element={<ProjectPage />} />
            <Route path="/project/:slug" element={<ProjectPage />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {!bare && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </LangProvider>
  )
}
