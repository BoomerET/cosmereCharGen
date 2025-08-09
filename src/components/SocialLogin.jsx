import React, { useContext } from 'react';
import { auth, googleProvider, facebookProvider, twitterProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { AuthContext } from '../contexts/AuthContext';

export default function SocialLogin() {
  const user = useContext(AuthContext);

  const login = provider => signInWithPopup(auth, provider);
  const logout = () => signOut(auth);

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span>Welcome, {user.displayName}</span>
        <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="space-x-2">
      <button onClick={() => login(googleProvider)} className="px-3 py-1 bg-red-600 text-white rounded">
        Sign in with Google
      </button>
      <button onClick={() => login(facebookProvider)} className="px-3 py-1 bg-blue-800 text-white rounded">
        Sign in with Facebook
      </button>
      <button onClick={() => login(twitterProvider)} className="px-3 py-1 bg-blue-400 text-white rounded">
        Sign in with X
      </button>
    </div>
  );
}

