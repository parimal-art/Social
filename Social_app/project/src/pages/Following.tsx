import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { PostCard } from '../components/PostCard';
import { UserCard } from '../components/UserCard';
import { Users, Heart, MessageCircle } from 'lucide-react';

export const Following: React.FC = () => {
  const { identity, principal } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts');

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
        return;
      }

      if (!principal) return;

      // Get following list
      const following = await apiClient.getFollowing(principal);
      
      if (following.length > 0) {
        // Get posts from followed users
        const postsResult = await apiClient.getPostsByUsers(following, BigInt(20), BigInt(0));
        setPosts(postsResult);

        // Get user details for following list
        const allUsers = await apiClient.getAllUsers();
        const followingUsersData = allUsers.filter(user => 
          following.some(f => f.toString() === user.principal.toString())
        );
        setFollowingUsers(followingUsersData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-lg p-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="flex space-x-4 mb-4">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create your profile first</h3>
          <p className="text-gray-500 mb-4">
            You need to create a profile to follow other users.
          </p>
          <a
            href="/profile"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Create Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Heart className="w-6 h-6" />
          <span>Following</span>
        </h1>
        
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'posts'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Users ({followingUsers.length})
          </button>
        </div>
      </div>

      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts from followed users</h3>
              <p className="text-gray-500 mb-4">
                Follow some users to see their posts in your feed.
              </p>
              <a
                href="/explore"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Explore Users
              </a>
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
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          {followingUsers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Not following anyone yet</h3>
              <p className="text-gray-500 mb-4">
                Discover and follow users to build your network.
              </p>
              <a
                href="/explore"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Explore Users
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followingUsers.map((user) => (
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
      )}
    </div>
  );
};