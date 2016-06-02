import {
  LOAD_POSTS_REQUEST,
  LOAD_POSTS_SUCCESS,
  LOAD_POSTS_FAILURE,
} from '../../constants';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';
import http from '../../utils/HttpClient';

export function loadPosts() {
  return {
    // Types of actions to emit before and after
    types: [LOAD_POSTS_REQUEST, LOAD_POSTS_SUCCESS, LOAD_POSTS_FAILURE],

    // Check the cache (optional):
    shouldCallAPI: (state) => {
      return !canUseDOM;
    },
    // Perform the fetching:
    callAPI: () => http.get(`http://ec2-54-209-252-231.compute-1.amazonaws.com/api/wordpress/posts`),

    // Arguments to inject in begin/end actions
    // payload: { slug },
  };
}

export function loadPost() {
  return {
    // Types of actions to emit before and after
    types: [LOAD_POST_REQUEST, LOAD_POST_SUCCESS, LOAD_POST_FAILURE],

    // Check the cache (optional):
    // shouldCallAPI: (state) => shouldFetchPost(state),

    // Perform the fetching:
    callAPI: () => http.get(`/api/v0/post/${slug}`),

    // Arguments to inject in begin/end actions
    payload: { slug },
  };
}
