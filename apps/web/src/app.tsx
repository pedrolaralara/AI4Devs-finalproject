import { useEffect, useState } from 'react'

export function App() {
  const [message, setMessage] = useState('Comprobando la conexión con la API…')

  useEffect(() => {
    const controller = new AbortController()

    async function checkApi() {
      try {
        const response = await fetch('/api/health', { signal: controller.signal })
        if (!response.ok || (await response.json())?.status !== 'ok') {
          throw new Error('Respuesta inesperada de la API')
        }
        if (!controller.signal.aborted) {
          setMessage('API conectada')
        }
      } catch {
        if (!controller.signal.aborted) {
          setMessage('No se pudo conectar con la API')
        }
      }
    }

    void checkApi()
    return () => controller.abort()
  }, [])

  return (
    <main>
      <h1>Requesto</h1>
      <p role="status">{message}</p>
    </main>
  )
}
