import React from 'react';
import ExportButton from './ExportButton';

const Header = (props) => {
  let disabled = props.status === undefined ? true : false;

  return (
    <header className="header">
      <h3>Ground Control Point</h3>
      <ExportButton onClick={(evt)=>{props.onExportClick(evt);}} disabled={disabled}/>
    </header>
  );
}

export default Header;