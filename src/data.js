// firebase
// tincan
// localstore
import R from 'ramda';
import * as most from 'most';

var dataSetup = function({ sessionId, ref, options, config, dataSource }){
  //TODO: get active data sources from index/config? get the init for them as well?
  //TODO: activity is structured like this as well... can communicate through bus (ex. current section, user, etc...)... has its own data set/get with completion etc...
  //TODO: events on initial setup for all -- multicast/behaviorsubject/etc activity to send last? OR send message to activity with stream and it will register it (have teardown setup)

  // fake data implementation
  // localstorage implementation
  // generic ajax/REST api impelementation for any remote datasource...
  // tincan implementation
  // firebase implementation

  // TODO: add this to readme and code in...
  // ORDER OF IMPORTANCE FOR SETUP DATA
  // 1. [options] attrs (*preferred*) <index.html, setup.js, data.js>
  // 2. [config] hooks (`config` function that takes object sent back from import of this library, merged in) [only place you can add functions] <config.js, setup.js, data.js>
  // 3. persisted data <setup.js, data.js>
  // 4. defaults in code <setup.js>

  // this may come from firebase at some point? \\

  var getConfig$ = most.just(config);

  //////////
  // test //
  //////////

  // can add delays and periodic updates to test more 'reactive' scenarios (ex. .periodic(20000).delay(200))

  var testData = dataSource.test;

  if(testData){

    var planId = R.path(['plan', 'id'])(config);
    var planData = R.compose(R.propOr({}, planId))(testData);

    var getActionplanData$ = most.just(planData);
    var setActionplanData = function({}){ /* dev/null */ };

  }

  ////////////
  // tincan //
  ////////////

  //TODO: make seperate api, instead of overwrite same variables...? have tincan + test data or tincan & firebase, etc...

  // reactive tincan... on set callback, trigger get (most.fromPromise ajax?)

  var tincanApi = dataSource.tincan;

  if(tincanApi){

    var getActionplanData$ = tincanApi.getActionplanData;
    var setActionplanData = tincanApi.setActionplanData;

  }

  //////////////
  // firebase //
  //////////////

  var firebaseConfig = dataSource.firebase;

  if(firebaseConfig){

    var setResponse = function({  }){ /* store at persist, firebase, tincan, etc... whichever are present, PLUS decorate with activity info first... */ };

  }

  /////////////////////
  // data access api //
  /////////////////////

  // decorate with activity info first for search? or add this in loaded.js?

  return {
    getConfig$,
    getActionplanData$,
    setActionplanData
  };

};

module.exports = {
  dataSetup
};
