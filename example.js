import { configureActionplan } from './src/setup';
import { bus } from 'partybus';
import tincanInit from 'tincan'; // this should come in through activity.js (hucklebuck)

var config = { // this should come in from '../../activity_config'
  activity_name: 'Measuring and Setting Quality Goals',
  slug: 'measuring_setting_quality_goals',
  full_url: 'https://governance.netlify.com/measuring_setting_quality_goals',
  distpath: '../../measuring_setting_quality_goals',
  author: 'Scitent http://scitent.com',
  first_section: 'measuring_quality_dashboards_and_scorecards',
  theme: 'clean-blog-3.3.7'
};

var allActionplans = {
  // universal defaults overriden by single actionplans
};

var actionplans = {
  'enter-ten-items': {
    plan: {
      id: 'governance',
      title: 'governance-action-plan'
    },
    element: {
      type: 'question',
      meta: {
        text: 'Enter 10 items...',
        markup: {
          element: 'h3',
          classes: ''
        },
        placeholder: 'Enter notes...',
        context: ['Section 1', Date.now()]
      }
    }
  },
  'what-are-your-thoughts': {
    plan: {
      id: 'governance',
      title: 'governance-action-plan'
    },
    element: {
      type: 'question',
      meta: {
        text: 'What are your thoughts?',
        markup: {
          element: 'h3',
          classes: ''
        },
        placeholder: 'Answer this...',
        context: ['Section 2', Date.now()]
      }
    }
  },
  'governance-takeaway': {
    plan: {
      id: 'governance',
      title: 'governance-action-plan'
    },
    element: {
      type: 'takeaway',
      html: {
        prehead: '<div>Stuff...</div>',
        prebody: '<div>Info...</div>',
        prefoot: '<div>Remember...</div>'

      },
      meta: {
        markup: {
          element: 'h2',
          title: 'Your Takeaway:',
          classes: ''
        },
        each: {
          markup: {
            parent: {
              element: 'ul',
              //element: 'div',
              classes: ''
            },
            child: {
              element: 'li',
              //element: 'div',
              classes: 'section-background'
            },
            inner: {
              question: {
                element: 'h3',
                classes: ''
              },
              context: {
                section: {
                  display: true,
                  element: 'pre',
                  classes: ''
                },
                date: {
                  display: true,
                  element: 'span',
                  classes: ''
                }
              },
              response: {
                element: 'div',
                classes: ''
              }
            }
          }
        }
      }
    }
  },
  'page1': {
    plan: {
      id: 'are-things-ok',
      title: 'Are things ok?'
    },
    element: {
      type: 'question',
      meta: {
        text: '',
        markup: {
          element: 'h3',
          classes: ''
        },
        placeholder: 'Enter notes...',
        context: ['Section 1', Date.now()]
      }
    }
  },
  'page2': {
    plan: {
      id: 'are-things-ok',
      title: 'Are things ok?'
    },
    element: {
      type: 'question',
      meta: {
        text: 'How do you make things better?',
        markup: {
          element: 'h3',
          classes: ''
        },
        placeholder: 'Answer this...',
        context: ['Section 1', Date.now()]
      }
    }
  },
  'page3': {
    plan: {
      id: 'are-things-ok',
      title: 'Are things ok?'
    },
    element: {
      type: 'question',
      meta: {
        text: 'Are things better?',
        markup: {
          element: 'h3',
          classes: ''
        },
        placeholder: 'Answer this...',
        context: ['Section 1', Date.now()]
      }
    }
  },
  'page4': {
    plan: {
      id: 'are-things-ok',
      title: 'Are things ok?'
    },
    element: {
      type: 'question',
      meta: {
        text: 'When will things get better?',
        markup: {
          element: 'p',
          classes: ''
        },
        placeholder: 'Answer this...',
        context: ['Section 1', Date.now()]
      }
    }
  },
  'page5': {
    plan: {
      id: 'are-things-ok',
      title: 'Are things ok?'
    },
    element: {
      type: 'question',
      meta: {
        text: 'Will things get better?',
        markup: {
          element: 'a',
          classes: ''
        },
        placeholder: 'What do you think...',
        context: ['Section 1', Date.now()]
      }
    }
  },
  'takeaway': {
    plan: {
      id: 'are-things-ok',
      title: 'Are things ok?'
    },
    element: {
      type: 'takeaway',
      meta: {
        markup: {
          element: 'h2',
          title: 'Notes:',
          classes: ''
        },
        each: {
          markup: {
            outer: {
              element: 'li',
              classes: ''
            },
            inner: {
              question: {
                element: 'h3',
                classes: ''
              },
              context: {
                element: 'pre',
                classes: ''
              },
              response: {
                element: 'div',
                classes: ''
              }
            }
          }
        }
      }
    }
  }
};

var testActionplanData = {
  'governance': {
    //'enter-ten-items': {
    //  text: 'Enter 10 items...',
    //  context: ['Section 1', 1489421176326],
    //  value: '1. hi, 2. ok, 3. bye, ....'
    //},
    'what-are-your-thoughts': {
      text: 'What are your thoughts?',
      context: ['Section 2', 1589421176327],
      value: 'I have a few...'
    }
  }
};

/////////////////////
// TEST DATA TEST //
///////////////////

//var tincan = tincanInit(config, true);
//
//var source = {
//  //firebase: { /* config for fb */ },
//  //tincan: { /* api for tincan */ },
//  test: testActionplanData
//};

///////////////////////
// TINCAN DATA TEST //
/////////////////////

var email = 'xghftohnson';
var firstName = 'Gim';
var lastName = 'Tohnson';

var authUrl = `https://17515-presscdn-0-77-pagely.netdna-ssl.com/wp-content/uploads/grassblade/6896-course-3/index.html?actor=%7B%22mbox%22%3A%22mailto%3A${email}%40scitent.us%22%2C%22name%22%3A%22${firstName}%20${lastName}%22%2C%22objectType%22%3A%22Agent%22%7D&auth=Basic%20MzctMzRiOTNjYWI2MTc0MmUwOmRjOThhYjFjN2U3NDRmZTE4NGRkYzU4N2U%3D&endpoint=https%3A%2F%2Flrs.scitent.us%2FxAPI%2F&registration=&activity_id=http%3A%2F%2Fcareerdevelopment.aaas.org%2Fcourse3`;
var tincan = tincanInit(config, false, authUrl);

var source = {
  tincan: {
    setActionplanData: tincan.setActionplanData,
    getActionplanData: tincan.getActionplanData
  }
};

////////////
// CONFIG //
////////////

configureActionplan({
  configuration: actionplans,
  globalConfiguration: allActionplans,
  dataSource: source
});

//////////////////////////////////////////////////////////////////////////////////
// example for use via index.js && actionplan_config.js (with no global config) //
//////////////////////////////////////////////////////////////////////////////////

//export default dataSource => configureActionplan({
//  configuration: actionplans,
//  dataSource: dataSource || { test: testActionplanData }
//});