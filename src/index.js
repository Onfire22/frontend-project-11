import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import render from './vew.js';
import resources from './locales.js';
import buildUrl from './helpers.js';
import parseRss from './parser.js';

const isValide = (arr, data) => { // -> helpers.js
  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'errors.uniq' }),
    },
    string: {
      url: () => ({ key: 'errors.url' }),
    },
  });
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
    const userUrl = elems.input.value;
    const proxyUrl = buildUrl(userUrl);
    const validePromise = isValide(watchedState.feeds, elems.input.value);
    validePromise.then(() => {
      watchedState.valide = true;
      watchedState.error = null;
    })
      .catch((err) => {
        watchedState.valide = false;
        err.errors.forEach((error) => {
          watchedState.error = i18nextInstance.t(error.key);
        });
      })
      .then(() => axios.get(proxyUrl))
      .then((response) => {
        const { feed, posts } = parseRss(response.data.contents);
        watchedState.feeds.push(feed);
        watchedState.posts.push(posts);
      })
      .catch((err) => {
        err.message = i18nextInstance.t('errors.network');
        watchedState.error = err.message;
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
    posts: [],
    status: '', // initial, failed, success
    valide: '',
    error: null,
  };
  await i18nextInstance.init({
    lng: 'ru',
    resources,
  });
  app(elems, state, i18nextInstance);
};

init();
