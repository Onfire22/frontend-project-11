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
  console.log(state)
  console.log(state.error)
  elems.feedback.textContent = i18nextInstance.t(state.error);
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
      console.log('fails')
      renderError(elems, i18nextInstance, state);
    }
    if (value === 'success') {
      console.log('success')
      renderSuccess(elems, i18nextInstance);
    }
  }
};

export default render;
