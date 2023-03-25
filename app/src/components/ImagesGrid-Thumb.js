import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';
import ImageLoader from 'blueimp-load-image';
import { shortenFileName } from '../common/utility';
import Tiff from 'tiff.js';

class ImagesGridThumb extends Component {
  static propTypes = {
    src: PropTypes.object,
    onThumbClick: PropTypes.func,
    onDeleteImage: PropTypes.func,
    selected: PropTypes.bool,
    points: PropTypes.number
  }

  static defaultProps = {
    src: null,
    onThumbClick: () => {},
    onDeleteImage: () => {},
    selected: false,
    points: 0
  }

  async loadImage(src) {
    if (!src) return;
    let imgElm = this.thumbImage;

    let imgData; // file, blob, or url
    if(src.type === 'image/tiff') {
      const buffer = await src.arrayBuffer();
      const tiff = new Tiff({
        buffer: buffer
      });
      imgData = tiff.toDataURL();
    } else {
      imgData = src;
    }

    let options = {
      canvas: true,
      maxWidth: 150,
      maxHeight: 150,
      contain: true,
      pixelRatio: window.devicePixelRatio,
      orientation: true
    };

    ImageLoader(
      imgData,
      function (canvas) {
        imgElm.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg', 0.5)})`;
      },
      options
    );
  }

  shouldComponentUpdate(nextProps) {
    return (this.props !== nextProps) ? true : false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.src !== nextProps.src) this.loadImage(nextProps.src);
  }

  componentDidMount() {
    this.loadImage(this.props.src);
  }

  onClickHandler(evt) {
    const { onThumbClick, src, selected } = this.props;
    evt.preventDefault();
    onThumbClick(src, selected);
  }

  onDeleteHandler(evt) {
    const { onDeleteImage, filename } = this.props;
    evt.preventDefault();
    evt.stopPropagation();
    onDeleteImage(filename);
  }

  render() {
    const { filename, points, selected, src } = this.props;    

    return (
      <div className={classNames('thumb', {
        'no-img': !src,
        selected
      })} onClick={(evt) => {this.onClickHandler(evt);}}>
        <div className='badge bubble'>
          <span className='count'>{points}</span>
        </div>
        <div className='delete bubble' onClick={(evt) => {this.onDeleteHandler(evt);}}>
          <span>&times;</span>
        </div>
        <div className='img' ref={el => {this.thumbImage = el;}} />
        <p className='img-name'>{shortenFileName(filename)}</p>
      </div>
    );
  }
}

export default ImagesGridThumb;
