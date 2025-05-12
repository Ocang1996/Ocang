import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AddLeaveForm from './AddLeaveForm';

interface LeaveInputButtonProps {
  userRole: 'admin' | 'superadmin' | 'user';
}

const LeaveInputButton: React.FC<LeaveInputButtonProps> = ({ userRole }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Hanya tampilkan tombol untuk admin atau superadmin
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return null;
  }
  
  return (
    <>
      <button
        onClick={() => setShowAddForm(true)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-md" 
        title="Tambah Data Cuti"
      >
        <Plus size={14} />
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
              }} 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveInputButton;
