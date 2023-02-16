import { auth, db } from './firebase'
import { doc, getDoc, writeBatch} from 'firebase/firestore'
import {createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
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
    const provider = new GoogleAuthProvider();

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
                    signInWithPopup(auth, provider)
                        .catch((error) => {
                            console.log(error.message);
                            setErrorMessage("Invalid registration");
                        })
                }}>
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