import { auth, db } from './firebase'
import { doc, writeBatch} from 'firebase/firestore'
import React, { useState } from "react"
import { useAuthState } from 'react-firebase-hooks/auth'
import { onAuthStateChanged } from 'firebase/auth'
import style from "../css/Register.css"


function Register(props) {
    const [user, loading, error] = useAuthState(auth);
    const [usernameError, setUsernameError] = useState(null);

    onAuthStateChanged(auth, (user) => {
        if (!user)
            props.setPopup(false);
    })

    const handleSubmit = async (e) => {
        e.preventDefault();
        const batch = writeBatch(db);
        const uidRef = doc(db, "users", user.uid);
        const usernameRef = doc(db, "usernames", e.target.username.value.toLowerCase());
        batch.set(uidRef, { username: e.target.username.value.toLowerCase() });
        batch.set(usernameRef, { uid: user.uid });
        try {
            await batch.commit();
            localStorage.setItem("username", e.target.username.value.toLowerCase());
            setUsernameError(null);
            props.setPopup(false);
        }
        catch {
            setUsernameError("Username already exists!");
            setTimeout(() => setUsernameError(true), 5000);
        }
    }

    if (user)
        return ( 
            <div className="Register">
                <form onSubmit={handleSubmit}>
                    <div className="form-pair">
                        <label htmlFor="username"> Select a username </label>
                        <input type="text" id="username" name="username" minLength="3" pattern="[A-Za-z0-9_]{3,24}"
                        onInvalid={(e) => {
                            e.target.setCustomValidity("Please input a username between 3 and 24 characters containing only letters, digits, and underscores.")
                        }}
                        onChange={(e) => {
                            e.target.setCustomValidity("");
                        }}
                        required/>
                    </div>
                    <button type="submit"> Register </button>
                </form>
                { (usernameError !== null) && 
                    <h1> {usernameError} </h1>
                }
            </div>
        );
}

export default Register