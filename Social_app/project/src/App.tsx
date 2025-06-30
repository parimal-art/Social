import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { CreatePost } from './pages/CreatePost';
import { Login } from './pages/Login';
import { Explore } from './pages/Explore';
import { Following } from './pages/Following';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile/:username?" element={<Profile />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/following" element={<Following />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;