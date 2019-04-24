require('ts-node').register({ files: true, transpileOnly: true });

const config = {
  gridUrl: 'http://screen-dbg:shot@grid.testkontur.ru/wd/hub',
  address: {
    host: 'localhost',
    port: 6060,
    path: '/iframe.html',
  },
  browsers: {
    chrome: { browserName: 'chrome' },
    firefox: { browserName: 'firefox' },
    ie11: { browserName: 'internet explorer' },
  },
};

module.exports = config;
