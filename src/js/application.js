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
    language: 'ru',
    urlForm: {
      valid: true,
      errors: [],
    },
    feeds: [], // id, title, description, URL
    posts: [], // structure: title, description, link, feedURL
    UIstate: {
      readPosts: [ // tracking already read posts
      // {postId, modalOpen}
      ],
    },
  };

  // elements list by selectors
  const elements = {
    form: document.querySelector('#RSS_input_form'),
    formInput: document.querySelector('#url_input'),
    formSubmit: document.querySelector('#submit'),
    posts: document.querySelector('ul.posts'),
    feeds: document.querySelector('ul.feeds'),
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      read: document.querySelector('.full-article'),
      close: document.querySelector('.btn-secondary-close'),
      submit: document.querySelector('#submit'),
    },
    structure: {
      mainTitle: document.querySelector('#mainTitle'),
      secondTitle: document.querySelector('#secondTitle'),
      exampleStatic: document.querySelector('#exampleStatic'),
      exampleDynamic: document.querySelector('#exampleDynamic'),
      submitPlaceholder: document.querySelector('#submitPlaceholder'),
      languageSwitch: document.querySelector('#language-switch'),
    },
  };
  // make state watched by function from module view.js
  // destructured way cause of naming convention for renders
  const { watchedState } = renderStateOnWatch(state, elements, i18nextInstance);

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

  // Validation & getFeed = OK. Got channelFeedObj from getFeed().
  // onSubmit=true handles submitting feed; false - for continious checks for already added
  const feedLoadedHandler = (channelFeedObj, onSubmit = true) => {
    // if its new submit - add feed to feeds list
    if (onSubmit === true) {
      watchedState.urlForm.valid = true;
      watchedState.feeds.push(channelFeedObj.feed);
      elements.form.reset();
      elements.formInput.focus();
    }
    // for continous checks for new posts & submitting new feeds
    //  - checking if post already added to state.posts
    channelFeedObj.postsArr.forEach((post) => {
      if (!arrayHasObject(watchedState.posts, post)) {
        watchedState.posts.push(post);
      }
    });
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
    // .message return text only without "validation error:" first part of the string
    watchedState.urlForm.errors.push(err.message);
    watchedState.urlForm.valid = false;
    elements.formInput.focus();
  };

  // handle submits based on validation by schema & getFeed
  const submitHandler = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target); // never forget about e.target as arg
    const link = formData.get('url').trim();
    schema.validate(link)
    // wait for validation schema to validate, then validate rss
      .then((validLink) => getFeed(validLink, i18nextInstance))
      .then((channelFeedObj) => { // get obj with feed & posts data
        feedLoadedHandler(channelFeedObj);
      })
      .catch((err) => { // error catcher watches for both 2 promises above -
        // - yup valid and rss/network validation
        feedErrorHandler(err);
      });
  };
  // function that checks added feeds every 5 seconds (should be used recursively)
  // not setInterval because of possible net problems
  const feedsChecker = (stateObj, mseconds = 5000) => {
    // array of URLs to feeds (submitted)
    const feedsLinks = stateObj.feeds.map((feed) => feed.URL);
    if (feedsLinks.length > 0) {
      feedsLinks.forEach((URL) => {
        getFeed(URL, i18nextInstance)
          .then((channelFeedObj) => feedLoadedHandler(channelFeedObj, false)) // false = onSubmit
          .then(() => {
            setTimeout(() => feedsChecker(stateObj, mseconds), mseconds);
          });
      });
    } else { setTimeout(() => feedsChecker(stateObj, mseconds), mseconds); }
  };

  // preview posts handler, shoud be used on parent container of added post links
  const previewHandler = (e) => {
    if (e.target.tagName === 'BTN') { // will handle event only if button clicked (not container)
      const clickedButton = e.target;
      const readPostObj = {
        id: clickedButton.id,
        modalOpen: true,
      };
      watchedState.UIstate.readPosts.push(readPostObj);
      e.stopImmediatePropagation();
    }
  };

  const languageChangeHandler = (e) => {
    const newLanguage = e.target.id;
    watchedState.language = newLanguage;
  };

  // Starting
  // add listener with submitHandler
  elements.form.addEventListener('submit', submitHandler);
  // set initial timeout for checker
  setTimeout(() => feedsChecker(watchedState), 5000);
  // listener to clicks on posts - preview
  elements.posts.addEventListener('click', previewHandler);
  // listener for language change
  elements.structure.languageSwitch.addEventListener('click', languageChangeHandler);
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
      // naming modal buttons accordingly to locale
      app(i18nextInstance);
    })
    .catch((e) => {
      throw new Error(`app initialization Error - ${e}`);
    });
};

export default runApp;
