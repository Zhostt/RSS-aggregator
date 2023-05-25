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
  const getRss = (url) => axios.get(url); // return responce - XML file (if rss is rss)

  // validate and parse RSS
  const parseRSS = (responce) => { // func should return promise cause we work with promises since getRss till the end
    // check if link contains RSS tag
    if (!responce.data.contents.includes('<rss')) {
      const parser = new DOMParser(); // https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/DOMParser
      const DOMElement = parser.parseFromString(responce.data.contents, 'text/xml'); // will return DOM element
      console.log('ERROR', DOMElement);
      throw new Error();
    }
    // if its rss - lets parse
    const parser = new DOMParser(); // https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/DOMParser
    const DOMElement = parser.parseFromString(responce.data.contents, 'text/xml'); // will return DOM element
    // console.log('RECIEVED DOM ELEMENT', DOMElement);
    return DOMElement;
  };

  const getFeedAndPosts = (DOMElement) => {
    // getting feed data
    const feed = {
      title: DOMElement.querySelector('title').textContent,
      description: DOMElement.querySelector('description').textContent,
      URL: feedLink, // instead of id - submitted link
    };
    // getting posts data
    const itemElArr = DOMElement.querySelectorAll('item'); // tags <item> will contain what we need (thats RSS structure)
    // from every item in rss we need: description, link, title (title should be a text of link), ID for feed
    const postsArr = []; // array that will be pushed to state. Not direct push to make this clean
    itemElArr.forEach((item) => { // for each item
      // ID is complicated - no special characters, cant begin with int. Cant genereate it each time - it will regenerate every feedCheck (5 sec) and make post doubles. So we get GUID of post and make correct string id out of it
      const normalisedPostGuid = item.querySelector('guid').textContent.replace(/[^\w\s]/gi, ''); // delete spec chars in post guid
      const postId = `post${normalisedPostGuid}`;
      const postObj = { // form according feed item obj that will go to state
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        link: item.querySelector('link').textContent,
        id: postId,
        feedURL: feedLink, // link between feed and post by feed URL
      };
      postsArr.push(postObj);
    });
    const feedPostObj = { feed, postsArr }; // func return feed obj and arr of posts objects
    return feedPostObj;
  };
  // and start all that
  const url = getLastUrlAllOrig(feedLink);
  return getRss(url)
    .catch((err) => { // handling network errors
      console.log(err);
      throw new Error(i18nextInstance.t('validation.networkErr'));
    })
    .then((responce) => {
      const DOMElement = parseRSS(responce);
      return getFeedAndPosts(DOMElement);
    })
    .catch((err) => {
      throw new Error(i18nextInstance.t('validation.notRssErr'));
    });
};

export default getFeed;
