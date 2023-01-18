import React, { useState, useEffect } from 'react';
import { useDocumentOnce } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

function Profile() {
    let { username } = useParams();
    const [value, loading, error, reload] = useDocumentOnce(doc(db, "usernames", username.toLowerCase()));
    const [user, authLoading, authError] = useAuthState(auth);
    const [loadProfile, setLoadingProfile] = useState(true);
    const [errorProfile, setErrorProfile] = useState(false);
    const [profile, setProfile] = useState(null);
    let unsub;

    function profileRender() {
        if (user && user.uid === value.data().uid)
            return (
                <div className="SignedInSelfProfile">
                    <h1> {profile.username} </h1>
                    <button> Edit Bio </button>
                </div>
            );
        else if (user)
            return (
                <div className="SignedInOtherProfile">
                    <h1> {profile.username} </h1>
                    <button> Follow </button>
                </div>
            );
        else 
            return (
                <div className="SignedOutProfile">
                    <h1> {profile.username} </h1>
                </div>
            );
    }
    
    useEffect(() => { 
        if (value && value.data()) {
            unsub = onSnapshot(doc(db, "users", value.data().uid), (doc) => {
                setLoadingProfile(false);
                setProfile(doc.data());
            }, (error) => {
                setErrorProfile(true);
            });
        }
    }, [value]);

    return(
        <div className="Profile">
            {(error || errorProfile) && <h1> Something went wrong... </h1> }
            {(loading || loadProfile) && <h1> Loading... </h1> }
            {value && !value.data() && <h1> User does not exist! </h1> }
            {profile && profileRender()} 
        </div>
    );
}

export default Profile;