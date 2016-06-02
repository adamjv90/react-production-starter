import * as types from '../../constants';
import update from 'react/lib/update';

export default function wpQuery(state = {
  lastFetched: null,
  isLoading: false,
  error: null,
  data: {},
}, action) {
  switch (action.type) {
    case types.LOAD_POSTS_REQUEST:
      return update(state, {
        isLoading: { $set: true },
        error: { $set: null }
      });
    case types.LOAD_POSTS_SUCCESS:
      return update(state, {
        data: { $set: action.body },
        lastFetched: { $set: action.lastFetched },
        isLoading: { $set: false },
      });
    case types.LOAD_POSTS_FAILURE:
      return update(state, {
        error: { $set: action.error },
      });
    default:
      return state;
  }
}
