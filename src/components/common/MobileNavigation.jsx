import { useEffect } from 'react';
import { X } from 'lucide-react';
import Sidebar from './Sidebar';

const MobileNavigation = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        tabIndex={open ? 0 : -1}
      />
      <div className={`relative h-full w-72 max-w-[86vw] transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar mobile onNavigate={onClose} />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-5 grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default MobileNavigation;
