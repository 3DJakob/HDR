import React, { useState } from 'react'
import { GlobalStyle } from './styles/GlobalStyle'
// let appInitialized = false

export const App: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<null |string>(null)
  const [status, setStatus] = useState('Initiated')

  // useEffect(() => {
  //   if (appInitialized) return
  //   window.Main.on('HDRCreated', (filename: string) => {
  //     setStatus('HDR created with filename: ' + filename)
  //     console.log('HDR created')
  //   })

  //   appInitialized = true
  // }, [])

  const loadImages = (): void => {
    setStatus('Creating HDR...')
    setImageUrl('hdrimage:01low,02low,03low')
  }

  const onLoad = (): void => {
    setStatus('HDR created')
  }

  return (
    <>
      <GlobalStyle />
      {imageUrl == null ? null : <img src={imageUrl} onLoad={onLoad} />}
      <h2 style={{ color: '#000' }}>{status}</h2>
      <button onClick={loadImages}>Generate HDR</button>
      <button onClick={() => window.Main.sendMessage('saveImage')}>Save image png</button>
    </>
  )
}
