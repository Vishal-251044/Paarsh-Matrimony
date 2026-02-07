// src/context/UserContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const UserContext = createContext();

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState({
    userEmail: '',
    isProfilePublished: false,
    membershipType: 'free'
  });

  const [isLoading, setIsLoading] = useState(false);

  // Enhanced function to get user from localStorage
  const getUserFromStorage = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
    return null;
  }, []);

  // Load from localStorage on mount - FIXED VERSION
  useEffect(() => {
    const loadInitialData = () => {
      try {
        // First try to get from context storage
        const savedContext = localStorage.getItem('userProfileContext');
        let contextData = {
          userEmail: '',
          isProfilePublished: false,
          membershipType: 'free'
        };

        if (savedContext) {
          try {
            contextData = JSON.parse(savedContext);
          } catch (e) {
            console.error('Error parsing userProfileContext:', e);
          }
        }

        // Get user from main user storage
        const user = getUserFromStorage();
        
        // ALWAYS prioritize the email from 'user' storage
        if (user?.email) {
          setUserProfile({
            userEmail: user.email, // <-- CRITICAL: Always use email from 'user'
            isProfilePublished: contextData.isProfilePublished || false,
            membershipType: contextData.membershipType || 'free'
          });
        } else if (contextData.userEmail) {
          // Fallback to context data
          setUserProfile(contextData);
        }
        // If neither has email, keep default empty state
      } catch (error) {
        console.error('Error loading initial user data:', error);
      }
    };

    loadInitialData();
  }, [getUserFromStorage]);

  // Save to localStorage when updated
  useEffect(() => {
    if (userProfile.userEmail) { // Only save if we have email
      localStorage.setItem('userProfileContext', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // Update user profile data - ENHANCED
  const updateUserProfile = useCallback((newData) => {
    setUserProfile(prev => {
      const updated = {
        ...prev,
        ...newData
      };
      
      // Ensure email is always from 'user' storage if available
      const user = getUserFromStorage();
      if (user?.email && user.email !== updated.userEmail) {
        updated.userEmail = user.email;
      }
      
      return updated;
    });
  }, [getUserFromStorage]);

  // Clear user data (on logout)
  const clearUserProfile = useCallback(() => {
    setUserProfile({
      userEmail: '',
      isProfilePublished: false,
      membershipType: 'free'
    });
    localStorage.removeItem('userProfileContext');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  // Refresh user data from backend
  const refreshUserData = useCallback(async (backendUrl, token) => {
    try {
      setIsLoading(true);
      const user = getUserFromStorage();
      
      if (!user?.email) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getUserFromStorage]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('token');
    const user = getUserFromStorage();
    return !!(token && user?.email);
  }, [getUserFromStorage]);

  // Check if user is premium
  const isPremiumUser = useCallback(() => {
    return userProfile.membershipType === 'premium';
  }, [userProfile.membershipType]);

  // Check if profile is published
  const isProfilePublished = useCallback(() => {
    return userProfile.isProfilePublished;
  }, [userProfile.isProfilePublished]);

  // Get user email with fallback
  const getUserEmail = useCallback(() => {
    if (userProfile.userEmail) {
      return userProfile.userEmail;
    }
    
    const user = getUserFromStorage();
    if (user?.email) {
      // Update context if email was found in storage
      updateUserProfile({ userEmail: user.email });
      return user.email;
    }
    
    return '';
  }, [userProfile.userEmail, getUserFromStorage, updateUserProfile]);

  return (
    <UserContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        clearUserProfile,
        refreshUserData,
        isAuthenticated,
        isPremiumUser,
        isProfilePublished,
        isLoading,
        getUserFromStorage,
        getUserEmail
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;