import './styles/global.scss';

import { mount } from 'svelte';

import App from './App.svelte';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing #app mount target.');
}

mount(App, { target });
