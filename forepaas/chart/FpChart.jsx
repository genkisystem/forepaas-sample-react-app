import React from 'react'
import { connect } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import _mergeWith from 'lodash/mergeWith'
import _isArray from 'lodash/isArray'
import PropTypes from 'prop-types'

import FpSdk from 'forepaas/sdk'
import FpTranslate from 'forepaas/translate'
import FpLoader from 'forepaas/core-ui/loader'
import FpQueryBuilder from 'forepaas/query-builder'
import FpToolbar from './toolbar'

/**
 * This component represents a chart
 * @example
 * <FpChart id="example-chart" chart={{component:'echarts', request:{}}}></FpChart>
 */
@connect(store => ({
  store: {
    memory: store.memory,
    querystring: store.querystring
  }
}))
class FpChart extends React.Component {
  /**
   * constructor
   * @param {Object} props - Props set by the parent
   * @param {Object} props.chart - The chart element
   * @param {Object} props.chart.component - Component use by the chart,
   * can be 'echart' || 'google-chart'.
   *  The component must be installed to be used
   * @param {Object} props.chart.request - Request called on refresh to the api
   * @param {Object} [props.chart['dynamic-parameters']] - Ids of dynamic parameter link to the chart
   * @param {Object} [props.chart.options] - Options for the chart, go to the component website to discover
   *  all different possible options, example for echarts: @see https://ecomfe.github.io/echarts-doc/public/en/option.html#title
   * @param {Object} [props.chart.options.toolbar] - See {@link Toolbar}
   * @param {string} [props.customclass] - Custom className for the component
   * @param {string} [props.style] - Style set to the component
   * @param {string} props.store - This is set by the decorator, connect to Redux store
   * @param {string} [props.id] - Represent the id of the chart
   */
  constructor (props) {
    super(props)
    /** @type {Object} */
    this.style = FpSdk.config.style ? FpSdk.config.style.chart : {}

    /** @type {Array} */
    this.dynamicParameters = (Array.isArray(this.props.chart['dynamic-parameters']) && this.props.chart['dynamic-parameters']) || []
    // let configDp = FpSdk.Utils.getAllFromKey('dynamic-parameter', 'dynamic-parameter.id')
    // this.dynamicParameters = this.dynamicParameters.filter((param) => configDp.indexOf(param) !== -1)

    /** @type {Object} */
    this.chart = {
      request: {},
      options: this.props.chart.options || {}
    }
    if (FpSdk.config.debug || this.props.chart.debug) {
      this.chart.options.toolbar = this.chart.options.toolbar || {}
      this.chart.options.toolbar.items = this.chart.options.toolbar.items || []
      this.chart.options.toolbar.items.push({type: 'debug'})
    }

    // if config from templates exists, we get it here and udpate chart options and chart component if necessary
    if (FpSdk.config.templates && Object.keys(FpSdk.config.templates).includes(this.props.chart.component)) {
      const { options, component } = this.getComponentConfigRecursive(FpSdk.config.templates[this.props.chart.component], this.props.chart.component)
      const optionsMerged = _mergeWith({}, options, this.chart.options, this.mergeWithCustomizer)
      this.chart.options = optionsMerged
      if (component) this.props.chart.component = component
    }

    this.currentRequestIndex = 0
    /** @type {number} */
    this.countDynParamInit = 0
    /** @type {Object} */

    let loading = {}
    if (this.props.chart['not-nullable-dynamic-parameters']) {
      this.props.chart['not-nullable-dynamic-parameters'].forEach(dynP => { loading[dynP] = true })
    }
    this.state = {
      loading,
      noDataAvailable: false
    }
    this.reload = this.reload.bind(this)
    this.checkLoading = this.checkLoading.bind(this)
    // force reload even if all dynamic parameters are not set
    setTimeout(_ => {
      if (!this.currentRequestIndex) {
        this.countDynParamInit = this.dynamicParameters.length
        this.debounceReload()
      }
    }, 50)
  }

  get emptyResultsMessage () {
    let content = get(this.props, 'chart.options.emptyResultsMessage') || 'No data available'
    content = FpTranslate(content)
    return {
      content,
      style: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        textAlign: 'center'
      }
    }
  }

  // We use this to handle merge of array in chart options
  mergeWithCustomizer (objValue, srcValue) {
    if ((_isArray(objValue) && _isArray(srcValue)) || (_isArray(objValue) && !_isArray(srcValue)) || (!_isArray(objValue) && _isArray(srcValue))) {
      return srcValue
    }
  }

  // Go through templates recursively to get all options needed
  getComponentConfigRecursive (component, componentName = '') {
    if (!component) return {}
    if (component.extends) {
      const { options = {}, component: componentExtended = null } = this.getComponentConfigRecursive(FpSdk.config.templates[component.extends], component.extends)
      const optionsMerged = _mergeWith({}, options, component.options, this.mergeWithCustomizer)
      return {
        options: optionsMerged,
        component: component.component || componentExtended
      }
    } else {
      let options = cloneDeep(component.options) || {}

      // Check if global librairy options exist in templates and merge options
      const name = componentName.split('.')
      if (name.length > 1 && FpSdk.config.templates[name[0]] && FpSdk.modules[name[0]]) {
        options = _mergeWith({}, FpSdk.config.templates[name[0]].options, options, this.mergeWithCustomizer)
      }
      return {
        options,
        component: componentName
      }
    }
  }

  changeLoading (id) {
    id = id.split('|')[0]
    if (
      this.props.chart['not-nullable-dynamic-parameters'] &&
      this.props.chart['not-nullable-dynamic-parameters'].indexOf(id) !== -1 &&
      this.props.store.querystring[id] !== null && typeof this.props.store.querystring[id] !== 'undefined'
    ) {
      this.state.loading[id] = false
    }
  }

  /**
   * Before the component will unmounted, we unsubscribe to changes from dynamic parameter
   */
  componentWillUnmount () {
    this.checkParams = null
    this.dynamicParameters.forEach(this.unregisterToDynamicParameter.bind(this))
  }

  registerToDynamicParameter (id) {
    id = id.split('|')[0]
    this.callbacksForDynamicParameters[id] = FpSdk.modules.store.subscribeKey(`querystring.${id}`, (value) => {
      this.changeLoading(id)
      this.countDynParamInit++

      this.debounceReload()
    })
  }

  debounceReload () {
    if (this.debounce) clearTimeout(this.debounce)
    this.debounce = setTimeout(_ => {
      this.reload()
    }, get(this.props.chart, 'options.debounce') || get(FpSdk.config, 'charts.debounce') || 50)
  }

  unregisterToDynamicParameter (id) {
    id = id.split('|')[0]
    this.callbacksForDynamicParameters[id]()
  }

  /**
   * When the component is mounted we check if all dynamic parameters
   * are set. Then we reload the chart
  */
  componentDidMount () {
    this.checkParams = null
    this.callbacksForDynamicParameters = {}
    this.dynamicParameters.forEach(this.registerToDynamicParameter.bind(this))

    this.dynamicParameters.forEach((param) => {
      this.changeLoading(param)
      if (this.props.store.querystring[param] !== undefined) {
        this.countDynParamInit++
      }
    })
    this.debounceReload()
  }

  /**
   * Analyse dynamic parameter string
   * @param  {Object} dynamicParam [description]
   * @return {Object}              formatted Dynamic parameters's infos
   * @example
   * datepicker|customdate:startOf('day'):endOf('day')
   * Dynamic|(FilterFuncName default to default):(Params1 optional):...
   */
  splitDynamicParams (dynamicParam) {
    let splitDp = dynamicParam.split('|')
    let meta = this.props.store.memory[splitDp[0]] || null
    let type = meta === null || meta.type === 'void' ? 'filter' : meta.type
    let transformParams = (splitDp[1] || 'default').split(':')
    let transform = transformParams[0]
    transformParams.shift()
    return {
      name: splitDp[0],
      transform: transform,
      params: transformParams || [],
      meta: meta,
      type: type
    }
  }
  /**
   * We get the information set by the dynamic parameter
   * in the Redux memory store and set the transform for the chart to
   * work properly. The transform will change the request made to the api
   * @param {string} dynamicParam Linked parameter
   */
  updateTransformer (dynamicParam) {
    let dynParamConfig = this.splitDynamicParams(dynamicParam)
    if (!dynParamConfig.meta) return

    var model = this.props.store.querystring[dynParamConfig.name]
    this.chart.request.addDynamicParameter(dynParamConfig, model)
  }

  /**
   * Called when we reload the chart to make the set the chart request
   * @param {Boolean} [force] Force the request to be made to the api.
   * Otherwise if the request has already been made, we use the result
   *  that we already received
   */
  reset (force) {
    if (!this.query || force) {
      this.query = null
      switch (true) {
        case !!this.props.chart.response:
          this.props.chart.response.id = this.props.chart.response.id || this.props.id
          this.query = new FpQueryBuilder.FpResponse(this.props.chart.response)
          break
        case !!this.props.chart.endpoint:
          this.props.chart.endpoint.id = this.props.chart.endpoint.id || this.props.id
          this.query = new FpQueryBuilder.FpEndpoint(this.props.chart.endpoint)
          break
        case !!this.props.chart.requestId:
          this.query = new FpQueryBuilder.FpQueryStore(this.props.chart.requestId)
          break
        case !!this.props.chart.requests:
          this.props.chart.requests.id = this.props.chart.requests.id || this.props.id
          this.query = new FpQueryBuilder.FpQueries(this.props.chart.requests)
          break
        default:
          this.props.chart.request.id = this.props.chart.request.id || this.props.id
          this.query = new FpQueryBuilder.FpQuery(this.props.chart.request)
          break
      }
    }
    this.chart.request = cloneDeep(this.query)
  }

  /**
   * Show an error if the component of the chart does not exists
   *  in Forepaas.modules
   */
  showComponentError () {
    let component = this.props.chart.component.split('.')
    let error = `Chart type ${this.props.chart.component} not found.`
    let errorHtml = {
      title: cloneDeep(error)
    }
    if (FpSdk.modules[component[0]] && FpSdk.modules[component[0]].listAll) {
      error += `\nYou can choose all graphs from this list:\n`
      errorHtml.list = true
      errorHtml.charts = []
      let list = cloneDeep(FpSdk.modules[component[0]].listAll)
      list.forEach((type, index) => {
        let chartName = type.replace('./', '').replace('.js', '')
        error += `\t${chartName}\n`
        errorHtml.charts.push((
          <li key={index}>{chartName}</li>
        ))
      })
    }
    this.state.error = (
      <div className='error-component'>
        <p>{errorHtml.title}</p>
        {errorHtml.list &&
          <div className='chart-list'>
            <p>{FpTranslate('You can choose all graphs from this list:')}</p>
            <ul className='lists'>
              {errorHtml.charts}
            </ul>
          </div>
        }
      </div>
    )
    this.setState({error: this.state.error})
  }

  checkParamsValue () {
    if (!this.checkParams) return false
    let comp = {}
    this.dynamicParameters.forEach(id => {
      id = id.split('|')[0]
      comp[id] = this.props.store.querystring[id] || null
    })
    return isEqual(comp, this.checkParams)
  }
  /**
   * Make the request to the api and then update the content of the chart
   * @param {Boolean} [force] Force the chart to be reload
   */
  reload (force) {
    // This is to reload only when all dynamic-parameters are set
    if (this.countDynParamInit < this.dynamicParameters.length || this.checkLoading()) {
      return
    }
    if (!force && this.checkParamsValue()) return
    this.reset(force)

    this.checkParams = {}
    this.dynamicParameters.forEach(id => {
      this.updateTransformer(id)
      this.checkParams[id] = cloneDeep(this.props.store.querystring[id]) || null
    })
    if (this.refs['fp-chart'] && !this.props.chart.noReload) {
      this.setState({element: null, error: null})
    }
    // Since reload can be debounced, we update the index of the latest request
    this.currentRequestIndex++
    let requestIndex = this.currentRequestIndex
    // If autoload set to false, we will render the component without launch the request, it will need a launch of the query inside the component
    if (this.props.chart.autoload === false) {
      let component = this.getComponent()
      if (!component) {
        return this.showComponentError()
      }
      this.state.element = React.createElement(component, {
        chart: this.chart,
        component: this.props.chart.component,
        style: this.props.style,
        reload: this.reload
      })
      if (this.refs['fp-chart']) {
        this.setState({element: this.state.element})
      }
      return
    }
    if (!force && !this.chart.request.cache) {
      force = true
    }
    this.chart.request.compute(null, !force)
      .then((data) => {
        if (this.currentRequestIndex !== requestIndex) return false
        this.chart.data = data
        if (this.chart.data && this.chart.data.results && !this.chart.options.disableNoDataHandler) {
          this.setState({ noDataAvailable: !(this.chart.data.results.length) })
        }
        let component = this.getComponent()
        if (!component) {
          return this.showComponentError()
        }
        this.state.element = React.createElement(component, {
          chart: this.chart,
          component: this.props.chart.component,
          style: this.props.style,
          reload: this.reload
        })
        if (this.refs['fp-chart']) {
          this.setState({element: this.state.element})
        }
      })
      .catch((err) => {
        console.error(err)
        this.state.error = (
          <div className='fp-error-query'>
            <p>{FpTranslate('chart.wrong_query')}</p>
            <p className='refresh' onClick={() => this.reload(true)}>{FpTranslate('chart.refresh')}<i className='fa fa-refresh' /></p>
          </div>
        )
        this.setState({error: this.state.error})
      })
  }

  /**
   * Methods use to get the component used by the chart
   * @return {React.Component|null} Component used by the chart
   * @example
   * this.props.chart.component = 'echarts'
   * let component = this.getComponent()
   * <caption>component will be equal to Echarts</caption>
   */
  getComponent () {
    let component = this.props.chart.component.split('.')
    if (FpSdk.modules['chart-' + this.props.chart.component]) return FpSdk.modules['chart-' + this.props.chart.component].default || FpSdk.modules['chart-' + this.props.chart.component]
    if (!FpSdk.modules[component[0]]) return null
    if (component.length === 1) { return FpSdk.modules[component[0]]['default'] } else { return FpSdk.modules[component[0]][component[1]] }
  }

  checkLoading () {
    if (this.props.chart['not-nullable-dynamic-parameters']) {
      let check = this.props.chart['not-nullable-dynamic-parameters'].some(dynP => {
        dynP = dynP.split('|')[0]
        return this.state.loading[dynP] === true
      })
      return check
    }
    return false
  }
  /**
   * render
   * @return {ReactElement} markup
   */
  render () {
    let content
    if (this.checkLoading()) {
      content = <FpLoader />
    } else if (this.state.noDataAvailable) {
      content = (this.chart.options.noDataAvailable &&
        <div className='fp-chart-no-data' dangerouslySetInnerHTML={{ __html: this.chart.options.noDataAvailable }} />) ||
        (FpSdk.config.noDataAvailable &&
        <div className='fp-chart-no-data' dangerouslySetInnerHTML={{ __html: FpSdk.config.noDataAvailable }} />) ||
        (
          <div className='fp-chart-empty' style={this.emptyResultsMessage.style}>
            <i className='fa fa-2x fa-ban' />
            <div className='content-error'>{this.emptyResultsMessage.content}</div>
          </div>
        )
    } else if (this.state.element) {
      content = (
        <div className='fp-chart-content'>
          {this.state.element}
          {this.chart.options.toolbar &&
            <FpToolbar reload={this.reload} chart={this.chart} options={this.chart.options.toolbar} />
          }
        </div>
      )
    } else if (this.state.error) {
      content = (
        <div className='fp-chart-error'>
          <div className='content-error'>
            {this.state.error}
          </div>
        </div>
      )
    } else {
      content = <FpLoader />
    }
    return (
      <div ref='fp-chart' className={'fp-chart ' + this.props.customclass}>
        {content}
      </div>
    )
  }
}

FpChart.propTypes = {
  chart: PropTypes.shape({
    autoload: PropTypes.Boolean,
    component: PropTypes.string,
    'dynamic-parameters': PropTypes.Array,
    'not-nullable-dynamic-parameters': PropTypes.array,
    response: PropTypes.object,
    endpoint: PropTypes.object,
    requests: PropTypes.object,
    requestId: PropTypes.string,
    request: PropTypes.object,
    options: PropTypes.object,
    debug: PropTypes.bool
  }),
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  customclass: PropTypes.string,
  store: PropTypes.object,
  id: PropTypes.string
}

FpChart.defaultProps = Object.create({}, {
  id: {
    enumerable: true,
    get: () => String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Date.now()
  },
  chart: {
    enumerable: true,
    get () { return {} }
  }
})

export default FpChart
