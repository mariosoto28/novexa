// Autor: MMSZ (Mario Soto Zea)
// Puente seguro entre la interfaz (React) y el proceso principal.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadProgress: () => ipcRenderer.invoke('progress:load'),
  saveProgress: (mmszData) => ipcRenderer.invoke('progress:save', mmszData),
});
