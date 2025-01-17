import React, { Component } from 'react';
import Dropzone from 'react-dropzone';

const DROPZONE_STYLE_ACTIVE = { borderStyle: 'solid', backgroundColor: '#eee' };
const DROPZONE_STYLE_REJECT = { borderStyle: 'solid', backgroundColor: '#ffdddd' };

class ImagesGetter extends Component {
  constructor(props) {
    super(props);
    this.onImagesDrop = this.onImagesDrop.bind(this);
    this.onTextDrop = this.onTextDrop.bind(this);
    this.submitLocalFiles = this.submitLocalFiles.bind(this);
    this.onToggle = this.onToggle.bind(this);
    this.onChooseImagesClick = this.onChooseImagesClick.bind(this);
  }

  onImagesDrop(acceptedFiles, rejectedFiles) {
    const { receiveImageFiles, imagery } = this.props;

    let items = [];

    if (imagery.items) {
      items = imagery.items.map(d => d.name);
    }

    this.images = acceptedFiles.filter(f => {
      return items.indexOf(f.name) < 0;
    });

    if (!this.images.length) return;

    receiveImageFiles(this.images, this.gcpText);
  }

  onTextDrop(acceptedFiles, rejectedFiles) {
    if (!acceptedFiles.length) return;
    const { previewGcpFile } = this.props;

    let name = acceptedFiles[0].name;
    let fReader = new FileReader();
    fReader.readAsText(acceptedFiles[0]);

    fReader.onload = () => {
      previewGcpFile(name, fReader.result)
    };
  }

  submitLocalFiles(evt) {
    evt.preventDefault();

    const { receiveImageFiles } = this.props;
    receiveImageFiles(this.images, this.gcpText);
  }

  onToggle() {
    this.gcpText = null;
    this.images = null;
  }

  onChooseImagesClick(evt) {
    evt.stopPropagation();
    const { toggleImageGrid } = this.props;
    toggleImageGrid();
  }

  renderFileText() {
    const { imagery } = this.props;

    let hasGCPFile = imagery.gcp_list_name ? true : false;
    let elm = <div><i className="fas fa-list fa-lg fa-fw" />&nbsp;&nbsp;<b>Load GCP File</b></div>;

    if (hasGCPFile) {
      // elm = <div><b>{imagery.gcp_list_name}</b> loaded</div>;
    }
    return elm;
  }

  render() {
    let gcpFileDropText = this.renderFileText();
    const { imagery } = this.props;

    return (
      <div className='images-getter'>
        <aside className='images-form'>
          <div className='dropzone-wrapper'>
            <Dropzone
              className='dropzone'
              disablePreview={true}
              onDrop={this.onTextDrop}
              activeStyle={DROPZONE_STYLE_ACTIVE}
              rejectStyle={DROPZONE_STYLE_REJECT}
              accept='text/plain'>
              {gcpFileDropText}
            </Dropzone>
          </div>
          <div className='dropzone-wrapper'>
            <Dropzone
              className='dropzone'
              disablePreview={true}
              onDrop={this.onImagesDrop}
              activeStyle={DROPZONE_STYLE_ACTIVE}
              rejectStyle={DROPZONE_STYLE_REJECT}
              accept='image/jpeg,image/png'>
              <div onClick={this.onChooseImagesClick}>
                <i className="fas fa-images fa-lg fa-fw" />&nbsp;&nbsp;
                <b>Choose Images&nbsp;
                {imagery.image_list.length > 0 && `(${imagery.items.length}/${imagery.image_list.length})`}
                </b> 
              </div>
            </Dropzone>
          </div>
        </aside>
      </div>
    );
  }
}

export default ImagesGetter;
