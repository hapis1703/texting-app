import {configureStore} from '@reduxjs/toolkit';
import reducers from './reducer';

export default configureStore({
  reducer: reducers,
});
