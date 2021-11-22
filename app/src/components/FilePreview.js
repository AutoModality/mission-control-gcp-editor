import React, { Component } from 'react';

export default class FilePreview extends Component {
  render () {
    const { errors, previewGcpFileCancel, previewText, receiveGcpFile } = this.props;

    return (
      <div className='file-preview modal-dialog'>
        <div className='bk' onClick={previewGcpFileCancel}/>
        <div className='inner'>
          <div className='head'>
            <h3>Load Ground Control Points</h3>
            <span className='icon' onClick={previewGcpFileCancel}><span>&times;</span></span>
          </div>
          <div className='output'>
            {errors && (
              <div className='errors'>
                {errors.map((error, i) => <p key={`error-${i}`}>{error}</p>)}
              </div>
            )}
            <textarea value={previewText} readOnly></textarea>
            <div className='actions'>              
              <button
                disabled={errors.length > 0}
                onClick={receiveGcpFile}>
                <i className="fas fa-folder-open fa-fw"></i>&nbsp;Load
              </button>
              <button onClick={previewGcpFileCancel}>
                <i className="fas fa-ban fa-fw"></i>&nbsp;Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
