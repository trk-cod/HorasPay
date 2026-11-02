import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';
import { ChildProcess, spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

let ventana: BrowserWindow | undefined;
let splash: BrowserWindow | undefined;
let api: ChildProcess | undefined;
let apiUrl = 'http://127.0.0.1:5157';
const esDesarrollo = Boolean(process.env.HORASPAY_DEV_URL);

const rutaEstado = () => path.join(app.getPath('userData'), 'window.json');
const puertoLibre = () => new Promise<number>((resolve, reject) => {
  const servidor = createServer(); servidor.unref(); servidor.on('error', reject);
  servidor.listen(0, '127.0.0.1', () => { const direccion = servidor.address(); servidor.close(() => typeof direccion === 'object' && direccion ? resolve(direccion.port) : reject(new Error('Sin puerto disponible'))); });
});
const esperar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function mostrarSplash(mensaje: string): Promise<void> {
  if (!splash) {
    splash = new BrowserWindow({ width: 370, height: 210, frame: false, resizable: false, transparent: false, alwaysOnTop: true, backgroundColor: '#0f172a', webPreferences: { contextIsolation: true, nodeIntegration: false } });
    await splash.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent('<style>body{margin:0;background:#0f172a;color:#fff;font-family:Segoe UI,sans-serif;display:grid;place-items:center;height:100vh}.card{text-align:center}.logo{font-size:40px;color:#34d399}.bar{width:250px;height:7px;background:#334155;border-radius:9px;margin:22px auto 8px;overflow:hidden}.bar i{display:block;width:72%;height:100%;background:#10b981;border-radius:9px}p{color:#cbd5e1}</style><div class="card"><div class="logo">◷</div><h2>HorasPay</h2><div class="bar"><i></i></div><p id="message">Preparando tus datos…</p></div>')}`);
  }
  splash.webContents.executeJavaScript(`document.getElementById('message').textContent=${JSON.stringify(mensaje)}`);
}

async function iniciarApi(): Promise<void> {
  if (esDesarrollo) return;
  await mostrarSplash('Iniciando tus datos…');
  const puerto = await puertoLibre(); apiUrl = `http://127.0.0.1:${puerto}`;
  const ejecutable = path.join(process.resourcesPath, 'api', 'HorasPay.Api.exe');
  api = spawn(ejecutable, ['--urls', apiUrl], { windowsHide: true, stdio: 'ignore' });
  api.once('error', error => void dialog.showErrorBox('No se pudo iniciar HorasPay', `No pudimos preparar tus datos locales. ${error.message}`));
  for (let intento = 0; intento < 40; intento += 1) {
    try { if ((await fetch(`${apiUrl}/health`)).ok) return; } catch { /* la API aún inicia */ }
    await esperar(125);
  }
  throw new Error('La aplicación tardó demasiado en preparar los datos locales.');
}

async function crearVentana(): Promise<void> {
  const guardado = await fs.readFile(rutaEstado(), 'utf8').then(JSON.parse).catch(() => ({}));
  ventana = new BrowserWindow({ width: guardado.width ?? 1200, height: guardado.height ?? 800, x: guardado.x, y: guardado.y, minWidth: 1000, minHeight: 650, show: false, backgroundColor: '#f8fafc', title: 'HorasPay', webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, additionalArguments: [`--horaspay-api=${apiUrl}`] } });
  ventana.on('close', () => { if (!ventana) return; const { x, y, width, height } = ventana.getBounds(); void fs.writeFile(rutaEstado(), JSON.stringify({ x, y, width, height })); });
  if (esDesarrollo) await ventana.loadURL(process.env.HORASPAY_DEV_URL!);
  else await ventana.loadFile(path.join(__dirname, '..', 'dist', 'frontend', 'browser', 'index.html'));
  ventana.show(); splash?.close(); splash = undefined;
}

function crearMenu(): void {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Archivo', submenu: [{ label: 'Nueva jornada', accelerator: 'Ctrl+N', click: () => ventana?.webContents.send('navegar', '/registrar') }, { type: 'separator' }, { label: 'Exportar CSV', accelerator: 'Ctrl+E', click: () => ventana?.webContents.send('exportar-csv') }, { type: 'separator' }, { role: 'quit', label: 'Salir' }] },
    { label: 'Editar', submenu: [{ role: 'undo', label: 'Deshacer' }, { role: 'redo', label: 'Rehacer' }, { type: 'separator' }, { role: 'cut', label: 'Cortar' }, { role: 'copy', label: 'Copiar' }, { role: 'paste', label: 'Pegar' }] },
    { label: 'Ver', submenu: [{ role: 'reload', label: 'Recargar' }, { role: 'toggleDevTools', label: 'Herramientas de desarrollo' }, { type: 'separator' }, { role: 'togglefullscreen', label: 'Pantalla completa' }] },
    { label: 'Ayuda', submenu: [{ label: 'Ayuda y atajos', accelerator: 'F1', click: () => ventana?.webContents.send('navegar', '/ayuda') }, { label: 'Guía de instalación', click: () => void shell.openExternal('https://github.com/trk-cod/HorasPay') }] }
  ]));
}

async function configurarActualizador(): Promise<void> {
  if (esDesarrollo) return;
  let autoUpdater: typeof import('electron-updater').autoUpdater;
  try {
    ({ autoUpdater } = await import('electron-updater'));
  } catch {
    return;
  }
  autoUpdater.autoDownload = true;
  autoUpdater.on('update-downloaded', () => ventana?.webContents.send('actualizacion-lista'));
  autoUpdater.checkForUpdates().catch(() => undefined);
  ipcMain.handle('instalar-actualizacion', () => autoUpdater.quitAndInstall());
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (!ventana) return; if (ventana.isMinimized()) ventana.restore(); ventana.focus(); });
  app.whenReady().then(async () => { await mostrarSplash('Preparando tus datos…'); await iniciarApi(); await mostrarSplash('Abriendo HorasPay…'); await crearVentana(); crearMenu(); void configurarActualizador(); });
}
app.on('window-all-closed', () => app.quit());
app.on('before-quit', () => { api?.kill(); });
ipcMain.handle('guardar-archivo', async (_event, name: string, data: string) => { const resultado = await dialog.showSaveDialog({ defaultPath: name }); if (resultado.canceled || !resultado.filePath) return false; await fs.writeFile(resultado.filePath, data, 'utf8'); return true; });
export { apiUrl };
