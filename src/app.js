import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './view.js';
import { buildUrl, isValide } from './helpers.js';
import parseRss from './parser.js';

export default (elems, state, i18nextInstance) => {
  const view = render(elems, i18nextInstance, state);
  const updatePosts = (model) => {
    view.updateStatus = 'initial';
    const promises = model.feeds.map(({ userUrl, id }) => axios.get(buildUrl(userUrl))
      .then((response) => {
        const { items } = parseRss(response.data.contents);
        items.filter((post) => !model.posts
          .some((oldPost) => post.postTitle === oldPost.postTitle))
          .forEach((post) => {
            post.id = id;
            model.posts.unshift(post);
          });
      }));
    Promise.all(promises)
      .catch((err) => {
        view.formState.error = err.name === 'ValidationError' ? err.type : 'AxiosError';
        view.updateStatus = 'failed';
      })
      .finally(setTimeout(updatePosts, 5000, model));
  };
  elems.form.addEventListener('submit', (e) => {
    e.preventDefault();
    view.formState.status = 'feeling';
    const userUrl = elems.input.value;
    const proxyUrl = buildUrl(userUrl);
    view.formState.status = 'pending';
    const validePromise = isValide(view.feeds, elems.input.value);
    validePromise.then(() => {
      view.formState.error = null;
      return axios.get(proxyUrl);
    })
      .then((response) => {
        try {
          const { title, description, items } = parseRss(response.data.contents);
          const id = uniqueId();
          const feed = {
            title, description, id, userUrl,
          };
          view.feeds.push(feed);
          items.forEach((post) => {
            post.id = id;
            view.posts.push(post);
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
