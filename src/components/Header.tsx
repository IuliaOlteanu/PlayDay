import React, { useState, useEffect, useContext } from 'react';
import Logo from "./../assets/logo_PlayDay_1.png";
import { auth, firestore } from '../lib/firebase'; // Import firebase auth and firestore
import { doc, getDoc } from 'firebase/firestore';
import { AuthContext } from './context/auth-provider';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState<"owner" | "player" | ''>('');
  const [loading, setLoading] = useState<boolean>(true); // Track loading state for authentication check

  const { user } = useContext(AuthContext);

  // Listen to auth state changes and fetch user role
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => await getDoc(doc(firestore, 'users', user.uid));
    fetchUser().then((userDoc) => {
      if (userDoc.exists()) {
        setRole(userDoc.data().role); // Set role from Firestore data
      }
      setLoading(false);
    }).catch((_) => setLoading(false));
  }, [user]);

  const handleSignIn = () => {
    navigate('/signIn');
  };

  const handleSignUp = () => {
    navigate('/signUp');
  };

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/'); // Redirect to home page after sign out
  };

  if (loading) {
    return (
      <header className="flex justify-between items-center p-4 shadow-md">
        <div>Loading...</div>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center p-4 shadow-md">
      {/* Logo Section */}
      <div className="flex items-center">
        <img
          src={Logo}
          alt="Logo"
          className="h-12 w-12 object-cover rounded-full border-2 border-black"
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex gap-6">
        <a href="/home" className="hover:text-[#065C64]">
          Home
        </a>

        <a href="/about" className="hover:text-[#065C64]">
          About Us
        </a>

        {role === 'owner' ? (
          <a href="/my-fields" className="hover:text-[#065C64]">
            My Fields
          </a>
        ) : (
          <a href="/fields" className="hover:text-[#065C64]">
            Fields
          </a>
        )}
        {user && role === 'owner' ? (
          <></>
        ) : <a href="/games" className="hover:text-[#065C64]">
          Games
        </a>}

        {/* Conditionally render 'My Profile' only if the user is authenticated */}
        {user ? (
          <a href="/my-profile" className="hover:text-[#065C64]">
            My Profile
          </a>
        ) : null}
      </nav>

      {/* Authentication Buttons */}
      <div className="flex gap-4">
        {user ? (
          <>
            <button
              onClick={handleSignOut}
              className="border-2 border-black px-4 py-1 hover:text-white hover:bg-[#065C64]"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            {/* Show Sign In and Sign Up buttons if user is not signed in */}
            <button
              onClick={handleSignIn}
              className="border-2 border-black px-4 py-1 hover:text-white hover:bg-[#065C64]"
            >
              Sign In
            </button>
            <button
              onClick={handleSignUp}
              className="border-2 border-black px-4 py-1 hover:text-white hover:bg-[#065C64]"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;