import { createElement as e } from 'react'
import { connect } from 'react-redux'
import { addNode, removeNode, updateNode } from './actions'

const AddNode = connect(null, {addNode})(
  ({addNode, type}) => e('button', {onClick: () => addNode(type)}, 'Add node')
)

const Node = connect(
  null,
  (dispatch, {nodeId}) => ({
    removeNode: () => dispatch(removeNode({nodeId})),
    updateNode: (node) => dispatch(updateNode({nodeId, node}))
  })
)(
  ({node, removeNode, updateNode}) => e('div', {},
    ' ',
    e('input', {
      onChange: e => updateNode({text: e.target.value}),
      value: node.text
    }),
    ' ',
    e('button', {onClick: removeNode}, 'del')
  )
)

const NodeList = ({type, nodes}) =>
  e('div', null,
    e('h2', {}, type || '(No type)'),
    nodes.entrySeq().map(
      ([nodeId, node]) => e(Node, {key: nodeId, nodeId, node})
    ),
    e(AddNode, {type})
  )

export default connect(
  state => ({
    nodesByType: state.get('nodes').groupBy(n => n.type)
  })
)(
  ({nodesByType}) => e('div', null,
    nodesByType.entrySeq().map(
      ([type, nodes]) => e(NodeList, {key: type, type, nodes})
    )
  )
)
