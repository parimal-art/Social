import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Import generated declarations
import { idlFactory as userIdlFactory } from '../declarations/user_management';
import { idlFactory as postIdlFactory } from '../declarations/post_management';
import { idlFactory as socialIdlFactory } from '../declarations/social_graph';

const HOST = import.meta.env.DEV 
  ? 'http://127.0.0.1:4943' 
  : 'https://ic0.app';

const USER_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_USER_MANAGEMENT || 'rdmx6-jaaaa-aaaaa-aaadq-cai';
const POST_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_POST_MANAGEMENT || 'rrkah-fqaaa-aaaaa-aaaaq-cai';
const SOCIAL_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_SOCIAL_GRAPH || 'ryjl3-tyaaa-aaaaa-aaaba-cai';

class ApiClient {
  private agent: HttpAgent;
  private userActor: any;
  private postActor: any;
  private socialActor: any;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeAgent();
  }

  private async initializeAgent() {
    try {
      this.agent = new HttpAgent({ host: HOST });
      
      if (import.meta.env.DEV) {
        try {
          await this.agent.fetchRootKey();
          console.log('Successfully connected to local replica');
        } catch (err) {
          console.error('Unable to fetch root key. Make sure your local replica is running with: dfx start --background');
          console.error('Then deploy canisters with: dfx deploy');
          throw new Error('Local replica connection failed. Please start the local replica and deploy canisters.');
        }
      }

      this.initializeActors();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize API client:', error);
      throw error;
    }
  }

  private initializeActors() {
    try {
      this.userActor = Actor.createActor(userIdlFactory, {
        agent: this.agent,
        canisterId: USER_CANISTER_ID,
      });

      this.postActor = Actor.createActor(postIdlFactory, {
        agent: this.agent,
        canisterId: POST_CANISTER_ID,
      });

      this.socialActor = Actor.createActor(socialIdlFactory, {
        agent: this.agent,
        canisterId: SOCIAL_CANISTER_ID,
      });
    } catch (error) {
      console.error('Failed to initialize actors:', error);
      throw new Error('Failed to initialize canister actors. Please ensure canisters are deployed.');
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializeAgent();
    }
  }

  async updateIdentity(identity: any) {
    await this.ensureInitialized();
    this.agent.replaceIdentity(identity);
    this.initializeActors();
  }

  // User Management
  async createUser(userData: any) {
    await this.ensureInitialized();
    try {
      return await this.userActor.create_user(userData);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async getUser(principal: Principal) {
    await this.ensureInitialized();
    try {
      return await this.userActor.get_user(principal);
    } catch (error) {
      console.error('Failed to get user:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string) {
    await this.ensureInitialized();
    try {
      return await this.userActor.get_user_by_username(username);
    } catch (error) {
      console.error('Failed to get user by username:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    await this.ensureInitialized();
    try {
      return await this.userActor.get_current_user();
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  async updateUser(userData: any) {
    await this.ensureInitialized();
    try {
      return await this.userActor.update_user(userData);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  async isUsernameAvailable(username: string) {
    await this.ensureInitialized();
    try {
      return await this.userActor.username_available(username);
    } catch (error) {
      console.error('Failed to check username availability:', error);
      throw error;
    }
  }

  async getAllUsers() {
    await this.ensureInitialized();
    try {
      return await this.userActor.get_all_users();
    } catch (error) {
      console.error('Failed to get all users:', error);
      throw error;
    }
  }

  // Post Management
  async createPost(postData: any) {
    await this.ensureInitialized();
    try {
      return await this.postActor.create_post(postData);
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  async getPost(postId: bigint) {
    await this.ensureInitialized();
    try {
      return await this.postActor.get_post(postId);
    } catch (error) {
      console.error('Failed to get post:', error);
      throw error;
    }
  }

  async getUserPosts(principal: Principal) {
    await this.ensureInitialized();
    try {
      return await this.postActor.get_user_posts(principal);
    } catch (error) {
      console.error('Failed to get user posts:', error);
      throw error;
    }
  }

  async updatePost(postId: bigint, postData: any) {
    await this.ensureInitialized();
    try {
      return await this.postActor.update_post(postId, postData);
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    }
  }

  async deletePost(postId: bigint) {
    await this.ensureInitialized();
    try {
      return await this.postActor.delete_post(postId);
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw error;
    }
  }

  async likePost(postId: bigint) {
    await this.ensureInitialized();
    try {
      return await this.postActor.like_post(postId);
    } catch (error) {
      console.error('Failed to like post:', error);
      throw error;
    }
  }

  async unlikePost(postId: bigint) {
    await this.ensureInitialized();
    try {
      return await this.postActor.unlike_post(postId);
    } catch (error) {
      console.error('Failed to unlike post:', error);
      throw error;
    }
  }

  async getRecentPosts(limit: bigint, offset: bigint) {
    await this.ensureInitialized();
    try {
      return await this.postActor.get_recent_posts(limit, offset);
    } catch (error) {
      console.error('Failed to get recent posts:', error);
      throw error;
    }
  }

  async getPostsByUsers(users: Principal[], limit: bigint, offset: bigint) {
    await this.ensureInitialized();
    try {
      return await this.postActor.get_posts_by_users(users, limit, offset);
    } catch (error) {
      console.error('Failed to get posts by users:', error);
      throw error;
    }
  }

  // Social Graph
  async followUser(principal: Principal) {
    await this.ensureInitialized();
    try {
      return await this.socialActor.follow_user(principal);
    } catch (error) {
      console.error('Failed to follow user:', error);
      throw error;
    }
  }

  async unfollowUser(principal: Principal) {
    await this.ensureInitialized();
    try {
      return await this.socialActor.unfollow_user(principal);
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      throw error;
    }
  }

  async isFollowing(follower: Principal, following: Principal) {
    await this.ensureInitialized();
    try {
      return await this.socialActor.is_following(follower, following);
    } catch (error) {
      console.error('Failed to check following status:', error);
      throw error;
    }
  }

  async getFollowers(principal: Principal) {
    await this.ensureInitialized();
    try {
      return await this.socialActor.get_followers(principal);
    } catch (error) {
      console.error('Failed to get followers:', error);
      throw error;
    }
  }

  async getFollowing(principal: Principal) {
    await this.ensureInitialized();
    try {
      return await this.socialActor.get_following(principal);
    } catch (error) {
      console.error('Failed to get following:', error);
      throw error;
    }
  }

  async getSocialStats(principal: Principal) {
    await this.ensureInitialized();
    try {
      return await this.socialActor.get_social_stats(principal);
    } catch (error) {
      console.error('Failed to get social stats:', error);
      throw error;
    }
  }

  async getFollowSuggestions(principal: Principal, limit: bigint) {
    await this.ensureInitialized();
    try {
      return await this.socialActor.get_follow_suggestions(principal, limit);
    } catch (error) {
      console.error('Failed to get follow suggestions:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();