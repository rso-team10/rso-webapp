import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import FirstPage from './FirstPage';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <FirstPage />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
