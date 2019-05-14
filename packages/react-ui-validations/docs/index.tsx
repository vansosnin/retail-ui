import * as React from 'react';
import * as ReactDom from 'react-dom';

import {Router, IndexRoute, Route, useRouterHistory} from 'react-router';
import createHashHistory from 'history/lib/createHashHistory';

import Layout from './components/Layout';
import Api from './components/Pages/Api.md';
import GettingStarted from './components/Pages/Docs/GettingStarted/GettingStarted.md';
import Examples from './components/Pages/Examples';
import Declarations from './components/Pages/Docs';
import Builder from './components/Pages/Builder';
import Concepts from './components/Pages/Concepts';

import 'docs/styles/reset.less';
import 'docs/styles/typography.less';

const history = useRouterHistory(createHashHistory)();

ReactDom.render(
  <Router history={history}>
    <Route path="/" component={Layout}>
      <IndexRoute component={GettingStarted}/>
      {[...Examples, ...Declarations, ...Builder, ...Concepts].map(page => (
        <Route key={page.url} path={page.url} component={page.component}/>
      ))}
      <Route path="api" component={Api}/>
      <Route path="getting-started" component={GettingStarted}>
        <Route path="*"/>
      </Route>
    </Route>
  </Router>,
  document.getElementById('content'),
);
