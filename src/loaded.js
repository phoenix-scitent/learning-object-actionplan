import R from 'ramda';
import * as most from 'most';
import classie from 'desandro-classie';
import { generateUUID } from './helpers.js';

var snabbdom = require('snabbdom');
var h = require('snabbdom/h').default;
var patch = snabbdom.init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/attributes').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/eventlisteners').default
]);

import virtualize from 'snabbdom-virtualize';

// makeSnabbdomClasses('class1 class2 class3') === { class1: true, class2: true, class3: true }
var makeSnabbdomClasses = R.ifElse(R.either(R.isNil, R.isEmpty), R.always({}), R.compose(R.mergeAll, R.map(R.objOf(R.__, true)), R.split(' ')));

var loaded = function(learningElement){
  var { el, ref, sessionId, emitter, bus, data, globalConfiguration, config } = learningElement;

  var teardown$ = most.fromEvent(`teardown`, emitter).take(1);

  ///////////
  // view //
  /////////

  //var handleTrueFalseResponse = function(context){
  //  return event => {
  //    console.log(context, event);
  //  }
  //};
  //
  //var trueFalseQuestion = function(questionData){
  //  var query = R.pathOr('', ['query'], questionData);
  //  var responses = R.pathOr({}, ['responses'], questionData);
  //  var trueResponseHtml = responses.true.markup;
  //  var falseResponseHtml = responses.false.markup;
  //
  //  // randomize order of responses? option on the question and the assessment level?
  //
  //  // {"id":"500567","type":"trueFalse","weight":3,"topics":["200457"],"relations":["500568"],"correctives":["300403"],"context":["Course 1"],"title":"Measure 1","query":"Is this orange?","responses":{"true":{"value":"Yes","markup":"<button>Yes</button>","feedback":"<p style=\"color:green;\">Correct!</p>"},"false":{"value":"No","markup":"<button>No</button>","feedback":"<p style=\"color:red;\">Incorrect :(</p>"}},"actions":{}}
  //
  //  return h('div', {}, [
  //    h('div', {}, query),
  //    h('div', {}, [
  //      h('div', { on: { click: handleTrueFalseResponse({ question: questionData, response: responses.true }) } }, virtualize(trueResponseHtml)),
  //      h('div', { on: { click: handleTrueFalseResponse({ question: questionData, response: responses.false }) } }, virtualize(falseResponseHtml))
  //    ])
  //  ]);
  //};
  //
  //var question = function(questionData){
  //  return h('div', { class: { 'assessment-question': true, 'row': true } }, [
  //    h('div', { class: { [`assessment-${R.prop('type', questionData)}`]: true, 'col-xs-12': true } }, [
  //      h('div', { class: { 'box': true } }, [
  //        R.cond([
  //          [R.propEq('type', 'trueFalse'), trueFalseQuestion],
  //          [R.T, R.always('')]
  //        ])(questionData)
  //      ])
  //    ])
  //  ]);
  //};
  //
  //var mountedNext = function(model){
  //  var next = R.pathOr('', ['assessment', 'next'], model);
  //
  //  return wrapper(model, 'mountedNext', [
  //    question(next)
  //  ]);
  //};

  //////////////
  // question //
  //////////////

  var questionTitle = function(model){
    var element = R.pathOr('p', ['data', 'config', 'element', 'meta', 'markup', 'element'], model);
    var classes = R.pathOr('', ['data', 'config', 'element', 'meta', 'markup', 'classes'], model);
    var title = R.pathOr('---', ['data', 'config', 'element', 'meta', 'text'], model);

    return h('div', {}, [
      h(element, { class: makeSnabbdomClasses(classes) }, title)
    ])
  };

  var handleEditorEntry = function(elm, text, context){
    most.fromEvent('input', elm)
      .debounce(700)
      .map(event => ({ value: event.target.value, ref: event.target.dataset.ref }))
      .tap((data) => { emitter.emit('intent', { type: 'setValue', context: { value: data.value, text, context  } }) })
      .takeUntil(teardown$)
      .drain();
  };

  var editor = function(model){
    var placeholder = R.pathOr('', ['data', 'config', 'element', 'meta', 'placeholder'], model);
    var text = R.pathOr('', ['data', 'config', 'element', 'meta', 'text'], model);
    var context = R.pathOr('', ['data', 'config', 'element', 'meta', 'context'], model);
    var value = R.pathOr('', ['takeaway', ref, 'value'], model);

    var insert = function(vnode){ handleEditorEntry(vnode.elm, text, context); };

    return h('textarea', { attrs: { placeholder, [`data-ref`]: ref }, props: { value }, hook: { insert } }, []);
  };

  var question = function(model){
    var prehead = R.pathOr('', ['data', 'config', 'element', 'html', 'prehead'], model);
    var prebody = R.pathOr('', ['data', 'config', 'element', 'html', 'prebody'], model);
    var prefoot = R.pathOr('', ['data', 'config', 'element', 'html', 'prefoot'], model);

    return h('div', { class: { 'question': true } }, [
      virtualize(prehead),
      questionTitle(model),
      virtualize(prebody),
      editor(model),
      virtualize(prefoot)
    ]);
  };

  //////////////
  // takeaway //
  //////////////

  var takeawaySection = function(model){
    return function(sectionData, ref){
      // sectionData :: { value: '', text: '', context: [ section, date ] }
      var element = R.pathOr('ul', ['data', 'config', 'element', 'meta', 'each', 'markup', 'child', 'element'], model);
      var classes = R.pathOr('', ['data', 'config', 'element', 'meta', 'each', 'markup', 'child', 'classes'], model);
      var questionElement = R.pathOr('ul', ['data', 'config', 'element', 'meta', 'each', 'markup', 'inner', 'question', 'element'], model);
      var questionClasses = R.pathOr('', ['data', 'config', 'element', 'meta', 'each', 'markup', 'inner', 'question', 'classes'], model);
      var responseElement = R.pathOr('ul', ['data', 'config', 'element', 'meta', 'each', 'markup', 'inner', 'response', 'element'], model);
      var responseClasses = R.pathOr('', ['data', 'config', 'element', 'meta', 'each', 'markup', 'inner', 'response', 'classes'], model);
      var contextSectionElement = R.pathOr('ul', ['data', 'config', 'element', 'meta', 'each', 'markup', 'inner', 'context', 'section', 'element'], model);
      var contextSectionClasses = R.pathOr('', ['data', 'config', 'element', 'meta', 'each', 'markup', 'inner', 'context', 'section', 'classes'], model);
      var contextDateElement = R.pathOr('ul', ['data', 'config', 'element', 'meta', 'each', 'markup', 'inner', 'context', 'date', 'element'], model);
      var contextDateClasses = R.pathOr('', ['data', 'config', 'element', 'meta', 'each', 'markup', 'inner', 'context', 'date', 'classes'], model);
      var contextSectionShouldDisplay = R.pathOr(false, ['data', 'config', 'element', 'meta', 'each', 'markup', 'inner', 'context', 'section', 'display'], model);
      var contextDateShouldDisplay = R.pathOr(false, ['data', 'config', 'element', 'meta', 'each', 'markup', 'inner', 'context', 'date', 'display'], model);

      var value = R.compose(
        virtualize,
        R.join(''),
        R.map(function(line){ return `<p>${line}</p>` }),
        R.split('\n'),
        R.pathOr('---', ['value'])
      )(sectionData);

      var text = R.pathOr('---', ['text'], sectionData);
      var context = R.pathOr([], ['context'], sectionData);
      var section = R.pathOr('---', [0], context);
      var date = R.pathOr('---', [1], context);

      return h(element, { class: R.merge(makeSnabbdomClasses(classes), { 'takeaway-section': true }) }, [
        h(questionElement, { class: makeSnabbdomClasses(questionClasses) }, text),
        contextSectionShouldDisplay ? h(contextSectionElement, { class: makeSnabbdomClasses(contextSectionClasses) }, section) : '',
        contextDateShouldDisplay ? h(contextDateElement, { class: makeSnabbdomClasses(contextDateClasses) }, date) : '',
        h(responseElement, { class: makeSnabbdomClasses(responseClasses) }, value)
      ]);
    }
  };

  var takeawayBody = function(model){
    var loaderHtml = R.pathOr(null, ['data', 'config', 'element', 'loader'], model);
    var element = R.pathOr('ul', ['data', 'config', 'element', 'meta', 'each', 'markup', 'parent', 'element'], model);
    var classes = R.pathOr('', ['data', 'config', 'element', 'meta', 'each', 'markup', 'parent', 'classes'], model);
    var takeaways = R.pathOr({}, ['takeaway'], model);
    var sections = R.compose(
      R.values,
      R.mapObjIndexed(takeawaySection(model))
    )(takeaways);

    //TODO: section ordering done here?

    if(sections.length > 0){
      return h(element, { class: makeSnabbdomClasses(classes) }, sections);
    } else {
      return loaderHtml ? h('div', {}, [ virtualize(loaderHtml) ]) : h('div', {}, '');
    }
  };

  var takeawayHead = function(model){
    var element = R.pathOr('p', ['data', 'config', 'element', 'meta', 'markup', 'element'], model);
    var classes = R.pathOr('', ['data', 'config', 'element', 'meta', 'markup', 'classes'], model);
    var title = R.pathOr('Your Takeaway:', ['data', 'config', 'element', 'meta', 'markup', 'title'], model);
    return h(element, { class: makeSnabbdomClasses(classes) }, title);
  };

  var takeaway = function(model){
    var prehead = R.pathOr('', ['data', 'config', 'element', 'html', 'prehead'], model);
    var prebody = R.pathOr('', ['data', 'config', 'element', 'html', 'prebody'], model);
    var prefoot = R.pathOr('', ['data', 'config', 'element', 'html', 'prefoot'], model);

    return h('div', { class: { 'takeaway': true } }, [
      virtualize(prehead),
      takeawayHead(model),
      virtualize(prebody),
      h('div', { class: { 'takeaway-sections': true } }, takeawayBody(model)),
      virtualize(prefoot)
    ]);
  };

  //////////
  // base //
  //////////

  var wrapper = function(model, mode, children){
    return h('div', { class: { 'actionplan': true, 'row': true, [`actionplan-mode-${mode}`]: true } }, [
      h('div', { class: { [`actionplan-${mode}`]: true, 'col-xs-12': true } }, [
        h('div', { class: { 'box': true } }, [
          //JSON.stringify(model),
          ...children
        ])
      ])
    ]);
  };

  var start = function(model){
    return wrapper(model, 'start', [
      R.cond([
        [R.pathEq(['data', 'config', 'element', 'type'], 'takeaway'), takeaway],
        [R.pathEq(['data', 'config', 'element', 'type'], 'question'), question],
        [R.T, R.always('---')]
      ])(model)
    ]);
  };

  var loading = function(model){
    var loaderHtml = R.pathOr(null, ['data', 'config', 'element', 'loader'], model);

    if(loaderHtml){
      return wrapper(model, 'loading', [
        h('div', {}, [
          virtualize(loaderHtml)
        ])
      ])
    } else {
      return wrapper(model, 'loading', [])
    }
  };

  var vdom = function(model){
    var dataHasNotLoaded = R.compose(R.pathEq(['data', 'config'], undefined));

    return R.ifElse(
        R.anyPass([
          dataHasNotLoaded
        ]),
        loading,
        R.cond([
          [R.propEq('mode', 'start'), start],
          //[R.propEq('mode', 'pickNext'), start],
          ////[R.propEq('mode', 'pickedNext'), start],
          //[R.propEq('mode', 'mountNext'), mountedNext],
          ////[R.propEq('mode', 'mountedNext'), start],
          //[R.propEq('mode', 'mountProgress'), start],
          ////[R.propEq('mode', 'mountedProgress'), start],
          //[R.propEq('mode', 'mountCompleted'), start],
          ////[R.propEq('mode', 'mountedCompleted'), start],
          [R.T, loading]
        ])
    )(model);
  };

  //////////////////////
  // update machinery //
  //////////////////////

  var modelSeed = {
    loader: R.pathOr('', ['loader'], globalConfiguration)
  };

  var mountSeed = el.querySelector('.mount');

  var intentSeed = { type: 'init', context: {} };

  /////////
  // NAP //
  /////////

  var shouldStart = function(model){
    //NOTE: this may be called many times (because many events get onto the stream and run in context of nil mode?)
    emitter.emit('intent', { type: 'changeMode', context: { mode: 'start' } });

    emitter.emit('internal', { type: 'action', context: { type: 'lifecycle', rule: 'shouldStart', ref } });

  };

  var nap = function(lastModel, model){
    // TODO: nap and vdom both use these 'state indicators' to make decision about actions to take... maybe create them in earlier function and pass into them both for use along with the model?
    var dataHasLoaded = R.compose(R.not, R.pathEq(['data', 'config'], undefined))(model);
    var isMode = (mode) => R.pathSatisfies(R.equals(mode), ['mode'], model);
    var duplicateMode = R.eqProps('mode', lastModel, model);

    var isBeginState = R.pathSatisfies(R.isNil, ['mode'], model) && dataHasLoaded;
    var isStartState = isMode('start') && !duplicateMode;

    if(isBeginState){
      shouldStart(model);
    }

    //if(isStartState){
    //  shouldContinue(model)
    //}

    return model;

  };

  /////////////
  // persist //
  /////////////

  var persist = function(model){
    var planId = R.pathOr('---', ['data', 'config', 'plan', 'id'], model);
    var value = R.pathOr(null, ['value'], model);
    var isNewTakeaway = R.pathOr(null, ['newTakeaway'], model);
    var takeaway = R.pathOr({}, ['takeaway'], model);
    var newPlan = { [planId]: takeaway };

    if(isNewTakeaway){
      emitter.emit('data::setActionplanData', newPlan);
      emitter.emit('bus::sendMessage', { id: planId, ref, type: 'newPlan', context: { newPlan } });
      emitter.emit('intent', { type: 'setNewTakeaway', context: { newTakeaway: false } });
    }

    return model;

  };

  /////////////////////
  // present/propose //
  /////////////////////

  var present = function(model, intent){
    // intent { type: 'updateChangeModeToPickNext', { next: { ... }, mode: 'pickNext' } }
    // proposal { model, intent, errors }

    // validation :: proposal -> proposal' (errors added if applicable)
    // transformation :: proposal -> proposal' (if error adds error data to model, if no error transforms model)

    // TODO: transaction: [Either, Either, Either] if any fail dont run model updates
    // TODO: use monadic solution? Either, fold, etc...

    // { errors: [] } //seperate from model? so they are not trampled on

    // TODO: async for remote communication?
    //most.of({ model, intent, errors: {} })
    //  .map(validate)
    //  .map(transform)
    //  .map(R.prop('model'))

    emitter.emit('internal', { step: 'present:intent', context: JSON.stringify(intent) });

    var validateMode = R.ifElse(
      R.compose(R.has('mode'), R.pathOr({}, ['intent', 'context'])),
      R.compose(R.identity), //TODO: write validations, if fail add to proposal.errors, if pass update proposal.model
      R.identity
    );

    //var validateNext = R.ifElse(
    //    R.compose(R.has('next'), R.propOr({}, ['intent', 'context'])),
    //    R.compose(R.identity), //TODO: write validations, if fail add to proposal.errors, if pass update proposal.model
    //    R.identity
    //);

    var validations = [ // add to errors obj if necessary
      validateMode
      //validateNext
    ];

    var validate = R.reduce((proposal, validation) => { return validation(proposal); }, R.__, validations);

    var updateMode = proposal => {
      var intent = R.prop('intent', proposal);
      return R.ifElse(
        R.compose(R.has('mode'), R.path(['intent', 'context'])),
        R.assocPath(['model', 'mode'], R.path(['context', 'mode'], intent)),
        R.identity
      )(proposal);
    };

    //var updateNext = proposal => {
    //  // TODO: situations for pull are: set 'wait state', send 'request', state update upon return... reactor logic, firebase once, ...? best practices?
    //
    //  var pickNextAlgorithm = R.compose(R.head);
    //  var getNext = R.compose(pickNextAlgorithm, R.pathOr([], ['model', 'data', 'measureBank'])); //TODO: add logic for remote fetch...
    //  return R.ifElse(
    //      R.pathEq(['intent', 'type'], 'changeModeToMountNext'),
    //      R.assocPath(['model', 'assessment', 'next'], getNext(proposal)),
    //      R.identity
    //  )(proposal);
    //};

    var updateConfig = proposal => {
      var intent = R.prop('intent', proposal);
      return R.ifElse(
          R.compose(R.has('config'), R.path(['intent', 'context'])),
          R.assocPath(['model', 'data', 'config'], R.path(['context', 'config'], intent)),
          R.identity
      )(proposal);
    };

    var updateActionplanData = proposal => {
      var intent = R.prop('intent', proposal);

      return R.ifElse(
          R.compose(R.has('takeaway'), R.path(['intent', 'context'])),
          R.assocPath(['model', 'takeaway'], R.path(['context', 'takeaway'], intent)),
          R.identity
      )(proposal);
    };

    var updateValue = proposal => {
      var intent = R.prop('intent', proposal);
      var value = R.path(['context', 'value'], intent);
      var text = R.path(['context', 'text'], intent);
      var context = R.path(['context', 'context'], intent);

      return R.ifElse(
          R.compose(R.has('value'), R.path(['intent', 'context'])),
          R.compose(
            R.assocPath(['model', 'takeaway', ref], { value, text, context }),
            R.assocPath(['model', 'newTakeaway'], true)
          ),
          R.identity
      )(proposal);
    };

    var updateNewTakeaway = proposal => {
      var intent = R.prop('intent', proposal);
      return R.ifElse(
          R.compose(R.has('newTakeaway'), R.path(['intent', 'context'])),
          R.assocPath(['model', 'newTakeaway'], R.path(['context', 'newTakeaway'], intent)),
          R.identity
      )(proposal);
    };

    var transformations = [ // only run if error obj is empty, otherwise add to model.errors
      updateMode,
      //updateNext,
      updateConfig,
      updateActionplanData,
      updateValue,
      updateNewTakeaway
      //updateBok,
      //updateMeasureBank,
      //updateResourceBank,
      //updatePreviousProgress
    ];

    var transform = proposal => {
      return R.ifElse(
          R.propSatisfies(R.isEmpty, 'errors'),
          R.reduce((proposal, transformation) => { return transformation(proposal); }, R.__, transformations),
          R.assocPath(['model', 'errors'], R.path(['errors'], proposal))
      )(proposal);
    };

    return R.compose(
        R.tap((model) => { emitter.emit('internal', { step: 'present:newModel', context: JSON.stringify(model) }); }),
        R.prop('model'),
        transform,
        validate
    )({ model, intent, errors: {} });

  };

  ////////////
  // action //
  ////////////

  var action = function(intent){
    emitter.emit('internal', '--STEP----------------------------------------');
    emitter.emit('internal', { step: 'action', type: intent.type, context: JSON.stringify(intent.context) });
    //emitter.emit('internal', { type: 'action', context: { type: intent.type, context: JSON.stringify(intent.context) } });

    // can do async (ex. 3rd party), processing of 'data' pre access to current model, can fill in defaults to prep data
    if(intent.type === 'data::getConfig'){
      return most.of(intent); // can also do processing...
    }

    if(intent.type === 'data::getActionplan'){
      return most.of(intent); // can also do processing...
    }

    if(intent.type === 'bus::getMessage'){ //TODO: handle reactive updates (if takeaway is on same page as question...) without infinite loop?
      return most.of(intent);
    }

    if(intent.type === 'setValue'){
      return most.of(intent); // can also do processing...
    }

    if(intent.type === 'setNewValue'){
      return most.of(intent); // can also do processing...
    }

    if(intent.type === 'setNewTakeaway'){
      return most.of(intent); // can also do processing...
    }

    if(intent.type === 'changeMode'){
      //TODO: remove when all refactord
      return most.of(intent)
          .delay(500)
          .tap(() => { if(intent.context.mode !== 'start'){} });
    }

    return most.of({ type: 'unknown', context: {} });
  };

  ////////////////////
  // update machine //
  ////////////////////

  //TODO: test... what happens if intent comes in during run of update machine...?

  //TODO: instead of direct return from the functions nap, propose and action above... emit event and start new part of stream listening!?... what if one takes 'longer' than another? can they start to interleave in incorrect orders? what is the consequence?

  most.fromEvent('intent', emitter)
      .startWith(intentSeed)
      .flatMap(action)                         // intent -> data
      .scan(present, modelSeed)                // model, data -> model'
    //.flatMap(model => { most.of(model) })    // reactive changes based on new model triggering intents based on 'state', any reason why the nap NEEDS to be after render?
      .tap(persist)                            // persist model
      .tap((model) => { emitter.emit('modelUpdated', model) })
      .takeUntil(teardown$)
      .drain();

  most.fromEvent('modelUpdated', emitter)
      .map(vdom)                               // model -> h
      .scan(patch, mountSeed)                  // mount, h -> h'
      .timestamp()
      .tap((renderTime) => { emitter.emit('rendered', renderTime.time) })
      .takeUntil(teardown$)
      .drain();

  most.fromEvent('modelUpdated', emitter)
      .combine((model, renderTime) => { return { model, renderTime }; }, most.fromEvent('rendered', emitter))
      .skipRepeatsWith(({ model, renderTime }, { prevModel, prevRenderTime }) => { return renderTime === prevRenderTime; })
      .map(R.prop('model'))
      .scan(nap, modelSeed)                 // lastModel, model -> model
      .takeUntil(teardown$)
      .drain();

  ////////////////////////
  // data communication //
  ////////////////////////

  // listen to changes and update remote persistance

  // figure out how to get initial subscribe data?
  R.propOr({ observe: () => {} }, 'getConfig$', data).takeUntil(teardown$).observe( config => emitter.emit('intent', { type: 'data::getConfig', context: { config } }) );
  R.propOr({ observe: () => {} }, 'getActionplanData$', data).takeUntil(teardown$).observe( takeaway => emitter.emit('intent', { type: 'data::getActionplan', context: { takeaway } }) );

  var setActionplanData = function(takeaway){
    var set = R.propOr(function(){}, 'setActionplanData', data);
    set({ takeaway }).drain(); //TODO: find way to make this universal to firebase and tincan api...
  };

  most.fromEvent('data::setActionplanData', emitter)
    .tap(setActionplanData)
    .takeUntil(teardown$)
    .drain();

  ////////////////////////////
  // internal communication //
  ////////////////////////////

  const internal$ = most.fromEvent('internal', emitter)
    .takeUntil(teardown$);

  internal$
    .tap(console.log)
    .drain();

  ///////////////////////
  // bus communication //
  ///////////////////////

  // listen and message between components, allowing for non-nested global communication
  // registration pattern (send out emitter || subject; reciver sends current state back then updates as needed) [MAKE SURE the stream or emitter has takeuntil teardown or unsubscribe... prefer subject then...]
  // lifecycle updates
  // commands for anyone listening (ex. stop all videos playing?)

  most.fromEvent('message', bus)
    .filter(R.pathEq(['identity', 'type'], 'actionplan'))
    .tap(message => { emitter.emit('intent', { type: 'bus::getMessage', context: message }) })
    .takeUntil(teardown$)
    .drain();

  // ex. meta.type === log... log all lifecycle events globally
  most.fromEvent('bus::sendMessage', emitter)
    .tap(({ id, ref, type, context }) => { bus.emit('message', { meta: { type, id, ref }, identity: { type: 'actionplan', id: sessionId }, context }) })
    .takeUntil(teardown$)
    .drain();

  //TODO: 'bus registration pattern' [register with activity] send emitter to activity for it to emit messages back || send 'subject' to push onto stream here... on activity events store to model? activity when recieve, hooks up and sends current state then each preceeding state

  //////////////
  // teardown //
  //////////////

  // mutationobserver
  // emitter.emit('teardown')

};

export {
  loaded
};