import React from 'react';

import ReactDOM from 'react-dom/client';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import App from './App';
import Book from "./components/Books/BookCard";
import BookList from "./components/Books/BookList";
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> 
      <Router>
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/book/:id" element={<Book />} />
        </Routes>
      </Router>
  </React.StrictMode>
);


reportWebVitals();
