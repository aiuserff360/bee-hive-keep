import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Priority } from '../data/content'
import { LOCATIONS, dayMonth, fromIso } from '../data/hives'
import { useStore } from '../store'
import { Button, Field, Modal, inputClass } from './ui'

/** Adds a task to the in-memory list. */
export function AddTaskModal({ hiveId, onClose }: { hiveId?: string; onClose: () => void }) {
  const { addTask, addFieldOp, notify } = useStore()
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('2026-09-28')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [assignee, setAssignee] = useState('Ravi Kumar')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const name = title.trim()
    if (!name) return
    addTask({ title: name, due, priority, assignee, state: 'Not Started', hiveId })
    const when = dayMonth(fromIso(due))
    addFieldOp(hiveId ? `${name} – Hive ${hiveId}` : name, when)
    notify('Task added (kept until you reload the page)')
    onClose()
  }

  return (
    <Modal title={hiveId ? `Add task for Hive ${hiveId}` : 'Add task'} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Task">
          <input autoFocus required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Inspect brood frames" className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Due date">
            <input type="date" required value={due} onChange={(e) => setDue(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Priority">
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputClass}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </Field>
        </div>
        <Field label="Assigned to">
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={inputClass}>
            <option>Ravi Kumar</option>
            <option>Field Team</option>
            <option>Lakshmi Devi</option>
          </select>
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Task</Button>
        </div>
      </form>
    </Modal>
  )
}

/** Shows the Add Hive form. The prototype has no backend, so nothing is stored. */
export function AddHiveModal({ onClose }: { onClose: () => void }) {
  const { notify } = useStore()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    notify('Demo only: new hives are not saved in this prototype')
    onClose()
  }
  return (
    <Modal title="Add hive" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Location">
          <select className={inputClass}>
            {LOCATIONS.map((l) => (
              <option key={l.id}>{l.name}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hive type">
            <select className={inputClass}>
              <option>Langstroth</option>
              <option>Top-bar</option>
              <option>Newton</option>
            </select>
          </Field>
          <Field label="Bee species">
            <select className={inputClass}>
              <option>Apis mellifera</option>
              <option>Apis cerana indica</option>
            </select>
          </Field>
        </div>
        <Field label="Field owner">
          <input required placeholder="Name of the beekeeper" className={inputClass} />
        </Field>
        <p className="text-xs text-muted">This prototype has no database, so the hive will not be saved.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Hive</Button>
        </div>
      </form>
    </Modal>
  )
}
