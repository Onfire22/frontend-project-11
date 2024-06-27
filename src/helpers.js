import * as yup from 'yup';

const buildUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/');
  proxyUrl.pathname = 'get';
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.append('url', url);
  return proxyUrl.toString();
};

const setAttributes = (elem, attributes) => {
  Object.entries(attributes).forEach(([key, value]) => {
    elem.setAttribute(key, value);
  });
};

const isValide = (arr, data) => {
  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'unique' }),
    },
    string: {
      url: () => ({ key: 'url' }),
    },
  });
  const scheme = yup.string().trim().url().notOneOf(arr);
  return scheme.validate(data);
};

export { buildUrl, setAttributes, isValide };
