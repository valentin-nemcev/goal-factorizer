import { createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'
import { Map, OrderedMap, Record } from 'immutable'

import { addGoal, removeGoal, updateGoal } from './actions'

const Goal = Record({text: 'Goal'})

let lastId = 0

export default combineReducers({

  goals: createReducer({
    [addGoal]: (goals) => goals.set(lastId++, new Goal()),
    [removeGoal]: (goals, {goalId}) => goals.delete(goalId),
    [updateGoal]: (goals, {goalId, goal}) => goals.mergeIn([goalId], goal)
  }, OrderedMap({
    [lastId++]: new Goal({text: 1}),
    [lastId++]: new Goal({text: 2})
  }))
}, Map)
