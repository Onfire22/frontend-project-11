const parseRss = (html) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(html, 'text/xml');
  const parsererror = data.querySelector('parsererror');
  if (parsererror) {
    throw new Error('valideRss');
  }
  const channel = data.querySelector('channel');
  const title = channel.querySelector('title').textContent;
  const description = channel.querySelector('description').textContent;
  const posts = channel.querySelectorAll('item');
  const items = Array.from(posts).map((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const postLink = item.querySelector('link').textContent;
    return { postTitle, postDescription, postLink };
  });
  return { title, description, items };
};

export default parseRss;
