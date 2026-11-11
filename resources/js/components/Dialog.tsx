import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export default function Dialog({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
  className = '',
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    document.body.classList.add('dialog-open');
    return () => { dialog.close(); document.body.classList.remove('dialog-open'); previous?.focus(); };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`dialog ${wide ? 'dialog-wide' : ''} ${className}`.trim()}
      aria-label={title}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="dialog-content">
        <header className="dialog-heading">
          <div className="dialog-title-block">
            <h2>{title}</h2>
            {subtitle && <p className="dialog-subtitle">{subtitle}</p>}
          </div>
          <button className="icon-button dialog-close-btn" aria-label="Tutup" type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
