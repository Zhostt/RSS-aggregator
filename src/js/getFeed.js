import axios from 'axios';
import { isNumber } from 'lodash';

// get from url. It gets xml
// Parser. Returns array of objects with ...
// ...description, link, title (title should be a text of link), ID
// Then parsed stuff added to state.feed
// viewer gets this and cnahge the view

// onSubmit - are we submitting new feed or check old ones for new posts, boolean
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
      const parser = new DOMParser(); // https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/DOMParser
      const DOMElement = parser.parseFromString(responce.data.contents, 'text/xml'); // will return DOM element
      console.log('ERROR', DOMElement);
      throw new Error(i18nextInstance.t('validation.notRssErr'));
    }
    // if its rss - lets parse
    const parser = new DOMParser(); // https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/DOMParser
    const DOMElement = parser.parseFromString(responce.data.contents, 'text/xml'); // will return DOM element
    console.log(DOMElement);
    return DOMElement;
  };

  const getFeedAndPosts = (DOMElement) => {
    // const id = Date.now().toString(); // generate ID by timestamp // Will use submitted URL instead of that
    // getting feed data
    const feed = {
      // id,
      title: DOMElement.querySelector('title').textContent,
      description: DOMElement.querySelector('description').textContent,
      URL: feedLink, // instead of id - submitted link
    };
    // getting posts data
    const itemElArr = DOMElement.querySelectorAll('item'); // tags <item> will contain what we need (thats RSS structure)
    // from every item in rss we need: description, link, title (title should be a text of link), ID for feed
    const postsArr = []; // array that will be pushed to state. Not direct push to make this clean
    itemElArr.forEach((item) => { // for each item
      const postObj = { // we form according feed item obj that will go to state
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        link: item.querySelector('link').textContent,
        feedURL: feedLink, // instead of id
        // feedId: id,
      };
      postsArr.push(postObj);
    });
    const channelpostObj = { feed, postsArr }; // func return feed obj and arr of posts objects
    return channelpostObj;
  };
  // and start all that
  const url = getLastUrlAllOrig(feedLink);
  return getRss(url) // will return promise with channelpostObj from getFeedAndPosts
    .then((responce) => {
      const DOMElement = parseRSS(responce);
      return getFeedAndPosts(DOMElement);
    });
};

export default getFeed;
