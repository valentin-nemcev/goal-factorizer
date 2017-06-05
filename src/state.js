import { createAction, createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'
import { Map, List, OrderedMap, Record, Set } from 'immutable'

const Node = Record({text: 'Node', type: null})
const Edge = Record({sourceId: null, targetId: null})

export const addNodeWithId = createAction('addNodeWithId')
export const removeNode = createAction('removeNode')
export const updateNode = createAction('updateNode')

export const toggleNodeTargetsEditing =
  createAction('toggleNodeTargetsEditing')

export const toggleEdge = createAction('toggleEdge')

let lastId = 0
const generateId = () => String(lastId++)

export const addNode = node => dispatch => {
  const nodeId = generateId()
  dispatch(addNodeWithId({nodeId, node}))
  return nodeId
}

export const reduceState = combineReducers({
  nodes: createReducer({
    [addNodeWithId]: (nodes, {nodeId, node}) => nodes.set(nodeId, new Node(node)),
    [removeNode]: (nodes, {nodeId}) => nodes.delete(nodeId),
    [updateNode]: (nodes, {nodeId, node}) => nodes.mergeIn([nodeId], node)
  }, OrderedMap()),
  edges: createReducer({
    [toggleEdge]: (edges, {sourceId, targetId, toggle = true}) =>
      edges[toggle ? 'add' : 'delete'](new Edge({sourceId, targetId}))
  }, Set()),
  local: combineReducers({
    nodeIdInTargetEditMode: createReducer({
      [toggleNodeTargetsEditing]:
        (prevNodeId, {nodeId, toggle}) => toggle ? nodeId : null
    }, null)
  }, Map)
}, Map)

export const nodesByType = (state) =>
  List(['action', 'goal']).map(
    t => [t, state.get('nodes').filter(n => n.type === t)]
  )

export const edges = (state) => state.get('edges')

export const nodeIdInTargetEditMode =
  (state) => state.getIn(['local', 'nodeIdInTargetEditMode'])

export const nodeInTargetEditModeisTarget = (state, nodeId) =>
  state.get('edges').has(new Edge({
    sourceId: nodeIdInTargetEditMode(state),
    targetId: nodeId
  }))

export const setSampleState = (dispatch) => {
  const goalId1 = dispatch(addNode({text: 'Goal 1', type: 'goal'}))
  const goalId2 = dispatch(addNode({text: 'Goal 2', type: 'goal'}))
  const actionId1 = dispatch(addNode({text: 'Action 1', type: 'action'}))
  dispatch(addNode({text: 'Action 2', type: 'action'}))
  const actionId3 = dispatch(addNode({text: 'Action 3', type: 'action'}))

  dispatch(toggleEdge({targetId: goalId1, sourceId: actionId1}))
  dispatch(toggleEdge({targetId: goalId1, sourceId: actionId3}))
  dispatch(toggleEdge({targetId: goalId2, sourceId: actionId1}))
}
