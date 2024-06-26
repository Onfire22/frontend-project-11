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
      notOneOf: () => ({ key: 'unique' }),
    },
    string: {
      url: () => ({ key: 'url' }),
    },
  });
  const scheme = yup.string().url().notOneOf(arr);
  return scheme.validate(data);
};

const app = (elems, state, i18nextInstance) => {
  const watchedState = onChange(state, render(elems, i18nextInstance, state));
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
      watchedState.error = null;
    })
      .then(() => {
        watchedState.status = 'pending';
        return axios.get(proxyUrl);
      })
      .then((response) => {
        try {
          const { feed, posts } = parseRss(response.data.contents);
          const id = uniqueId();
          feed.id = id;
          watchedState.links.push(userUrl);
          watchedState.feeds.push(feed);
          posts.forEach((post) => {
            post.id = id;
            watchedState.posts.push(post);
          });
          watchedState.status = 'success';
        } catch (error) {
          watchedState.error = error.message;
          watchedState.status = 'failed';
        }
      })
      .catch((err) => {
        watchedState.error = err.name === 'ValidationError' ? err.type : 'AxiosError';
        watchedState.status = 'failed';
      });
  });
};

const init = async () => {
  const i18nextInstance = i18next.createInstance();
  const elems = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    template: document.querySelector('#card_template'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    mainBtn: document.querySelector('.btn_add'),
    staticElems: ['title', 'subtitle', 'label', 'btn_add', 'hint'],
  };
  const state = {
    feeds: [],
    posts: [],
    links: [],
    status: '', // initial, pending!!!!!!, failed, success
    error: null,
  };
  await i18nextInstance.init({
    lng: 'ru',
    resources,
  });
  app(elems, state, i18nextInstance);
};

init();
