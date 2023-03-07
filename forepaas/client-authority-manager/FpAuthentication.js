import React from 'react'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'

import FpSdk from 'forepaas/sdk'
import FpXhr from 'forepaas/xhr'
import FpLoader from 'forepaas/core-ui/loader'
import {set, del} from 'forepaas/store/local/action'

class FpAuthentication extends FpXhr {
  get localSession () {
    try {
      return JSON.parse(localStorage.getItem('client-authority-manager-session'))
    } catch (_) { return null }
  }
  get token () { return this.localSession && this.localSession.token }
  getBaseUrl () {
    return `${FpSdk.config.authentication.split('?')[0]}/v4`
  }

  getUsername () {
    let cam = FpSdk.modules.store.getState().local['client-authority-manager-session']
    if (cam) return cam.user || FpSdk.config.username || ''
    return FpSdk.config.username || ''
  }

  getLogin () {
    let cam = FpSdk.modules.store.getState().local['client-authority-manager-session']
    if (cam) return cam.login || FpSdk.config.login || ''
    return FpSdk.config.login || ''
  }

  getAppId () {
    return this._getQueryStringFromUrl(FpSdk.config && FpSdk.config.authentication).app_id || null
  }

  openAuthMode (authMode, props) {
    let authorizationCode = ['king_id', 'openam_authorization_code', 'authorization_code']
    if (authorizationCode.indexOf(authMode.type) !== -1) {
      return this.loginOauth(authMode)
    }
    return React.createElement(FpSdk.modules['client-authority-manager'].FpStandardLogin, props || {})
  }

  loginOauth (authMode, options) {
    var redirectUri = encodeURIComponent(window.location.origin + window.location.pathname + '#/reply/')
    var url = this.getBaseUrl() + '/login?app_id=' + this.getAppId() + '&auth_mode_id=' + authMode._id + '&redirect_uri=' + redirectUri
    window.location.replace(url)
    return React.createElement(FpLoader, {})
  }

  standardLogin (form) {
    return new Promise((resolve, reject) => {
      this.post({
        data: form,
        url: 'v4/login'
      })
        .then((session) => {
          document.location.hash = `${FpSdk.config.root || ''}?${document.location.hash.split('?')[1] || ''}`
          window.history.pushState({}, '', '')
          FpSdk.modules.store.dispatch(set('client-authority-manager-session', session))
          resolve('AuthenticationLoginSuccess')
        })
        .catch((err) => {
          reject(err.response.data.error)
        })
    })
  }

  mfaConfiguration (user, id, name) {
    return this.post({
      url: `${this.getBaseUrl()}/mfa/${id}`,
      data: user,
      queryString: {
        name: name
      }
    })
  }

  errorLogin () {
    let error = new RegExp('^#/errorMessage/(.*)$').exec(window.location.hash)
    let content = error && error[1]
    if (!content) return Promise.resolve()
    content = decodeURIComponent(content)
    try {
      content = JSON.parse(content)
    } catch (error) {}
    let err = new Error(content.error)
    err.status = content.status
    return Promise.reject(err)
  }

  replyLogin () {
    let reply = new RegExp('^#/reply/(.*)$').exec(window.location.hash)
    let content = reply && reply[1]
    if (!content) return Promise.resolve()
    if (content && content.split('?')[0] === 'error') {
      let message = this._getQueryStringFromUrl(window.location.hash).message
      window.location.hash = '/'
      return Promise.reject(new Error(message))
    } else {
      return this.checkSession(content)
    }
  }

  checkSession (token, redirect = true) {
    return new Promise((resolve, reject) => {
      if (!token) return resolve()
      this.get({
        url: 'v4/checkSession',
        queryString: {
          token: token
        }
      })
        .then((session) => {
          if (redirect === true) {
            document.location.hash = `${FpSdk.config.root || ''}?${document.location.hash.split('?')[1] || ''}`
            window.history.pushState({}, '', '')
          }
          FpSdk.modules.store.dispatch(set('client-authority-manager-session', session))
          resolve('AuthenticationLoginSuccess')
        })
        .catch((err) => {
          reject(get(err, 'response.data.error') || err)
        })
    })
  }

  logout () {
    let session = FpSdk.modules.store.getState().local['client-authority-manager-session']
    if (!session) return Promise.resolve(FpSdk.modules.store.dispatch(del('client-authority-manager-session')))
    return this.delete({
      url: 'v4/logout',
      queryString: {
        auth_mode_id: session.auth_mode_id
      }
    })
      .then((data) => {
        FpSdk.modules.store.dispatch(del('client-authority-manager-session'))
        FpSdk.modules.store.dispatch(set('client-authority-manager-session', { logout: true }))
        if (data.redirect_url) {
          document.location.href = data.redirect_url
        } else {
          document.location.href = document.location.href.split('?')[0]
          document.location.reload()
        }
      })
      .catch((err) => {
        console.error(err)
        FpSdk.modules.store.dispatch(del('client-authority-manager-session'))
        FpSdk.modules.store.dispatch(set('client-authority-manager-session', { logout: true }))
        document.location.href = document.location.href.split('?')[0]
        document.location.reload()
      })
  }

  applicationsPreferences () {
    return this.get({
      cache: true,
      url: 'v1/applications/preferences'
    }).then((data) => {
      data = cloneDeep(data)
      data.auth_mode = data.auth_mode
        .filter((am) => {
          return am.type !== 'apikey'
        })
        .map((am) => {
          am.icon = 'data:image/png;base64,' + am.icon
          am.open = (props) => {
            return this.openAuthMode(am, props)
          }
          return am
        })
      return data
    })
  }

  passwordChange (oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
      this.post({
        url: 'v4/passwordChange',
        data: {
          password: newPassword,
          oldpassword: oldPassword
        }
      })
        .then(() => {
          let cam = FpSdk.modules.store.getState().local['client-authority-manager-session']
          cam.password_renew = false
          FpSdk.modules.store.dispatch(set('client-authority-manager-session', cam))
          resolve('AuthenticationPasswordChangeSuccess')
        })
        .catch((err) => {
          if (err.response) return reject(err.response.data.error)
          reject(err)
        })
    })
  }

  passwordRenew (email) {
    return new Promise((resolve, reject) => {
      this.post({
        url: 'v4/sendRenewRequest',
        data: {
          email
        }
      })
        .then(() => {
          resolve('AuthenticationPasswordRenewSuccess')
        })
        .catch((err) => {
          reject(err.response.data.error)
        })
    })
  }

  request (options) {
    options.baseURL = FpSdk.config.authentication
    options.url = options.url
    return FpXhr.prototype.request(options)
      .then((res) => {
        return res.data
      })
  }

  _getQueryStringFromUrl (url) {
    if (typeof url !== 'string' || url.indexOf('?') === -1) return {}
    var qs = url.split('?')[1]
    if (!qs) return {}
    qs = qs.split('&').reduce((prev, curr, i, arr) => {
      var p = curr.split('=')
      prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1])
      return prev
    }, {})
    return qs
  }
}

export default new FpAuthentication()
