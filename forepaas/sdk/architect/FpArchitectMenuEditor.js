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
    url += `/${window.Forepaas.config.server.app_name}/menus`
    url += `?token=${this.token}&app_id=${this.getAppId()}`
    this.modal = document.createElement('div')
    this.modal.innerHTML = `
      <div class="fp-modal-content">
        <iframe src='${url}'></iframe>
      </div>
    `
    this.modal.classList.add('fp-architect-menu-editor')
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
      this.resolve(evt.data.menus)
    }
    if (evt.data.state === 'close') {
      this.modal.style.display = 'none'
      this.unmount()
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

  edit ({ lang }) {
    this.mount()
    this.id = Math.random().toString(36).substr(2, 9)

    if (!this.ready) {
      this.load(true)
      return new Promise((resolve, reject) => {
        setTimeout(_ => {
          this.edit({ lang })
            .then(menus => resolve(menus))
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
      this.iframe.contentWindow.postMessage({
        op: 'menu',
        value: {
          lang,
          id: this.id,
          token,
          app_name: window.Forepaas.config.server.app_name,
          api_url: window.Forepaas.config.api,
          dashboards: window.Forepaas.config.dashboarding,
          app_id: this.getAppId(),
          menu: window.Forepaas.config.menu
        }
      }, '*')
      this.modal.style.display = 'block'
    })
  }
}
