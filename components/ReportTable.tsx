import React from 'react';
import type { FarmEntry } from '../types';

interface ReportTableProps {
  date: string;
  entries: FarmEntry[];
  fields: string[];
  showActionColumn: boolean;
  onEdit: (id: number) => void;
  onRemove: (id: number) => void;
}

const ReportTable: React.FC<ReportTableProps> = ({ date, entries, fields, showActionColumn, onEdit, onRemove }) => {
  const totals = fields.reduce((acc, field) => {
    acc[field] = entries.reduce((sum, entry) => sum + (parseFloat(String(entry[field] || 0))), 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-3 px-1">{date}</h2>
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-2 py-3 text-left font-semibold text-slate-600 tracking-wider text-xs sm:text-sm sm:px-3">FARM NAME</th>
              {fields.map(field => (
                <th key={field} className="px-2 py-3 text-center font-semibold text-slate-600 tracking-wider text-xs sm:text-sm sm:px-3">{field}</th>
              ))}
              {showActionColumn && (
                <th className="px-2 py-3 text-center font-semibold text-slate-600 tracking-wider text-xs sm:text-sm sm:px-3">ACTION</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-2 py-3 sm:px-3 text-left text-slate-700 font-medium whitespace-nowrap">{entry.farm || ''}</td>
                {fields.map(field => (
                  <td key={field} className="px-2 py-3 sm:px-3 text-center text-slate-600 whitespace-nowrap">{entry[field] != null ? entry[field] : ''}</td>
                ))}
                {showActionColumn && entry.id != null && (
                  <td className="px-2 py-3 sm:px-3 text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:space-x-2">
                      <button 
                        onClick={() => onEdit(entry.id!)} 
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-1.5 px-3 w-full sm:w-auto rounded-full text-xs transition-colors"
                        aria-label={`Edit entry for ${entry.farm}`}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onRemove(entry.id!)} 
                        className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-1.5 px-3 w-full sm:w-auto rounded-full text-xs transition-colors"
                        aria-label={`Remove entry for ${entry.farm}`}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 font-bold text-slate-800">
            <tr>
              <td className="px-2 py-3 sm:px-3 text-left tracking-wider">TOTAL</td>
              {fields.map(field => (
                <td key={field} className="px-2 py-3 sm:px-3 text-center">
                  {totals[field].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </td>
              ))}
              {showActionColumn && <td className="p-3"></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ReportTable;