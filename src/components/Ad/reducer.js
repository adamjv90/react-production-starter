import * as types from '../../constants';
import update from 'react/lib/update';

export default function ad(state = {}, action) {
  switch (action.type) {
    case types.AD_LOADED:
      return update(state, {
        [action.id] : {
          $set: {
            width: action.width,
            height: action.height
          }
        }
      });
    default:
      return state;
  }
}
