import onChange from 'on-change';

const renderStateOnWatch = (state, elements) => {
  const watchedFeedForm = onChange(state, (path, value, previousValue) => {
    document.querySelectorAll('.text-danger').forEach((el) => el.remove()); // remove prev error messages
    // if submit is valid
    if (path === 'urlForm.valid' && value === true) {
      elements.formInput.classList.remove('is-invalid');
      // тут будет отрисовка фида

      // else if submit is invalid (newly invalid or was invalid and invalid again)
    } else if ((path === 'urlForm.valid' && value === false) || (path === 'urlForm.errors' && value !== [])) {
      elements.formInput.classList.add('is-invalid'); // making input invalid
      state.urlForm.errors.forEach((err) => { // create p elem for each error and add error text
        const errorP = document.createElement('div');
        errorP.classList.add('feedback', 'm-0', 'position-relative', 'small', 'text-danger');
        errorP.textContent = err;
        elements.form.appendChild(errorP);
      });
    }
  });
  return watchedFeedForm;
};
export default renderStateOnWatch;
