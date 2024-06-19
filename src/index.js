import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';

const makeValidation = (arr, data) => {
  const scheme = yup.string().url().notOneOf(arr);
  return scheme.validate(data);
};

const app = () => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const state = {
    feeds: [],
    status: 'feeling', // failed, success
    error: null,
  };
  const watchedState = onChange(state, (path, value, previousValue) => {
    if (path === 'status') {
      if (value === 'failed') {
        input.classList.add('is-invalid');
      }
      if (value === 'success') {
        input.classList.remove('is-invalid');
        form.reset();
        input.focus();
      }
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const promise = makeValidation(watchedState.feeds, input.value);
    promise.then((data) => {
      watchedState.status = 'success';
      watchedState.feeds.push(data);
    })
      .catch((err) => {
        watchedState.status = 'failed';
        watchedState.error = err.errors;
      });
  });
};

app();
