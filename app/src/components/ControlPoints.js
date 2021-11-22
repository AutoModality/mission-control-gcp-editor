import React, { Component } from 'react';
import classNames from 'classnames';

class ControlPoints extends Component {

  renderPoints() {
    const { controlpoints, selectedImage } = this.props;
    const points = controlpoints.points.filter(p => {
      return p.img_name === selectedImage && p.type === 'image';
    });

    if (!points.length) return (
      <li>No Points ...</li>
    );

    return points.map((pt, index) => (
      <li key={`gcp-tick-${pt.id}-${index}`} className={classNames(
        'active', 'point', { 'edit': pt.isAutomatic }
      )}/>
    ));
  }

  render() {
    const { selectedImage } = this.props;
    return (
      <div className='control-points-i'>
        <div>
          <h3>{selectedImage}</h3>
          <ul>
            {this.renderPoints()}
          </ul>
        </div>
      </div>
    );
  }
}

export default ControlPoints;
