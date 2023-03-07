import axios from 'axios'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import assign from 'lodash/assign'

import Utils from './Utils'
import Templates from './templates'
import { FpArchitectServer, FpArchitectApi, FpArchitectEditor, FpArchitectMenuEditor } from './architect'

class FpSdk {
  constructor () {
    this.modules = require('forepaas.json').modules
    this.Utils = Utils
  }
  initModules () {
    for (let key in this.modules) {
      if (key === 'sdk' || this.modules[key].root) {
        continue
      }
      try {
        this.modules[key.split(':').pop()] = require('forepaas/' + key.replace(/:/g, '_') + '/index').default
      } catch (err) {
        console.error(err)
        delete this.modules[key]
        console.error(`Cannot find module ${key}`)
      }
    }
  }
  getEnvs () {
    return new Promise((resolve, reject) => {
      axios.get('environments-vars.json')
        .then((envs) => {
          this.envs = envs.data
          return resolve()
        })
        .catch(() => {
          this.envs = {}
          resolve()
        })
    })
  }
  getModule (name) {
    if (this.modules[name]) return this.modules[name]
    if (this.modules['core-ui'] && this.modules['core-ui'][name]) { return this.modules['core-ui'][name] }
    return null
  }
  readArgs () {
    let tmp, res
    if (document.location.href.length === 0) return {}
    tmp = document.location.href.split('?') ? document.location.href.split('?')[1] : ''
    if (!tmp) return {}
    res = {}
    tmp = tmp.split('&')
    tmp.forEach((t) => {
      t = t.split('=')
      if (t.length === 2) {
        res[t[0]] = t[1]
      }
    })
    return res
  }
  computeVars (expr) {
    // eslint-disable-next-line no-unused-vars
    let ENV = this.envs
    // eslint-disable-next-line no-eval
    return eval(expr)
  }
  initConfig (config) {
    if (config) {
      Object.keys(config).forEach((key) => {
        if (typeof config[key] === 'string') {
          if (config[key].indexOf('file://') === 0) {
            let file = config[key].replace('file://config/', '')
            config[key] = require('config/' + file)
          }
          if (typeof config[key] === 'string' && config[key].substr(0, 6) === '{{ENV.' && config[key].substr(-2) === '}}') {
            config[key] = this.computeVars(config[key].substr(2, config[key].length - 4))
          }
        }
        if (typeof config[key] === 'object') {
          this.initConfig(config[key])
        }
      })
    }
    return config
  }
  getPreview () {
    return new Promise((resolve, reject) => {
      try {
        window.addEventListener('message', (event) => {
          if (!event.data.authentication) event.data.authentication = '{{ENV.CAM_URL}}'
          if (!event.data.api) event.data.api = '{{ENV.API_URL}}'
          if (!event.data.application_name) event.data.application_name = '{{ENV.APP_NAME}}'
          this.config = this.initConfig(event.data)
          if (this.modules['client-authority-manager']) {
            if (!this.config.authenticationToken) {
              reject(new Error('Missing authenticationToken'))
            }
            this.modules['client-authority-manager'].FpAuthentication.checkSession(this.config.authenticationToken)
              .then(() => {
                if (this.config.url) document.location.href = this.config.url
                resolve()
              })
              .catch((err) => {
                reject(err)
              })
          } else {
            resolve()
          }
        })
        window.parent.postMessage('ready', '*')
        console.info('Wait config')
      } catch (err) {
        reject(err)
        console.error(err)
      }
    })
  }
  getFromServer () {
    return FpArchitectApi.config()
      .then((res) => {
        console.info(res)
        this.config = this.initConfig(res.data)
        if (window.self !== window.top) {
          window.addEventListener('message', (e) => {
            if (e.data.id === 'app') {
              switch (e.data.op) {
                case 'REDIRECT':
                  window.location.hash = e.data.value
                  break
              }
            }
          })
        }
        // We initiate components for optimization purpose
        return Promise.all([
          FpArchitectServer(res.server, res.token),
          FpArchitectApi.components()
        ])
      })
      .then(() => {
        this.FpArchitectEditor = new FpArchitectEditor()
        this.FpArchitectMenuEditor = new FpArchitectMenuEditor()
        window.parent.postMessage({ loaded: true }, '*')
        return true
      })
  }
  getConfig () {
    return new Promise((resolve, reject) => {
      try {
        let config
        try {
          if (process.env.NODE_ENV === 'development') {
            let overwriteConfig
            let prodConfig = cloneDeep(require('config/global.json'))
            try {
              overwriteConfig = cloneDeep(require('config/global-override.json'))
            } catch (err) {
              overwriteConfig = null
            }
            config = assign(prodConfig, overwriteConfig)
          } else {
            config = cloneDeep(require('config/global.json'))
          }
        } catch (err) {
          config = cloneDeep(require('config/global.json'))
        }
        if (typeof config.authentication === 'undefined') config.authentication = '{{ENV.CAM_URL}}'
        if (!config.api) config.api = '{{ENV.API_URL}}'
        if (!config.application_name) config.application_name = '{{ENV.APP_NAME}}'
        this.config = this.initConfig(config)
        resolve()
      } catch (err) {
        console.error(err)
        reject(new Error('No config file found, please create a file name global.json in the config folder'))
      }
    })
  }

  updateConfig (id, value) {
    let conf = get(this.config, id)
    if (conf) {
      Object.keys(value).forEach(key => {
        conf[key] = value[key]
      })
    }
  }

  init () {
    this.modules.sdk = this.modules.sdk || {}
    this.modules.sdk.templates = Templates
  }
  start () {
    let queryParams
    return this.getEnvs()
      .then(() => {
        queryParams = this.readArgs()
        try {
          queryParams.token = JSON.parse(decodeURIComponent(queryParams.token))
        } catch (err) {}
        if (queryParams.preview) {
          return this.getPreview()
        } else if (queryParams.server) {
          return this.getFromServer()
        } else {
          return this.getConfig()
        }
      })
      .then(() => {
        if (this.modules['client-authority-manager']) {
          // We check if the tocken provided is correct and set redirect to false to stay on the same page
          let authentication = this.modules['client-authority-manager'].FpAuthentication
          let token = queryParams.token || (authentication.localSession && authentication.localSession.token)
          if (!token) return true
          return this.modules['client-authority-manager'].FpAuthentication.checkSession(token, false)
            .then(_ => true)
            .catch(err => console.error(err))
        }
        return true
      })
      .catch((err) => console.error(err))
  }
}

const sdk = new FpSdk()
global.Forepaas = sdk
export default sdk

/* global Forepaas */
Forepaas.initModules()
Forepaas.init()
