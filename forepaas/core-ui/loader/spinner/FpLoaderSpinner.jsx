import React from 'react'
require('./FpLoaderSpinner.css')

/**
 * Renders the spinner of the loader from FpLoader
 */
export default class FpLoader extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   */
  constructor (props) {
    super(props)
    this.style = {
      width: '100%',
      height: '100%'
    }
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    let bars = []
    const props = this.props

    for (let i = 0; i < 12; i++) {
      let barStyle = {}
      barStyle.WebkitAnimationDelay = barStyle.animationDelay =
        (i - 12) / 10 + 's'

      barStyle.WebkitTransform = barStyle.transform =
        'rotate(' + (i * 30) + 'deg) translate(146%)'

      bars.push(
        <div style={barStyle} className='fp-loader-spinner_bar' key={i} />
      )
    }

    return (
      <div className={(props.className || '') + ' fp-loader-spinner'}>
        <div className='fp-loader-spinner-content'>
          {bars}
        </div>
      </div>
    )
  }
}
