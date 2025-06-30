import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

interface AuthContextType {
  isAuthenticated: boolean;
  identity: Identity | null;
  principal: Principal | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  authClient: AuthClient | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client);
      
      if (await client.isAuthenticated()) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();
        
        setIsAuthenticated(true);
        setIdentity(identity);
        setPrincipal(principal);
      }
    });
  }, []);

  const login = async () => {
    if (!authClient) return;
    
    const APP_NAME = "ICP Social Media";
    const APP_LOGO = "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1";
    const HOST = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:4943' 
      : 'https://identity.ic0.app';
    
    await new Promise<void>((resolve) => {
      authClient.login({
        identityProvider: HOST,
        onSuccess: () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal();
          
          setIsAuthenticated(true);
          setIdentity(identity);
          setPrincipal(principal);
          resolve();
        },
        onError: (error) => {
          console.error('Login failed:', error);
          resolve();
        },
        windowOpenerFeatures: `
          left=${window.screen.width / 2 - 400},
          top=${window.screen.height / 2 - 300},
          toolbar=0,
          location=0,
          menubar=0,
          width=800,
          height=600
        `,
      });
    });
  };

  const logout = async () => {
    if (!authClient) return;
    
    await authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
    setPrincipal(null);
  };

  const value = {
    isAuthenticated,
    identity,
    principal,
    login,
    logout,
    authClient,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};