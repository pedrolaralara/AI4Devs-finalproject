import { BrowserRouter } from 'react-router'
import { SessionScreen } from './features/auth/session-screen'
import './app.css'

export function App() {
  return (
    <main>
      <h1>Requesto</h1>
      <BrowserRouter>
        <SessionScreen />
      </BrowserRouter>
    </main>
  )
}
