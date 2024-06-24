import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './vew.js';
import resources from './locales.js';
import buildUrl from './helpers.js';
import parseRss from './parser.js';

const isValide = (arr, data) => {
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
// toDo: add global states
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
    const validePromise = isValide(watchedState.links, elems.input.value);
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
        try {
          const { feed, posts } = parseRss(response.data.contents);
          const id = uniqueId();
          feed.id = id;
          watchedState.links.push(userUrl);
          watchedState.feeds.push(feed);
          watchedState.posts.push({ id, posts });
          watchedState.status = 'success';
        } catch (error) {
          watchedState.status = 'failed';
          watchedState.error = i18nextInstance.t(error.message);
        }
      })
      .catch((err) => {
        err.message = i18nextInstance.t('errors.network');
        watchedState.status = 'failed';
        watchedState.error = err.message;
      });
  });
};

const init = async () => {
  const i18nextInstance = i18next.createInstance();
  const elems = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    card: document.createElement('div'),
    cardBody: document.createElement('div'),
    cardTitle: document.createElement('h2'),
    list: document.createElement('ul'),
    staticElems: ['title', 'subtitle', 'label', 'btn_add', 'hint'],
  };
  const state = {
    feeds: [],
    posts: [],
    links: [],
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
