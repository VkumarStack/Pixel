import React, { useState, useEffect, useRef } from 'react';
import { useDocumentOnce } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import Canvas from './Canvas';
import Post from './Post';

function Profile() {
    let { username } = useParams();
    const [value, loading, error, reload] = useDocumentOnce(doc(db, "usernames", username.toLowerCase()));
    const [user, authLoading, authError] = useAuthState(auth);
    const [loadProfile, setLoadingProfile] = useState(true);
    const [errorProfile, setErrorProfile] = useState(false);
    const [profile, setProfile] = useState(null);
    const avatar = useRef(null);
    let unsub;

    function profileRender() {
        console.log(profile);
        if (user && user.uid === value.data().uid)
            return (
                <div className="SignedInSelfProfile">
                    <Canvas dimension="50" size="300px" editable={true} array={profile.avatar} ref={avatar}></Canvas>
                    <button onClick={(e) => {
                        if (value)
                            updateDoc(doc(db, "users", value.data().uid), { avatar: Array.from(avatar.current.exportCanvas()) });
                    }}>Update Icon</button>
                    <h1> {profile.username} </h1>
                    <form className="edit-bio" onSubmit={(e) =>{
                        e.preventDefault();
                        if (value)
                            updateDoc(doc(db, "users", value.data().uid), { bio: e.target.bio.value });
                    }}>
                        <label htmlFor="bio"> Bio </label>
                        <h1>{profile.bio}</h1>
                        <textarea name="bio" id="bio" cols="30" rows="10"></textarea>
                        <button type='submit'> Edit Bio </button>
                    </form>
                    <Post></Post>
                </div>
            );
        else if (user)
            return (
                <div className="SignedInOtherProfile">
                    <Canvas dimension="50" size="100px" editable={false} array={profile.avatar} ref={avatar}></Canvas>
                    <h1> {profile.username} </h1>
                    <h1>{profile.bio}</h1>
                    <button onClick={async (e) => {
                        await runTransaction(db, async (transaction) => {
                            const followerRef = doc(db, "users", user.uid, "following", value.data().uid);
                            const followeeRef = doc(db, "users", value.data().uid, "followers", user.uid);
                            const followerDoc = await transaction.get(followerRef);
                            const followeeDoc = await transaction.get(followeeRef);
                            // Unfollow 
                            if (followerDoc.exists() && followeeDoc.exists()) {
                                transaction.delete(followerRef);
                                transaction.delete(followeeRef);
                            }
                            else { // Unfollow
                                transaction.set(followerRef, { time:  serverTimestamp()})
                                transaction.set(followeeRef, { time: serverTimestamp()})
                            }
                        });

                    }}> Follow </button>
                </div>
            );
        else 
            return (
                <div className="SignedOutProfile">
                    <Canvas dimension="50" size="100px" editable={false} array={profile.avatar} ref={avatar}></Canvas>
                    <h1> {profile.username} </h1>
                    <h1>{profile.bio}</h1>
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