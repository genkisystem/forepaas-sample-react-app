import { FpArchitectServer } from 'forepaas/sdk/architect'

export default (refresh) => {
  if (!window.Forepaas.config.server) return
  FpArchitectServer()
    .then(io => {
      io.on({
        action: 'update',
        id: 'menu'
      }, menus => refresh(menus))
      io.on({
        action: 'refresh'
      }, data => {
        if (data.itemId === 'menu') refresh(data.menu)
      })
    })
}
