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
  // yup schema to validate if it is url
  const schema = yup.object().shape({
    url: yup.string().url('enter valid URL').required('enter valid URL').notOneOf(state.urlForm.listFeed),
  });
  const watchedState = renderStateOnWatch(state, elements);

  const submitHandler = (e) => {
    e.preventDefault();
    alert(e.target.textContent);
    const formData = new FormData();
    const link = formData.get('url');
    schema.validate(link)
      .then((validLink) => {
        alert('OK');
        watchedState.urlForm.listFeed.push(validLink);
        watchedState.urlForm.valid = true;
        elements.formInput.reset();
        elements.formInput.focus();
        watchedState.urlForm.errors = [];
      })
      .catch((err) => {
        alert('ERROR');
        watchedState.urlForm.valid = false;
        watchedState.urlForm.errors.push(err);
      });
  };

  alert('INITIALIZED5');
  elements.formSubmit.addEventListener = ('click', submitHandler);
};

export default app;
