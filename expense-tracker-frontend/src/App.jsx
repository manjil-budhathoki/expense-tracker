import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import WishlistPage from './pages/WishlistPage';
import RentPage from './pages/RentPage';

export default function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/rent" element={<RentPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </FinanceProvider>
  );
}