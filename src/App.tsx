import React, { useEffect } from 'react'
import { GlobalStyle } from './styles/GlobalStyle'
let appInitialized = false

export const App: React.FC = () => {
  const [status, setStatus] = React.useState('Initiated')

  useEffect(() => {
    if (appInitialized) return
    window.Main.on('HDRCreated', (filename: string) => {
      setStatus('HDR created with filename: ' + filename)
      console.log('HDR created')
    })

    appInitialized = true
  }, [])

  const loadImages = (): void => {
    window.Main.sendMessage('createHDR')
    setStatus('Creating HDR...')
  }

  return (
    <>
      <GlobalStyle />
      <h2 style={{ color: '#000' }}>{status}</h2>
      <button onClick={loadImages}>Generate HDR</button>
      <button onClick={() => window.Main.sendMessage('saveImage')}>Save image png</button>
    </>
  )
}
