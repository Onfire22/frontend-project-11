import './styles.scss';
import 'bootstrap';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './vew.js';
import resources from './locales.js';
import { buildUrl, isValide } from './helpers.js';
import parseRss from './parser.js';

const app = (elems, state, i18nextInstance) => {
  const watchedState = render(elems, i18nextInstance, state);
  watchedState.status = 'initial';
  const updatePosts = (feed, proxyUrl) => {
    axios.get(proxyUrl)
      .then((response) => {
        const { posts } = parseRss(response.data.contents);
        posts.filter((post) => !watchedState.posts
          .some((oldPost) => post.postTitle === oldPost.postTitle))
          .forEach((post) => {
            post.id = feed.id;
            watchedState.posts.unshift(post);
          });
      })
      .then(() => setTimeout(updatePosts, 5000, feed, proxyUrl))
      .catch((err) => {
        watchedState.error = err.name === 'ValidationError' ? err.type : 'AxiosError';
        watchedState.status = 'failed';
      });
  };
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
      .then(() => {
        state.feeds.forEach((feed) => {
          updatePosts(feed, proxyUrl);
        });
      })
      .catch((err) => {
        watchedState.error = err.name === 'ValidationError' ? err.type : 'AxiosError';
        watchedState.status = 'failed';
      });
  });
};

const init = () => {
  const i18nextInstance = i18next.createInstance();
  const elems = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    template: document.querySelector('#card_template'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    mainBtn: document.querySelector('.btn_add'),
    modalTitle: document.querySelector('.modal-title'),
    modalText: document.querySelector('.modal-body'),
    readBtn: document.querySelector('.btn-primary'),
    staticElems: ['title', 'subtitle', 'label', 'btn_add', 'hint'],
  };
  const state = {
    feeds: [],
    posts: [],
    links: [],
    status: '', // initial, pending, failed, success
    error: null,
    watchedPost: '',
  };
  i18nextInstance.init({
    lng: 'ru',
    resources,
  }).then(() => app(elems, state, i18nextInstance));
};

init();
