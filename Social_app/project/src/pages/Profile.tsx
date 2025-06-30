import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { PostCard } from '../components/PostCard';
import { CreateUserForm } from '../components/CreateUserForm';
import { User, Calendar, MapPin, Link as LinkIcon, Edit, Users, Heart } from 'lucide-react';

export const Profile: React.FC = () => {
  const { identity, principal } = useAuth();
  const { username } = useParams();
  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [socialStats, setSocialStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (identity) {
      apiClient.updateIdentity(identity);
      loadData();
    }
  }, [identity, username]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      try {
        const currentUserResult = await apiClient.getCurrentUser();
        if ('Ok' in currentUserResult) {
          setCurrentUser(currentUserResult.Ok);
        }
      } catch (error) {
        console.log('No current user profile found');
      }

      if (username) {
        // Get user by username
        const userResult = await apiClient.getUserByUsername(username);
        if ('Ok' in userResult) {
          setUser(userResult.Ok);
          
          // Get user's posts
          const userPosts = await apiClient.getUserPosts(userResult.Ok.principal);
          setPosts(userPosts);
          
          // Get social stats
          const stats = await apiClient.getSocialStats(userResult.Ok.principal);
          setSocialStats(stats);
          
          // Check if following
          if (principal) {
            const following = await apiClient.isFollowing(principal, userResult.Ok.principal);
            setIsFollowing(following);
          }
        }
      } else {
        // Get current user's profile
        try {
          const userResult = await apiClient.getCurrentUser();
          if ('Ok' in userResult) {
            setUser(userResult.Ok);
            
            // Get user's posts
            const userPosts = await apiClient.getUserPosts(userResult.Ok.principal);
            setPosts(userPosts);
            
            // Get social stats
            const stats = await apiClient.getSocialStats(userResult.Ok.principal);
            setSocialStats(stats);
          }
        } catch (error) {
          console.log('No user profile found, showing create form');
          setShowCreateForm(true);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user || !principal) return;
    
    try {
      if (isFollowing) {
        await apiClient.unfollowUser(user.principal);
        setIsFollowing(false);
      } else {
        await apiClient.followUser(user.principal);
        setIsFollowing(true);
      }
      
      // Refresh social stats
      const stats = await apiClient.getSocialStats(user.principal);
      setSocialStats(stats);
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const handleUserCreated = (newUser: any) => {
    setUser(newUser);
    setCurrentUser(newUser);
    setShowCreateForm(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Your Profile</h1>
          <CreateUserForm onUserCreated={handleUserCreated} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
          <p className="text-gray-500">
            The user you're looking for doesn't exist or hasn't created a profile yet.
          </p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && user.principal.toString() === currentUser.principal.toString();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end space-x-6 -mt-12">
            <div className="relative">
              <img
                src={user.avatar_url || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1`}
                alt={user.display_name}
                className="w-24 h-24 rounded-full border-4 border-white bg-white object-cover"
              />
              {user.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.display_name}</h1>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
                
                {!isOwnProfile && (
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                
                {isOwnProfile && (
                  <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2">
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
              
              {user.bio && (
                <p className="text-gray-700 mb-3">{user.bio}</p>
              )}
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(Number(user.created_at) / 1000000).toLocaleDateString()}</span>
                </div>
                
                {socialStats && (
                  <>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{socialStats.following_count} Following</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{socialStats.followers_count} Followers</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {isOwnProfile ? 'Your Posts' : `${user.display_name}'s Posts`}
        </h2>
        
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">
              {isOwnProfile ? "You haven't posted anything yet." : "This user hasn't posted anything yet."}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id.toString()}
              post={post}
              currentUser={currentUser}
              onLike={loadData}
              onUnlike={loadData}
            />
          ))
        )}
      </div>
    </div>
  );
};