# ICP Social Media Platform

A fully decentralized social media platform built on the Internet Computer Protocol (ICP) using Rust for backend canisters and React for the frontend.

## Features

### Core Functionality
- **Decentralized Authentication**: Sign in using Internet Identity or Plug Wallet
- **User Profiles**: Create, edit, and manage user profiles stored on-chain
- **Post Management**: Create, edit, and delete text/media posts
- **Social Interactions**: Like posts, follow/unfollow users
- **Feed System**: Paginated feed of posts from followed users
- **Social Graph**: View followers and following lists

### Technical Features
- **100% On-Chain**: All data stored on ICP canisters, no centralized database
- **Rust Backend**: Three separate canisters for user management, post management, and social graph
- **React Frontend**: Modern, responsive UI with Tailwind CSS
- **Type Safety**: Full TypeScript integration with Candid interface definitions
- **Real-time Updates**: Efficient state management and data synchronization

## Architecture

### Backend Canisters (Rust)

1. **User Management Canister**
   - User profile creation and management
   - Username availability checking
   - User authentication and authorization

2. **Post Management Canister**
   - Post creation, editing, and deletion
   - Like/unlike functionality
   - Feed generation with pagination

3. **Social Graph Canister**
   - Follow/unfollow relationships
   - Social statistics (followers, following counts)  
   - Follow suggestions algorithm

### Frontend (React)

- **Authentication Context**: Manages Internet Identity integration
- **API Client**: Handles all canister communications
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Component Architecture**: Modular, reusable components

## Getting Started

### Prerequisites

- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (Internet Computer SDK)
- [Node.js](https://nodejs.org/) (v16 or later)
- [Rust](https://rustup.rs/) (latest stable version)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd icp-social-media
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the local replica**
   ```bash
   dfx start --background
   ```

4. **Deploy canisters locally**
   ```bash
   dfx deploy
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

### Local Development

To work with the local replica:

```bash
# Start the local replica
dfx start --background

# Deploy all canisters
dfx deploy

# Generate TypeScript declarations
dfx generate

# Start the frontend development server
npm run dev
```

### Mainnet Deployment

To deploy to the Internet Computer mainnet:

1. **Add cycles to your cycles wallet**
   ```bash
   dfx wallet --network ic balance
   ```

2. **Deploy to mainnet**
   ```bash
   dfx deploy --network ic
   ```

3. **Build and deploy frontend**
   ```bash
   npm run build
   dfx deploy --network ic frontend
   ```

## Project Structure

```
├── src/
│   ├── user_management/     # User management canister (Rust)
│   ├── post_management/     # Post management canister (Rust)
│   ├── social_graph/        # Social graph canister (Rust)
│   ├── contexts/            # React contexts
│   ├── components/          # React components
│   ├── pages/              # React pages
│   ├── lib/                # Utilities and API client
│   └── declarations/       # Generated Candid declarations
├── dfx.json                # DFX configuration
├── Cargo.toml             # Rust workspace configuration
└── package.json           # Node.js dependencies
```

## API Documentation

### User Management
- `create_user(request)` - Create a new user profile
- `get_user(principal)` - Get user by principal
- `get_user_by_username(username)` - Get user by username
- `update_user(request)` - Update user profile
- `username_available(username)` - Check username availability

### Post Management
- `create_post(request)` - Create a new post
- `get_post(id)` - Get post by ID
- `update_post(id, request)` - Update post
- `delete_post(id)` - Delete post
- `like_post(id)` - Like a post
- `unlike_post(id)` - Unlike a post
- `get_recent_posts(limit, offset)` - Get recent posts with pagination

### Social Graph
- `follow_user(principal)` - Follow a user
- `unfollow_user(principal)` - Unfollow a user
- `get_followers(principal)` - Get user's followers
- `get_following(principal)` - Get users followed by user
- `get_social_stats(principal)` - Get social statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Future Enhancements

### Planned Features
- **End-to-end Encryption**: Encrypted direct messages
- **IPFS Integration**: Decentralized media storage
- **Comment System**: Threaded comments on posts
- **Advanced Search**: Full-text search across posts and users
- **Notifications**: Real-time notification system
- **Content Moderation**: Community-driven moderation tools

### Technical Improvements
- **Caching Layer**: Implement query caching for better performance
- **Batch Operations**: Optimize bulk operations
- **Advanced Analytics**: User engagement metrics
- **Mobile App**: React Native mobile application

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Create an issue in the repository
- Join the [Internet Computer Developer Discord](https://discord.gg/cA7y6ezyE2)
- Check the [Internet Computer Documentation](https://internetcomputer.org/docs/)