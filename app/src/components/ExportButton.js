import React from 'react';

const ExportButton = (props) => {
    return (
        <button className='export-btn' onClick={props.onClick} disabled={props.disabled}>
            <i className="fas fa-file-export fa-fw" />&nbsp;
            Export GCP List
        </button>
    );
}

export default ExportButton;