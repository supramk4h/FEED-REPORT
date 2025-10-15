import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { FarmEntry } from './types';
import Header from './components/Header';
import ReportView from './components/ReportView';
import EditModal from './components/EditModal';
import ManageFieldsModal from './components/ManageFieldsModal';
import { PlusCircleIcon, CogIcon } from './components/Icons';
import { supabase } from './lib/supabaseClient';

// Allow TypeScript to recognize the globally loaded html2pdf library
declare const html2pdf: any;

const App: React.FC = () => {
  const [reportData, setReportData] = useState<FarmEntry[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFieldsModalOpen, setIsFieldsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showActionColumn, setShowActionColumn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reportWrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('fields')
        .select('name')
        .order('name', { ascending: true });
      if (fieldsError) throw new Error(`Failed to fetch fields: ${fieldsError.message}`);
      setFields(fieldsData.map(f => f.name));

      // Fetch report entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('report_entries')
        .select('*')
        .order('date', { ascending: true });
      if (entriesError) throw new Error(`Failed to fetch report entries: ${entriesError.message}`);
      
      // The 'data' column in Supabase is a JSONB. We need to flatten it.
      const flattenedEntries = entriesData.map(({ id, date, farm, data }) => ({
        id,
        date,
        farm,
        ...data,
      }));
      setReportData(flattenedEntries);

    } catch (err: any) {
      console.error("Error fetching data from Supabase:", err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data from Supabase on initial render
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const dataToImport: FarmEntry[] = JSON.parse(content);
          if (!Array.isArray(dataToImport)) {
            alert('Invalid JSON: The file must contain an array of report entries.');
            return;
          }
          
          const recordsToInsert = dataToImport.map(entry => {
            const { date, farm, ...dynamicData } = entry;
            return { date, farm, data: dynamicData };
          });
          
          const { error } = await supabase.from('report_entries').insert(recordsToInsert);
          if (error) throw error;

          await fetchData(); // Refresh data from DB
        }
      } catch (err: any) {
        alert('Error importing data: ' + err.message);
        console.error(err);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExportJson = useCallback(() => {
    if (reportData.length === 0) {
      alert('No data to export.');
      return;
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'farm_report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [reportData]);
  
  const handlePrintPdf = useCallback(() => {
    // ... (rest of the function is unchanged)
  }, [showActionColumn]);

  const handleToggleActionColumn = useCallback(() => setShowActionColumn(prev => !prev), []);
  const handleAddEntry = useCallback(() => { setEditingIndex(null); setIsEditModalOpen(true); }, []);
  const handleOpenFieldsModal = useCallback(() => setIsFieldsModalOpen(true), []);

  const handleEditEntry = useCallback((id: number) => {
    const entryIndex = reportData.findIndex(e => e.id === id);
    if (entryIndex !== -1) {
      setEditingIndex(entryIndex);
      setIsEditModalOpen(true);
    }
  }, [reportData]);
  
  const handleRemoveEntry = async (id: number) => {
    const { error } = await supabase.from('report_entries').delete().eq('id', id);
    if (error) {
      alert("Failed to remove entry: " + error.message);
    } else {
      await fetchData(); // Refresh
    }
  };

  const handleClearData = async () => {
    const { error } = await supabase.from('report_entries').delete().neq('id', -1); // Deletes all rows
    if (error) {
        alert("Failed to clear data: " + error.message);
    } else {
        await fetchData(); // Refresh
    }
  };

  const handleSaveEntry = async (entry: FarmEntry) => {
    const { id, date, farm, ...dynamicData } = entry;
    const record = { id, date, farm, data: dynamicData };
    
    const { error } = await supabase.from('report_entries').upsert(record);
    if (error) {
      alert('Failed to save entry: ' + error.message);
    } else {
      await fetchData(); // Refresh
    }

    setIsEditModalOpen(false);
    setEditingIndex(null);
  };
  
  const handleAddField = async (field: string) => {
    if (field && !fields.includes(field)) {
      const { error } = await supabase.from('fields').insert({ name: field });
      if (error) {
        alert('Failed to add field: ' + error.message);
      } else {
        await fetchData(); // Refresh
      }
    }
  };

  const handleRemoveField = async (fieldToRemove: string) => {
    // This is a complex operation: delete the field, then scrub it from all existing entries.
    // Ideally, this would be a single database transaction or function.
    
    // 1. Remove from 'fields' table
    const { error: fieldError } = await supabase.from('fields').delete().eq('name', fieldToRemove);
    if (fieldError) {
      alert('Error deleting field: ' + fieldError.message);
      return;
    }
    
    // 2. Remove the key from the 'data' JSONB column in all entries
    const recordsToUpdate = reportData.map(entry => {
        const { id, date, farm, ...dynamicData } = entry;
        delete dynamicData[fieldToRemove];
        return { id, date, farm, data: dynamicData };
    });

    const { error: updateError } = await supabase.from('report_entries').upsert(recordsToUpdate);
    if (updateError) {
      alert('Error updating entries after field removal: ' + updateError.message);
    }

    await fetchData(); // Refresh to ensure consistency
  };

  const editingEntry = editingIndex !== null ? reportData[editingIndex] : null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center text-slate-500 py-20 px-6">
          <CogIcon className="mx-auto h-16 w-16 text-slate-400 animate-spin" />
          <h2 className="mt-4 text-2xl font-bold text-slate-700">Loading Report Data...</h2>
          <p className="mt-2">Connecting to the database. Please wait.</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center text-red-600 bg-red-50 py-20 px-6 rounded-lg">
          <h2 className="mt-4 text-2xl font-bold">Failed to Load Report</h2>
          <p className="mt-2 max-w-md mx-auto">{error}</p>
          <p className="mt-4 text-sm">Please check your internet connection and Supabase configuration.</p>
        </div>
      );
    }
    if (reportData.length > 0) {
      return (
        <ReportView 
          data={reportData} 
          fields={fields}
          showActionColumn={showActionColumn}
          onEdit={handleEditEntry}
          onRemove={handleRemoveEntry}
        />
      );
    }
    return (
      <div className="text-center text-slate-500 py-20 px-6">
        <PlusCircleIcon className="mx-auto h-16 w-16 text-slate-400" />
        <h2 className="mt-4 text-2xl font-bold text-slate-700">Your Report is Empty</h2>
        <p className="mt-2 max-w-md mx-auto">
          Get started by importing a JSON file or adding a new entry. Use the "Report Actions" menu to begin.
        </p>
      </div>
    );
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Header
          onImportClick={() => fileInputRef.current?.click()}
          onExportJson={handleExportJson}
          onPrintPdf={handlePrintPdf}
          onToggleActionColumn={handleToggleActionColumn}
          onAddEntry={handleAddEntry}
          onClearData={handleClearData}
          onManageFields={handleOpenFieldsModal}
        />
        <input
          type="file"
          id="fileInput"
          accept=".json"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
        <main ref={reportWrapperRef} className="bg-white shadow-xl rounded-xl p-4 sm:p-6 overflow-x-auto">
          {renderContent()}
        </main>
      </div>
      
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEntry}
        entryData={editingEntry}
        fields={fields}
      />
      
      <ManageFieldsModal
        isOpen={isFieldsModalOpen}
        onClose={() => setIsFieldsModalOpen(false)}
        fields={fields}
        onAddField={handleAddField}
        onRemoveField={handleRemoveField}
      />
    </div>
  );
};

export default App;