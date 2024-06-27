import onChange from 'on-change';

const renderSuccess = (elems, i18nextInstance) => {
  elems.feedback.classList.remove('text-danger');
  elems.feedback.classList.add('text-success');
  elems.input.classList.remove('is-invalid');
  elems.feedback.textContent = '';
  elems.feedback.textContent = i18nextInstance.t('successMsg');
  elems.form.reset();
  elems.input.focus();
};

const renderError = (elems, i18nextInstance, watchedState) => {
  elems.feedback.classList.remove('text-success');
  elems.feedback.classList.add('text-danger');
  elems.input.classList.add('is-invalid');
  elems.feedback.textContent = '';
  elems.feedback.textContent = i18nextInstance.t(`errors.${watchedState.error}`);
};

const renderModal = (elems, i18nextInstance, watchedState, value) => {
  if (value) {
    elems.body.classList.add('.modal-open');
    elems.body.style = 'style="overflow: hidden; padding-right: 15px"';
    elems.modal.classList.add('show');
    elems.modal.removeAttribute('aria-hidden');
    elems.modal.setAttribute('aria-modal', 'true');
    elems.modal.style = 'display: block';
  }
};

const renderFeeds = (elems, i18nextInstance, watchedState) => {
  const cardTemplate = elems.template.content;
  const feedsCard = cardTemplate.querySelector('.card').cloneNode(true);
  const cardTitle = feedsCard.querySelector('.card-title');
  const list = feedsCard.querySelector('.list-group');
  cardTitle.textContent = i18nextInstance.t('feeds');
  watchedState.feeds.forEach(({ title, description }) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');
    const listTitle = document.createElement('h3');
    listTitle.classList.add('h6', 'm-0');
    listTitle.textContent = title;
    const listText = document.createElement('p');
    listText.classList.add('m-0', 'small', 'text-black-50');
    listText.textContent = description;
    listItem.append(listTitle, listText);
    list.append(listItem);
  });
  elems.feeds.innerHTML = '';
  elems.feeds.append(feedsCard);
};

const renderPosts = (elems, i18nextInstance, watchedState) => {
  const cardTemplate = elems.template.content;
  const feedsCard = cardTemplate.querySelector('.card').cloneNode(true);
  const cardTitle = feedsCard.querySelector('.card-title');
  cardTitle.textContent = i18nextInstance.t('posts');
  const list = feedsCard.querySelector('.list-group');
  list.addEventListener('click', ({ target }) => {
    if (target.classList.contains('btn')) {
      watchedState.modalState.modalOpen = true;
    }
  });
  watchedState.posts.forEach((post) => {
    const { id, postTitle, postLink } = post;
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.setAttribute('href', postLink);
    link.dataset.id = id;
    link.textContent = postTitle;
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.textContent = i18nextInstance.t('viewBtn');
    button.dataset.id = id;
    listItem.append(link, button);
    list.append(listItem);
  });
  elems.posts.innerHTML = '';
  elems.posts.append(feedsCard);
};

const render = (elems, i18nextInstance, state) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'status') {
      if (value === 'initial') {
        elems.staticElems.forEach((elName) => {
          const element = document.querySelector(`.${elName}`);
          element.textContent = i18nextInstance.t(elName);
        });
      }
      if (value === 'failed') {
        renderError(elems, i18nextInstance, watchedState);
        elems.mainBtn.disabled = false;
      }
      if (value === 'success') {
        renderSuccess(elems, i18nextInstance);
        elems.mainBtn.disabled = false;
      }
      if (value === 'pending') {
        elems.mainBtn.disabled = true;
      }
    }
    if (path === 'posts') {
      renderFeeds(elems, i18nextInstance, watchedState);
      renderPosts(elems, i18nextInstance, watchedState);
    }
    if (path === 'modalState.modalOpen') {
      renderModal(elems, i18nextInstance, watchedState, value);
    }
  });
  return watchedState;
};

export default render;
