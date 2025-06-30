import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { PlusCircle, Image, Film, Smile } from 'lucide-react';

export const CreatePost: React.FC = () => {
  const { identity } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (identity) {
      apiClient.updateIdentity(identity);
      loadCurrentUser();
    }
  }, [identity]);

  const loadCurrentUser = async () => {
    try {
      const user = await apiClient.getCurrentUser();
      if ('Ok' in user) {
        setCurrentUser(user.Ok);
      }
    } catch (error) {
      console.log('No user profile found');
      navigate('/profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Please enter some content for your post');
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.createPost({
        content: content.trim(),
        media_urls: mediaUrls,
      });

      if ('Ok' in result) {
        navigate('/');
      } else {
        alert('Failed to create post: ' + result.Err);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const addMediaUrl = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      setMediaUrls([...mediaUrls, url.trim()]);
    }
  };

  const removeMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <PlusCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create your profile first</h3>
          <p className="text-gray-500 mb-4">
            You need to create a profile before you can post content.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a Post</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind?
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts with the community..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={6}
              maxLength={280}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {content.length}/280
            </div>
          </div>

          {mediaUrls.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Media</h3>
              {mediaUrls.map((url, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 truncate">{url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMediaUrl(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={addMediaUrl}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Image className="w-5 h-5" />
                <span>Add Image</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};