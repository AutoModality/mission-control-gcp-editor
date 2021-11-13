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

// mission id and home location
let missionId = urlParams.get('mid');
let homeLocation = urlParams.get('home');
let [lat, lon] = [38.015965, -122.526599]; // default home location: San Rafael Airport
if(homeLocation && homeLocation.includes(',')) {
  lat = Number(homeLocation.split(',')[0].trim());
  lon = Number(homeLocation.split(',')[1].trim());
}

// gcp and images
let gcpList = urlParams.get('gcp');
if(gcpList) gcpList = JSON.parse(gcpList);
else gcpList = { crs: 'WGS84', controlPoints: [] };

let parentScope = parent && parent.angular ? parent.angular.element('#main').scope() : undefined;
if(parentScope && parentScope.GCPs && parentScope.DisplayedImages) gcpList = parentScope.GCPs;
console.log('GCP List:', gcpList);

let promises = [];
let gcp_list = [], points = [], image_files = [], joins = [], highlighted = [];
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
  if(!image_files.find(img => img.name === name)) image_files.push(file);
}

Promise.all(promises).then(results => {
  // construct joins
  for(let gcp of gcpList.controlPoints) {
    let key = gcp.geo_lat + '_' + gcp.geo_lon;
    joins[key] = joins[key] || [];
    joins[key].push(gcp.im_x + '_' + gcp.im_y + '_' + gcp.image_name);
  }

  // console.log(image_files);
  // console.log(joins);
  // console.log(highlighted);

  let controlPoints = { highlighted: highlighted, points: points, joins: joins };
  let imagery =  {
    gcp_list_name: gcpList.name,
    gcp_list: gcp_list,
    gcp_list_preview: false,
    items: image_files,
    gcp_list_text: gcpList.crs,
    sourceProjection: gcpList.crs
  };

  init(controlPoints, imagery);
});

function init(controlpoints, imagery) {
  controlpoints = controlpoints || { highlighted: highlighted, points: points, joins: joins };
  imagery = imagery || {};
  
  // Default state
  let DEFAULT_STATE = {
    mapCenter: [lat, lon],
    imagepanel: { menu_active: true },
    imagery: imagery,
    controlpoints: controlpoints
  };
  
  // create store
  let store = configureStore(DEFAULT_STATE);
  
  ReactDOM.render(
    <Provider store={store}>
      <WrappedApp />
    </Provider>,
    document.getElementById('root')
  ); 
}
