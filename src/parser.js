const parseRss = (html) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(html, 'text/xml');
  const channel = data.querySelector('channel');
  const title = channel.querySelector('title').textContent;
  const description = channel.querySelector('description').textContent;
  const link = channel.querySelector('link').textContent;
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
    feed: { title, description, link },
    posts,
  };
};

export default parseRss;