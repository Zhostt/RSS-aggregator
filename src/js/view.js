import onChange from 'on-change';

// initial render according to locale
const localeRender = (i18nextInstance, elements) => {
  // modal buttons
  elements.modal.read.textContent = i18nextInstance.t('buttons.read');
  elements.modal.close.textContent = i18nextInstance.t('buttons.close');
  // submit
  elements.modal.submit.textContent = i18nextInstance.t('buttons.submit');
  // basic static structure
  elements.structure.mainTitle.textContent = i18nextInstance.t('structure.mainTitle');
  elements.structure.secondTitle.textContent = i18nextInstance.t('structure.secondTitle');
  elements.structure.exampleStatic.textContent = i18nextInstance.t('structure.exampleStatic');
  elements.structure.exampleDynamic.textContent = i18nextInstance.t('structure.exampleDynamic');
  elements.structure.submitPlaceholder.textContent = i18nextInstance.t('structure.submitPlaceholder');
};

const renderStateOnWatch = (state, elements, i18nextInstance) => {
  localeRender(i18nextInstance, elements);
  const clearFeedback = () => document.querySelectorAll('.feedback').forEach((el) => el.remove()); // remove prev feedback messages
  const watchedState = onChange(state, (path, value) => {
    // if submit is valid - delete red frame
    if (path === 'urlForm.valid' && value === true) {
      elements.formInput.classList.remove('is-invalid');
      clearFeedback();
      // if submit is invalid (newly invalid or was invalid and invalid again)
    } else if ((path === 'urlForm.valid' && value === false) || (path === 'urlForm.errors' && value !== [])) {
      clearFeedback();
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
      // select last added feed, our value is renewed array of objects (state.feeds)
      const lastAddedFeed = value[value.length - 1];
      feedLi.innerHTML = `<h3 class="channel-title h6 m-0">${lastAddedFeed.title}</h2><p class="channel-descr">${lastAddedFeed.description}</p>`;
      elements.feeds.append(feedLi); // insert created el as first one
      // feedback that feed loaded properly
      clearFeedback();
      const successP = document.createElement('p');
      successP.classList.add('feedback', 'm-0', 'position-relative', 'small', 'text-success');
      successP.textContent = i18nextInstance.t('validation.success');
      elements.form.appendChild(successP);
    }
    // add any new posts
    if (path === 'posts') {
      document.querySelectorAll('.post-list-el').forEach((el) => el.remove()); // delete all viewed feed for renewing
      // incoming value is array of posts objects, everytime bigger.
      const postsArr = value;
      postsArr.forEach((post) => { // create li el, link and button in it
        const postLi = document.createElement('li');
        const postLink = document.createElement('a');
        const postViewBtn = document.createElement('btn');
        // link
        postLink.href = post.link;
        postLink.id = post.id;
        postLink.textContent = post.title;
        postLink.classList.add('fw-bold');
        // button
        postViewBtn.id = post.id;
        postViewBtn.textContent = i18nextInstance.t('buttons.view');
        postViewBtn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        postViewBtn.setAttribute('data-bs-toggle', 'modal');
        postViewBtn.setAttribute('data-bs-target', '#previewModal');
        // li element
        postLi.classList.add('post-list-el', 'list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
        postLi.append(postLink);
        postLi.append(postViewBtn);
        elements.posts.prepend(postLi);
      });
    }
    // modal window on click View button
    if (path === 'UIstate.readPosts') {
      // set post title as read (no more bold)
      const valueID = value[value.length - 1].id;
      const readPost = document.querySelector(`#${valueID}`); // select el by last added id to readPosts state
      readPost.classList.remove('fw-bold');
      readPost.classList.add('fw-normal');
      // set texts in modal
      // find viewed post by id
      const viewedPostObj = state.posts.find((post) => post.id === valueID);
      // change modal textContent accrodingly
      elements.modal.title.textContent = viewedPostObj.title;
      elements.modal.body.textContent = viewedPostObj.description;
      // change read button link to clicked article
      elements.modal.read.href = viewedPostObj.link;
    }
  });
  const returnVal = { watchedState }; // because of naming convention for renders !!!
  return returnVal;
};
export default renderStateOnWatch;
