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
let [lat, lon] = [38.015965, -122.526599]; // default home location: San Rafael Airport
if(homeLocation && homeLocation.includes(',')) {
  lat = Number(homeLocation.split(',')[0].trim());
  lon = Number(homeLocation.split(',')[1].trim());
}

let promises = [];

let gcpList = urlParams.get('gcp');
if(gcpList) gcpList = JSON.parse(gcpList);
// console.log(gcpList);

let gcp_list = [], points = [], imageFiles = [], joins = [], highlighted = [];
for(let gcp of gcpList.controlPoints) {
  // construct gcp list
  gcp_list.push([Number(gcp.geo_x), Number(gcp.geo_y), Number(gcp.geo_z), Number(gcp.im_x), Number(gcp.im_y), gcp.image_name]);

  // construct point coordinate list
  points.push({
    id: gcp.im_x + '_' + gcp.im_y + '_' + gcp.image_name,
    coord: [Number(gcp.im_x), Number(gcp.im_y)],
    img_name: gcp.image_name,
    type: 'image'
  });
  points.push({
    id: gcp.geo_lat + '_' + gcp.geo_lon,
    coord: [Number(gcp.geo_lat), Number(gcp.geo_lon)],
    img_name: gcp.image_name,
    type: 'map'
  });

  // construct image file list
  if(gcp.image_url) {
    let imageFetch = urlToObject(gcp.image_url, gcp.image_name);
    promises.push(imageFetch);     
  }
}

async function urlToObject(url, name) {
  const response = await fetch(url);
  const blob = await response.blob();
  let option = {
    type: blob.type
  };
  const file = new File([blob], name, option);
  if(!imageFiles.find(img => img.name === name)) imageFiles.push(file);
}

Promise.all(promises).then(results => {
  // construct joins
  for(let gcp of gcpList.controlPoints) {
    let key = gcp.geo_lat + '_' + gcp.geo_lon;
    joins[key] = joins[key] || [];
    joins[key].push(gcp.im_x + '_' + gcp.im_y + '_' + gcp.image_name);
  }

  // console.log(imageFiles);
  // console.log(joins);
  // console.log(highlighted)

  let imagery = {
    gcp_list_name: 'gcp_list.txt',
    gcp_list: gcp_list,
    // gcp_list_preview: true,
    items: imageFiles,
    gcp_list_text: gcpList.crs,
    sourceProjection: gcpList.crs
  }
  
  // Default state
  const DEFAULT_STATE = {
    mapCenter: [lat, lon],
    imagepanel: { menu_active: true },
    imagery: imagery,
    controlpoints:{ highlighted: highlighted, points: points, joins: joins }
  };
  
  // create store
  const store = configureStore(DEFAULT_STATE);
  
  ReactDOM.render(
    <Provider store={store}>
      <WrappedApp />
    </Provider>,
    document.getElementById('root')
  );

});
