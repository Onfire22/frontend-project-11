import './styles.scss';
import 'bootstrap';
import i18next from 'i18next';
import resources from './locales.js';
import app from './app.js';

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
    formState: {
      status: '', // initial, pending, failed, success
      error: null,
    },
    modalState: {
      watchedPost: '',
    },
  };
  i18nextInstance.init({
    lng: 'ru',
    resources,
  }).then(() => app(elems, state, i18nextInstance));
};

init();
