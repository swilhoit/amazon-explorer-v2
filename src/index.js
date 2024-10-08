// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from './reducers';
import Layout from './Layout';
import MainComponent from './components/MainComponent';
import RelatedKeywords from './components/RelatedKeywords';
import ProductComparison from './components/ProductComparison';
import ProductKeywordGenerator from './components/ProductKeywordGenerator';
import AdCreativesDashboard from './components/AdCreativesDashboard';
import CalculatorComponent from './components/CalculatorComponent';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { AuthProvider } from './AuthContext';
import Settings from './components/settings';
import AccountHistory from './components/AccountHistory';
import { ApiProvider } from './ApiContext';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

const sampleAsins = ['B073JYC4XM', 'B076DD5JNS', 'B07Y1R8V6J'];

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <ApiProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<MainComponent />} />
                <Route path="price-segments" element={<MainComponent activeTab={1} />} />
                <Route path="winners" element={<MainComponent activeTab={2} />} />
                <Route path="insights" element={<MainComponent activeTab={3} />} />
                <Route path="comparison" element={<MainComponent activeTab={4} />} />
                <Route path="segment-by-feature" element={<MainComponent activeTab={5} />} />
                <Route path="calculator" element={<CalculatorComponent />} />
                <Route path="related-keywords" element={<RelatedKeywords />} />
                <Route path="product-comparison" element={<ProductComparison asins={sampleAsins} />} />
                <Route path="keyword-generator" element={<ProductKeywordGenerator />} />
                <Route path="ad-creatives" element={<AdCreativesDashboard />} />
                <Route path="settings" element={<Settings />} />
                <Route path="account-history" element={<AccountHistory />} />
              </Route>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<SignUp />} />
            </Routes>
          </Router>
        </ApiProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
