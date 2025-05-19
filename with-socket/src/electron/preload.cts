const electron = require('electron')

electron.contextBridge.exposeInMainWorld('electron', {
  testPing: () => ipcInvoke('ping'),
} satisfies Window['electron'])

function ipcInvoke<Key extends keyof EventPayloadMapping>(
  key: Key,
): Promise<EventPayloadMapping[Key]> {
  return electron.ipcRenderer.invoke(key)
}

function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void,
) {
  // @ts-ignore
  electron.ipcRenderer.on(key, (_, payload) => callback(payload))
}
