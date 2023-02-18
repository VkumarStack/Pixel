import React, { useRef } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from './firebase';
import { doc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import Canvas from './Canvas';
import Post from './Post';

function Profile() {
    let { userid } = useParams();
    const [snapshot, docLoading, docError] = useDocument(doc(db, "users", userid));
    const [authUser, authLoading, authError] = useAuthState(auth);
    const avatar = useRef(null);

    const handleFollow = async (e) => {
        await runTransaction(db, async (transaction) => {
            const followerRef = doc(db, "users", authUser.uid, "following", userid);
            const followeeRef = doc(db, "users", userid, "followers", authUser.uid);
            const followerDoc = await transaction.get(followerRef);
            const followeeDoc = await transaction.get(followeeRef);
            // Unfollow 
            if (followerDoc.exists() && followeeDoc.exists()) {
                transaction.delete(followerRef);
                transaction.delete(followeeRef);
            }
            else { // Follow
                transaction.set(followerRef, { time:  serverTimestamp()});
                transaction.set(followeeRef, { time: serverTimestamp()});
            }
        });
    }

    function profileRender() {
        if (snapshot.exists() && authUser && authUser.uid === userid)
            return (
                <div className="SignedInSelfProfile">
                    <Canvas dimension="50" size="300px" editable={true} array={snapshot.data().avatar} ref={avatar}></Canvas>
                    <button onClick={(e) => {
                        if (authUser)
                            updateDoc(doc(db, "users", authUser.uid), { avatar: Array.from(avatar.current.exportCanvas()) });
                    }}>Update Icon</button>
                    <h1> {snapshot.data().username} </h1>
                    <form className="edit-bio" onSubmit={(e) =>{
                        e.preventDefault();
                        if (authUser)
                            updateDoc(doc(db, "users", authUser.uid), { bio: e.target.bio.value });
                    }}>
                        <label htmlFor="bio"> Bio </label>
                        <h1>{snapshot.data().bio}</h1>
                        <textarea name="bio" id="bio" cols="30" rows="10"></textarea>
                        <button type='submit'> Edit Bio </button>
                    </form>
                    <Post></Post>
                </div>
            );
        else if (snapshot.exists() && authUser)
            return (
                <div className="SignedInOtherProfile">
                    <Canvas dimension="50" size="100px" editable={false} array={snapshot.data().avatar} ref={avatar}></Canvas>
                    <h1> {snapshot.data().username} </h1>
                    <h1>{snapshot.data().bio}</h1>
                    <button onClick={handleFollow}> Follow </button>
                </div>
            );
        else if (snapshot.exists())
            return (
                <div className="SignedOutProfile">
                    <Canvas dimension="50" size="100px" editable={false} array={snapshot.data().avatar} ref={avatar}></Canvas>
                    <h1> {snapshot.data().username} </h1>
                    <h1>{snapshot.data().bio}</h1>
                </div>
            );
        else if (!snapshot.exists())
            return (
                <div className="ProfileError">
                    <h1> User does not exist! </h1>
                </div>
            );
    }
    
    return(
        <div className="Profile">
            {(authError || docError) && <h1> Something went wrong... </h1> }
            {(authLoading || docLoading) && <h1> Loading... </h1> }
            {snapshot && profileRender()} 
        </div>
    );
}

export default Profile;