import { createElement as e } from 'react'
import { render } from 'react-dom'

import { compose, createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { createLogger } from 'redux-logger'

import reduceState from './reduceState'
import App from './App'

const logger = createLogger({
  stateTransformer: (state) => state.toJS()
})

const store = createStore(
  reduceState,
  compose(
    applyMiddleware(logger),
    // persistStore(db)
  )
)

render(
  e(Provider, {store}, e(App)),
  document.getElementById('root')
)
