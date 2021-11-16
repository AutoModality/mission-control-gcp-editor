import { connect } from 'react-redux';
import { toggleImageGrid } from '../state/actions';

import ImagesGridModal from '../components/ImagesGridModal';

const mapStateToProps = (state) => state;
export default connect(mapStateToProps, {toggleImageGrid })(ImagesGridModal);
