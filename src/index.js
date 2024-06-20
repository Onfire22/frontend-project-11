import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './vew.js';
import resources from './translations.js';

const makeValidation = (arr, data) => {
  const scheme = yup.string().url().notOneOf(arr);
  return scheme.validate(data);
};

const app = (elems, state, i18nextInstance) => {
  const watchedState = onChange(state, render(elems, i18nextInstance));
  watchedState.status = 'initial';
  elems.input.addEventListener('input', () => {
    watchedState.status = 'feeling';
  });
  elems.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const promise = makeValidation(watchedState.feeds, elems.input.value);
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

const init = async () => {
  const i18nextInstance = i18next.createInstance();
  const elems = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    staticElems: ['title', 'subtitle', 'label', 'btn_add', 'hint'],
  };
  const state = {
    feeds: [],
    status: '', // initial, failed, success
    error: null,
  };
  await i18nextInstance.init({
    lng: 'ru',
    resources,
  });
  app(elems, state, i18nextInstance);
};

init();
