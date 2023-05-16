// Import our custom CSS
import '../scss/styles.scss';

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap';
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
    form: document.querySelector('.RSS_input_form'),
    formInput: document.querySelector('#url_input'),
    formSubmit: document.querySelector('submit'),
  };
  // yup schema to validate if it is url
  const schema = yup.object().shape({
    url: yup.string().url().required().notOneOf(state.listFeed),
  });

  const watchedState = renderStateOnWatch(state, elements);

  elements.form.addEventListener = ('submit', (e) => {
    e.preventDefault();
    const formData = new FormData();
    const link = formData.get('url');
    schema.validate(link)
      .then((validLink) => {
        watchedState.urlForm.listFeed.push(validLink);
        watchedState.urlForm.valid = true;
        elements.formInput.reset();
        elements.formInput.focus();
        watchedState.urlForm.errors = [];
      })
      .catch((err) => {
        watchedState.urlForm.valid = false;
        watchedState.urlForm.errors.push(err);
      });
  });
};

app();
