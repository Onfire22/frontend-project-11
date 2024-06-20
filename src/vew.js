const render = (input, form) => (path, value, previousValue) => {
  if (path === 'status') {
    if (value === 'failed') {
      input.classList.add('is-invalid');
    }
    if (value === 'success') {
      input.classList.remove('is-invalid');
      form.reset();
      input.focus();
    }
    if (value === 'feeling') {
      input.classList.remove('is-invalid');
    }
  }
};

export default render;
