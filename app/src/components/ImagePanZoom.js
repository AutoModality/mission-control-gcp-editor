import React, { Component, PropTypes } from 'react';
import Image from './Image';
import Slider from 'react-rangeslider';

// https://github.com/rexxars/react-element-pan/blob/master/src/element-pan.js
class ImagePanZoom extends Component {

  static propTypes = {
    image: PropTypes.object,
    points: PropTypes.array,
    onImagePositionChange: PropTypes.func,
    markerDraggable: PropTypes.bool
  }

  static defaultProps = {
    image: null,
    points: [],
    onImagePositionChange: () => {},
    markerDraggable: false
  }

  constructor(props) {
    super(props);

    this.state = {
      dragging: false,
      marker: null,
      scale: 1,
      imageWidth: 0,
      imageHeight: 0,
      imageData: {
        src: null,
        width: 0,
        height: 0,
        orientation: 1
      }
    };

    this.onDownHandler = this.onDownHandler.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.onSliderChange = this.onSliderChange.bind(this);
    this.onImageLoad = this.onImageLoad.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.image !== nextProps.image) {
      this.reset();
    }

    this.setState({ dragging: false, marker: null });
  }

  componentDidMount() {
    this.el = this.refs.container;
  }

  reset() {
    if (this.el) {
      this.el.scrollLeft = 0;
      this.el.scrollTop = 0
    }

    this.setState({
      dragging: false
    });
  }

  getMousePosition(evt) {
    let rect = this.el.getBoundingClientRect();

    let x = typeof evt.clientX === 'undefined' ? evt.changedTouches[0].clientX : evt.clientX;
    let y = typeof evt.clientY === 'undefined' ? evt.changedTouches[0].clientY : evt.clientY;

    return [x - rect.left, y - rect.top];
  }

  getCenter() {
    if (!this.el) return [0,0];
    let rect = this.el.getBoundingClientRect();
    let x = this.el.scrollLeft + (rect.width / 2);
    let y = this.el.scrollTop + (rect.height / 2);
    return [x,y]
  }


  transformPosition(x, y, atNative) {
    const {imageData, imageWidth, imageHeight} = this.state;
    const dx = imageWidth / imageData.width;
    const dy = imageHeight / imageData.height;

    if (atNative) {
      return [x * (1 / dx), y * (1 / dy)];
    }

    return [x * dx, y * dx];
  }

  onDownHandler(evt) {
    evt.preventDefault();
    if (!evt.target) return;

    window.addEventListener('mousemove', this.onDragMove);
    window.addEventListener('touchmove', this.onDragMove);
    window.addEventListener('mouseup', this.onDragStop);
    window.addEventListener('touchend', this.onDragStop);

    // let target = evt.currentTarget || evt.target;
    let bounds = evt.target.getBoundingClientRect();

    let [startX, startY] = this.getMousePosition(evt);

    var state = {
      dragging: true,
      marker: evt.target.className.indexOf('image-point') > -1 ? evt.target : null,

      elHeight: this.el.clientHeight,
      elWidth: this.el.clientWidth,

      startX: startX,
      startY: startY,

      scrollX: this.el.scrollLeft,
      scrollY: this.el.scrollTop,

      maxX: bounds.width,
      maxY: bounds.height
    };

    this.setState(state);
  }

  onDragMove(evt) {
    if (!this.state.dragging) {
      return;
    }

    let [x, y] = this.getMousePosition(evt);

    if (this.state.marker) {
      this.state.marker.style.left = `${x}px`;
      this.state.marker.style.top = `${y}px`;
      return;
    }

    // Letting the browser automatically stop on scrollHeight
    // gives weird bugs where some extra pixels are showing.
    // Substracting the height/width of the container from the
    // inner content seems to do the trick.
    this.el.scrollLeft = Math.min(
      this.state.maxX - this.state.elWidth,
      this.state.scrollX - (x - this.state.startX)
    );

    this.el.scrollTop = Math.min(
      this.state.maxY - this.state.elHeight,
      this.state.scrollY - (y - this.state.startY)
    );
  }

  onDragStop(evt) {
    const {imageData, imageWidth, imageHeight} = this.state;
    let [x, y] = this.getMousePosition(evt);

    let left = this.el.scrollLeft;
    let top = this.el.scrollTop;

    let [nx, ny] = this.transformPosition(left + x, top + y, true);

    if (this.state.marker) {
      this.state.marker.style.left = `${nx}px`;
      this.state.marker.style.top = `${ny}px`;
    }

    window.removeEventListener('mousemove', this.onDragMove);
    window.removeEventListener('touchmove', this.onDragMove);
    window.removeEventListener('mouseup', this.onDragStop);
    window.removeEventListener('touchend', this.onDragStop);

    let markerId = this.state.marker ? +this.state.marker.getAttribute('data-id') : null;
    this.props.onImagePositionChange([nx, ny], markerId);

    this.setState({ dragging: false, marker: null });
  }

  onSliderChange(value) {
    const {imageData, scaleFn} = this.state;
    if (!imageData.src || !scaleFn) return;

    let scale = value;
    let [imageWidth, imageHeight] = this.scaleImage(imageData.width, imageData.height, scale, scaleFn);

    this.setState({scale, imageWidth, imageHeight});
  }

  scaleImage(width, height, scale, fn) {
    let ratio, dim;

    if (width > height) {
      ratio = height / width;
      dim = fn(scale);
      return [dim, dim * ratio];
    }

    ratio = width / height;
    dim = fn(scale);
    return [dim * ratio, dim];
  }

  onImageLoad(imageData, imageMeta) {
    let {width, height} = imageData;

    let min = (width > height) ? 432 : 360;
    let max = (width > height) ? width * 2 : height * 2;

    let scaleFn = this.linearScale([0,2], [min, max], true);
    let scaleFnInverse = this.linearScale([min, max], [0,2], true);

    let scale = scaleFnInverse(max / 2);
    let [imageWidth, imageHeight] = this.scaleImage(width, height, scale, scaleFn);

    this.setState({imageData, scaleFn, scale, imageWidth, imageHeight});
  }


  // https://github.com/mapbox/simple-linear-scale/blob/master/index.js
  linearScale(domain, range, clamp) {
    return function(value) {
      if (domain[0] === domain[1] || range[0] === range[1]) {
        return range[0];
      }
      let ratio = (range[1] - range[0]) / (domain[1] - domain[0]),
        result = range[0] + ratio * (value - domain[0]);
      return clamp ? Math.min(range[1], Math.max(range[0], result)) : result;
    };
  }

  renderPoints() {
    const { points, selectedImage, markerDraggable } = this.props;
    const {imageData, imageWidth, imageHeight} = this.state;

    return points.map((pt, i) => {
      if (pt.imageIndex === selectedImage && pt.locations.image) {
        let [x, y] = this.transformPosition(pt.locations.image[0], pt.locations.image[1]);
        let style = {
          left: `${x}px`,
          top: `${y}px`
        };
        let klass = markerDraggable ? ' draggable' : '';
        return <div key={`ip${i}`} className={`image-point${klass}`} data-id={pt.id} style={style} />;
      }

      return null;
    });
  }

  render() {
    const {imageData, scale, imageWidth, imageHeight} = this.state;
    const {image} = this.props;

    let pos = this.getCenter();
    pos = this.transformPosition(pos[0], pos[1], true);
    this.props.onImagePositionChange(pos);

    return (
      <div className='imgpanzoom-container'>
        <div
          ref='container'
          className='imagepanzoom'
          onMouseDown={this.onDownHandler}
          onTouchStart={this.onDownHandler}>
          <div className='points-layer' style={{width: `${imageWidth}px`, height: `${imageHeight}px`}}>
            {this.renderPoints()}
          </div>
          <Image
            srcToLoad={image}
            srcToDisplay={imageData.src}
            width={imageWidth}
            height={imageHeight}
            needsRevoking={imageData.needsRevoking}
            orientation={imageData.orientation}
            onImageLoad={this.onImageLoad}
          />
        </div>
        <Slider
          value={scale}
          min={0}
          max={2}
          step={0.01}
          orientation="vertical"
          onChange={this.onSliderChange}
        />
      </div>
    );
  }
}

export default ImagePanZoom;