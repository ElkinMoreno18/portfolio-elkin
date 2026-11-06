import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ScrollTrigger } from './motion'
import { focusHeading } from './focus'
import { Hero } from './hero/Hero'
import { Projects } from './sections/Projects'
import { Experience } from './sections/Experience'
import { Stack } from './sections/Stack'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { useContent } from '@/content/store'

/** Tiempo máximo que se mantiene colocada la sección mientras la página termina de montarse. */
const HOLD_MS = 4000
const USER_INPUT = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

export default function Home() {
  // key cambia en cada navegación: pulsar otra vez el mismo enlace vuelve a colocar la sección.
  const { hash, key } = useLocation()
  const { stack, experience } = useContent()
  // El stack cruza sus tecnologías con los puestos: si cambia cualquiera de
  // los dos ya montado (guardado en /admin), la tabla se vuelve a montar.
  const stackKey = JSON.stringify([stack, experience.map((j) => [j.company, j.end, j.tech])])

  // Llegada con /#seccion (volver de un detalle, un enlace desde otra página).
  // La sección se coloca antes de la primera pintura, así no se ve la portada
  // un instante. Después, lo de encima todavía crece (el pin de la portada se
  // monta tras pintar, las fuentes y las capturas cambian altos): cada vez que
  // la página cambia de alto, o ScrollTrigger recalcula, se vuelve a colocar
  // en el mismo fotograma. En cuanto la persona desplaza o pulsa algo, se
  // deja de corregir: nunca se le quita el control.
  useLayoutEffect(() => {
    const target = hash ? document.getElementById(safeDecode(hash.slice(1))) : null
    if (!target) return
    const align = () => target.scrollIntoView({ block: 'start', behavior: 'instant' })
    align()
    focusHeading(target)

    const ro = new ResizeObserver(align)
    ro.observe(document.body)
    ScrollTrigger.addEventListener('refresh', align)
    const timer = window.setTimeout(stop, HOLD_MS)
    USER_INPUT.forEach((ev) => window.addEventListener(ev, stop, { passive: true }))
    function stop() {
      ro.disconnect()
      ScrollTrigger.removeEventListener('refresh', align)
      window.clearTimeout(timer)
      USER_INPUT.forEach((ev) => window.removeEventListener(ev, stop))
    }
    return stop
  }, [hash, key])

  return (
    <>
      <Hero />
      <Projects />
      <Experience />
      <Stack key={stackKey} />
      <About />
      <Contact />
    </>
  )
}
