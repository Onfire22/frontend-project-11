import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './vew.js';
import { buildUrl, isValide } from './helpers.js';
import parseRss from './parser.js';

export default (elems, state, i18nextInstance) => {
  const watchedState = render(elems, i18nextInstance, state);
  watchedState.formState.status = 'initial';
  const updatePosts = (model) => {
    const promises = model.formState.feeds.map(({ userUrl, id }) => axios.get(buildUrl(userUrl))
      .then((response) => {
        const { items } = parseRss(response.data.contents);
        items.filter((post) => !model.formState.posts
          .some((oldPost) => post.postTitle === oldPost.postTitle))
          .forEach((post) => {
            post.id = id;
            model.formState.posts.unshift(post);
          });
      }));
    Promise.all(promises)
      .catch((err) => {
        watchedState.formState.error = err.name === 'ValidationError' ? err.type : 'AxiosError';
        watchedState.formState.status = 'failed';
      })
      .finally(setTimeout(updatePosts, 5000, model));
  };
  elems.input.addEventListener('input', () => {
    watchedState.formState.status = 'feeling';
  });
  elems.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const userUrl = elems.input.value;
    const proxyUrl = buildUrl(userUrl);
    const validePromise = isValide(watchedState.formState.feeds, elems.input.value);
    validePromise.then(() => {
      watchedState.formState.error = null;
      watchedState.formState.status = 'pending';
      return axios.get(proxyUrl);
    })
      .then((response) => {
        try {
          const { title, description, items } = parseRss(response.data.contents);
          const id = uniqueId();
          const feed = {
            title, description, id, userUrl,
          };
          watchedState.formState.feeds.push(feed);
          items.forEach((post) => {
            post.id = id;
            watchedState.formState.posts.push(post);
          });
          watchedState.formState.status = 'success';
        } catch (error) {
          watchedState.formState.error = error.message;
          watchedState.formState.status = 'failed';
        }
      })
      .catch((err) => {
        watchedState.formState.error = err.name === 'ValidationError' ? err.type : 'AxiosError';
        watchedState.formState.status = 'failed';
      });
  });
  updatePosts(watchedState);
};
