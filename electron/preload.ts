import { contextBridge, ipcRenderer } from 'electron';

const apiUrl = process.argv.find(x => x.startsWith('--horaspay-api='))?.replace('--horaspay-api=', '') ?? 'http://127.0.0.1:5157';

contextBridge.exposeInMainWorld('horasPay', {
  apiUrl,
  version: process.env.npm_package_version ?? '0.1.0',
  saveFile: (name: string, data: string) => ipcRenderer.invoke('guardar-archivo', name, data),
  onNavigate: (callback: (path: string) => void) => ipcRenderer.on('navegar', (_event, path) => callback(path)),
  onUpdateReady: (callback: () => void) => ipcRenderer.on('actualizacion-lista', callback)
});
