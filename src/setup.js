import R from 'ramda';
import * as most from 'most';
import { learningElement$ } from 'watcher';
import { makeEmitter, bus } from 'partybus';
import { generateUUID } from './helpers.js';
import { dataSetup } from './data.js';
import { loaded } from './loaded.js';

const configureActionplan = function({configuration, globalConfiguration, dataSource}){

  learningElement$
    .filter(el => el.getAttribute('learning-element') === 'actionplan')
    .tap(el => el.innerHTML = '<div class="mount"></div>' )
    .map(function(el){
      const sessionId = generateUUID({ prefix: 'actionplan-session' });
      const emitter = makeEmitter();
      const ref = el.getAttribute('learning-element-ref');
      const options = R.unless(R.isNil, JSON.parse)(el.getAttribute('learning-element-options'));
      const config = R.pathOr({}, [ref], configuration);
      const data = dataSetup({ sessionId, ref, options, config, dataSource });

      //TODO: best way to make decisions here using data?

      return { el, ref, sessionId, emitter, bus, data };
    })
    .tap(loaded)
    .drain();

};

export { configureActionplan };