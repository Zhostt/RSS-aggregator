import onChange from 'on-change';

const renderStateOnWatch = (state, elements, i18nextInstance) => {
  const watchedFeedForm = onChange(state, (path, value, previousValue) => {
    document.querySelectorAll('.feedback').forEach((el) => el.remove()); // remove prev feedback messages
    // if submit is valid - delete red frame
    if (path === 'urlForm.valid' && value === true) {
      elements.formInput.classList.remove('is-invalid');
      // тут будет отрисовка фида

      // if submit is invalid (newly invalid or was invalid and invalid again)
    } else if ((path === 'urlForm.valid' && value === false) || (path === 'urlForm.errors' && value !== [])) {
      elements.formInput.classList.add('is-invalid'); // making input invalid
      state.urlForm.errors.forEach((err) => { // create p elem for each error and add error text
        const errorP = document.createElement('p');
        errorP.classList.add('feedback', 'm-0', 'position-relative', 'small', 'text-danger');
        errorP.textContent = err;
        elements.form.appendChild(errorP);
      });
    }
    // new feed added to state
    if (path === 'feeds') {
      // add feed title and descr
      const feedLi = document.createElement('li');
      const lastAddedFeed = value[value.length - 1]; // select last added feed, our value is renewed array of objects (state.feeds)
      feedLi.innerHTML = `<h3 class="channel-title h6 m-0">${lastAddedFeed.title}</h2><p class="channel-descr">${lastAddedFeed.description}</p>`;
      elements.feeds.append(feedLi); // insert created el as first one
      // add posts for that feed
      const postsForThisFeed = state.posts.filter((post) => post.feedId === lastAddedFeed.id); // id === id of last added feed
      postsForThisFeed.forEach((post) => {
        const postLi = document.createElement('li');
        const postLink = document.createElement('a');
        postLink.href = post.link;
        postLink.textContent = post.title;
        postLi.append(postLink);
        elements.posts.append(postLi);
      });
      // feedback that everything loaded properly
      const sucessP = document.createElement('p');
      sucessP.classList.add('feedback', 'm-0', 'position-relative', 'small', 'text-success');
      sucessP.textContent = i18nextInstance.t('validation.success');
      elements.form.append(sucessP);
    }
  });
  return watchedFeedForm;
};
export default renderStateOnWatch;
