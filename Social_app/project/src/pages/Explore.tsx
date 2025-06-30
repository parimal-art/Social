import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { UserCard } from '../components/UserCard';
import { Search, Users, TrendingUp } from 'lucide-react';

export const Explore: React.FC = () => {
  const { identity, principal } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (identity) {
      apiClient.updateIdentity(identity);
      loadData();
    }
  }, [identity]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      try {
        const user = await apiClient.getCurrentUser();
        if ('Ok' in user) {
          setCurrentUser(user.Ok);
        }
      } catch (error) {
        console.log('No user profile found');
      }

      // Get all users
      const allUsers = await apiClient.getAllUsers();
      setUsers(allUsers);

      // Get follow suggestions if user exists
      if (principal) {
        try {
          const suggestionsResult = await apiClient.getFollowSuggestions(principal, BigInt(10));
          setSuggestions(suggestionsResult);
        } catch (error) {
          console.log('Error getting suggestions:', error);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-lg p-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Search className="w-6 h-6" />
          <span>Explore</span>
        </h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Suggested for You</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.slice(0, 6).map((userPrincipal) => {
              const user = users.find(u => u.principal.toString() === userPrincipal.toString());
              return user ? (
                <UserCard
                  key={user.principal.toString()}
                  user={user}
                  currentUser={currentUser}
                  onFollowChange={loadData}
                />
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>All Users</span>
        </h2>
        
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try a different search term' : 'No users have joined yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.principal.toString()}
                user={user}
                currentUser={currentUser}
                onFollowChange={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};