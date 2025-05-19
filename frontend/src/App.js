import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Book from "./components/Books/Book";
import BookList from "./components/Books/BookList";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<BookList />} />
            <Route path="/book/:id" element={<Book />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;