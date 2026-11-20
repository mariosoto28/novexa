// Autor: MMSZ (Mario Soto Zea)
// Puente seguro entre la interfaz (React) y el proceso principal.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadProgress: () => ipcRenderer.invoke('progress:load'),
  saveProgress: (mmszData) => ipcRenderer.invoke('progress:save', mmszData),
  listarCopias: () => ipcRenderer.invoke('progress:copias'),
  copiaManual: (mmszData, mmszEtiqueta) => ipcRenderer.invoke('progress:copiaManual', mmszData, mmszEtiqueta),
  exportarProgreso: (mmszContenido) => ipcRenderer.invoke('progress:exportar', mmszContenido),
  importarProgreso: () => ipcRenderer.invoke('progress:importar'),
});
