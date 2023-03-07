import { FpDimension } from 'forepaas/formatter'
import FpQuery from 'forepaas/query-builder/FpQuery'
import FpSdk from 'forepaas/sdk'
import { set } from 'forepaas/store/querystring/action'
import FpTranslate from 'forepaas/translate'
import moment from 'moment-timezone'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import helpers from './helpers'

import './FpDynamicParameterDatepicker.less'
import 'react-date-range/dist/styles.css' // main style file
import 'react-date-range/dist/theme/default.css' // theme css file


@connect(state => ({
  querystring: state.querystring
}))
class FpDynamicParameterDatepicker extends React.Component {
  constructor(props) {
    super(props)
    let reference = ''
    let error = null
    if (this.props.reference) reference = this.props.reference.includes('range_') ? this.props.reference.replace('range_', '') : this.props.reference
    else error = FpTranslate(`datepicker.reference.error`)
    this.state = {
      open: false,
      startDate: this.evalDateString(this.props.startAt),
      endDate: this.evalDateString(this.props.endAt),
      minDate: this.evalDateString(this.props.minDate, true),
      maxDate: this.evalDateString(this.props.maxDate),
      lang: (localStorage.lang && JSON.parse(localStorage.lang)) || FpSdk.config.lang || 'en',
      format: this.props.format || new FpDimension(reference).info.format || 'DD/MM/YYYY',
      error
    }
    this.handleSelect = this.handleSelect.bind(this)
    this.getDatepicker = this.getDatepicker.bind(this)
    this.initFromModel()
  }

  componentDidMount() {
    this.min = moment.utc()
    this.max = moment.utc()
    if (this.props.disable_reference_date) {
      return this.validateAndUpdate()
    }

    let promise
    if (this.props.request) {
      promise = new Promise((resolve, reject) => {
        new FpQuery(this.props.request).compute()
          .then((data) => {
            let dateField = Object.keys(data.query_params.data.fields)[0]
            this.max = (data.query_params.data.fields[dateField].includes('max')) ? moment.utc(data.results[0].data[dateField].max[0].value) : moment.utc()
            this.min = (data.query_params.data.fields[dateField].includes('min')) ? moment.utc(data.results[0].data[dateField].min[0].value) : this.max
            resolve(true)
          })
          .catch((err) => {
            reject(err)
            this.setState({ error: FpTranslate(`datepicker.request.error`) })
          })
      })
    } else {
      promise = new Promise((resolve, reject) => {
        FpSdk.modules['query-builder'].FpDataset.compute()
          .then((dataset) => {
            this.setState({ err: null })
            let dataAvailable = dataset.data_available
            if (dataAvailable.min) this.min = moment.utc(dataAvailable.min)
            if (dataAvailable.max) this.max = moment.utc(dataAvailable.max)
            if (this.props.diamonds && this.props.diamonds.length > 0) {
              this.props.diamonds.forEach((diamond, index) => {
                diamond = dataAvailable.diamonds[diamond]
                if (diamond) {
                  if (index === 0 || this.min > moment.utc(diamond.min)) { this.min = moment.utc(diamond.min) }
                  if (index === 0 || this.max < moment.utc(diamond.max)) { this.max = moment.utc(diamond.max) }
                }
              })
            }
            resolve(true)
          })
          .catch((err) => {
            reject(err)
            this.setState({ error: FpTranslate(`datepicker.dataset.error`) })
          })
      })
    }

    promise.then(this.validateAndUpdate.bind(this))
      .catch((err) => {
        console.error(err)
      })
  }

  validateAndUpdate() {
    if (!this.min.isValid()) this.min = moment.utc()
    if (!this.max.isValid()) this.max = moment.utc()
    let values = {
      minDate: this.evalDateString(this.props.minDate, true),
      maxDate: this.evalDateString(this.props.maxDate),
      startDate: this.evalDateString(this.props.startAt),
      endDate: this.evalDateString(this.props.endAt)
    }
    this.setState({
      minDate: (values.minDate.isValid) ? values.minDate : moment.utc(),
      maxDate: (values.maxDate.isValid) ? values.maxDate : moment.utc()
    })
    if (!this.props.querystring[this.props.id]) {
      this.setState({
        startDate: (values.startDate.isValid) ? values.startDate : moment.utc(),
        endDate: (values.endDate.isValid) ? values.endDate : moment.utc()
      })
    }
    this.initRanges()
    let setter = [this.state.startDate.unix() + ',' + moment.utc(this.state.endDate).unix()]
    this.updateModel(setter)
    this.getDatepicker()
  }

  evalDateString(dateString, min) {
    let compareTo = min ? this.min : this.max
    if (dateString && moment.utc(new Date(dateString)).isValid()) {
      return moment.utc(new Date(dateString))
    }
    if (compareTo && dateString) {
      let result = new Function('date', 'return date.' + dateString)(moment.utc(compareTo))
      return result
    }
    if (dateString) {
      return new Function('date', 'return date.' + dateString)(moment.utc())
    }
    if (min) {
      return moment.utc().subtract(1, 'year').startOf('year')
    }
    return moment.utc(Date.now())
  }

  initRanges() {
    if (this.props.ranges) {
      let ranges = {}
      for (let idx in this.props.ranges) {
        let range = this.props.ranges[idx]
        ranges[FpTranslate(range.label)] = {
          startDate: this.evalDateString(range.start),
          endDate: this.evalDateString(range.end)
        }
      }
      let staticRanges = helpers.createStaticRanges(Object.entries(ranges).map(([key, { startDate, endDate }]) => { return { range: () => ({ startDate: startDate.toDate(), endDate: endDate.toDate() }), label: key } }))
      this.setState({ staticRanges })
      this.setState({ ranges })
    }
  }




  updateModel(setter) {
    if (this.props.id) {
      this.props.dispatch(set(this.props.id, setter))
    }
  }
  initFromModel() {
    if (this.props.id) {
      var model = this.props.querystring[this.props.id]
      if (model) {
        model = model[0].split(',').map((timestamp) => {
          return moment.utc(timestamp * 1000)
        })
        this.state.startDate = model[0]
        this.state.endDate = model[1]
      }
    }
  }

  handleSelect(date) {
    this.setState({
      startDate: moment.utc(date.startDate),
      endDate: moment.utc(date.endDate)
    })

    if (this.props.id && moment.utc(date.startDate).unix() !== moment.utc(date.endDate).unix()) {
      let model = this.props.querystring[this.props.id]
      let check = [moment.utc(date.startDate).unix() + ',' + moment.utc(date.endDate).unix()]
      if (JSON.stringify(check) !== JSON.stringify(model)) {
        this.updateModel(check)
      }
    }
  }

  getDatepicker() {
    let component, Picker
    component = this.props.component.split('.')
    if (component.length === 1) {
      Picker = helpers.default
    } else {
      if (!helpers[component[1]]) {
        console.error(`Component ${component[1]} for datepicker does not exists, switching to default datepicker`)
        console.error(`You can choose from this list : ${helpers.listAll.join(', ')}`)
        Picker = helpers.default
      } else {
        Picker = helpers[component[1]]
      }
    }
    this.setState({ element: Picker })
  }

  render() {
    if (this.state.error) {
      return <div className='datepicker-error'><p>{this.state.error}</p></div>
    }
    if (this.state.element) {
      let Picker = this.state.element
      return (
        <div className='datepicker'>
          <Picker config={this.props} onChange={this.handleSelect} {...this.state} />
        </div>
      )
    }
    return null
  }
}

FpDynamicParameterDatepicker.propTypes = {
  querystring: PropTypes.object,
  dispatch: PropTypes.func,
  component: PropTypes.string,
  diamonds: PropTypes.array,
  startAt: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  endAt: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  disable_reference_date: PropTypes.bool,
  format: PropTypes.string,
  ranges: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  id: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  customclass: PropTypes.string,
  request: PropTypes.object,
  reference: PropTypes.string
}
export default FpDynamicParameterDatepicker
