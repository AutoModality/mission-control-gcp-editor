import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';
import ImageLoader from 'blueimp-load-image';

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

  loadImage(src) {
    if (!src) return;
    let imgElm = this.thumbImage;

    let options = {
      canvas: true,
      maxWidth: 150,
      maxHeight: 150,
      contain: true,
      pixelRatio: window.devicePixelRatio,
      orientation: true
    };

    ImageLoader(
      src,
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
    const shortenFileName = (fileName, maxLength) => {
      maxLength = maxLength || 16;
    
      var name = fileName.substring(0, fileName.lastIndexOf("."));
      var ext = fileName.substring(fileName.lastIndexOf("."));
    
      if(name.length <= maxLength) return fileName;
      else {
        var prefix = name.substring(0, 4);
        var postfix = name.substring(name.length-9);
        var newName = prefix + "..." + postfix;
        return newName + ext;
      }
    }

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
