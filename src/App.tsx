import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Test from './pages/Test';

function AppContent() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Test />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}


