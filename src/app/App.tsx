import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { HomePage } from './pages/HomePage';
import { CreateKPPage } from './pages/CreateKPPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateKPPage />} />
        <Route path="/create/:id" element={<CreateKPPage />} />
      </Routes>
    </BrowserRouter>
  );
}
