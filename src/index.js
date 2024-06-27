import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './reducers'; // You'll need to create this
import Layout from './Layout';
import MainComponent from './components/MainComponent';
import RelatedKeywords from './components/RelatedKeywords';
import ProductComparison from './components/ProductComparison';
import ProductKeywordGenerator from './components/ProductKeywordGenerator';

const store = createStore(rootReducer);

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
          </Route>
        </Routes>
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);