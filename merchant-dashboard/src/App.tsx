import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Finansal } from './pages/Finansal';
import { Inventory } from './pages/Inventory';
import { Login } from './pages/Login';
import { Notifications } from './pages/Notifications';
import { Register } from './pages/Register';
import { Settings } from './pages/Settings';
import { useMerchantStore } from './store/useMerchantStore';

const KorumaliRota = () => {
  const isAuthenticated = useMerchantStore((state) => state.isAuthenticated);
  return isAuthenticated ? <AppShell /> : <Navigate to="/" replace />;
};

export const App = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route element={<KorumaliRota />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/finansal" element={<Navigate to="/financials" replace />} />
      <Route path="/financials" element={<Finansal />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/settings" element={<Settings />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
