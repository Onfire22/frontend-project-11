const renderSuccess = (elems, i18nextInstance) => {
  elems.feedback.classList.remove('text-danger');
  elems.feedback.classList.add('text-success');
  elems.input.classList.remove('is-invalid');
  elems.feedback.textContent = '';
  elems.feedback.textContent = i18nextInstance.t('successMsg');
  elems.form.reset();
  elems.input.focus();
};

const renderError = (elems, i18nextInstance, state) => {
  elems.feedback.classList.remove('text-success');
  elems.feedback.classList.add('text-danger');
  elems.input.classList.add('is-invalid');
  elems.feedback.textContent = '';
  elems.feedback.textContent = i18nextInstance.t(`errors.${state.error}`);
};

const renderFeeds = (elems, i18nextInstance, state) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const card = document.createElement('div');
  card.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nextInstance.t('feeds');
  const list = document.createElement('ul');
  list.classList.add('list-group-item', 'border-0', 'border-end-0');
  const listItems = state.feeds.map(({ title, description }) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');
    const listTitle = document.createElement('h3');
    listTitle.classList.add('h6', 'm-0');
    listTitle.textContent = title;
    const listText = document.createElement('p');
    listText.classList.add('m-0', 'small', 'text-black-50');
    listText.textContent = description;
    listItem.append(listTitle, listText);
    return listItem;
  });
  list.append(...listItems);
  card.append(cardTitle);
  container.append(card, list);
  elems.feeds.innerHTML = '';
  elems.feeds.append(container);
};

const render = (elems, i18nextInstance, state) => (path, value) => {
  if (path === 'status') {
    if (value === 'initial') {
      elems.staticElems.forEach((elName) => {
        const element = document.querySelector(`.${elName}`);
        element.textContent = i18nextInstance.t(elName);
      });
    }
    if (value === 'failed') {
      renderError(elems, i18nextInstance, state);
    }
    if (value === 'success') {
      renderSuccess(elems, i18nextInstance);
      renderFeeds(elems, i18nextInstance, state);
    }
  }
};

export default render;
