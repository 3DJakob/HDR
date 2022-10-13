import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { GlobalStyle } from './styles/GlobalStyle'
import SquareLoader from 'react-spinners/SquareLoader'
import GSolverHistogram from './components/GSolverHistogram'
import Input from './components/Input'
import Button from './components/Button'
let appInitialized = false

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  flex-direction: column;
`

const Top = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  background-color: #363531;
`

const Image = styled.img`
  border-radius: 15px;
  box-shadow: 0 13px 27px -5px hsla(240, 30.1%, 28%, 0.25),0 8px 16px -8px hsla(0, 0%, 0%, 0.3),0 -6px 16px -6px hsla(0, 0%, 0%, 0.03);
  margin: 20px;
  width: 100%;
`

const Bottom = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  flex: 1;
`

const Controls = styled.div`
  display: flex;
  flex-direction: row;
`

type Status = 'idle' | 'loading' | 'success' | 'error'

export const App: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<null |string>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [g, setG] = useState<[number[], number[], number[]]>([[1, 2, 3], [1, 2, 3], [1, 2, 3]])
  const [images, setImages] = useState<[string, string, string]>(['01low', '02low', '03low'])

  useEffect(() => {
    if (appInitialized) return
    window.Main.on('responseFunction', (responseFunction: [Uint8Array, Uint8Array, Uint8Array]) => {
      console.log(responseFunction)
      setG([Array.from(responseFunction[0]), Array.from(responseFunction[1]), Array.from(responseFunction[2])])
    })

    appInitialized = true
  }, [])

  const loadImages = (): void => {
    setStatus('loading')
    setImageUrl(`hdrimage:${images[0]},${images[1]},${images[2]}`)
  }

  const onLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    setStatus('success')
  }

  return (
    <Container>
      <GlobalStyle />
      <Top>
        {imageUrl == null ? null : <Image src={imageUrl} onLoad={(e) => onLoad(e)} />}
        {/* <Image src='https://picsum.photos/200/300' /> */}
        <SquareLoader
          color='#ccc'
          loading={status === 'loading'}
          size={30}
          aria-label='Loading Spinner'
          data-testid='loader'
          // style={{ margin: 100 }}
        />
      </Top>
      <Bottom>
        <Controls>
          <Input placeholder='Image name' value={images[0]} onChange={(value) => setImages([value, images[1], images[2]])} />
          <Input placeholder='Image name' value={images[1]} onChange={(value) => setImages([images[0], value, images[2]])} />
          <Input placeholder='Image name' value={images[2]} onChange={(value) => setImages([images[0], images[1], value])} />
          <Button onClick={loadImages}>HDR merge</Button>
        </Controls>
        <GSolverHistogram responseFunctions={g} />
      </Bottom>
    </Container>
  )
}
