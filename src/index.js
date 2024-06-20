// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import MainComponent from './MainComponent';
import RelatedKeywords from './components/RelatedKeywords';
import ProductComparison from './components/ProductComparison';

const sampleAsins = ['B073JYC4XM', 'B076DD5JNS', 'B07Y1R8V6J'];

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MainComponent />} />
          <Route path="related-keywords" element={<RelatedKeywords />} />
          <Route path="product-comparison" element={<ProductComparison asins={sampleAsins} />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
