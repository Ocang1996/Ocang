import { useState, useEffect } from 'react';
import { Search, UserPlus, RefreshCw, Edit, Trash2, ShieldAlert, User, UserCheck, X, Check } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';
import { isAdmin, isSuperAdmin, removeCustomCredential } from '../../lib/auth';
import AddUserForm from '../users/AddUserForm';
import EditUserForm from '../users/EditUserForm';

type UserData = {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
};

const UserManagementTab = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
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
        
        // Cek perubahan username untuk melihat apakah default users telah diubah
        const usernameChanges = JSON.parse(localStorage.getItem('username_changes') || '{}');
        const changedDefaultUsers = Object.keys(usernameChanges).filter(username => 
          ['admin', 'user', 'superadmin'].includes(username)
        );
        
        console.log('Changed default users:', changedDefaultUsers);
        
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
        
        // Filter out default users whose username has been changed
        // or if there's already a user with the same role in registered users
        const filteredDefaultUsers = defaultUsers.filter(defaultUser => {
          // Skip if username has been changed
          if (changedDefaultUsers.includes(defaultUser.username)) {
            return false;
          }
          
          // Skip if there's already a user with the same role
          const existingUserWithRole = registeredUsers.find((user: any) => 
            user.role === defaultUser.role && 
            ['admin', 'superadmin'].includes(defaultUser.role)
          );
          
          if (existingUserWithRole) {
            console.log(`Skipping default ${defaultUser.role} user because a user with the same role already exists`);
            return false;
          }
          
          return true;
        });
        
        // Merge default users with registered users, avoiding duplicates by username
        const existingUsernames = registeredUsers.map((user: any) => user.username);
        const finalFilteredDefaultUsers = filteredDefaultUsers.filter(user => !existingUsernames.includes(user.username));
        
        const allUsers = [...registeredUsers, ...finalFilteredDefaultUsers].map((user: any) => ({
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
          message: t('error_general')
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
      message: t('user_added')
    });
    
    // Close add form
    setShowAddForm(false);
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  // Handle edit user
  const handleEditUser = (userData: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: 'superadmin' | 'admin' | 'user';
  }) => {
    // Update user in state with potentially missing fields
    setUsers(prev => prev.map(user => {
      if (user.id === userData.id) {
        return {
          ...user,
          ...userData,
          // Keep existing fields that might not be in the userData
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        };
      }
      return user;
    }));
    
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
      message: t('user_updated')
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
        message: t('cannot_delete_own_account')
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
        message: t('cannot_delete_admin')
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      return;
    }
    
    // Cek apakah ini adalah pengguna yang berasal dari akun default
    let isModifiedDefaultUser = false;
    let originalDefaultUsername = '';
    
    try {
      const usernameChanges = JSON.parse(localStorage.getItem('username_changes') || '{}');
      const defaultUsers = ['admin', 'user', 'superadmin'];
      
      // Cek apakah ada username default yang diubah ke username ini
      for (const [oldUsername, newUsername] of Object.entries(usernameChanges)) {
        if (newUsername === userToDelete.username && defaultUsers.includes(oldUsername)) {
          isModifiedDefaultUser = true;
          originalDefaultUsername = oldUsername;
          break;
        }
      }
    } catch (e) {
      console.error('Error checking if user is modified default user:', e);
    }
    
    // Show confirmation dialog
    if (window.confirm(`${t('confirm_delete_user')} "${userToDelete.name || userToDelete.username}"?`)) {
      // Remove from state
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // In a real app, this would also be deleted from the server
      // For demo purposes, we'll remove from localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const filteredUsers = registeredUsers.filter((user: any) => 
        user.username !== userToDelete.username
      );
      localStorage.setItem('registered_users', JSON.stringify(filteredUsers));
      
      // Untuk pengguna yang berasal dari akun default, perlu penanganan khusus
      if (isModifiedDefaultUser) {
        try {
          // Hapus perubahan username untuk akun default ini
          const usernameChanges = JSON.parse(localStorage.getItem('username_changes') || '{}');
          delete usernameChanges[originalDefaultUsername];
          localStorage.setItem('username_changes', JSON.stringify(usernameChanges));
          console.log(`Removed username change record for default user ${originalDefaultUsername}`);
        } catch (e) {
          console.error('Error updating username changes:', e);
        }
      }
      
      // Tambahkan username ke daftar user yang dihapus
      try {
        const deletedUsers = JSON.parse(localStorage.getItem('deleted_users') || '[]');
        if (!deletedUsers.includes(userToDelete.username)) {
          deletedUsers.push(userToDelete.username);
          localStorage.setItem('deleted_users', JSON.stringify(deletedUsers));
          console.log('Added to deleted users list:', userToDelete.username);
        }
        
        // Jika ini adalah pengguna yang berasal dari akun default, tambahkan juga username aslinya
        if (isModifiedDefaultUser && !deletedUsers.includes(originalDefaultUsername)) {
          deletedUsers.push(originalDefaultUsername);
          localStorage.setItem('deleted_users', JSON.stringify(deletedUsers));
          console.log('Added original default username to deleted users list:', originalDefaultUsername);
        }
        
        // Periksa juga apakah username ini memiliki riwayat perubahan nama
        // Jika ada, tambahkan juga riwayat username sebelumnya ke daftar yang dihapus
        const usernameChanges = JSON.parse(localStorage.getItem('username_changes') || '{}');
        for (const [oldUsername, newUsername] of Object.entries(usernameChanges)) {
          if (newUsername === userToDelete.username && !deletedUsers.includes(oldUsername)) {
            deletedUsers.push(oldUsername);
            console.log('Added previous username to deleted users list:', oldUsername);
          }
        }
        localStorage.setItem('deleted_users', JSON.stringify(deletedUsers));
      } catch (e) {
        console.error('Error updating deleted users list:', e);
      }
      
      // Hapus kredensial custom untuk user yang dihapus
      try {
        removeCustomCredential(userToDelete.username);
      } catch (e) {
        console.error('Error removing custom credentials:', e);
      }
      
      // Show success notification
      setNotification({
        type: 'success',
        message: t('user_deleted')
      });
      
      // Reload users after deletion to ensure UI is up to date
      setTimeout(() => {
        loadUsers();
      }, 500);
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  // Format role for display
  const formatRole = (role: string, username: string) => {
    // Periksa apakah ini adalah username hasil perubahan dari default user
    let isCustomDefaultUser = false;
    try {
      const usernameChanges = JSON.parse(localStorage.getItem('username_changes') || '{}');
      const defaultUsers = ['admin', 'user', 'superadmin'];
      
      // Cek apakah ada username default yang diubah ke username ini
      for (const [oldUsername, newUsername] of Object.entries(usernameChanges)) {
        if (newUsername === username && defaultUsers.includes(oldUsername)) {
          isCustomDefaultUser = true;
          break;
        }
      }
    } catch (e) {
      console.error('Error checking if user is modified default user:', e);
    }
    
    const formatRoleDisplay = (label: string, icon: React.ReactElement, extraClass: string) => {
      return (
        <>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${extraClass}`}>
            {icon}
            {label}
          </span>
          {isCustomDefaultUser && (
            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              Akun Default Diubah
            </span>
          )}
        </>
      );
    };

    switch(role) {
      case 'superadmin':
        return formatRoleDisplay(
          t('user_role_superadmin'),
          <ShieldAlert className="w-3 h-3 mr-1" />,
          "bg-purple-100 text-purple-800 dark:bg-purple-700/30 dark:text-purple-400"
        );
      case 'admin':
        return formatRoleDisplay(
          t('user_role_admin'),
          <UserCheck className="w-3 h-3 mr-1" />,
          "bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-400"
        );
      default:
        return formatRoleDisplay(
          t('user_role_user'),
          <User className="w-3 h-3 mr-1" />,
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {t('access_denied')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('access_denied_message')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('user_management')}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('user_management_desc')}</p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-3 rounded-md text-sm flex items-center justify-between ${
          notification.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <X className="h-4 w-4 mr-2" />
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

      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 mb-4">
        {/* Search */}
        <div className="flex flex-1 max-w-md relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
            placeholder={t('search_users')}
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
            className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            onClick={() => setShowAddForm(true)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            <span>{t('add_user')}</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('user_name')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('user_username')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('user_role')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('user_created')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('user_actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center items-center">
                    <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                    {t('loading_users')}
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t('no_users_found')}
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-500 dark:text-emerald-300 font-medium">
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
                    {formatRole(user.role, user.username)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Admin can edit users but only superadmin can edit other admins and superadmins */}
                    {(isSuperAdmin() || user.role === 'user') && (
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 mr-3"
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

export default UserManagementTab; 