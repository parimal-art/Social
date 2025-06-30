import React, { useState } from 'react';
import { apiClient } from '../lib/api';
import { PlusCircle, Image } from 'lucide-react';

interface CreatePostFormProps {
  onPostCreated: (post: any) => void;
}

export const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    setLoading(true);
    try {
      const result = await apiClient.createPost({
        content: content.trim(),
        media_urls: mediaUrls,
      });

      if ('Ok' in result) {
        onPostCreated(result.Ok);
        setContent('');
        setMediaUrls([]);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          maxLength={280}
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {content.length}/280
        </div>
      </div>

      {mediaUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mediaUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Media ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== index))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addMediaUrl}
          className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
        >
          <Image className="w-5 h-5" />
          <span>Add Image</span>
        </button>

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
  );
};