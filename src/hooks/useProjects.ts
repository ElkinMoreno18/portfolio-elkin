import { useEffect, useState } from 'react'
import { fetchPublishedProjects } from '@/lib/projectsApi'
import type { Project } from '@/lib/types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [demo, setDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetchPublishedProjects()
      .then((res) => {
        if (!alive) return
        setProjects(res.projects)
        setDemo(res.demo)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return { projects, demo, loading }
}
