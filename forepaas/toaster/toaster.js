import has from 'lodash/has'

import FpSdk from 'forepaas/sdk'

import def from './helpers/toastify.jsx'

class FpToaster {
  constructor () {
    this.toaster = def
  }

  pop (message, type) {
    if (typeof this.toaster.pop !== 'function') {
      console.error(`Required function pop not defined`)
      return
    }
    return this.toaster.pop(message, type || 'success')
  }
  success (message) {
    return this.pop(message, 'success')
  }
  error (message) {
    return this.pop(message, 'error')
  }
  warn (message) {
    return this.pop(message, 'warn')
  }
  info (message) {
    return this.pop(message, 'info')
  }

  render () {
    if (has(FpSdk, 'config.toaster')) {
      if (FpSdk.modules[FpSdk.config.toaster]) {
        this.toaster = FpSdk.modules[FpSdk.config.toaster]
      } else {
        try {
          this.toaster = require(`./helpers/${FpSdk.config.toaster}.jsx`).default
        } catch (err) {
          this.toaster = def
        }
      }
    }
    return this.toaster.render()
  }
}

export default new FpToaster()
