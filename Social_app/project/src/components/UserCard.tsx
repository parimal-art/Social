import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { User, Users, Heart } from 'lucide-react';

interface UserCardProps {
  user: any;
  currentUser: any;
  onFollowChange: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, currentUser, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (currentUser && user) {
      checkFollowStatus();
    }
  }, [currentUser, user]);

  const checkFollowStatus = async () => {
    if (!currentUser || !user) return;
    
    try {
      const following = await apiClient.isFollowing(currentUser.principal, user.principal);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !user || loading) return;
    
    setLoading(true);
    try {
      if (isFollowing) {
        await apiClient.unfollowUser(user.principal);
        setIsFollowing(false);
      } else {
        await apiClient.followUser(user.principal);
        setIsFollowing(true);
      }
      onFollowChange();
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = currentUser && user.principal.toString() === currentUser.principal.toString();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={user.avatar_url || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1`}
          alt={user.display_name}
          className="w-15 h-15 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user.display_name}</h3>
          <p className="text-gray-500 text-sm truncate">@{user.username}</p>
          {user.is_verified && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              Verified
            </span>
          )}
        </div>
      </div>

      {user.bio && (
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{user.bio}</p>
      )}

      <div className="flex items-center justify-between">
        <Link
          to={`/profile/${user.username}`}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View Profile
        </Link>

        {!isOwnProfile && currentUser && (
          <button
            onClick={handleFollow}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              isFollowing
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  );
};