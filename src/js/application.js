// yup for validation
import * as yup from 'yup';
// localization lib
import i18n from 'i18next';
// lodash is lodash
import _ from 'lodash';
// render from our view.js file
import renderStateOnWatch from './view.js';
// localization files from i18next
import resources from '../locales/resources.js';
// func that gets rss link, parses, returns
import getFeed from './getFeed.js';

const app = (i18nextInstance) => {
  // Structure: url > feed > posts(articles)
  const state = {
    urlForm: {
      valid: true,
      errors: [],
    },
    feeds: [],
    posts: [],
  };

  // elements list by selectors
  const elements = {
    form: document.querySelector('#RSS_input_form'),
    formInput: document.querySelector('#url_input'),
    formSubmit: document.querySelector('#submit'),
    posts: document.querySelector('ul.posts'),
    feeds: document.querySelector('ul.feeds'),
  };
  // make state watched by function from module view.js
  const watchedState = renderStateOnWatch(state, elements, i18nextInstance);

  // set default error messages for different validations, based on our i18next translations
  yup.setLocale({
    mixed: {
      required: i18nextInstance.t('validation.requiredErr'),
      notOneOf: i18nextInstance.t('validation.notOneOfErr'),
    },
    string: {
      url: i18nextInstance.t('validation.urlErr'),
    },
  });

  // yup schema to validate if it is url. Not using obj.shape cause we validate only 1 string.
  // let because we change schema after each addition to feedList
  let schema = yup.string()
    .url()
    .required()
    .notOneOf(state.feeds.map((feed) => feed.URL)); // not in already added URLs

  // check if array has specific obj - if state alrady have posts and feeds. Returns Boolean
  const arrayHasObject = (array, obj) => {
    const hasObj = array.some((item) => _.isEqual(item, obj));
    return hasObj;
  };

  // Validation & getFeed = OK. Got channelFeedObj from getFeed()
  const feedLoadedHandler = (channelFeedObj) => {
    watchedState.urlForm.valid = true;
    // if feed or post is not added already - add to state if not. Thats for continous getFeed
    if (!arrayHasObject(watchedState.feeds, channelFeedObj.feed)) {
      watchedState.feeds.push(channelFeedObj.feed);
    }
    channelFeedObj.postsArr.forEach((post) => {
      if (!arrayHasObject(watchedState.posts, channelFeedObj.postArr)) {
        watchedState.posts.push(post);
      }
    });
    elements.form.reset();
    elements.formInput.focus();
    // renewing schema because notOneOf cant see changes in targeted array
    schema = yup.string()
      .url()
      .required()
      .notOneOf(state.feeds.map((feed) => feed.URL));
  };

  // Validation || getFeed ERROR
  const feedErrorHandler = (err) => {
    // push errors to state, switch valid to false, refocus
    watchedState.urlForm.errors = [];
    watchedState.urlForm.errors.push(err.message); // .message return text only without "validation error:" first part of the string
    watchedState.urlForm.valid = false;
    elements.formInput.focus();
  };

  // handle submits based on validation by schema & getFeed
  const submitHandler = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target); // never forget about e.target as arg
    const link = formData.get('url');
    schema.validate(link)
      .then((validLink) => getFeed(validLink, i18nextInstance) // wait for validation schema to validate
        .then((channelFeedObj) => { // then wait for getter to get feed&posts(look what getFeed returns) and validate link (rss or err)
          feedLoadedHandler(channelFeedObj);
        }))
      .catch((err) => { // error catcher watches for both 2 promises -
        // validation and getter should be on same level with 1st one, not nested in it
        feedErrorHandler(err);
      });
  };
  // add listener with submitHandler
  elements.form.addEventListener('submit', submitHandler);
};

// to initialize instance of i18n without async/await we should envelop it
const runApp = () => {
  const i18nextInstance = i18n.createInstance();
  i18nextInstance.init({
    lng: 'ru', // Current language
    debug: false,
    resources, // from locales
  })
    .then(() => {
      app(i18nextInstance);
    })
    .catch((e) => {
      throw new Error('i18next initialization Error');
    });
};

export default runApp;
