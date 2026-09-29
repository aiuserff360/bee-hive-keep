import { Route, Routes } from 'react-router-dom'
import { ComingSoon } from './components/blocks'
import HiveMap from './components/HiveMap'
import Shell from './components/Shell'
import AiInsights from './pages/AiInsights'
import Alerts from './pages/Alerts'
import Dashboard from './pages/Dashboard'
import HealthSensors from './pages/HealthSensors'
import HiveDetail from './pages/hive/HiveDetail'
import HivesList from './pages/HivesList'
import HoneyProduction from './pages/HoneyProduction'
import People from './pages/People'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Sustainability from './pages/Sustainability'
import Tasks from './pages/Tasks'
import { StoreProvider } from './store'

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
          <Route path="health-sensors" element={<HealthSensors />} />
          <Route path="ai-insights" element={<AiInsights />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="honey-production" element={<HoneyProduction />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="people" element={<People />} />
          <Route path="reports" element={<Reports />} />
          <Route path="sustainability" element={<Sustainability />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<ComingSoon title="Page not found" note="The page you are looking for does not exist." />} />
        </Route>
      </Routes>
    </StoreProvider>
  )
}
