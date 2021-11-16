import { connect } from 'react-redux';
import App from '../components/App';
import { onWindowResize, toggleExport, toggleImageGrid, addControlPoint } from '../state/actions';

const mapStateToProps = (state) => state;
export default connect(mapStateToProps, { onWindowResize, toggleExport, toggleImageGrid, addControlPoint })(App);