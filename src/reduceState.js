import { createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'
import { Map, OrderedMap, Record } from 'immutable'

import { addNode, removeNode, updateNode } from './actions'

const Node = Record({text: 'Goal', type: null})

let lastId = 0

export default combineReducers({

  nodes: createReducer({
    [addNode]: (nodes, type) => nodes.set(lastId++, new Node({type})),
    [removeNode]: (nodes, {nodeId}) => nodes.delete(nodeId),
    [updateNode]: (nodes, {nodeId, node}) => nodes.mergeIn([nodeId], node)
  }, OrderedMap({
    [lastId++]: new Node({text: 'Goal 1', type: 'goal'}),
    [lastId++]: new Node({text: 'Goal 2', type: 'goal'}),
    [lastId++]: new Node({text: 'Action 1', type: 'action'}),
    [lastId++]: new Node({text: 'Action 2', type: 'action'}),
    [lastId++]: new Node({text: 'Action 3', type: 'action'})
  }))
}, Map)
