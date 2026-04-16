import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-12">
        <div className="max-w-6xl mx-auto px-5 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
