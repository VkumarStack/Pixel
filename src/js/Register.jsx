import { auth, db } from './firebase'
import { doc, getDoc, writeBatch} from 'firebase/firestore'
import {createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import React, { useRef, useState, useEffect } from "react"
import { useAuthState } from 'react-firebase-hooks/auth'
import { useNavigate } from "react-router-dom"

function Register() {
    // Auth Loading
    const [user, loading, error] = useAuthState(auth);
    const [username, setUsername] = useState(null);
    const [loadingUser, setLoadingUser] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [usernameError, setUsernameError] = useState(null);
    const passwordRef = useRef(0);
    const confirmPasswordRef = useRef(0);
    const navigate = useNavigate();

    useEffect(() => {
        async function getUsername(usr) {
            setLoadingUser(true);
            const name = await getDoc(doc(db, "users", usr.uid));
            if (name.exists())
                setUsername(name.data().username);
            else
                setUsername(null);
            setLoadingUser(false);
        }
        if (user)
            getUsername(user);
    }, [user])

    if (!user && !loading)
        return (
            <div className="Register">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    createUserWithEmailAndPassword(auth, e.target.email.value, e.target.password.value)
                    .catch((error) => {
                        console.log(error.message);
                        setErrorMessage("Invalid registration");
                    });
                }}>
                    <div className="form-pair">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" required/>
                    </div>
                    <div className="form-pair">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" ref={passwordRef}
                        minLength="6"
                        pattern="(?=.*[0-9a-zA-Z]).{6,}"
                        onInvalid={(e) => {e.target.setCustomValidity("Password must be a minimum of six characters long")}}
                        onChange={(e) => {
                            if (e.target.value !== confirmPasswordRef.current.value)
                                confirmPasswordRef.current.setCustomValidity("Passwords must match");
                            else
                                confirmPasswordRef.current.setCustomValidity("");
                            e.target.setCustomValidity("");
                        }}
                        required/>
                    </div>
                    <div className="form-pair">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input type="password" id="confirm-password" name="confirm-password" ref={confirmPasswordRef}
                        minLength="6"
                        pattern="(?=.*[0-9a-zA-Z]).{6,}" 
                        onChange={(e) => {
                            if (e.target.value !== passwordRef.current.value)
                                e.target.setCustomValidity("Passwords must match");
                            else
                                e.target.setCustomValidity("");
                        }}
                        required/>
                    </div>
                    <button type="submit">Register Account</button>
                </form>
                { (errorMessage !== null) && 
                    <h1> {errorMessage} </h1>
                }
            </div>
        ); 
    if (user && (!loadingUser && !username))
        return ( 
            <div className="username-select">
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const batch = writeBatch(db);
                    const uidRef = doc(db, "users", user.uid);
                    batch.set(uidRef, { username: e.target.username.value.toLowerCase() });
                    const usernameRef = doc(db, "usernames", e.target.username.value.toLowerCase());
                    batch.set(usernameRef, { uid: user.uid });
                    try {
                        await batch.commit();
                        setUsernameError(null);
                        setUsername(e.target.username.value);
                        navigate(-1);
                    }
                    catch {
                        setUsernameError("Username already exists!");
                    }
                }}>
                    <div className="form-pair">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" name="username" minLength="3" pattern="[A-Za-z0-9_]{3,24}"
                        onInvalid={(e) => {
                            e.target.setCustomValidity("Please input a username between 3 and 24 characters containing only letters, digits, and underscores.")
                        }}
                        onChange={(e) => {
                            e.target.setCustomValidity("");
                        }}
                        required/>
                    </div>
                    <button type="submit">Choose Username</button>
                </form>
                { (usernameError !== null) && 
                    <h1> {usernameError} </h1>
                }
            </div>
        );
    if (loading || loadingUser)
        return ( <h1> Loading...</h1> );
    return (
        <button onClick={(e) => {
            signOut(auth);
            console.log(user);
        }}>Sign Out</button>
    );
}

export default Register