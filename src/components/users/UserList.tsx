import { useState, useEffect } from 'react';
import { Search, UserPlus, RefreshCw, Edit, Trash2, ShieldAlert, User, UserCheck, X, Check } from 'lucide-react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';
import { isAdmin, isSuperAdmin } from '../../lib/auth';
import AddUserForm from './AddUserForm';
import EditUserForm from './EditUserForm';

interface UserListProps {
  onLogout: () => void;
}

type UserData = {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
};

const UserList = ({ onLogout }: UserListProps) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const { isDark } = useTheme();
  const { t } = useTranslation();

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  // Load mock users from localStorage
  const loadUsers = () => {
    setLoading(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      try {
        // Get registered users from localStorage
        const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        
        // Add default demo users if not already in the list
        const defaultUsers = [
          {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            name: 'Administrator',
            role: 'admin',
            createdAt: '2023-01-01T00:00:00Z',
            lastLogin: '2023-06-15T10:30:00Z'
          },
          {
            id: '2',
            username: 'user',
            email: 'user@example.com',
            name: 'Regular User',
            role: 'user',
            createdAt: '2023-01-15T00:00:00Z',
            lastLogin: '2023-06-14T14:20:00Z'
          },
          {
            id: '3',
            username: 'superadmin',
            email: 'superadmin@example.com',
            name: 'Super Administrator',
            role: 'superadmin',
            createdAt: '2022-12-01T00:00:00Z',
            lastLogin: '2023-06-15T09:15:00Z'
          }
        ];
        
        // Merge default users with registered users, avoiding duplicates by username
        const existingUsernames = registeredUsers.map((user: any) => user.username);
        const filteredDefaultUsers = defaultUsers.filter(user => !existingUsernames.includes(user.username));
        
        const allUsers = [...registeredUsers, ...filteredDefaultUsers].map((user: any) => ({
          id: user.id || String(Math.random()).slice(2, 10),
          username: user.username,
          email: user.email || '',
          name: user.name || '',
          role: user.role || 'user',
          createdAt: user.created || user.createdAt || new Date().toISOString(),
          lastLogin: user.lastLogin || ''
        }));
        
        setUsers(allUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        setNotification({
          type: 'error',
          message: 'Gagal memuat data pengguna'
        });
      } finally {
        setLoading(false);
      }
    }, 500); // Simulate API delay
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle add user
  const handleAddUser = (userData: Omit<UserData, 'id' | 'createdAt'>) => {
    // Create new user object
    const newUser: UserData = {
      ...userData,
      id: String(Math.random()).slice(2, 10),
      createdAt: new Date().toISOString()
    };
    
    // Add to state
    setUsers(prev => [...prev, newUser]);
    
    // In a real app, this would also be saved to the server
    // For demo purposes, we'll save to localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    registeredUsers.push({
      ...newUser,
      password: 'defaultpassword', // In a real app, the password would be hashed
      created: newUser.createdAt
    });
    localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
    
    // Show success notification
    setNotification({
      type: 'success',
      message: 'Pengguna berhasil ditambahkan'
    });
    
    // Close add form
    setShowAddForm(false);
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  // Handle edit user
  const handleEditUser = (userData: UserData) => {
    // Update user in state
    setUsers(prev => prev.map(user => user.id === userData.id ? userData : user));
    
    // In a real app, this would also be saved to the server
    // For demo purposes, we'll save to localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const updatedRegisteredUsers = registeredUsers.map((user: any) => {
      if (user.username === userData.username) {
        return {
          ...user,
          email: userData.email,
          name: userData.name,
          role: userData.role
        };
      }
      return user;
    });
    localStorage.setItem('registered_users', JSON.stringify(updatedRegisteredUsers));
    
    // Show success notification
    setNotification({
      type: 'success',
      message: 'Pengguna berhasil diperbarui'
    });
    
    // Close edit form
    setEditingUser(null);
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  // Handle delete user
  const handleDeleteUser = (userId: string) => {
    // Get user to delete
    const userToDelete = users.find(user => user.id === userId);
    
    if (!userToDelete) return;
    
    // Check if attempting to delete oneself
    const currentUser = JSON.parse(localStorage.getItem('app_user') || '{}');
    if (currentUser.username === userToDelete.username) {
      setNotification({
        type: 'error',
        message: 'Anda tidak dapat menghapus akun yang sedang digunakan'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      return;
    }
    
    // Check if regular admin trying to delete an admin or superadmin
    if (!isSuperAdmin() && (userToDelete.role === 'admin' || userToDelete.role === 'superadmin')) {
      setNotification({
        type: 'error',
        message: 'Anda tidak memiliki izin untuk menghapus admin atau superadmin'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      return;
    }
    
    // Show confirmation dialog
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${userToDelete.name || userToDelete.username}"?`)) {
      // Remove from state
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // In a real app, this would also be deleted from the server
      // For demo purposes, we'll remove from localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const filteredUsers = registeredUsers.filter((user: any) => 
        user.username !== userToDelete.username
      );
      localStorage.setItem('registered_users', JSON.stringify(filteredUsers));
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Pengguna berhasil dihapus'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  // Format role for display
  const formatRole = (role: string) => {
    switch(role) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-700/30 dark:text-purple-400">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-400">
            <UserCheck className="w-3 h-3 mr-1" />
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <User className="w-3 h-3 mr-1" />
            User
          </span>
        );
    }
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // If user is not admin or superadmin, show not authorized message
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar activeItem="users" onLogout={onLogout} />
        
        <div className="w-full min-h-screen">
          <Header title="Manajemen Pengguna" onLogout={onLogout} />
          
          <div className="mx-auto px-4 pt-24 pb-8 lg:ml-28 lg:mr-6 max-w-7xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <ShieldAlert className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Akses Tidak Diizinkan
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Anda tidak memiliki izin untuk mengakses halaman ini. Hanya admin dan superadmin yang dapat mengelola pengguna.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeItem="users" onLogout={onLogout} />
      
      <div className="w-full min-h-screen">
        <Header title="Manajemen Pengguna" onLogout={onLogout} />
        
        <div className="mx-auto px-4 pt-24 pb-8 lg:ml-28 lg:mr-6 max-w-7xl">
          <div className="mb-6 mt-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 text-transparent bg-clip-text">
              Manajemen Pengguna
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Kelola pengguna aplikasi EmpDash
            </p>
          </div>

          {/* Notification */}
          {notification && (
            <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
              notification.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              <div className="flex items-center">
                {notification.type === 'success' ? (
                  <Check className="h-5 w-5 mr-2" />
                ) : (
                  <X className="h-5 w-5 mr-2" />
                )}
                <span>{notification.message}</span>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-4 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
              {/* Search */}
              <div className="flex flex-1 max-w-md relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Cari pengguna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 items-center">
                {/* Refresh button */}
                <button 
                  className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  onClick={loadUsers}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                
                {/* Add user button */}
                <button 
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => setShowAddForm(true)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  <span>Tambah Pengguna</span>
                </button>
              </div>
            </div>
            
            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-750">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pengguna
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Username
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Terdaftar
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex justify-center items-center">
                          <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                          Memuat data pengguna...
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Tidak ada pengguna yang ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300 font-medium">
                                {user.name.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name || 'Unnamed User'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{user.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatRole(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {/* Admin can edit users but only superadmin can edit other admins and superadmins */}
                          {(isSuperAdmin() || user.role === 'user') && (
                            <button
                              onClick={() => setEditingUser(user)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          
                          {/* Admin can delete users but only superadmin can delete other admins and superadmins */}
                          {(isSuperAdmin() || user.role === 'user') && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Form Modal */}
      {showAddForm && (
        <AddUserForm 
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddUser}
        />
      )}
      
      {/* Edit User Form Modal */}
      {editingUser && (
        <EditUserForm 
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleEditUser}
        />
      )}
    </div>
  );
};

export default UserList; 