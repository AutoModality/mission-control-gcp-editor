import classNames from 'classnames';
import React, { Component } from 'react';
import L from 'leaflet';

class ImagesGridModal extends Component {
  constructor(props) {
    super(props);
    
    this.selectImage = this.selectImage.bind(this);    
    this.getImageFile = this.getImageFile.bind(this);
    this.buildJoins = this.buildJoins.bind(this);

    this.onSubmit = this.onSubmit.bind(this);
    this.onClose = this.onClose.bind(this); 
    
    this._imagesToBeAdded = [];
    this._imagesToBeRemoved = [];
  }

  componentDidMount() {
    L.DomUtil.addClass(document.body, 'prevent-overflow');
  }

  componentWillUnmount() {
    L.DomUtil.removeClass(document.body, 'prevent-overflow');
  }  

  updateProps(props) {
    this.setState(props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateProps(nextProps);
  }  

  selectImage(imageId) {
    const { imagery } = this.props;    
    let selectedImages = imagery.items.map(img => img.name);
    let image = imagery.image_list.find(img => img.id === imageId);

    if(image) {      
      image.selected = !image.selected;
      if(image.selected) {        
        if(!selectedImages.includes(image.Exif.Name)) this._imagesToBeAdded.push(image.Exif.Name);
      }
      else {
        if(selectedImages.includes(image.Exif.Name)) this._imagesToBeRemoved.push(image.Exif.Name);
      }
    }

    this.forceUpdate();
  }

  async onSubmit() {
    const { imagery, controlpoints, toggleImageGrid } = this.props;
    
    // update images
    for(let imageName of this._imagesToBeAdded) {
      let image = imagery.image_list.find(img => img.Exif.Name === imageName);
      if(image) {
        let file = await this.getImageFile(image.linked_file, image.Exif.Name);
        if(file && !imagery.items.find(img => img.name === image.Exif.Name)) imagery.items.push(file);
      }      
    }

    // update joins
    for(let imageName of this._imagesToBeRemoved) {      
      // Remove joins
      let indexList = [];
      let imgPoints = controlpoints.points.filter(p => p.type === 'image' && p.img_name === imageName);
      for(let point of imgPoints) {
        let ip_index = -1, mp_index = -1;
        ip_index = controlpoints.points.findIndex(p => p.id === point.id);
        if(ip_index >= 0) mp_index = controlpoints.points.findIndex(p => p.key === controlpoints.points[ip_index].key);
        if(ip_index >= 0 && mp_index >=0) {
          indexList.push(ip_index);
          indexList.push(mp_index);
        }
      }   

      for (let i = indexList.length-1; i >= 0; i--) controlpoints.points.splice(indexList[i], 1);

      // Remove image
      let img_index = imagery.items.findIndex(img => img.name === imageName);      
      if(img_index >= 0) imagery.items.splice(img_index, 1);
    }
    controlpoints.joins = this.buildJoins(controlpoints.points);

    // reset local lists
    this._imagesToBeAdded = [];
    this._imagesToBeRemoved = [];    
    
    // close modal dialog
    toggleImageGrid();
  }

  onClose() {
    const { toggleImageGrid } = this.props;
    toggleImageGrid();
  }

  async getImageFile(url, name) {
    try{
      const response = await fetch(url);
      const blob = await response.blob();
      let option = {
        type: blob.type
      };
      const file = new File([blob], name, option);
      return file;
    }
    catch(error){
      return null;
    }    
  }

  buildJoins(points) {
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

  renderImages() {
    const { imagery } = this.props;

    let images = imagery.image_list || [];    

    return images.map(img => {
      let src = img.thumbnail;
      let filename = img.Exif.Name;
      let style = {
        border: img.selected && '2px solid red',
        // cursor: img.selected && 'default'
      };

      return (
        <div key={img.id}
          className={classNames('thumb', { 'no-img': !src })} 
          onClick={ (evt) => {this.selectImage(img.id);} }
          style={style}>          
          <div className='img'>
            <img src={src} alt={filename} />
            <p className='img-name'>{filename}</p>
          </div>
        </div>
      );
    });
  }

  render() {
    let props = this.props;

    return (
      <div className={classNames('image-grid-modal')}>
        <div className='bk' onClick={(evt) => {this.onClose()} }/>
        <div className='inner'>
          <div className='head'>
            <h3>Select Images</h3>
            <span className='icon' onClick={(evt) => {this.onClose()} } title="Close"><span>&times;</span></span>
          </div>
          <div className='grid'>
            {this.renderImages()}
          </div>
          <div className='actions'>
            <button onClick={(evt) => {this.onSubmit()}}>Confirm</button>
            <button onClick={(evt) => {this.onClose()}}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }
}

export default ImagesGridModal;
