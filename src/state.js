import { createAction, createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'
import { Map, List, OrderedMap, Record, Set } from 'immutable'

const Node = Record({text: 'Node', type: null, parents: Set()})

export const addNodeWithId = createAction('addNodeWithId')
export const removeNode = createAction('removeNode')
export const updateNode = createAction('updateNode')

export const toggleNodeParentsEditing =
  createAction('toggleNodeParentsEditing')

export const toggleParent = createAction('toggleParent')

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
    [updateNode]: (nodes, {nodeId, node}) => nodes.mergeIn([nodeId], node),
    [toggleParent]: (nodes, {childNodeId, parentNodeId, toggle = true}) =>
      nodes.updateIn(
        [childNodeId, 'parents'],
        parents => parents[toggle ? 'add' : 'delete'](parentNodeId)
      )
  }, OrderedMap({
  })),
  local: combineReducers({
    nodeInParentEditMode: createReducer({
      [toggleNodeParentsEditing]:
        (prevNodeId, {nodeId, toggle}) => toggle ? nodeId : null
    }, null)
  }, Map)
}, Map)

export const nodesByType = (state) =>
  List(['action', 'goal']).map(
    t => [t, state.get('nodes').filter(n => n.type === t)]
  )

export const edges = (state) =>
  state.get('nodes').entrySeq().flatMap(
    ([childId, child]) => child.parents.map(
      parentId => ({source: parentId, target: childId})
    )
  )

export const nodeInParentEditMode =
  (state) => state.getIn(['local', 'nodeInParentEditMode'])

export const nodeInParentEditModeisParent = (state, node) => {
  return node.parents.has(nodeInParentEditMode(state))
}

export const setSampleState = (dispatch) => {
  const goalId1 = dispatch(addNode({text: 'Goal 1', type: 'goal'}))
  const goalId2 = dispatch(addNode({text: 'Goal 2', type: 'goal'}))
  const actionId1 = dispatch(addNode({text: 'Action 1', type: 'action'}))
  dispatch(addNode({text: 'Action 2', type: 'action'}))
  const actionId3 = dispatch(addNode({text: 'Action 3', type: 'action'}))

  dispatch(toggleParent({childNodeId: goalId1, parentNodeId: actionId1}))
  dispatch(toggleParent({childNodeId: goalId1, parentNodeId: actionId3}))
  dispatch(toggleParent({childNodeId: goalId2, parentNodeId: actionId1}))
}
