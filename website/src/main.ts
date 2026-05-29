import './styles/global.scss';

import { hydrate } from 'svelte';

import App from './App.svelte';
import { setInitialRoutePath } from './route-runtime';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing #app mount target.');
}

setInitialRoutePath(window.location.pathname);

hydrate(App, { target });
