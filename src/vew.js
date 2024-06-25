const renderSuccess = (elems, i18nextInstance) => {
  elems.feedback.textContent = '';
  elems.input.classList.remove('is-invalid');
  elems.feedback.textContent = i18nextInstance.t('successMsg');
};

const renderError = (elems, i18nextInstance) => {
  elems.feedback.textContent = '';
  elems.input.classList.remove('is-invalid');
};

const render = (elems, i18nextInstance) => (path, value) => {
  if (path === 'status') {
    if (value === 'initial') {
      elems.staticElems.forEach((elName) => {
        const element = document.querySelector(`.${elName}`);
        element.textContent = i18nextInstance.t(elName);
      });
    }
    if (value === 'failed') {
      elems.input.classList.add('is-invalid');
    }
    if (value === 'success') {
      elems.input.classList.remove('is-invalid');
      elems.form.reset();
      elems.input.focus();
    }
    if (value === 'feeling') {
      elems.input.classList.remove('is-invalid');
    }
  }
};

export default render;
