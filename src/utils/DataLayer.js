import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';
import isUndefined from 'lodash/isUndefined';
import delay from 'lodash/delay';
import each from 'lodash/each';

export function trackEvent (type, attributes) {
  return new Promise((resolve, reject) => {
    function track(type, attributes) {
      if (isUndefined(window.bN)) {
        return delay(track, 100, type, attributes);
      }

      window.bN_cfg = { h: location.hostname };

      each(attributes, (val, key) => window.bN.set(key, val));

      window.bN.ping(type);

      resolve({ type, attributes: attributes });
    }

    if (canUseDOM) {
      track(type, attributes);
    } else {
      reject('cannot track DataLayer events without a DOM');
    }
  });
}
