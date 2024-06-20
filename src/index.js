import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './vew.js';

const makeValidation = (arr, data) => {
  const scheme = yup.string().url().notOneOf(arr);
  return scheme.validate(data);
};

const init = async () => {
  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: 'ru',
    resources: '1',
  });
};

const app = () => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const state = {
    feeds: [],
    status: 'feeling', // failed, success
    error: null,
  };
  const watchedState = onChange(state, render(input, form));
  input.addEventListener('input', () => {
    watchedState.status = 'feeling';
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
        watchedState.error = err.key; // todo errors
      });
  });
};

app();
