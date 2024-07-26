import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';  // Changed this line
import rootReducer from './reducers';
import Layout from './Layout';
import MainComponent from './components/MainComponent';
import RelatedKeywords from './components/RelatedKeywords';
import ProductComparison from './components/ProductComparison';
import ProductKeywordGenerator from './components/ProductKeywordGenerator';
import AdCreativesDashboard from './components/AdCreativesDashboard';

// Enable Redux DevTools Extension
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

const sampleAsins = ['B073JYC4XM', 'B076DD5JNS', 'B07Y1R8V6J'];

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MainComponent />} />
            <Route path="related-keywords" element={<RelatedKeywords />} />
            <Route path="product-comparison" element={<ProductComparison asins={sampleAsins} />} />
            <Route path="keyword-generator" element={<ProductKeywordGenerator />} />
            <Route path="ad-creatives" element={<AdCreativesDashboard />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);