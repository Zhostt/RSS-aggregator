// yup for validation
import * as yup from 'yup';
// localization lib
import i18n from 'i18next';
// render from our view.js file
import renderStateOnWatch from './view.js';
// localization files from i18next
import resources from '../locales/resources.js';

const app = (i18nextInstance) => {
  // state
  const state = {
    urlForm: {
      listFeed: [],
      valid: true,
      errors: [],
    },
  };

  // elements list by selectors
  const elements = {
    form: document.querySelector('#RSS_input_form'),
    formInput: document.querySelector('#url_input'),
    formSubmit: document.querySelector('#submit'),
  };
  // make state watched by function from module view.js
  const watchedState = renderStateOnWatch(state, elements);

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
  // let because we change schema after each addition to listFeed
  let schema = yup.string()
    .url()
    .required()
    .notOneOf(state.urlForm.listFeed);

  // handle submits based on validation by schema
  const submitHandler = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target); // never forget about e.target
    const link = formData.get('url'); // get url string
    schema.validate(link)
      .then((validLink) => {
        watchedState.urlForm.listFeed.push(validLink); // add new feed to listFeed
        watchedState.urlForm.valid = true; // switch valid state to true
        elements.form.reset();
        elements.formInput.focus();
        // renewing schema bacause notOneOf cant see changes in targeted array
        schema = yup.string()
          .url()
          .required()
          .notOneOf(state.urlForm.listFeed);
      })
      .catch((err) => {
        watchedState.urlForm.errors = []; // clear errors array
        watchedState.urlForm.errors.push(err.message); // add our new errors
        // .message give text only without "validation error:" first part of the string
        watchedState.urlForm.valid = false; // switch state validation to false
        elements.formInput.focus();
      });
  };

  elements.form.addEventListener('submit', submitHandler);
};

const runApp = () => { // to initialize instance of i18n without async/await we should envelop it
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
