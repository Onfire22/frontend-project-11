import onChange from 'on-change';
import { Modal } from 'bootstrap';
import { uniqueId } from 'lodash';
import { setAttributes } from './helpers.js';

const initialRender = (elems, i18nextInstance) => {
  elems.staticElems.forEach((elName) => {
    const element = document.querySelector(`.${elName}`);
    element.textContent = i18nextInstance.t(elName);
  });
};

const feelingRender = (elems) => {
  elems.feedback.textContent = '';
  elems.input.classList.remove('is-invalid');
};

const renderSuccess = (elems, i18nextInstance) => {
  elems.mainBtn.disabled = false;
  elems.feedback.classList.remove('text-danger');
  elems.feedback.classList.add('text-success');
  elems.input.classList.remove('is-invalid');
  elems.feedback.textContent = '';
  elems.feedback.textContent = i18nextInstance.t('successMsg');
  elems.form.reset();
  elems.input.focus();
};

const renderError = (elems, i18nextInstance, watchedState) => {
  elems.mainBtn.disabled = false;
  elems.feedback.classList.remove('text-success');
  elems.feedback.classList.add('text-danger');
  elems.input.classList.add('is-invalid');
  elems.feedback.textContent = '';
  elems.feedback.textContent = i18nextInstance.t(`errors.${watchedState.formState.error}`);
  elems.input.focus();
};

const renderModal = (elems, value) => {
  const modal = new Modal(document.querySelector('#modal'));
  elems.modalTitle.textContent = value.postTitle;
  elems.modalText.textContent = value.postDescription;
  setAttributes(elems.readBtn, { href: value.postLink });
  modal.show();
};

const renderFeeds = (elems, i18nextInstance, watchedState) => {
  const cardTemplate = elems.template.content;
  const feedsCard = cardTemplate.querySelector('.card').cloneNode(true);
  const cardTitle = feedsCard.querySelector('.card-title');
  const list = feedsCard.querySelector('.list-group');
  cardTitle.textContent = i18nextInstance.t('feeds');
  watchedState.formState.feeds.forEach(({ title, description }) => {
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
  elems.posts.addEventListener('click', ({ target }) => {
    if (target.classList.contains('btn')) {
      const btnId = target.dataset.id;
      const targetLink = document.querySelector(`[data-id="${btnId}"]`);
      targetLink.classList.add('fw-normal', 'link-secondary');
      targetLink.classList.remove('fw-bold');
      const targetTitle = targetLink.textContent;
      const targetPost = watchedState.formState.posts
        .find(({ postTitle }) => postTitle === targetTitle);
      watchedState.modalState.watchedPost = targetPost;
    }
  });
  watchedState.formState.posts.forEach((post) => {
    const { postTitle, postLink } = post;
    const id = uniqueId();
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    link.classList.add('fw-bold');
    setAttributes(link, { target: '_blank', rel: 'noopener noreferrer', href: postLink });
    link.dataset.id = id;
    link.textContent = postTitle;
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    setAttributes(button, { type: 'button' });
    button.textContent = i18nextInstance.t('viewBtn');
    button.dataset.id = id;
    listItem.append(link, button);
    list.append(listItem);
  });
  elems.posts.innerHTML = '';
  elems.posts.append(feedsCard);
};

const renderStatus = (elems, value, watchedState, i18nextInstance) => {
  switch (value) {
    case 'initial':
      initialRender(elems, i18nextInstance);
      break;
    case 'feeling':
      feelingRender(elems);
      break;
    case 'failed':
      renderError(elems, i18nextInstance, watchedState);
      break;
    case 'success':
      renderSuccess(elems, i18nextInstance);
      break;
    case 'pending':
      elems.mainBtn.disabled = true;
      break;
    default:
      break;
  }
};

const render = (elems, i18nextInstance, state) => {
  const view = onChange(state, (path, value) => {
    switch (path) {
      case 'formState.status':
        renderStatus(elems, value, view, i18nextInstance);
        break;
      case 'formState.posts':
        renderFeeds(elems, i18nextInstance, view);
        renderPosts(elems, i18nextInstance, view);
        break;
      case 'modalState.watchedPost':
        renderModal(elems, value);
        break;
      default:
        break;
    }
  });
  return view;
};

export default render;
