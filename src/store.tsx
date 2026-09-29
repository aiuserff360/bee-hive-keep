import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { INITIAL_FIELD_OPS, INITIAL_TASKS } from './data/content'
import type { FieldOp, Task } from './data/content'

export type Theme = 'light' | 'dark'

interface Store {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id'>) => void
  toggleTask: (id: string) => void
  fieldOps: FieldOp[]
  addFieldOp: (title: string, when: string) => void
  toggleFieldOp: (id: string) => void
  toast: string | null
  notify: (message: string) => void
}

const StoreContext = createContext<Store | null>(null)
const ThemeContext = createContext<Theme>('light')

/** In-memory state only: changes last until the page is reloaded. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [fieldOps, setFieldOps] = useState<FieldOp[]>(INITIAL_FIELD_OPS)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const nextId = useRef(1)

  const notify = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const value = useMemo<Store>(
    () => ({
      tasks,
      addTask: (task) => setTasks((list) => [...list, { ...task, id: `new-${nextId.current++}` }].sort((a, b) => a.due.localeCompare(b.due))),
      toggleTask: (id) =>
        setTasks((list) => list.map((t) => (t.id === id ? { ...t, state: t.state === 'Done' ? 'Pending' : 'Done' } : t))),
      fieldOps,
      addFieldOp: (title, when) => setFieldOps((list) => [...list, { id: `new-${nextId.current++}`, title, when, done: false }]),
      toggleFieldOp: (id) => setFieldOps((list) => list.map((f) => (f.id === id ? { ...f, done: !f.done } : f))),
      toast,
      notify,
    }),
    [tasks, fieldOps, toast, notify],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}

export const ThemeProvider = ThemeContext.Provider
export const useTheme = () => useContext(ThemeContext)

/** The mock task list was written for hive BGL-042; other hives reuse it as sample data. */
export function useHiveTasks(hiveId: string) {
  const { tasks } = useStore()
  return tasks.filter((t) => !t.hiveId || t.hiveId === hiveId || t.hiveId === 'BGL-042')
}
