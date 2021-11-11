import React from 'react';

const AddPoint = (props) => {
    return (
      <div className='add-point-wrapper'>
        <button className='add-point' onClick={props.onClick}>
          <i className='fa fa-plus-circle fa-fw' />&nbsp;
          Add Marker
        </button>
        <div className='helper'>
          <p>Click on the image or map to add a point.</p>
        </div>

      </div>
    )
}

export default AddPoint;