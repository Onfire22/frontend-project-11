import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './vew.js';
import { buildUrl, isValide } from './helpers.js';
import parseRss from './parser.js';

export default (elems, state, i18nextInstance) => {
  const view = render(elems, i18nextInstance, state);
  view.formState.status = 'initial';
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
        view.formState.error = err.name === 'ValidationError' ? err.type : 'AxiosError';
        view.formState.status = 'failed';
      })
      .finally(setTimeout(updatePosts, 5000, model));
  };
  elems.input.addEventListener('input', () => {
    view.formState.status = 'feeling';
  });
  elems.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const userUrl = elems.input.value;
    const proxyUrl = buildUrl(userUrl);
    const validePromise = isValide(view.formState.feeds, elems.input.value);
    validePromise.then(() => {
      view.formState.error = null;
      view.formState.status = 'pending';
      return axios.get(proxyUrl);
    })
      .then((response) => {
        try {
          const { title, description, items } = parseRss(response.data.contents);
          const id = uniqueId();
          const feed = {
            title, description, id, userUrl,
          };
          view.formState.feeds.push(feed);
          items.forEach((post) => {
            post.id = id;
            view.formState.posts.push(post);
          });
          view.formState.status = 'success';
        } catch (error) {
          view.formState.error = error.message;
          view.formState.status = 'failed';
        }
      })
      .catch((err) => {
        view.formState.error = err.name === 'ValidationError' ? err.type : 'AxiosError';
        view.formState.status = 'failed';
      });
  });
  updatePosts(view);
};
