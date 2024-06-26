// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import MainComponent from './MainComponent';
import RelatedKeywords from './components/RelatedKeywords';
import ProductComparison from './components/ProductComparison';
import ProductKeywordGenerator from './components/ProductKeywordGenerator';

const sampleAsins = ['B073JYC4XM', 'B076DD5JNS', 'B07Y1R8V6J'];

ReactDOM.render(
  React.createElement(React.StrictMode, null,
    React.createElement(Router, null,
      React.createElement(Routes, null,
        React.createElement(Route, { path: "/", element: React.createElement(Layout, null) },
          React.createElement(Route, { index: true, element: React.createElement(MainComponent, null) }),
          React.createElement(Route, { path: "related-keywords", element: React.createElement(RelatedKeywords, null) }),
          React.createElement(Route, { path: "product-comparison", element: React.createElement(ProductComparison, { asins: sampleAsins }) }),
          React.createElement(Route, { path: "keyword-generator", element: React.createElement(ProductKeywordGenerator, null) })
        )
      )
    )
  ),
  document.getElementById('root')
);
