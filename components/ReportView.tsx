import React from 'react';
import type { FarmEntry } from '../types';
import ReportTable from './ReportTable';

interface ReportViewProps {
  data: FarmEntry[];
  fields: string[];
  showActionColumn: boolean;
  onEdit: (id: number) => void;
  onRemove: (id: number) => void;
}

const ReportView: React.FC<ReportViewProps> = ({ data, fields, showActionColumn, onEdit, onRemove }) => {
  const groupedData: { [date: string]: FarmEntry[] } = {};

  data.forEach((entry) => {
    const date = entry.date || 'Unknown Date';
    if (!groupedData[date]) {
      groupedData[date] = [];
    }
    groupedData[date].push(entry);
  });

  const sortedDates = Object.keys(groupedData).sort((a, b) => {
    if (a === 'Unknown Date') return 1;
    if (b === 'Unknown Date') return -1;
    return new Date(a).getTime() - new Date(b).getTime()
  });

  return (
    <div className="space-y-10">
      {sortedDates.map(date => (
        <ReportTable
          key={date}
          date={date}
          entries={groupedData[date]}
          fields={fields}
          showActionColumn={showActionColumn}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default ReportView;