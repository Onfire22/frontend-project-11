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
      form.reset();
      input.focus();
    }
    if (value === 'feeling') {
      elems.input.classList.remove('is-invalid');
    }
  }
};

export default render;
