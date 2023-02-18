import React, { useState } from 'react';
import { auth, db } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import Register from './Register';
import '../css/Header.css';

function Header() {
    const [user, loading, error] = useAuthState(auth);
    const [authError, setAuthError] = useState(false);
    const [registerPopup, setPopup] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const provider = new GoogleAuthProvider();

    const handleSignIn = (e) => {
        e.preventDefault();
        signInWithPopup(auth, provider)
            .then(async (credential) => {
                const username = await getDoc(doc(db, "users", credential.user.uid));
                if (!username.exists())
                    setPopup(true);
                else
                    localStorage.setItem("username", username.data().username);
            })
            .catch((error) => {
                setAuthError(true);
                setTimeout(() => {setAuthError(false)}, 5000);
            })
    }

    function buttonRender() {
        if (location.pathname === '/register')
            return;
        if (user)
            return (
                <div className="sign-out">
                    <button onClick={(e) => {
                        signOut(auth);
                        localStorage.removeItem("username");
                        }}> Sign Out </button>
                </div>
            );
        else if (!error)
            return (
                <div className="sign-in">
                    <button onClick={handleSignIn}> Sign In </button>
                    {authError && <h1> Something went wrong with your sign in... </h1>}
                </div>
            );
    }

    return(
        <div className="Header">
            <div className="logo">
                <h1> LOGO PLACEHOLDER </h1>
            </div>
            <div className="search">
                <button> SEARCH PLACEHOLDER </button>
            </div>
            { buttonRender() }
            { registerPopup && <Register setPopup={setPopup}></Register> }
        </div>
    );

}

export default Header