import React, { Component } from 'react';
import { WindowResizeListener } from 'react-window-resize-listener'
import Header from './Header';
import LeafletMap from '../connectors/LeafletMap';
import ExportModal from './ExportModal';
import ImagesGridModal from './ImagesGridModal';
import FilePreview from '../connectors/FilePreview';
import ImageEditor from '../connectors/ImageEditor';

import SlidingPanel from './SlidingPanel';
import Directions from './Directions';
import ImagesGetter from '../connectors/ImagesGetter';
import ImagesGrid from '../connectors/ImagesGrid';
import ImageNav from '../connectors/ImageNav';

class App extends Component {

  constructor(props) {
    super(props);

    // WindowResizeListener.DEBOUNCE_TIME = 200;
    this.onExportClick = this.onExportClick.bind(this);
    this.onAddHandler = this.onAddHandler.bind(this);

    // console.log('App Properties:', props);
  }

  onResize(w) {
    // this.props.onWindowResize(w);
  }

  getLeftDimensions() {
    if (!this.rightPanel) return ['auto', 'auto'];

    // Use height of right side as basis for left side height
    let parentHeight = this.rightPanel.offsetHeight;
    let imageNavHeight = (this.imageNavElm) ? this.imageNavElm.offsetHeight : 0;

    if (!imageNavHeight) {
      console.warn('Could not find a height for ".image-nav" element!');
    }

    let imageHeight = parentHeight - imageNavHeight;

    return [`${parentHeight}px`, `${imageHeight}px`]
  }

  onExportClick(evt) {
    evt.preventDefault();
    this.props.toggleExport();
  }  
  

  onAddHandler(evt) {
    const { getPositions, imagery, addControlPoint } = this.props;
    let positions = getPositions();

    addControlPoint({
      image: [...positions.image],
      map: [positions.map.lat, positions.map.lng]
    }, imagery.selected);
  }

  render() {
    const { exporter, imageGrid, controlpoints, imagery, imagepanel } = this.props;
    let [panelHeight, imageHeight] = this.getLeftDimensions();

    return (
      <div className='app'>
        {/*<WindowResizeListener onResize={ (w) => {this.onResize(w);} } />*/}
        {imagery.gcp_list_preview &&
          <FilePreview />
        }
        {exporter.active &&
          <ExportModal
            projection={imagery.projection}
            sourceProjection={imagery.sourceProjection}
            gcpListName={imagery.gcp_list_name}
            controlpoints={controlpoints}
            onClick={ (evt)=>{this.onExportClick(evt);} }/>
        }
        {
          <ImagesGridModal {...this.props} />
        }       
        <main className='main'>
          <section className='inner'>            
            <div className='panel left'>
              <div style={{ height: panelHeight }}>
                <Header onExportClick={this.onExportClick} status={controlpoints.status}/>

                <div className='image-nav-container' ref={(el) => {this.imageNavElm = el;}}>
                  <ImageNav setControlPoint={this.props.setControlPoint}/>
                </div>

                <ImageEditor
                  height={imageHeight}
                  onImagePositionChange={this.props.onImagePositionChange}
                  setPointProperties={this.props.setPointProperties}/>

                <SlidingPanel panelOpen={imagepanel.menu_active} >
                  <Directions/>
                  <ImagesGetter/>
                  <ImagesGrid/>
                </SlidingPanel>
              </div>
            </div>            
            <div className='panel right' ref={(el) => {this.rightPanel = el;}}>
              <LeafletMap {...this.props}/>
            </div>
          </section>
        </main>
      </div>
    );
  }
}

export default App;
