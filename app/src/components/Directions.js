import React, { Component } from 'react';

class Directions extends Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
    this.onClick = this.onClick.bind(this);
  }

  onClick(evt) {
    evt.preventDefault();
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    const statusClass = this.state.isOpen ? '' : 'hidden';
    return (
      <div className={`directions ${statusClass}`}>
        <h3 onClick={this.onClick}><span className='arrow'></span>Directions</h3>
        <div className='direction-content'>
          <p>Connect at least 5 high-contrast objects in 3 or more images to their corresponding locations on the map.</p>
          <ol>
          <li>
              <span className='tc'><span className='circled'>1</span></span>
              <span className='tc'>Load predefined ground control points. (Optional)</span>
            </li>
            <li>
              <span className='tc'><span className='circled'>2</span></span>
              <span className='tc'>Choose mission images.</span>
            </li>
            <li>
              <span className='tc'><span className='circled'>3</span></span>
              <span className='tc'>Set a point in an image.</span>
            </li>
            <li>
              <span className='tc'><span className='circled'>4</span></span>
              <span className='tc'>Select or set a corresponding point on the map.</span>
            </li>
            <li>
              <span className='tc'><span className='circled'>5</span></span>
              <span className='tc'>Repeat step 2-4 until at least 5 objects in 3 or more images are connected.</span>
            </li>
            <li>
              <span className='tc'><span className='circled'>6</span></span>
              <span className='tc'>Save/Export the ground control points.</span>
            </li>
          </ol>
        </div>
      </div>
    );
  }
}

export default Directions;