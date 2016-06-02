import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';
import isUndefined from 'lodash/isUndefined';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import each from 'lodash/each';
import delay from 'lodash/delay';
import extend from 'lodash/extend';
import keys from 'lodash/keys';
import pick from 'lodash/pick';

export function track (data) {
  return new Promise((resolve, reject) => {
    function track(data) {
      const props = ['s_265_account', 'prop54', 'pfxID', 'channel', 'linkInternalFilters', 'mmxgo', 'pageName', 'prop1', 'prop3', 'prop2', 'eVar11', 'eVar17', 'authOverride', 'prop6custom', 'prop9', 'prop16', 'prop17', 'prop18', 'prop19', 'prop20', 'prop22', 'prop58', 'prop6custom', 'prop62'];

      // Wait until the omniture library is loaded into browser
      if (isUndefined(window.bN) || isUndefined(window.s_265) || isUndefined(window.s_265.t)) {
        return delay(track, 100, data);
      }

      // Delete any props set from previous ping
      each(props, (prop) => {
        if (!isUndefined(window.s_265[prop])) {
          delete window.s_265[prop];
        }
      });

      // Set some defaults
      extend(window.s_265, {
        prop54: 'vault',
        pfxID: 'smp',
        channel: 'us.smpvault',
        linkInternalFilters: `javascript:,stylemepretty.com`,
        mmxgo: true,
        s_265_account: 'aolsmp,aolsvc'
      });
      extend(window.s_265, data);
      if (!window.s_265.prop62){
        extend(window.s_265, { prop62: 'video_novideo' });
      }

      if (isObject(window.s_265) && isFunction(window.s_265.t)) {
        window.s_265.t();
      }

      if (isFunction(window.bN)) {
        window.bN.view();
      }

      resolve(pick(window.s_265, props.concat(keys(data))));
    }

    if (canUseDOM) {
      track(data);
    } else {
      reject('cannot track DataLayer events without a DOM');
    }
  });
}
