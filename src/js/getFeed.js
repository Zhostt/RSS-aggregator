import axios from 'axios';

// get from url from state (onWatch state.urlForm.feedList)
// It gets xml, next is Parser. Returns array of objects with ...
// ...description, link, title (title should be a text of link), feedURL as ID
// Then parsed staff added to state.feed
// viewer gets this and cnahge the view

const getFeed = (feedLink, state, i18nextInstance) => {
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
  const parseRSS = (rssPromise) => rssPromise
    .then((responce) => { // fun should return promise
    // cause we work with promises since getRss till the end
    // check if link contains RSS tag
      if (!responce.data.contents.includes('rss version')) {
      // if not - push new error to state errors and stop function
        state.urlForm.valid = false;
        state.urlForm.errors.push(i18nextInstance.t('validation.notRssErr'));
        return false;
      }
      // if its rss - lets parse
      const parser = new DOMParser(); // https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/DOMParser
      const DOMElement = parser.parseFromString(responce.data.contents, 'text/xml'); // will return DOM element
      console.log(DOMElement);
      const itemElArr = DOMElement.querySelectorAll('item'); // tags <item> will contain what we need (thats RSS structure)
      // from every item in rss we need:
      // description, link, title (title should be a text of link), feedURL as ID
      const feedArr = []; // array that will be pushed to state. Not direct push to make this clean
      itemElArr.forEach((item) => { // for each item
        const feedObj = { // we form according feed item obj that will go to state
          title: item.querySelector('title').textContent,
          description: item.querySelector('description').textContent,
          link: item.querySelector('link').textContent,
          feedURL: feedLink, // original feed link (not that all-origins stugg)
        };
        feedArr.push(feedObj);
      });
      return feedArr;
    });

  // and start all that
  const url = getLastUrlAllOrig(feedLink);
  const rssPromise = getRss(url);
  // stop if validation failed
  parseRSS(rssPromise) // parseRSS return promise
    .then((feedArr) => {
      if (feedArr !== false) {
        state.feed.push(feedArr);
        return feedArr;
      }
      return false;
    }); // and we push returned arr to state
};

export default getFeed;
