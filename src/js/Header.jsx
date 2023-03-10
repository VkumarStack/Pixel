import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import Register from './Register';
import Search from './Search';
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
                <div className="auth-buttons">
                    <button onClick={(e) => {
                        signOut(auth);
                        localStorage.removeItem("username");
                        }}> 
                    Sign Out </button>
                    <button onClick={(e) => {
                        navigate("/users/" + user.uid);
                    }}>
                    Profile </button>
                </div>
            );
        else if (!error)
            return (
                <div className="auth-buttons">
                    <button onClick={handleSignIn}> Sign In </button>
                </div>
            );
    }

    return(
        <div className="Header">
            <div className="logo">
                <h1> <Link to={"/"}> Pixel </Link> </h1>
            </div>
            <Search></Search>
            { buttonRender() }
            { registerPopup && <Register setPopup={setPopup}></Register> }
        </div>
    );

}

export default Header