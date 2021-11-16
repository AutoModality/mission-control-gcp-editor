import { connect } from 'react-redux';
import { receiveImageFiles, previewGcpFile, toggleImageGrid } from '../state/actions';
import ImagesGetter from '../components/ImagesGetter';

const mapStateToProps = (state) => state;
export default connect(mapStateToProps, { receiveImageFiles, previewGcpFile, toggleImageGrid })(ImagesGetter);
