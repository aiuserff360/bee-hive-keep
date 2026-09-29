import { Route, Routes } from 'react-router-dom'
import { ComingSoon } from './components/blocks'
import HiveMap from './components/HiveMap'
import Shell from './components/Shell'
import Dashboard from './pages/Dashboard'
import HiveDetail from './pages/hive/HiveDetail'
import HivesList from './pages/HivesList'
import { StoreProvider } from './store'

// Sidebar entries that have no design yet.
const PLACEHOLDERS: Array<[string, string]> = [
  ['health-sensors', 'Health & Sensors'],
  ['ai-insights', 'AI Insights'],
  ['alerts', 'Alerts'],
  ['honey-production', 'Honey Production'],
  ['tasks', 'Tasks & Field Ops'],
  ['people', 'People & Communities'],
  ['reports', 'Reports'],
  ['sustainability', 'Sustainability'],
  ['settings', 'Settings'],
]

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Dashboard />} />
          <Route
            path="map"
            element={
              <div className="h-full min-h-[520px] p-3.5">
                <h1 className="sr-only">Map</h1>
                <HiveMap />
              </div>
            }
          />
          <Route path="hives" element={<HivesList />} />
          <Route path="hives/:id" element={<HiveDetail />} />
          <Route path="hives/:id/:tab" element={<HiveDetail />} />
          {PLACEHOLDERS.map(([path, title]) => (
            <Route key={path} path={path} element={<ComingSoon title={title} />} />
          ))}
          <Route path="*" element={<ComingSoon title="Page not found" note="The page you are looking for does not exist." />} />
        </Route>
      </Routes>
    </StoreProvider>
  )
}
