// yup for validation
import * as yup from 'yup';
// render from our view.js file
import renderStateOnWatch from './view.js';

const app = () => {
  const state = {
    urlForm: {
      listFeed: [],
      valid: true,
      errors: [],
    },
  };

  const elements = {
    form: document.querySelector('#RSS_input_form'),
    formInput: document.querySelector('#url_input'),
    formSubmit: document.querySelector('#submit'),
  };
  // make state watched by function from module view.js
  const watchedState = renderStateOnWatch(state, elements);

  // yup schema to validate if it is url. Not using obj.shape cause we validate only 1 string.
  // let because we change schema after each addition to listFeed
  let schema = yup.string('URL is a string')
    .url('enter valid URL')
    .required('URL is required to submit')
    .notOneOf(state.urlForm.listFeed, 'URL already added to feed');

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
        elements.form.focus();
        schema = yup.string('URL is a string') // renewing schema bacause it cant follow the state changes itself (i mean notOneOf cant see changes in array)
          .url('enter valid URL')
          .required('URL is required to submit')
          .notOneOf(state.urlForm.listFeed, 'URL already added to feed');
      })
      .catch((err) => {
        watchedState.urlForm.errors = []; // clear errors array
        watchedState.urlForm.errors.push(err); // add our new errors
        watchedState.urlForm.valid = false; // switch state validation to false
      });
  };

  elements.form.addEventListener('submit', submitHandler);
};

export default app;
