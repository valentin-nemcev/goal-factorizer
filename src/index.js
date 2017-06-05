import { createElement as e } from 'react'
import { render } from 'react-dom'

import { compose, createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { createLogger } from 'redux-logger'

import { reduceState, setSampleState } from './state'
import App from './App'

const logger = createLogger({
  stateTransformer: (state) => state.toJS()
})

const store = createStore(
  reduceState,
  compose(
    applyMiddleware(thunk),
    applyMiddleware(logger)
    // persistStore(db)
  )
)

window.store = store

setSampleState(store.dispatch)

render(
  e(Provider, {store}, e(App)),
  document.getElementById('root')
)
