import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = ({ onNavigate, onShowAuth }) => {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Get user info with fallbacks
  const getUserName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserEmail = () => {
    return user?.email || 'No email available';
  };

  const getJoinDate = () => {
    if (user?.created_at) {
      return new Date(user.created_at).getFullYear();
    }
    return new Date().getFullYear();
  };

  const getUserInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
    }}>
      {/* Header Navigation */}
      <header className="border-b border-gray-800/50 bg-gray-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">StudyAI</h1>
            </div>
            
            <nav className="flex items-center space-x-6">
              <button 
                onClick={() => onNavigate?.('dashboard')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button className="text-blue-400 font-medium">
                Profile
              </button>
              {!user && (
                <button 
                  onClick={onShowAuth}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Sign In
                </button>
              )}
              {user && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                  {getUserInitial()}
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
          
          {user ? (
            <div className="flex items-start space-x-6">
              {/* Profile Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-medium">
                {getUserInitial()}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-white mb-2">{getUserName()}</h2>
                  <p className="text-gray-300">{getUserEmail()}</p>
                  <p className="text-gray-400 text-sm mt-1">Joined in {getJoinDate()}</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleEditProfile}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No Profile Found</h2>
              <p className="text-gray-400 mb-6">Please sign in to view your profile.</p>
              <button
                onClick={onShowAuth}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Profile</h3>
            <p className="text-gray-300 mb-6">Profile editing functionality coming soon!</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
            <p className="text-gray-300 mb-6">Password change functionality coming soon!</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;