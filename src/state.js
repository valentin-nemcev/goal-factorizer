import { createAction, createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'
import { Map, List, OrderedMap, Record, Set } from 'immutable'

const Node = Record({text: 'Node', type: null, parents: Set()})

let lastId = 0

export const addNode = createAction('addNode')
export const removeNode = createAction('removeNode')
export const updateNode = createAction('updateNode')

export const toggleNodeParentsEditing =
  createAction('toggleNodeParentsEditing')

export const toggleParent = createAction('toggleParent')

export const reduceState = combineReducers({
  nodes: createReducer({
    [addNode]: (nodes, node) => nodes.set(String(lastId++), new Node(node)),
    [removeNode]: (nodes, {nodeId}) => nodes.delete(nodeId),
    [updateNode]: (nodes, {nodeId, node}) => nodes.mergeIn([nodeId], node),
    [toggleParent]: (nodes, {childNodeId, parentNodeId, toggle}) =>
      nodes.updateIn(
        [childNodeId, 'parents'],
        parents => parents[toggle ? 'add' : 'delete'](parentNodeId)
      )
  }, OrderedMap({
    [lastId++]: new Node({text: 'Goal 1', type: 'goal', parents: Set(['2', '4'])}),
    [lastId++]: new Node({text: 'Goal 2', type: 'goal', parents: Set(['2'])}),
    [lastId++]: new Node({text: 'Action 1', type: 'action'}),
    [lastId++]: new Node({text: 'Action 2', type: 'action'}),
    [lastId++]: new Node({text: 'Action 3', type: 'action'})
  })),
  local: combineReducers({
    parentEditNode: createReducer({
      [toggleNodeParentsEditing]:
        (prevNodeId, {nodeId, toggle}) => toggle ? nodeId : null
    }, null)
  }, Map)
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
