import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Dropdown({ label, icon: Icon, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dropdown-wrapper" ref={dropdownRef}>
      <button
        className="dropdown-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        type="button"
      >
        {Icon && <Icon size={16} />}
        {label}
        <ChevronDown size={16} className={open ? 'rotate' : ''} />
      </button>
      {open && (
        <div className={`dropdown-menu ${align}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ as: Component = 'a', children, ...props }) {
  return (
    <Component className="dropdown-item" {...props}>
      {children}
    </Component>
  );
}
