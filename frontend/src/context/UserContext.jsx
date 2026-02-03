// src/context/UserContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const UserContext = createContext();

// Custom hook to use the context
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

// Provider component
export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState({
    userEmail: '',
    isProfilePublished: false,
    membershipType: 'free'
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('userProfileContext');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setUserProfile(parsedData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
      }
    }
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    localStorage.setItem('userProfileContext', JSON.stringify(userProfile));
  }, [userProfile]);

  // Update user profile data
  const updateUserProfile = (newData) => {
    setUserProfile(prev => ({
      ...prev,
      ...newData
    }));
  };

  // Clear user data (on logout)
  const clearUserProfile = () => {
    setUserProfile({
      userEmail: '',
      isProfilePublished: false,
      membershipType: 'free'
    });
    localStorage.removeItem('userProfileContext');
  };

  // Get user data from localStorage
  const getUserFromStorage = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
      }
    }
    return null;
  };

  // Refresh user data from backend (optional)
  const refreshUserData = async (backendUrl, token) => {
    try {
      setIsLoading(true);
      const user = getUserFromStorage();
      
      if (!user?.email) {
        return null;
      }

      // You can add backend API call here if needed
      // const response = await axios.get(`${backendUrl}/profile/get/${user.email}`);
      
      // For now, just return stored data
      return user;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!getUserFromStorage();
  };

  // Check if user is premium
  const isPremiumUser = () => {
    return userProfile.membershipType === 'premium';
  };

  // Check if profile is published
  const isProfilePublished = () => {
    return userProfile.isProfilePublished;
  };

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
        getUserFromStorage
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;