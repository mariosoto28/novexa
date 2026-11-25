const { contextBridge: mmszContextBridge, ipcRenderer: mmszIpcRenderer } = require('electron');

mmszContextBridge.exposeInMainWorld('mmszApi', {
  mmszLoadProgress: () => mmszIpcRenderer.invoke('progress:load'),
  mmszSaveProgress: (mmszData) => mmszIpcRenderer.invoke('progress:save', mmszData),
  mmszListarCopias: () => mmszIpcRenderer.invoke('progress:copias'),
  mmszCopiaManual: (mmszData, mmszEtiqueta) => mmszIpcRenderer.invoke('progress:copiaManual', mmszData, mmszEtiqueta),
  mmszExportarProgreso: (mmszContenido) => mmszIpcRenderer.invoke('progress:exportar', mmszContenido),
  mmszImportarProgreso: () => mmszIpcRenderer.invoke('progress:importar'),
});
