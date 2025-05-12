import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AddLeaveForm from './AddLeaveForm';

interface LeaveButtonHeaderProps {
  userRole: 'admin' | 'superadmin' | 'user';
}

const LeaveButtonHeader: React.FC<LeaveButtonHeaderProps> = ({ userRole }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return null;
  }
  
  return (
    <>
      <button
        onClick={() => setShowAddForm(true)}
        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors text-sm font-medium"
      >
        <Plus size={16} strokeWidth={2.5} />
        Tambah Data Cuti
      </button>
      
      {/* Form tambah cuti */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <AddLeaveForm 
              onClose={() => setShowAddForm(false)} 
              onSuccess={() => {
                setShowAddForm(false);
                // Tampilkan notifikasi sukses jika diperlukan
                alert("Data cuti berhasil ditambahkan!");
                window.location.reload();
              }} 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveButtonHeader;
