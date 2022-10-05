import { app, BrowserWindow, ipcMain } from 'electron'
import { readImage, readImageAsRGB } from './raw'
import { loadPNG } from './png'
// import nd from 'ndarray'

let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

// const assetsPath =
//   process.env.NODE_ENV === 'production'
//     ? process.resourcesPath
//     : app.getAppPath()

function createWindow (): void {
  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 1100,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY).catch(console.error)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const sendPNGImages = async (): Promise<void> => {
  const img1 = await loadPNG('01low.png')
  const img2 = await loadPNG('02low.png')
  const img3 = await loadPNG('03low.png')
  mainWindow?.webContents.send('message', [img1, img2, img3])
}

async function registerListeners (): Promise<void> {
  /**
   * This comes from bridge integration, check bridge.ts
   */
  ipcMain.on('message', (_, message) => {
    let imageData1: Uint8Array = new Uint8Array()
    let imageData2: Uint8Array = new Uint8Array()
    let imageData3: Uint8Array = new Uint8Array()
    let imagesRAW = []

    switch (message) {
      case 'loadRAWImages':
        imageData1 = readImage('1.arw')
        imageData2 = readImage('2.arw')
        imageData3 = readImage('3.arw')

        imagesRAW = [imageData1, imageData2, imageData3]
        console.log('imported!')
        mainWindow?.webContents.send('message', imagesRAW)
        break
      case 'readPixels':
        console.log('readPixels')
        break
      case 'loadPNGImages':
        sendPNGImages().catch(console.error)
        break
      case 'saveImage':
        // saveImage(sampleImageData)
        // console.log('saveImage')
        // convertRAWtoTIFF('1.arw', '1.tiff')
        // convertRAWtoTIFF('2.arw', '2.tiff')
        // convertRAWtoTIFF('3.arw', '3.tiff')

        readImageAsRGB('1.arw')

        break
    }
  })
}

app.on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
