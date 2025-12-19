import React from 'react';
import { 
  ArrowLeft, ShoppingCart, CheckCircle, AlertTriangle, 
  Home, Heart, FileText, User, LayoutDashboard, Package, Settings, Loader2 
} from 'lucide-react';

export const ToastNotification = ({ toast }) => (
  <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-full shadow-2xl bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 backdrop-blur-md border border-white/10">
      {toast.type === 'success' ? <CheckCircle size={16} className="text-green-400 dark:text-green-600" /> : <AlertTriangle size={16} className="text-red-400 dark:text-red-600" />}
      <span className="text-xs font-bold tracking-wide">{toast.msg}</span>
    </div>
  </div>
);

export const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-primary">
    <Loader2 size={40} className="animate-spin mb-4"/>
    <p className="font-bold text-slate-500 text-xs tracking-wider">MEMUAT TOKO...</p>
  </div>
);

export const Header = ({ title, showCart = true, backTo, cartCount, navigate }) => (
  <div className="sticky top-0 z-40 flex items-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg p-4 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
    {backTo ? (
      <button onClick={() => navigate(backTo)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
        <ArrowLeft size={20} className="text-slate-800 dark:text-white group-active:-translate-x-1 transition-transform"/>
      </button>
    ) : (
      <div className="w-10"></div>
    )}
    <h2 className="flex-1 text-center font-bold text-lg text-slate-900 dark:text-white tracking-tight">{title}</h2>
    <div className="w-10 flex justify-end">
      {showCart && (
        <button onClick={() => navigate('cart')} className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ShoppingCart size={20} className="text-slate-800 dark:text-white"/>
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in">{cartCount}</span>
          )}
        </button>
      )}
    </div>
  </div>
);

export const BottomNav = ({ role, currentView, navigate }) => {
  const isAdminNav = role === 'admin';
  const menu = isAdminNav ? [
    { id: 'admin-orders', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'admin-inventory', icon: Package, label: 'Produk' },
    { id: 'admin-settings', icon: Settings, label: 'Pengaturan' }
  ] : [
    { id: 'home', icon: Home, label: 'Beranda' },
    { id: 'saved', icon: Heart, label: 'Disimpan' },
    { id: 'orders', icon: FileText, label: 'Pesanan' },
    { id: 'profile', icon: User, label: 'Profil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe z-50 transition-colors duration-300">
      <div className="max-w-md mx-auto flex justify-around py-3">
        {menu.map((item) => (
          <button 
            key={item.id} 
            onClick={() => navigate(item.id)} 
            className={`flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-95 ${currentView === item.id ? 'text-primary' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}
          >
            <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 2} className={currentView === item.id ? 'animate-in fade-in zoom-in duration-200' : ''} />
            <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};