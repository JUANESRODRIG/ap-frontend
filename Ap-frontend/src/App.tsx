import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './layout/Navbar';
import Home from './pages/Home';
import Gallery from './pages/Gallery';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Navbar />
                <main className="content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/gallery" element={<Gallery />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
