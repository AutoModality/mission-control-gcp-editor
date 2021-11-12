import React from 'react';
import ReactDOM from 'react-dom';
import WrappedApp from './connectors/Wrapped';

// Redux
import { Provider } from 'react-redux'
import configureStore from './state/store';

// Styles
import 'ace-css/css/ace.min.css';
import 'leaflet/dist/leaflet.css';
import './styles/main.css';

// URL query
const url = new URL(window.location);
let urlParams = url.searchParams;
let missionId = urlParams.get('mid');
let homeLocation = urlParams.get('home');
let lat = 38.015965, lon = -122.526599;
if(homeLocation && homeLocation.includes(',')) {
  lat = Number(homeLocation.split(',')[0].trim());
  lon = Number(homeLocation.split(',')[1].trim());
}

// Default state
const DEFAULT_STATE = {
  mapCenter: [lat, lon],
  imagepanel: { menu_active: true },
  imagery: {},
  controlpoints:{ highlighted: [], points:[], joins: {} }
};

// create store
const store = configureStore(DEFAULT_STATE);

ReactDOM.render(
  <Provider store={store}>
    <WrappedApp />
  </Provider>,
  document.getElementById('root')
);
