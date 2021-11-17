import classNames from 'classnames';
import React, { Component } from 'react';
import L from 'leaflet';

class ImagesGridModal extends Component {
  constructor(props) {
    super(props);
    
    this.selectImage = this.selectImage.bind(this);    
    this.getImageFile = this.getImageFile.bind(this);

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
    
    // add images
    for(let imageName of this._imagesToBeAdded) {
      let image = imagery.image_list.find(img => img.Exif.Name === imageName);
      if(image) {
        let file = await this.getImageFile(image.linked_file, image.Exif.Name);
        if(file && !imagery.items.find(img => img.name === image.Exif.Name)) imagery.items.push(file);
      }      
    }

    // remove images and joins
    for(let imageName of this._imagesToBeRemoved) {      
      // Remove joins
      let points = controlpoints.points.filter(p => p.img_name === imageName);
      for(let point of points) {
        let p_index = controlpoints.points.findIndex(p => p.id === point.id);
        if(p_index) controlpoints.points.splice(p_index, 1);
      }    
      // Remove image
      let index = imagery.items.findIndex(img => img.name === imageName);      
      if(index) imagery.items.splice(index, 1);  
    }

    this._imagesToBeAdded = [];
    this._imagesToBeRemoved = [];
    
    this.forceUpdate();
    imagery.items = imagery.items.sort((a, b) => {
      if(a.name < b.name) return -1;
      if(a.name > b.name) return 1;
    });
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
