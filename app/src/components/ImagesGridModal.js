import classNames from 'classnames';
import React, { Component } from 'react';
import L from 'leaflet';

class ImagesGridModal extends Component {
  constructor(props) {
    super(props);
    this.onClose = this.onClose.bind(this);
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

  onClose() {
    const { toggleImageGrid } = this.props;
    toggleImageGrid();
  }

  renderImages() {
    const { imagery } = this.props;

    let images = imagery.image_list || [];    

    return images.map(img => {
      let src = img.thumbnail;
      let filename = img.Exif.Name;
      let style = {
        border: img.selected && '2px solid red'
      };

      return (
        <div key={img.id}
          className={classNames('thumb', { 'no-img': !src })} 
          onClick={(evt) => {this.onClickHandler(evt);}}
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
            <button>Confirm</button>
            <button onClick={(evt) => {this.onClose()} }>Cancel</button>
          </div>
        </div>
      </div>
    );
  }
}

export default ImagesGridModal;
