import FpSdk from 'forepaas/sdk'
import FpTranslate from 'forepaas/translate'
import moment from 'moment-timezone'
import PropTypes from 'prop-types'
import React from 'react'
import * as locales from 'react-date-range/dist/locale'
import { Calendar } from 'react-date-range'
import ReactDOM from 'react-dom'

class FpDynamicParameterDaysPicker extends React.Component {
  constructor(props) {
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

  componentDidMount() { window.addEventListener('click', this.handleClickOutside) }
  componentWillUnmount() { window.removeEventListener('click', this.handleClickOutside) }

  get closeOnSelect() { return this.props.config.closeOnSelect || true }
  get showActionButtons() { return this.props.config.showActionButtons || false }

  endDate(event) { return moment.utc(`${event.toDateString()} 23:59:59`) }
  startDate(event) { return moment.utc(`${event.toDateString()} 00:00:00`) }
  handleClickOutside() { this.setState({ open: false }) }
  handleClick(e) { e.stopPropagation() }
  cancelChange() { this.setState({ open: false }) }

  handleChange(e) {
    this.setState({ currentEvent: e })
    if (!this.showActionButtons) {
      this.props.onChange({
        startDate: this.startDate(e),
        endDate: this.endDate(e)
      })
      if (this.closeOnSelect) {
        this.setState({ open: false })
      }
    }
  }

  toggle(e) {
    if (e) e.stopPropagation()
    this.setState({
      open: !this.state.open
    })
  }

  applyChange() {
    if (this.state.currentEvent) {
      this.props.onChange({
        startDate: this.startDate(this.state.currentEvent),
        endDate: this.endDate(this.state.currentEvent)
      })
      if (this.closeOnSelect) {
        this.setState({ open: false })
      }
    }
  }

  getStyleDatepicker(element) {
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

  datepicker() {
    const lang = Object.keys(locales).includes(this.props.lang) ? this.props.lang : 'enUS'
    let element = document.getElementById(this.props.config.id)
    let style = this.getStyleDatepicker(element)
    let calendar = (
      <div style={style} className='datepicker-open' onClick={this.handleClick}>
        <Calendar
          locale={locales[lang]}
          date={this.props.startDate.toDate()}
          minDate={this.props.minDate.toDate()}
          maxDate={this.props.maxDate.toDate()}
          format={this.props.format}
          onChange={this.handleChange}
        />
        {this.showActionButtons && (
          <div className='action-buttons'>
            <div className='action-buttons-wrapper'>
              <button onClick={this.cancelChange} className='btn btn-primary'>{FpTranslate('datepicker.days.cancel')}</button>
              <button onClick={this.applyChange} className='btn btn-success'>{FpTranslate('datepicker.days.apply')}</button>
            </div>
          </div>
        )}
      </div>
    )
    return ReactDOM.createPortal(calendar, document.getElementById('root'))
  }

  render() {
    return (
      <div id={this.props.config.id} onClick={this.handleClick} style={this.props.config.style}>
        <div className='datepicker-close' onClick={this.toggle}>
          <span className='datepicker-close-start'>{this.props.startDate.format(this.props.format)}</span>
        </div>
        {(this.state.open) &&
          this.datepicker()
        }
      </div>
    )
  }
}

FpDynamicParameterDaysPicker.propTypes = {
  config: PropTypes.shape({
    id: PropTypes.string,
    style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    closeOnSelect: PropTypes.bool,
    showActionButtons: PropTypes.bool
  }),
  lang: PropTypes.string,
  startDate: PropTypes.instanceOf(moment),
  minDate: PropTypes.instanceOf(moment),
  maxDate: PropTypes.instanceOf(moment),
  format: PropTypes.string,
  onChange: PropTypes.func
}

export default FpDynamicParameterDaysPicker
