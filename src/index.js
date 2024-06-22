import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import render from './vew.js';
import resources from './locales.js';

const buildUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/');
  proxyUrl.pathname = 'get';
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.append('url', url);
  return proxyUrl.toString();
};

const request = async (url) => {
  const targetUrl = buildUrl(url);
  const response = await axios.get(targetUrl);
  const data = response.data.contents;
  const parser = new DOMParser();
  return parser.parseFromString(data, 'text/xml');
};

request('https://lorem-rss.hexlet.app/feed');

const parser = (html) => {
  const channel = html.querySelector('channel');
  const title = channel.querySelector('title');
  const titleContent = title.textContent;
  const description = channel.querySelector('description');
  const descriptionContent = description.textContent;
  const link = channel.querySelector('link');
  const linkContent = link.textContent;
  const items = channel.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const feedTitle = item.querySelector('title');
    const feedTitleContent = feedTitle.textContent;
    const feedDescription = item.querySelector('description');
    const feedDescriptionContent = feedDescription.textContent;
    const feedLink = item.querySelector('link');
    const feedLinkContent = feedLink.textContent;
    return { feedTitleContent, feedDescriptionContent, feedLinkContent };
  });
  return {
    feed: { titleContent, descriptionContent, linkContent },
    posts,
  };
};

const makeValidation = (arr, data) => { // -> helpers.js
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
    const promise = makeValidation(watchedState.feeds, elems.input.value, i18nextInstance);
    promise.then((data) => {
      watchedState.status = 'success';
      watchedState.feeds.push(data);
    })
      .catch((err) => {
        watchedState.status = 'failed';
        err.errors.forEach((error) => {
          watchedState.error = i18nextInstance.t(error.key);
        });
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
