import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = ({ onNavigate, onShowAuth }) => {
  const { user, getAuthHeaders } = useAuth();
  const [userStats, setUserStats] = useState({
    topicsExplored: 120,
    sessions: 350,
    streaks: 25
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('System Default');
  const [recentActivity] = useState([
    {
      id: 1,
      title: 'Explored Quantum Physics',
      date: '2024-03-15',
      icon: '⚛️'
    },
    {
      id: 2,
      title: 'Explored Ancient Civilizations',
      date: '2024-03-10',
      icon: '🏛️'
    },
    {
      id: 3,
      title: 'Explored Renewable Energy',
      date: '2024-03-05',
      icon: '🌱'
    }
  ]);

  const [achievements] = useState([
    {
      id: 1,
      title: 'First Topic',
      description: 'Explored your first topic',
      icon: '🎯',
      earned: true
    },
    {
      id: 2,
      title: '100 Topics',
      description: 'Explored 100 topics',
      icon: '💯',
      earned: true
    },
    {
      id: 3,
      title: '30 Day Streak',
      description: 'Maintained 30 day learning streak',
      icon: '📅',
      earned: true
    }
  ]);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleExportData = () => {
    // Mock export functionality
    console.log('Exporting user data...');
    alert('Data export initiated. You will receive an email with your data.');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deletion requested');
      alert('Account deletion request submitted.');
    }
  };

  const handleConnectSocial = () => {
    console.log('Connecting social media...');
    alert('Social media connection feature coming soon!');
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
            
            {/* Navigation Menu */}
            <nav className="flex items-center space-x-8">
              <button 
                onClick={() => onNavigate?.('dashboard')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={() => onNavigate?.('sessions')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Sessions
              </button>
              <button className="text-blue-400 font-medium">
                Profile
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Profile</h1>
            
          <div className="flex items-start space-x-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'S'}
              </span>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {user?.user_metadata?.name || 'Sophia Bennett'}
              </h2>
              <p className="text-gray-400 mb-2">
                {user?.email || 'sophia.bennett@email.com'}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Joined in {user?.created_at ? new Date(user.created_at).getFullYear() : '2022'}
              </p>
              
              <div className="flex space-x-3">
                <button 
                  onClick={handleEditProfile}
                  className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 transition-colors"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Statistics Overview</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h4 className="text-gray-400 text-sm mb-2">Topics Explored</h4>
              <p className="text-3xl font-bold text-white">{userStats.topicsExplored}</p>
            </div>
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h4 className="text-gray-400 text-sm mb-2">Sessions</h4>
              <p className="text-3xl font-bold text-white">{userStats.sessions}</p>
            </div>
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h4 className="text-gray-400 text-sm mb-2">Streaks</h4>
              <p className="text-3xl font-bold text-white">{userStats.streaks}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{activity.title}</h4>
                    <p className="text-gray-400 text-sm">{activity.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Achievements</h3>
          <div className="grid grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h4 className="text-white font-medium mb-1">{achievement.title}</h4>
                <p className="text-gray-400 text-sm">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Account Settings */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Account Settings</h3>
            
          {/* Preferences */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-medium text-white mb-4">Preferences</h4>
              
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-white font-medium">Theme</h5>
                  <p className="text-gray-400 text-sm">System Default</p>
                </div>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="System Default">System Default</option>
                  <option value="Light">Light</option>
                  <option value="Dark">Dark</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-white font-medium">Notifications</h5>
                  <p className="text-gray-400 text-sm">Receive notifications for new content and updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    value="" 
                    className="sr-only peer"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-medium text-white mb-4">Privacy</h4>
            
            <div className="space-y-4">
              <button 
                onClick={handleExportData}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-700/30 rounded-lg transition-colors"
              >
                <span className="text-white">Export Data</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              <button 
                onClick={handleDeleteAccount}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
              >
                <span>Delete Account</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Authentication */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h4 className="text-lg font-medium text-white mb-4">Authentication</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-white font-medium">Connect with Social Media</h5>
                <p className="text-gray-400 text-sm">Not connected</p>
              </div>
              <button 
                onClick={handleConnectSocial}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  defaultValue={user?.user_metadata?.name || 'Sophia Bennett'}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || 'sophia.bennett@email.com'}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;