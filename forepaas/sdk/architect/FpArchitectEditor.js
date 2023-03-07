import get from 'lodash/get'
import './FpArchitectEditor.less'

export default class FpArchitectEditor {
  constructor () {
    this.onMessage = this.onMessage.bind(this)
    this.onReady = this.onReady.bind(this)
    let url = ''
    if (process.env.ARCHITECT_FRONT_URI) {
      url = process.env.ARCHITECT_FRONT_URI + window.Forepaas.config.server.server_addr.pathname + '#/architect'
    } else {
      url = window.Forepaas.config.server.server_addr.origin + window.Forepaas.config.server.server_addr.pathname + '/public/#/architect'
    }
    url += `/${window.Forepaas.config.server.app_name}/editor`
    url += `?token=${this.token}&app_id=${this.getAppId()}`
    this.modal = document.createElement('div')
    this.modal.innerHTML = `
      <div class="fp-modal-content">
        <iframe src='${url}'></iframe>
      </div>
    `
    this.modal.classList.add('fp-architect-editor')
    this.modal.style.display = 'none'
    this.iframe = this.modal.querySelector('iframe')
    window.addEventListener('message', this.onReady, false)
    document.querySelector('body').appendChild(this.modal)
  }
  get token () {
    if (window.Forepaas.config.server.token) return window.Forepaas.config.server.token
    let cam = window.Forepaas.modules['client-authority-manager']
    if (cam && cam.FpAuthentication.localSession) {
      return cam.FpAuthentication.token
    }
  }
  mount () { window.addEventListener('message', this.onMessage, false) }
  unmount () { window.removeEventListener('message', this.onMessage, false) }

  getAppId () {
    let qs = window.Forepaas.config.authentication.split('?')[1]
    qs = qs.split('&').map(q => q.split('='))
    for (let i in qs) {
      if (qs[i][0] === 'app_id') return qs[i][1]
    }
    return null
  }

  onReady (evt) {
    if (evt.data.isEditor && evt.data.state === 'ready') {
      this.ready = true
      window.removeEventListener('message', this.onReady, false)
    }
  }
  onMessage (evt) {
    if (!evt.data.isEditor) return
    if (evt.data.state === 'success') {
      this.modal.style.display = 'none'
      this.unmount()
      this.resolve(evt.data.item)
    }
    if (evt.data.state === 'close') {
      this.modal.style.display = 'none'
      this.unmount()
      this.reject()
    }
  }

  load (state) {
    if (state && this.lastState !== state) {
      this.lastState = true
      this.loader = document.createElement('div')
      this.loader.innerHTML = `
        <div class="loader-architect"></div>
      `
      this.loader.classList.add('loader-architect-container')
      document.querySelector('body').appendChild(this.loader)
    }
    if (state === false) {
      if (this.loader && this.loader.parentNode) {
        this.loader.parentNode.removeChild(this.loader)
      }
    }
  }

  edit ({ lang, item, dashboardId }) {
    this.mount()
    this.dashboardId = dashboardId || item.dashboardId
    this.item = item
    this.id = Math.random().toString(36).substr(2, 9)
    if (!this.ready) {
      this.load(true)
      return new Promise((resolve, reject) => {
        setTimeout(_ => {
          this.edit({ lang, item, dashboardId })
            .then(item => resolve(item))
        }, 100)
      })
    }
    return new Promise((resolve, reject) => {
      this.load(false)
      this.resolve = resolve
      this.reject = reject
      let fp = window.Forepaas
      let state = {}
      if (fp.modules.store) {
        state = fp.modules.store.getState()
      }
      let token = fp.config.server.token || get(state, 'local.client-authority-manager-session.token')
      let dashboard = null
      if (this.dashboardId) {
        dashboard = window.Forepaas.config.dashboarding[this.dashboardId]
      } else {
        let id = document.location.href.split('#')[1]
        if (id) {
          id = id.split('?')[0]
          dashboard = window.Forepaas.config.dashboarding[id]
        }
      }
      this.iframe.contentWindow.postMessage({
        id: this.id,
        lang,
        dashboardId: this.id,
        item: this.item || {},
        token,
        app_name: window.Forepaas.config.server.app_name,
        api_url: window.Forepaas.config.api,
        dashboards: JSON.parse(JSON.stringify(window.Forepaas.config.dashboarding)),
        app_id: this.getAppId(),
        menu: JSON.parse(JSON.stringify(window.Forepaas.config.menu)),
        dashboard: JSON.parse(JSON.stringify(dashboard))
      }, '*')
      this.modal.style.display = 'block'
    })
  }
}
