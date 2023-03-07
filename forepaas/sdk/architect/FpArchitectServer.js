class FpArchitectServer {
  constructor (io, appName, serverAddr, token) {
    this.app_name = appName
    this.server_addr = new URL(serverAddr)
    this.token = token
    this.io = io.connect(this.server_addr.origin, {
      path: this.server_addr.pathname + 'socket.io',
      query: 'type=cam&token=' + this.token
    })
    this.io.emit('architect', {
      action: 'join',
      app_name: this.app_name
    })
    window.Forepaas.config.server = this
    this.funcs = {}
  }

  emit (options) {
    let params = new URLSearchParams(window.location.hash)
    let user = params.get('user')
    if (user) {
      user = user.replace(/"/g, '')
    }
    options.user = user
    options.app_name = this.app_name
    this.io.emit('architect', options)
  }

  on (params, cb) {
    const onMessage = (message) => {
      for (let key in params) {
        if (params[key] !== message[key]) return
      }
      return cb(message.value)
    }
    let key = JSON.stringify(params)
    this.funcs[key] = onMessage
    this.io.on('architect', this.funcs[key])
  }

  remove (params) {
    this.io.removeListener('architect', this.funcs[JSON.stringify(params)])
  }
}
let cache = null
export default (serverAddr, token) => {
  if (cache) return cache
  let tmp = serverAddr.split('/')
  let appName = tmp.pop()
  tmp.pop()
  serverAddr = tmp.join('/')
  cache = new Promise((resolve, reject) => {
    (function () {
      var first, s
      s = document.createElement('script')
      s.src = serverAddr + '/socket.io/socket.io.js?type=cam&token=' + token
      s.type = 'text/javascript'
      s.async = true
      s.onload = s.onreadystatechange = _ => {
        resolve(new FpArchitectServer(window.io, appName, serverAddr, token))
      }
      first = document.getElementsByTagName('script')[0]
      return first.parentNode.insertBefore(s, first)
    }).call(this)
  })
  return cache
}
