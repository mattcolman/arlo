import React from 'react';
import { render } from 'react-dom';
import Root from './Root';

const mountPoint = document.getElementById('app');

render(<Root />, mountPoint);

if (module.hot) {
  module.hot.accept('./Root', () => {
    const NextRoot = require('./Root').default; // eslint-disable-line global-require

    render(<NextRoot />, mountPoint);
  });
}
