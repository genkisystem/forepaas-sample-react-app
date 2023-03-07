import FpStandardLogin from './FpStandardLogin/FpStandardLogin.jsx'
import FpLoginSelector from './FpLoginSelector.jsx'
import FpPasswordChange from './FpPasswordChange/FpPasswordChange.jsx'
import FpAuthentication from './FpAuthentication'
import FpXhr from 'forepaas/xhr'
import FpAuthenticationInterceptor from './FpAuthenticationInterceptor'
import './styles/authentication.less'
FpXhr.interceptors.push(FpAuthenticationInterceptor)

class FpClientAuthorityManager {
  constructor () {
    this.FpStandardLogin = FpStandardLogin
    this.FpLoginSelector = FpLoginSelector
    this.FpPasswordChange = FpPasswordChange
    this.FpAuthentication = FpAuthentication
    return this
  }
}

export default new FpClientAuthorityManager()
