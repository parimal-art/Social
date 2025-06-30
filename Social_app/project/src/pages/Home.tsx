import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { PostCard } from '../components/PostCard';
import { CreatePostForm } from '../components/CreatePostForm';
import { Heart, MessageCircle, Repeat, Share } from 'lucide-react';

export const Home: React.FC = () => {
  const { identity, principal } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

      // Get posts
      const postsResult = await apiClient.getRecentPosts(BigInt(20), BigInt(0));
      setPosts(postsResult);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost: any) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome to ICP Social</h1>
        
        {currentUser ? (
          <CreatePostForm onPostCreated={handlePostCreated} />
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 mb-3">
              Complete your profile to start posting and connecting with others!
            </p>
            <a
              href="/profile"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Create Profile
            </a>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">
              Be the first to share something with the community!
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