import { createAction, createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'
import { Map, List, OrderedMap, Record, Set } from 'immutable'

const Node = Record({text: 'Node', type: null, parents: Set()})

let lastId = 0

export const addNode = createAction()
export const removeNode = createAction()
export const updateNode = createAction()

export const reduceState = combineReducers({
  nodes: createReducer({
    [addNode]: (nodes, node) => nodes.set(String(lastId++), new Node(node)),
    [removeNode]: (nodes, {nodeId}) => nodes.delete(nodeId),
    [updateNode]: (nodes, {nodeId, node}) => nodes.mergeIn([nodeId], node)
  }, OrderedMap({
    [lastId++]: new Node({text: 'Goal 1', type: 'goal', parents: Set(['2', '4'])}),
    [lastId++]: new Node({text: 'Goal 2', type: 'goal', parents: Set(['2'])}),
    [lastId++]: new Node({text: 'Action 1', type: 'action'}),
    [lastId++]: new Node({text: 'Action 2', type: 'action'}),
    [lastId++]: new Node({text: 'Action 3', type: 'action'})
  }))
}, Map)

export const getNodesByType = (state) =>
  List(['action', 'goal']).map(
    t => [t, state.get('nodes').filter(n => n.type === t)]
  )

export const getEdges = (state) =>
  state.get('nodes').entrySeq().flatMap(
    ([childId, child]) => child.parents.map(
      parentId => ({source: parentId, target: childId})
    )
  )
