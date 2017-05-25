import { PureComponent, Component, createElement as e } from 'react'
import { jsPlumb } from 'jsplumb'

import { Map } from 'immutable'

import { debounce } from 'lodash'

export const withCanvas = NestedComponent => class extends Component {
  constructor (props) {
    super(props)
    this.jsPlumb = jsPlumb.getInstance()
    this.state = {
      endpoints: new Map()
    }
    this.repaint = debounce(() => this.jsPlumb.repaintEverything())
  }

  render () {
    return e(NestedComponent, {canvas: this, ...this.props})
  }

  setEndpointRef (endpoint, el) {
    this.setState(({endpoints}) => ({endpoints: endpoints.set(endpoint, el)}))
    this.repaint()
  }

  getEndpointRef (endpoint) {
    return this.state.endpoints.get(endpoint)
  }
}

export class Endpoint extends Component {
  render () {
    const {endpoint, canvas, ...restProps} = this.props
    const props = {
      ...restProps,
      ref: el => canvas.setEndpointRef(endpoint, el)
    }

    return e('div', props, ...props.children)
  }
}

const connectionParams = {
  detachable: false
}

export class Edge extends PureComponent {
  _getEndpointRefs ({source, target}) {
    const [sourceRef, targetRef] = [source, target].map(
      e => this.props.canvas.getEndpointRef(e),
    )
    return {
      sourceRef,
      targetRef
    }
  }

  _disconnect () {
    if (this.connection) {
      this.jsPlumb.deleteConnection(this.connection)
      this.connection = null
    }
  }

  _connect () {
    const {sourceRef, targetRef} = this.state
    if (sourceRef && targetRef) {
      this.connection = this.jsPlumb
        .connect({
          ...connectionParams,
          ...this.props.connection,
          source: sourceRef,
          target: targetRef
        })
    }
  }

  constructor (props) {
    super(props)
    this.state = this._getEndpointRefs(props)
    this.canvas = props.canvas
    this.jsPlumb = this.canvas.jsPlumb
    this.connection = null
  }

  componentWillReceiveProps (props) {
    this.setState(() => this._getEndpointRefs(props))
  }

  componentDidMount () {
    this._connect()
  }

  componentDidUpdate (_, prevState) {
    this._disconnect()
    this._connect()
  }

  componentWillUnmount () {
    this._disconnect()
  }

  render () { return null }
}
