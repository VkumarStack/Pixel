import React from 'react';
import { auth, db } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import SignIn from './SignIn';
import '../css/Header.css';

function Header() {
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();
    const location = useLocation();

    function buttonRender() {
        if (location.pathname === '/register')
            return;
        if (user)
            return (
                <div className="sign-out">
                    <button onClick={(e) => signOut(auth)}> Sign Out </button>
                </div>
            );
        else if (loading)
            return (
                <div className="loading">
                    <h1> Loading... </h1>
                </div>
            );
        else if (!error)
            return (
                <div className="auth-buttons">
                    <SignIn></SignIn>
                    <div className="register">
                        <button onClick={(e) => {
                            navigate("/register");
                        }}> Register </button>
                    </div>
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
        </div>
    );

}

export default Header