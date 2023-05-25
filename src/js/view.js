import onChange from 'on-change';

const renderStateOnWatch = (state, elements, i18nextInstance) => {
  const watchedFeedForm = onChange(state, (path, value, previousValue) => {
    // if submit is valid - delete red frame
    if (path === 'urlForm.valid' && value === true) {
      document.querySelectorAll('.feedback').forEach((el) => el.remove()); // remove prev feedback messages
      elements.formInput.classList.remove('is-invalid');
      // feedback that feed loaded properly
      const successP = document.createElement('p');
      successP.classList.add('feedback', 'm-0', 'position-relative', 'small', 'text-success');
      successP.textContent = i18nextInstance.t('validation.success');
      elements.form.appendChild(successP);

      // if submit is invalid (newly invalid or was invalid and invalid again)
    } else if ((path === 'urlForm.valid' && value === false) || (path === 'urlForm.errors' && value !== [])) {
      document.querySelectorAll('.feedback').forEach((el) => el.remove()); // remove prev feedback messages
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
    }
    // add any new posts
    if (path === 'posts') {
      document.querySelectorAll('.post-list-el').forEach((el) => el.remove()); // delete all viewed feed for renewing
      // incoming value is array of posts objects, everytime bigger. We need last version of array added
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
      console.log('value in state', value);
      const valueID = value[value.length - 1].id;
      const readPost = document.querySelector(`#${valueID}`); // select el by last added id to readPosts state
      readPost.classList.remove('fw-bold');
      readPost.classList.add('fw-normal');
      // set texts in modal
      const viewedPostObj = state.posts.find((post) => post.id === valueID); // find viewed post by id
      console.log('viewedObj', viewedPostObj);
      elements.modalTitle.textContent = viewedPostObj.title; // change modal textContent accrodingly
      elements.modalBody.textContent = viewedPostObj.description;
    }
  });
  return watchedFeedForm;
};
export default renderStateOnWatch;
