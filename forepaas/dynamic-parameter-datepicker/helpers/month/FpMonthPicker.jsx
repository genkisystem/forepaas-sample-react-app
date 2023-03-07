import FpTranslate from 'forepaas/translate'
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment-timezone'
import PropTypes from 'prop-types'
import React from 'react'
import './FpMonthPicker.less'



window.moment = moment

class FpMonthPicker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      year: (this.props.date && cloneDeep(this.props.date)) || cloneDeep(this.props.minDate),
      text: FpTranslate('datepicker.month.header.year'),
      click: 0
    }
    this.handleMonthIconClick = this.handleMonthIconClick.bind(this)
    this.selectDate = this.selectDate.bind(this)
    this.renderMonthPicker = this.renderMonthPicker.bind(this)
  }

  getDate (year, month) {
    let date = moment.utc(`${year.format('YYYY')}-${month.length === 1 ? `0${month}` : month}-01`)
    return date
  }

  handleMonthIconClick (e, action) {
    if (action === 'next') {
      this.state.year = this.state.year.add(1, 'year')
    }
    if (action === 'prev') {
      this.state.year = this.state.year.subtract(1, 'year')
    }
    this.setState(this.state)
  }

  selectDate (e, month) {
    if (e.target.getAttribute('disabled') !== null) {
      return e.preventDefault()
    }
    let state = this.state
    month = month.length > 1 ? month : `0${month}`
    let toSend = {}
    toSend = state
    this.setState(toSend)
    this.props.onChange(this.getDate(state.year, month))
  }

  renderMonthPickerHeader () {
    let nextClass = ['month-picker-button', 'next']
    let prevClass = ['month-picker-button', 'prev']
    let disabled = {
      prev: parseInt(this.state.year.format('YYYY')) <= parseInt(this.props.minDate.format('YYYY')),
      next: parseInt(this.state.year.format('YYYY')) >= parseInt(this.props.maxDate.format('YYYY'))
    }
    if (disabled.prev) prevClass.push('disabled')
    if (disabled.next) nextClass.push('disabled')
    return (
      <div className='month-picker-year'>
        <div className='month-picker-year-wrapper'>
          <button
            onClick={(e) => this.handleMonthIconClick(e, 'prev')}
            className={prevClass.join(' ')}
          >
            <i className='month-picker-icon' />
          </button>
          <span>{this.state.text} : {this.state.year.format('YYYY')}</span>
          <button
            onClick={(e) => !disabled.next && this.handleMonthIconClick(e, 'next')}
            className={nextClass.join(' ')}
          >
            <i className='month-picker-icon' />
          </button>
        </div>
      </div>
    )
  }

  isMonthDisabled (currentUnix) {
    return currentUnix < this.props.minDate.unix() || currentUnix > this.props.maxDate.endOf('month').unix()
  }

  isMonthActive (month) {
    return false
  }

  renderMonthPicker () {
    return (
      <div className='month-picker'>
        { this.renderMonthPickerHeader() }
        <ul className='month-picker-list'>
          { moment.monthsShort().map((monthString, index) => {
            let month, className, currentUnix
            month = (index + 1).toString()
            className = ['month-picker-list-item']
            currentUnix = this.getDate(this.state.year, month).unix()
            let disabled = this.isMonthDisabled(currentUnix)
            if (this.props.date.format('MMM-YYYY') === `${monthString}-${this.state.year.format('YYYY')}`) {
              className.push('active')
            }
            if (disabled) {
              className.push('disabled')
            }
            return (
              <li
                onClick={(e) => this.selectDate(e, month)}
                key={index}
                className={className.join(' ')}
                disabled={disabled}
              >
                {monthString}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  render () {
    return (
      <div className='fp-month-range-picker'>
        {this.renderMonthPicker('start')}
      </div>
    )
  }
}

FpMonthPicker.propTypes = {
  date: PropTypes.instanceOf(moment),
  minDate: PropTypes.instanceOf(moment),
  maxDate: PropTypes.instanceOf(moment),
  onChange: PropTypes.func
}

FpMonthPicker.defaultProps = {
  dayStartOfMonth: 1,
  dayEndOfMOnth: 'last'
}

export default FpMonthPicker
