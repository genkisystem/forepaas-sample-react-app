import FpSdk from 'forepaas/sdk'

import FpAuthentication from './FpAuthentication.js'

export default {
  onRequest (request) {
    return new Promise((resolve, reject) => {
      let token, appId
      if (FpSdk.config && FpSdk.config.authenticationToken) {
        token = FpSdk.config.authenticationToken
      }
      if (FpAuthentication.localSession) {
        token = FpAuthentication.token
      }
      token = request.queryString.token || token
      appId = request.queryString.app_id || FpAuthentication.getAppId()
      if (appId) request.queryString.app_id = appId
      if (token) request.queryString.token = token
      resolve(request)
    })
  },
  onError (options, error) {
    return new Promise((resolve, reject) => {
      let url = options.url.split('?')[0]
      if (error.response && error.response.data && !['logout', 'v4/logout'].includes(url)) {
        // We add no permission for this user for the dropzone
        let messages = ['Invalid token', 'No permission for this user', 'FpCam::Invalid token', 'Unauthorized']
        let check = messages.indexOf(error.response.data.message) !== -1 || messages.indexOf(error.response.data.error) !== -1
        let status = error.response.data.status || error.response.status
        if (check && (status === 403 || status === 401)) {
          return FpAuthentication.logout()
            .then(_ => console.info('Session not valid: logout'))
            .then(_ => reject(error))
            .catch(_ => reject(error))
        }
      }
      reject(error)
    })
  }
}
