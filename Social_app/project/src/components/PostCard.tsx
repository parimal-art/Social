import React, { useState } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { apiClient } from '../lib/api';

interface PostCardProps {
  post: any;
  currentUser: any;
  onLike: () => void;
  onUnlike: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLike, onUnlike }) => {
  const [isLiking, setIsLiking] = useState(false);
  
  const isLiked = currentUser && post.likes.some((like: any) => 
    like.toString() === currentUser.principal.toString()
  );
  
  const isOwner = currentUser && post.author.toString() === currentUser.principal.toString();

  const handleLike = async () => {
    if (!currentUser || isLiking) return;
    
    setIsLiking(true);
    try {
      if (isLiked) {
        await apiClient.unlikePost(post.id);
        onUnlike();
      } else {
        await apiClient.likePost(post.id);
        onLike();
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <img
          src={`https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=48&h=48&dpr=1`}
          alt="User avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">Anonymous User</span>
              <span className="text-gray-500 text-sm">
                {formatDate(post.created_at)}
              </span>
            </div>
            
            {isOwner && (
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="mb-4">
            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mt-3 grid grid-cols-1 gap-3">
                {post.media_urls.map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Post media ${index + 1}`}
                    className="rounded-lg max-w-full h-auto object-cover"
                    style={{ maxHeight: '400px' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-6 text-gray-500">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 hover:text-red-500 transition-colors ${
                isLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{Number(post.like_count)}</span>
            </button>
            
            <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span>0</span>
            </button>
            
            <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
              <Share className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};