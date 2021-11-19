import React from 'react';
import ReactDOM from 'react-dom';
import WrappedApp from './connectors/Wrapped';

// Redux
import { Provider } from 'react-redux';
import configureStore from './state/store';

// Styles
import 'ace-css/css/ace.min.css';
import 'leaflet/dist/leaflet.css';
import './styles/main.css';

// Test data
import testData from './common/test-data';

// URL query
const url = new URL(window.location);
let urlParams = url.searchParams;

let mode = (urlParams.get('mode') || '').toLowerCase();

// mission id and home location
// let missionId = urlParams.get('mid');
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

let imageList = [], imageLoaded;

let parentScope = parent && parent.angular ? parent.angular.element('#main').scope() : undefined;
if(parentScope && parentScope.GCPs && parentScope.DisplayedImages) gcpList = parentScope.GCPs;
else if(mode == 'test') gcpList = testData().gcp_list;
else gcpList = { crs: 'WGS 84', controlPoints: [] };
// console.log('GCP list:', gcpList);

if(parentScope && parentScope.DisplayedImages) {
  imageList = parentScope.DisplayedImages.filter(img => !img.Exif.Name.includes('Orthophoto')).sort((a,b) => {
    if(a.Exif.Name < b.Exif.Name) return -1;
    if(a.Exif.Name > b.Exif.Name) return 1;
  });
  imageLoaded = parentScope.STATUS_IMAGERY_DATA_LOADING;
}
else if(mode == 'test') {
  imageList = testData().image_list;
  imageLoaded = 'done';
}
else {
  imageList = [];
  imageLoaded = 'done';
}
// console.log('Image list:', imageList);

let promises = [];
let gcp_list = [], points = [], image_files = [], joins = [], highlighted = [];
for(let gcp of gcpList.controlPoints) {
  // construct gcp list
  gcp_list.push([Number(gcp.geo_x), Number(gcp.geo_y), Number(gcp.geo_z), Number(gcp.im_x), Number(gcp.im_y), gcp.image_name]);

  // construct point coordinate list
  points.push({
    key: [gcp.geo_lat, gcp.geo_lon, gcp.im_x, gcp.im_y, gcp.image_name].join('_'),
    id: ['img', gcp.im_x, gcp.im_y, gcp.image_name].join('_'),
    coord: [Number(gcp.im_x), Number(gcp.im_y)],
    img_name: gcp.image_name,
    type: 'image',
    has_image: true
  });
  points.push({
    key: [gcp.geo_lat, gcp.geo_lon, gcp.im_x, gcp.im_y, gcp.image_name].join('_'),
    id: ['map', gcp.geo_lat, gcp.geo_lon].join('_'),
    coord: [Number(gcp.geo_lat), Number(gcp.geo_lon)],
    // img_name: gcp.image_name,
    type: 'map',
    z: Number(gcp.geo_z)
  });

  // construct image file list
  if(gcp.image_url) {    
    let imageFetch = getImageFile(gcp.image_url, gcp.image_name);
    promises.push(imageFetch);
    
    let image = imageList.find(img => img.Exif.Name === gcp.image_name);
    if(image) image.selected = true;
  }
}

async function getImageFile(url, name) {
  const response = await fetch(url);
  const blob = await response.blob();
  let option = {
    type: blob.type
  };
  const file = new File([blob], name, option);
  if(!image_files.find(img => img.name === name)) image_files.push(file);
}

function buildJoins(points) {
  let joins = [];
  let mapPoints = points.filter(p => p.type === 'map');
  let imgPoints = points.filter(p => p.type === 'image');

  let keys = new Set(mapPoints.map(p => p.id));
  for(let k of keys) {
    joins[k] = joins[k] || [];

    for(let imgPoint of imgPoints) {
      let mapPoint = mapPoints.find(mp => mp.key === imgPoint.key);
      if(mapPoint && mapPoint.id === k) {
        joins[k].push(imgPoint.id);
      }
    }
  }

  return joins;
}

function init(controlpoints, imagery) {
  controlpoints = controlpoints || { highlighted: highlighted, points: points, joins: joins };
  imagery = imagery || {};
  
  // Default state
  let DEFAULT_STATE = {
    mapCenter: [lat, lon],
    imagepanel: { menu_active: true },
    imagery: imagery,
    controlpoints: controlpoints,
    imageGrid: { grid_active: false }
  };
  
  // Create store
  let store = configureStore(DEFAULT_STATE);
  
  ReactDOM.render(
    <Provider store={store}>
      <WrappedApp />
    </Provider>,
    document.getElementById('root')
  );  
}

let controlPoints = {
  highlighted: highlighted, 
  points: points, 
  joins: buildJoins(points),
  mode: 'img_edit',
  status: { valid: true, errors: [] }
};
let imagery =  {
  gcp_list_name: gcpList.name,
  gcp_list: gcp_list,
  gcp_list_preview: false,
  items: image_files,
  gcp_list_text: gcpList.crs,
  sourceProjection: gcpList.crs,
  image_list: imageList,
  image_list_loaded: imageLoaded
};

if(promises.length > 0) {
  Promise.all(promises).then(res => {
    // wait for completion of loading images
    init(controlPoints, imagery);

    let thumb = document.querySelector(".thumb");
    if(thumb) thumb.click();
    let fitMakrer = document.querySelector(".fit-marker");
    if(fitMakrer) fitMakrer.click();    
  })
}
else {
  init(controlPoints, imagery);
}


