import React, { useState, useEffect } from 'react';
import type { FarmEntry } from '../types';
import { XIcon } from './Icons';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: FarmEntry) => void;
  entryData: FarmEntry | null;
  fields: string[];
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, entryData, fields }) => {
  const [formData, setFormData] = useState<FarmEntry>({ date: '', farm: '' });

  useEffect(() => {
    if (isOpen) {
      if (entryData) {
        setFormData(entryData);
      } else {
        const today = new Date().toISOString().split('T')[0];
        const initialData: FarmEntry = { date: today, farm: '' };
        fields.forEach(f => initialData[f] = '');
        setFormData(initialData);
      }
    }
  }, [entryData, isOpen, fields]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' && value !== '' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.farm) {
      alert("Date and Farm Name are required.");
      return;
    }
    const finalData: FarmEntry = { date: formData.date, farm: formData.farm };
    fields.forEach(field => {
        const value = formData[field];
        if (value !== '' && value != null) {
            finalData[field] = value;
        }
    });
    onSave(finalData);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 transition-opacity animate-fade-in" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all animate-fade-in-up">
          <div className="flex justify-between items-center px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800">{entryData ? 'Edit Entry' : 'Add New Entry'}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
              <XIcon />
            </button>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editDate" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" id="editDate" name="date" value={formData.date || ''} onChange={handleChange} required className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="editFarm" className="block text-sm font-medium text-slate-700 mb-1">Farm Name</label>
                  <input type="text" id="editFarm" name="farm" value={formData.farm || ''} onChange={handleChange} required className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. Green Valley Farms" />
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {fields.map(field => (
                    <div key={field}>
                      <label htmlFor={`edit_${field}`} className="block text-sm font-medium text-slate-700 mb-1">{field}</label>
                      <input
                        type="number"
                        step="any"
                        id={`edit_${field}`}
                        name={field}
                        value={formData[field] ?? ''}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-0 sm:space-x-3 p-4 sm:p-5 bg-slate-50 border-t border-slate-200 rounded-b-lg">
              <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 font-semibold">
                Cancel
              </button>
              <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditModal;