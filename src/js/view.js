import onChange from 'on-change';

const renderStateOnWatch = (state, elements) => {
  const watchedFeedForm = onChange(state.urlForm, (path, value, previousValue) => {
    // Если все ок и сабмит проходит
    if (path === 'valid' && value === true) {
      // тут будет отрисовка фида
    } else if (path === 'valid' && value === false) {
      elements.formInput.classList.add('invalid');
    }
  });
  return watchedFeedForm;
};
export default renderStateOnWatch;
