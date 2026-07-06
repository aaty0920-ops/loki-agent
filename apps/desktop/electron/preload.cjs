const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld('lokiDesktop', {
  getConnection: profile => ipcRenderer.invoke('loki:connection', profile),
  revalidateConnection: () => ipcRenderer.invoke('loki:connection:revalidate'),
  touchBackend: profile => ipcRenderer.invoke('loki:backend:touch', profile),
  getGatewayWsUrl: profile => ipcRenderer.invoke('loki:gateway:ws-url', profile),
  openSessionWindow: (sessionId, opts) => ipcRenderer.invoke('loki:window:openSession', sessionId, opts),
  openNewSessionWindow: () => ipcRenderer.invoke('loki:window:openNewSession'),
  petOverlay: {
    // Main renderer → main process: window lifecycle + drag. `request` is
    // `{ bounds, screen }`; resolves with the screen bounds it actually used.
    open: request => ipcRenderer.invoke('loki:pet-overlay:open', request),
    close: () => ipcRenderer.invoke('loki:pet-overlay:close'),
    setBounds: bounds => ipcRenderer.send('loki:pet-overlay:set-bounds', bounds),
    setIgnoreMouse: ignore => ipcRenderer.send('loki:pet-overlay:ignore-mouse', ignore),
    // Flip the overlay focusable (and focus it) while the composer needs keys.
    setFocusable: focusable => ipcRenderer.send('loki:pet-overlay:set-focusable', focusable),
    // Main renderer → overlay (forwarded by main): push the latest pet state.
    pushState: payload => ipcRenderer.send('loki:pet-overlay:state', payload),
    // Overlay → main renderer (forwarded by main): pop back in / composer submit.
    control: payload => ipcRenderer.send('loki:pet-overlay:control', payload),
    // Overlay subscribes to state pushes.
    onState: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('loki:pet-overlay:state', listener)
      return () => ipcRenderer.removeListener('loki:pet-overlay:state', listener)
    },
    // Main renderer subscribes to overlay control messages.
    onControl: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('loki:pet-overlay:control', listener)
      return () => ipcRenderer.removeListener('loki:pet-overlay:control', listener)
    }
  },
  getBootProgress: () => ipcRenderer.invoke('loki:boot-progress:get'),
  getConnectionConfig: profile => ipcRenderer.invoke('loki:connection-config:get', profile),
  saveConnectionConfig: payload => ipcRenderer.invoke('loki:connection-config:save', payload),
  applyConnectionConfig: payload => ipcRenderer.invoke('loki:connection-config:apply', payload),
  testConnectionConfig: payload => ipcRenderer.invoke('loki:connection-config:test', payload),
  probeConnectionConfig: remoteUrl => ipcRenderer.invoke('loki:connection-config:probe', remoteUrl),
  oauthLoginConnectionConfig: remoteUrl => ipcRenderer.invoke('loki:connection-config:oauth-login', remoteUrl),
  oauthLogoutConnectionConfig: remoteUrl => ipcRenderer.invoke('loki:connection-config:oauth-logout', remoteUrl),
  profile: {
    get: () => ipcRenderer.invoke('loki:profile:get'),
    set: name => ipcRenderer.invoke('loki:profile:set', name)
  },
  api: request => ipcRenderer.invoke('loki:api', request),
  notify: payload => ipcRenderer.invoke('loki:notify', payload),
  requestMicrophoneAccess: () => ipcRenderer.invoke('loki:requestMicrophoneAccess'),
  readFileDataUrl: filePath => ipcRenderer.invoke('loki:readFileDataUrl', filePath),
  readFileText: filePath => ipcRenderer.invoke('loki:readFileText', filePath),
  selectPaths: options => ipcRenderer.invoke('loki:selectPaths', options),
  writeClipboard: text => ipcRenderer.invoke('loki:writeClipboard', text),
  saveImageFromUrl: url => ipcRenderer.invoke('loki:saveImageFromUrl', url),
  saveImageBuffer: (data, ext) => ipcRenderer.invoke('loki:saveImageBuffer', { data, ext }),
  saveClipboardImage: () => ipcRenderer.invoke('loki:saveClipboardImage'),
  getPathForFile: file => {
    try {
      return webUtils.getPathForFile(file) || ''
    } catch {
      return ''
    }
  },
  normalizePreviewTarget: (target, baseDir) => ipcRenderer.invoke('loki:normalizePreviewTarget', target, baseDir),
  watchPreviewFile: url => ipcRenderer.invoke('loki:watchPreviewFile', url),
  stopPreviewFileWatch: id => ipcRenderer.invoke('loki:stopPreviewFileWatch', id),
  setTitleBarTheme: payload => ipcRenderer.send('loki:titlebar-theme', payload),
  setNativeTheme: mode => ipcRenderer.send('loki:native-theme', mode),
  setTranslucency: payload => ipcRenderer.send('loki:translucency', payload),
  setPreviewShortcutActive: active => ipcRenderer.send('loki:previewShortcutActive', Boolean(active)),
  openExternal: url => ipcRenderer.invoke('loki:openExternal', url),
  openPreviewInBrowser: url => ipcRenderer.invoke('loki:openPreviewInBrowser', url),
  fetchLinkTitle: url => ipcRenderer.invoke('loki:fetchLinkTitle', url),
  sanitizeWorkspaceCwd: cwd => ipcRenderer.invoke('loki:workspace:sanitize', cwd),
  settings: {
    getDefaultProjectDir: () => ipcRenderer.invoke('loki:setting:defaultProjectDir:get'),
    setDefaultProjectDir: dir => ipcRenderer.invoke('loki:setting:defaultProjectDir:set', dir),
    pickDefaultProjectDir: () => ipcRenderer.invoke('loki:setting:defaultProjectDir:pick')
  },
  revealLogs: () => ipcRenderer.invoke('loki:logs:reveal'),
  getRecentLogs: () => ipcRenderer.invoke('loki:logs:recent'),
  readDir: dirPath => ipcRenderer.invoke('loki:fs:readDir', dirPath),
  gitRoot: startPath => ipcRenderer.invoke('loki:fs:gitRoot', startPath),
  revealPath: targetPath => ipcRenderer.invoke('loki:fs:reveal', targetPath),
  renamePath: (targetPath, newName) => ipcRenderer.invoke('loki:fs:rename', targetPath, newName),
  writeTextFile: (filePath, content) => ipcRenderer.invoke('loki:fs:writeText', filePath, content),
  trashPath: targetPath => ipcRenderer.invoke('loki:fs:trash', targetPath),
  git: {
    worktreeList: repoPath => ipcRenderer.invoke('loki:git:worktreeList', repoPath),
    worktreeAdd: (repoPath, options) => ipcRenderer.invoke('loki:git:worktreeAdd', repoPath, options),
    worktreeRemove: (repoPath, worktreePath, options) =>
      ipcRenderer.invoke('loki:git:worktreeRemove', repoPath, worktreePath, options),
    branchSwitch: (repoPath, branch) => ipcRenderer.invoke('loki:git:branchSwitch', repoPath, branch),
    branchList: repoPath => ipcRenderer.invoke('loki:git:branchList', repoPath),
    repoStatus: repoPath => ipcRenderer.invoke('loki:git:repoStatus', repoPath),
    fileDiff: (repoPath, filePath) => ipcRenderer.invoke('loki:git:fileDiff', repoPath, filePath),
    scanRepos: (roots, options) => ipcRenderer.invoke('loki:git:scanRepos', roots, options),
    review: {
      list: (repoPath, scope, baseRef) => ipcRenderer.invoke('loki:git:review:list', repoPath, scope, baseRef),
      diff: (repoPath, filePath, scope, baseRef, staged) =>
        ipcRenderer.invoke('loki:git:review:diff', repoPath, filePath, scope, baseRef, staged),
      stage: (repoPath, filePath) => ipcRenderer.invoke('loki:git:review:stage', repoPath, filePath),
      unstage: (repoPath, filePath) => ipcRenderer.invoke('loki:git:review:unstage', repoPath, filePath),
      revert: (repoPath, filePath) => ipcRenderer.invoke('loki:git:review:revert', repoPath, filePath),
      revParse: (repoPath, ref) => ipcRenderer.invoke('loki:git:review:revParse', repoPath, ref),
      commit: (repoPath, message, push) => ipcRenderer.invoke('loki:git:review:commit', repoPath, message, push),
      commitContext: repoPath => ipcRenderer.invoke('loki:git:review:commitContext', repoPath),
      push: repoPath => ipcRenderer.invoke('loki:git:review:push', repoPath),
      shipInfo: repoPath => ipcRenderer.invoke('loki:git:review:shipInfo', repoPath),
      createPr: repoPath => ipcRenderer.invoke('loki:git:review:createPr', repoPath)
    }
  },
  terminal: {
    dispose: id => ipcRenderer.invoke('loki:terminal:dispose', id),
    resize: (id, size) => ipcRenderer.invoke('loki:terminal:resize', id, size),
    start: options => ipcRenderer.invoke('loki:terminal:start', options),
    write: (id, data) => ipcRenderer.invoke('loki:terminal:write', id, data),
    onData: (id, callback) => {
      const channel = `loki:terminal:${id}:data`
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on(channel, listener)
      return () => ipcRenderer.removeListener(channel, listener)
    },
    onExit: (id, callback) => {
      const channel = `loki:terminal:${id}:exit`
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on(channel, listener)
      return () => ipcRenderer.removeListener(channel, listener)
    }
  },
  onClosePreviewRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('loki:close-preview-requested', listener)
    return () => ipcRenderer.removeListener('loki:close-preview-requested', listener)
  },
  onOpenUpdatesRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('loki:open-updates', listener)
    return () => ipcRenderer.removeListener('loki:open-updates', listener)
  },
  onDeepLink: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('loki:deep-link', listener)
    return () => ipcRenderer.removeListener('loki:deep-link', listener)
  },
  signalDeepLinkReady: () => ipcRenderer.invoke('loki:deep-link-ready'),
  onWindowStateChanged: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('loki:window-state-changed', listener)
    return () => ipcRenderer.removeListener('loki:window-state-changed', listener)
  },
  onFocusSession: callback => {
    const listener = (_event, sessionId) => callback(sessionId)
    ipcRenderer.on('loki:focus-session', listener)
    return () => ipcRenderer.removeListener('loki:focus-session', listener)
  },
  onNotificationAction: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('loki:notification-action', listener)
    return () => ipcRenderer.removeListener('loki:notification-action', listener)
  },
  onPreviewFileChanged: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('loki:preview-file-changed', listener)
    return () => ipcRenderer.removeListener('loki:preview-file-changed', listener)
  },
  onBackendExit: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('loki:backend-exit', listener)
    return () => ipcRenderer.removeListener('loki:backend-exit', listener)
  },
  onPowerResume: callback => {
    const listener = () => callback()
    ipcRenderer.on('loki:power-resume', listener)
    return () => ipcRenderer.removeListener('loki:power-resume', listener)
  },
  onBootProgress: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('loki:boot-progress', listener)
    return () => ipcRenderer.removeListener('loki:boot-progress', listener)
  },
  // First-launch bootstrap progress -- emitted by the install.ps1 stage
  // runner in main.cjs (apps/desktop/electron/bootstrap-runner.cjs).
  // Renderer's install overlay subscribes to live events and queries the
  // current snapshot via getBootstrapState() to recover after a devtools
  // reload mid-bootstrap.
  getBootstrapState: () => ipcRenderer.invoke('loki:bootstrap:get'),
  resetBootstrap: () => ipcRenderer.invoke('loki:bootstrap:reset'),
  repairBootstrap: () => ipcRenderer.invoke('loki:bootstrap:repair'),
  cancelBootstrap: () => ipcRenderer.invoke('loki:bootstrap:cancel'),
  onBootstrapEvent: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('loki:bootstrap:event', listener)
    return () => ipcRenderer.removeListener('loki:bootstrap:event', listener)
  },
  getVersion: () => ipcRenderer.invoke('loki:version'),
  getRemoteDisplayReason: () => ipcRenderer.invoke('loki:get-remote-display-reason'),
  uninstall: {
    summary: () => ipcRenderer.invoke('loki:uninstall:summary'),
    run: mode => ipcRenderer.invoke('loki:uninstall:run', { mode })
  },
  updates: {
    check: () => ipcRenderer.invoke('loki:updates:check'),
    apply: opts => ipcRenderer.invoke('loki:updates:apply', opts),
    getBranch: () => ipcRenderer.invoke('loki:updates:branch:get'),
    setBranch: name => ipcRenderer.invoke('loki:updates:branch:set', name),
    onProgress: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('loki:updates:progress', listener)
      return () => ipcRenderer.removeListener('loki:updates:progress', listener)
    }
  },
  themes: {
    fetchMarketplace: id => ipcRenderer.invoke('loki:vscode-theme:fetch', id),
    searchMarketplace: query => ipcRenderer.invoke('loki:vscode-theme:search', query)
  }
})
