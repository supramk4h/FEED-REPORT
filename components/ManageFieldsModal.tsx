import React, { useState } from 'react';
import { XIcon, TrashIcon } from './Icons';

interface ManageFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: string[];
  onAddField: (field: string) => void;
  onRemoveField: (field: string) => void;
}

const ManageFieldsModal: React.FC<ManageFieldsModalProps> = ({ isOpen, onClose, fields, onAddField, onRemoveField }) => {
  const [newField, setNewField] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedField = newField.trim();
    if (trimmedField === '') {
        alert("Field name cannot be empty.");
        return;
    }
    if (fields.includes(trimmedField)) {
        alert("This field already exists.");
        return;
    }
    onAddField(trimmedField);
    setNewField('');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 transition-opacity animate-fade-in" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all animate-fade-in-up">
          <div className="flex justify-between items-center px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800">Manage Report Fields</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
              <XIcon />
            </button>
          </div>

          <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
            <p className="text-sm text-slate-600">Add or remove the data columns for your reports. Changes will be saved automatically.</p>
            
            <ul className="space-y-2">
                {fields.map(field => (
                    <li key={field} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                        <span className="font-medium text-slate-700">{field}</span>
                        <button 
                            onClick={() => onRemoveField(field)} 
                            className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100"
                            aria-label={`Remove ${field} field`}
                        >
                            <TrashIcon className="h-5 w-5 pointer-events-none"/>
                        </button>
                    </li>
                ))}
                {fields.length === 0 && (
                    <li className="text-center text-slate-500 py-4">No fields defined.</li>
                )}
            </ul>
          </div>

          <form onSubmit={handleAdd} className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 rounded-b-lg">
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    placeholder="New field name"
                    className="w-full sm:flex-grow px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold whitespace-nowrap">
                    Add Field
                </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ManageFieldsModal;