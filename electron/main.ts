import { app, BrowserWindow, ipcMain } from 'electron'
import { convertRawToRGB } from '../src/lib/BayerFilter'
import { setSaturationImage, setSaturationPixel } from '../src/lib/Saturation'
import { saveImage } from './jimp'
import { readImage } from './raw'

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

async function registerListeners (): Promise<void> {
  /**
   * This comes from bridge integration, check bridge.ts
   */
  ipcMain.on('message', (_, message) => {
    let imageData1 = null
    let imageData2 = null
    let imageData3 = null
    let rgb: {r: Uint8Array, g: Uint8Array, b: Uint8Array}
    let rgbSat: {r: number, g: number, b: number}
    let imagesRAW = []

    switch (message) {
      case 'generateHDR':
        imageData1 = readImage('1.arw')
        imageData2 = readImage('2.arw')
        imageData3 = readImage('3.arw')

        imagesRAW = [imageData1, imageData2, imageData3]

        // mainWindow?.webContents.send('message', [imageData1, imageData2, imageData3])
        // mainWindow?.webContents.send('message', imageData)

        for (let i = 0; i < 3; i++) {
          const rgb = convertRawToRGB(imagesRAW[i], 2848, 4288)
          saveImage(setSaturationImage(rgb), 2848, 4288, `image${i}.jpg`)
        }
        break
      case 'saveImage':
        // saveImage(sampleImageData)
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
