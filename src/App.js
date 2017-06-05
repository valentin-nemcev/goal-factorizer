import { createElement as e } from 'react'
import { connect } from 'react-redux'
import { withCanvas, Endpoint, Edge } from './plumb'

import {
  nodesByType,
  edges,
  addNode,
  removeNode,
  updateNode,
  toggleNodeTargetsEditing,
  toggleTarget,
  nodeIdInTargetEditMode,
  nodeInTargetEditModeisTarget
} from './state'

const AddNode = connect(null, {addNode})(
  ({addNode, type}) => e(
    'button',
    {onClick: () => addNode({type, text: type}), style: {marginTop: '1em'}},
    'Add ' + type
  )
)

const TargetEditModeCheckbox = connect(
  (state, {node, nodeId}) => ({
    targetEdit: nodeIdInTargetEditMode(state) === nodeId
  }),
  (dispatch, {nodeId}) => ({
    toggleTargetEdit:
      (toggle) => dispatch(toggleNodeTargetsEditing({nodeId, toggle}))
  })
)(({targetEdit, toggleTargetEdit}) =>
  e('input', {
    type: 'checkbox',
    onChange: e => toggleTargetEdit(e.target.checked),
    checked: targetEdit
  })
)

const TargetCheckbox = connect(
  (state, {node, nodeId}) => ({
    someNodeInTargetEditMode: nodeIdInTargetEditMode(state) != null,
    thisNodeIsTarget: nodeInTargetEditModeisTarget(state, nodeId)
  }),
  (dispatch, {nodeId}) => ({
    toggleTarget: (toggle) => dispatch(toggleTarget({toggle, nodeId}))
  })
)(({someNodeInTargetEditMode, thisNodeIsTarget, toggleTarget}) =>
    e('input', {
      style: {visibility: someNodeInTargetEditMode ? 'visible' : 'hidden'},
      type: 'checkbox',
      checked: thisNodeIsTarget,
      onChange: e => toggleTarget(e.target.checked)
    })
)

const Node = connect(
  null,
  (dispatch, {nodeId}) => ({
    removeNode: () => dispatch(removeNode({nodeId})),
    updateNode: (node) => dispatch(updateNode({nodeId, node}))
  })
)(
  ({nodeId, node, removeNode, updateNode, canvas}) => e(
    Endpoint,
    {style: {marginTop: '1em', padding: '0 0.5em'}, canvas, endpoint: nodeId},
    e(TargetCheckbox, {node, nodeId}),
    ' ',
    e('input', {
      onChange: e => updateNode({text: e.target.value}),
      value: node.text
    }),
    ' ',
    e('button', {onClick: removeNode}, 'del'),
    e(TargetEditModeCheckbox, {node, nodeId}),
  )
)

const NodeList = ({type, nodes, canvas}) =>
  e('div', {style: {marginRight: '8em'}},
    e('h2', {}, type || '(No type)'),
    nodes.entrySeq().map(
      ([nodeId, node]) => e(Node, {key: nodeId, nodeId, node, canvas})
    ),
    e(AddNode, {type})
  )

export default connect(
  state => ({
    nodesByType: nodesByType(state),
    edges: edges(state)
  })
)(
  withCanvas(
    ({nodesByType, edges, canvas}) => e('div', {style: {display: 'flex'}},
      nodesByType.map(
        ([type, nodes]) => e(NodeList, {key: type, type, nodes, canvas})
      ),
      edges.map(
        ({sourceId, targetId}) => e(Edge, {
          source: sourceId,
          target: targetId,
          key: [sourceId, targetId].join(':'),
          connection: {
            anchors: ['Right', 'Left'],
            connector: ['Bezier', {curviness: 50}],
            endpoint: ['Rectangle', {width: 2, height: 10}]
          },
          canvas
        })
      )
    )
  )
)
