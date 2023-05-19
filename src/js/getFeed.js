import axios from 'axios';

// get from url from state (onWatch state.urlForm.feedList),so getter should recieve state and make onWatch
// It gets xml, next is Parser. Returns array of objects with description, link, title (title should be a text of link), feedURL as ID
// Then parsed staff added to state.feed
// viewer gets this and cnahge the view

// summary func
const getFeed = (feedLink, state, i18nextInstance) => {
  const getLastUrlAllOrig = (link) => { // https://github.com/Hexlet/hexlet-allorigins is needed
    const allOriginPath = 'https://allorigins.hexlet.app/get?disableCache=true&url='; // to prevent same origin policy err
    const url = new URL(link, allOriginPath); // path first, url base second arg
    return url;
  };

  const getRss = (url) => axios.get(url); // return promise, content is XML file (if rss is rss)

  const validateRSS = (rss) => {
    rss.then((responce) => {
    // check if link contains RSS
      if (!responce.headers['content-type'].includes('application/rss+xml') || !responce.headers['content-type'].includes('application/xml')) {
      // if not - push new error to state errors and stop function
        state.urlForm.valid = false;
        state.urlForm.errors.push(i18nextInstance.t('validation.notRssErr'));
        return false;
      }
      return true;
    });
  };

  const parseRSS = (rss, url) => {
    const parser = new DOMParser();
    const DOMElement = parser.parseFromString(rss, 'text/xml'); // will return DOM element, tags <item> will contain what we need
    const itemElArr = DOMElement.querySelectorAll('item');
    const feedArr = [];
    // from every item - form feed obj with
    // description, link, title (title should be a text of link), feedURL as ID
    itemElArr.forEach((el) => {
      const feedObj = {
        title: el.title,
        description: el.description,
        link: el.link,
        RSS: url,
      };
      feedArr.push(feedObj);
    });
    return feedArr;
  };

  // and start all that
  const url = getLastUrlAllOrig(feedLink);
  const rssPromise = getRss(url);
  const rssValid = validateRSS(rssPromise, i18nextInstance);
  // stop if validation failed
  if (rssValid === false) {
    return false;
  }
  const feedArr = parseRSS(rssPromise, url);
  console.log(feedArr);
  state.feed.push(...feedArr);
};

export default getFeed;
