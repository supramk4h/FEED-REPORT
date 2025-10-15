import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, DocumentAddIcon, DocumentDownloadIcon, PrinterIcon, ViewColumnsIcon, PlusIcon, TrashIcon, CogIcon } from './Icons';

interface HeaderProps {
  onImportClick: () => void;
  onExportJson: () => void;
  onPrintPdf: () => void;
  onToggleActionColumn: () => void;
  onAddEntry: () => void;
  onClearData: () => void;
  onManageFields: () => void;
}

const Header: React.FC<HeaderProps> = (props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsDropdownOpen(false);
  };

  const menuItems = [
    { label: 'Import JSON', icon: <DocumentAddIcon />, action: props.onImportClick },
    { label: 'Export JSON', icon: <DocumentDownloadIcon />, action: props.onExportJson },
    { label: 'Print PDF', icon: <PrinterIcon />, action: props.onPrintPdf },
    { divider: true },
    { label: 'Add New Entry', icon: <PlusIcon />, action: props.onAddEntry },
    { label: 'Manage Fields', icon: <CogIcon />, action: props.onManageFields },
    { label: 'Toggle Action Column', icon: <ViewColumnsIcon />, action: props.onToggleActionColumn },
    { divider: true },
    { label: 'Clear / Refresh', icon: <TrashIcon />, action: props.onClearData, isDestructive: true },
  ];

  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b border-slate-200">
      <h1 className="text-4xl font-bold text-slate-800 tracking-tight mb-4 md:mb-0">
        Farm Report
      </h1>
      <div ref={dropdownRef} className="relative inline-block text-left w-full md:w-auto">
        <button
          type="button"
          className="inline-flex items-center justify-center w-full rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Report Actions
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
        </button>

        {isDropdownOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
            <div className="py-1">
              {menuItems.map((item, index) => {
                if (item.divider) {
                  return <div key={index} className="border-t border-slate-100 my-1" />;
                }
                const buttonClasses = `w-full text-left px-4 py-2 text-sm flex items-center gap-3 ${
                  item.isDestructive 
                    ? 'text-red-700 hover:bg-red-50 hover:text-red-900' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`;
                return (
                  <button key={item.label} onClick={() => handleAction(item.action)} className={buttonClasses}>
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
