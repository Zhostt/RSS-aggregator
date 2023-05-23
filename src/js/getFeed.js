import axios from 'axios';

// get from url. It gets xml
// Parser. Returns array of objects with ...
// ...description, link, title (title should be a text of link), ID
// Then parsed stuff added to state.feed
// viewer gets this and cnahge the view

const getFeed = (feedLink, i18nextInstance) => {
  // form correct url to avoid same policy origin problem
  const getLastUrlAllOrig = (link) => {
    // https://github.com/Hexlet/hexlet-allorigins is needed
    const allOriginPath = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
    // const url = new URL(link, allOriginPath); // Same origins still applies somehow
    const urlStr = allOriginPath + link; // but it works with str
    return urlStr;
  };

  // get responce from url
  const getRss = (url) => axios.get(url); // return promise, content is XML file (if rss is rss)

  // validate and parse RSS
  const parseRSS = (responce) => { // func should return promise cause we work with promises since getRss till the end
    // check if link contains RSS tag
    if (!responce.data.contents.includes('<rss')) {
      // if not - push new error to state errors and stop function
      throw new Error(i18nextInstance.t('validation.notRssErr'));
    }
    // if its rss - lets parse
    const parser = new DOMParser(); // https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/DOMParser
    const DOMElement = parser.parseFromString(responce.data.contents, 'text/xml'); // will return DOM element
    console.log(DOMElement);
    return DOMElement;
  };

  const getFeedAndPosts = (DOMElement) => {
    const id = Date.now().toString(); // generate ID by timestamp
    // getting feed data
    const feed = {
      id,
      title: DOMElement.querySelector('title').textContent,
      description: DOMElement.querySelector('description').textContent,
      URL: feedLink,
    };
    // getting posts data
    const itemElArr = DOMElement.querySelectorAll('item'); // tags <item> will contain what we need (thats RSS structure)
    // from every item in rss we need: description, link, title (title should be a text of link), ID for feed
    const postsArr = []; // array that will be pushed to state. Not direct push to make this clean
    itemElArr.forEach((item) => { // for each item
      const feedObj = { // we form according feed item obj that will go to state
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        link: item.querySelector('link').textContent,
        feedId: id,
      };
      postsArr.push(feedObj);
    });
    const channelFeedObj = { feed, postsArr }; // func return feed obj and arr of posts objects
    console.log(channelFeedObj);
    return channelFeedObj;
  };

  // and start all that
  const url = getLastUrlAllOrig(feedLink);
  return getRss(url) // will return promise with channelFeedObj from getFeedAndPosts
    .then((responce) => {
      const DOMElement = parseRSS(responce);
      return getFeedAndPosts(DOMElement);
    });
};

export default getFeed;
