import FpSdk from 'forepaas/sdk'
import FpTranslate from 'forepaas/translate'
import moment from 'moment-timezone'
import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import FpMonthRangePicker from './FpMonthRangePicker.jsx'



class FpDynamicParameterMonthsPicker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false,
      currentEvent: null
    }
    this.toggle = this.toggle.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.cancelChange = this.cancelChange.bind(this)
    this.applyChange = this.applyChange.bind(this)
  }
  componentDidMount () {
    window.addEventListener('click', this.handleClickOutside)
  }

  componentWillUnmount () {
    window.removeEventListener('click', this.handleClickOutside)
  }

  get closeOnSelect () { return this.props.config.closeOnSelect || true }
  get showActionButtons () { return this.props.config.showActionButtons || false }

  handleClickOutside () {
    this.setState({ open: false })
  }

  handleClick (e) {
    e.stopPropagation()
  }

  handleChange (e) {
    this.setState({currentEvent: e})
    if (!this.showActionButtons) {
      this.props.onChange(e)
      if (this.closeOnSelect) {
        this.setState({ open: false })
      }
    }
  }

  toggle (e) {
    if (e) e.stopPropagation()
    this.setState({
      open: !this.state.open
    })
  }

  applyChange () {
    if (this.state.currentEvent) {
      this.props.onChange(this.state.currentEvent)
      if (this.closeOnSelect) {
        this.setState({ open: false })
      }
    }
  }

  cancelChange () {
    this.setState({open: false})
  }

  getStyleDateRange (element) {
    let offset = FpSdk.Utils.offset(element)
    let isLeft = offset.left < window.innerWidth / 2
    let isBottom = offset.top > window.innerHeight / 2
    let ret = {
      position: 'absolute',
      zIndex: 100
    }
    ret.left = isLeft ? offset.left : offset.right - 695
    ret.top = isBottom ? offset.top - 340 : offset.top + offset.height + 10
    return ret
  }

  dateRange () {
    let element = document.getElementById(this.props.config.id)
    let style = this.getStyleDateRange(element)
    let dateRange = (
      <div style={style} className='datepicker-open' onClick={this.handleClick}>
        <FpMonthRangePicker
          startDate={this.props.startDate}
          endDate={this.props.endDate}
          minDate={this.props.minDate}
          maxDate={this.props.maxDate}
          ranges={this.props.ranges}
          onChange={this.handleChange}
          dayOfMonth={this.props.config.dayOfMonth}
        />
        { this.showActionButtons && (
          <div className='action-buttons'>
            <div className='action-buttons-wrapper'>
              <button onClick={this.cancelChange} className='btn btn-primary'>{FpTranslate('datepicker.days.cancel')}</button>
              <button onClick={this.applyChange} className='btn btn-success'>{FpTranslate('datepicker.days.apply')}</button>
            </div>
          </div>
        )}
      </div>
    )
    return ReactDOM.createPortal(dateRange, document.getElementById('root'))
  }

  render () {
    return (
      <div id={this.props.config.id} onClick={this.handleClick} style={this.props.config.style}>
        <div className='datepicker-close' onClick={this.toggle}>
          <span className='datepicker-close-start'>{this.props.startDate.format(this.props.format)}</span>
          <i className='datepicker-close-separator fp fp-chevron-right' />
          <span className='datepicker-close-close'>{this.props.endDate.format(this.props.format)}</span>
        </div>
        {(this.state.open) &&
          this.dateRange()
        }
      </div>
    )
  }
}

FpDynamicParameterMonthsPicker.propTypes = {
  config: PropTypes.shape({
    id: PropTypes.string,
    style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    closeOnSelect: PropTypes.bool,
    showActionButtons: PropTypes.bool,
    dayOfMonth: PropTypes.string
  }),
  startDate: PropTypes.instanceOf(moment),
  endDate: PropTypes.instanceOf(moment),
  minDate: PropTypes.instanceOf(moment),
  maxDate: PropTypes.instanceOf(moment),
  format: PropTypes.string,
  onChange: PropTypes.func,
  ranges: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
}

export default FpDynamicParameterMonthsPicker
