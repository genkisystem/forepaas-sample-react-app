import React from 'react'
import PropTypes from 'prop-types'
import FpTranslate from 'forepaas/translate'

const HeaderLogin = ({ text, title, logo, dots }) => {
  return (
    <div className='header-login'>
      <img src={logo} alt='logo' className='login-logo' />
      {dots && (
        <img src={dots} alt='dots' className='dots' />
      )}
      <h1 className='login-title'>{FpTranslate(title)}</h1>
      {text && <p className='login-text'>{FpTranslate(text)}</p>}
    </div>
  )
}

HeaderLogin.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  logo: PropTypes.string,
  dots: PropTypes.string
}

export default HeaderLogin
