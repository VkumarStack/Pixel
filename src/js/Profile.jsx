import React, { useRef, useEffect, useState } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from './firebase';
import { doc, updateDoc, runTransaction, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import Canvas from './Canvas';
import UserDrawings from './UserDrawings';
import '../css/Profile.css'

function Profile() {
    let { userid } = useParams();
    const [snapshot, docLoading, docError] = useDocument(doc(db, "users", userid));
    const [authUser, authLoading, authError] = useAuthState(auth);
    const [following, setFollowing] = useState(false);
    const [edit, setEdit] = useState(false);
    const avatar = useRef(null);
    let unsub = null;

    useEffect(() => {
        if (authUser) {
            if (unsub !== null)
                unsub();
            unsub = onSnapshot(doc(db, "users", authUser.uid, "following", userid), (doc) => {
                if (doc.exists())
                    setFollowing(true);
                else
                    setFollowing(false);
            });
        }
    }, [authUser, userid])

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
                transaction.set(followerRef, { time:  serverTimestamp(), username: snapshot.data().username });
                transaction.set(followeeRef, { time: serverTimestamp(), username: localStorage.getItem("username")});
            }
        });
    }


    function profileRender() {
        let ownPage = authUser && authUser.uid === userid;
        if (snapshot.exists())
            return (
                <div className={"profile-container" + ((ownPage && " self-profile") || "") + ((edit && " editable") || "")}>
                    <div className="icon-container">
                        <h1> {snapshot.data().username} </h1>
                        <Canvas dimension="50" size="300px" editable={ownPage && edit} array={snapshot.data().avatar} ref={avatar}></Canvas>
                        { (ownPage && edit) && 
                            <button onClick={(e) => {
                                updateDoc(doc(db, "users", authUser.uid), { avatar: Array.from(avatar.current.exportCanvas()) });
                            }}>Update Icon</button> }
                        { (ownPage) &&
                            <button onClick={(e) => setEdit(!edit) }> Edit Profile </button> }
                    </div>
                    { ownPage && 
                    <form className="bio-container" onSubmit={(e) => {
                        e.preventDefault();
                        updateDoc(doc(db, "users", authUser.uid), { bio: e.target.bio.value });
                    }}> 
                        <textarea className="bio" name="bio" id="bio" cols="30" rows="10" defaultValue={snapshot.data().bio}>
                        </textarea>
                        <button type='submit'> Edit Bio </button>
                    </form> }
                    { !ownPage && 
                    <div className="bio">
                        <h1>{snapshot.data().bio}</h1>
                    </div>
                    }
                    { (!ownPage && authUser) && 
                    <button onClick={handleFollow}> {(following && "Unfollow") || ("Follow")} </button>}
                </div>
            );
        else 
            return (
                <div className="ProfileError">
                    <h1> User does not exist! </h1>
                </div>
            );
    }
    
    return(
        <div className="Profile">
            <div className="profile-modes">
                <button> Profile </button>
                <button> Followers </button>
                <button> Following </button>
            </div>
            {(authError || docError) && <h1> Something went wrong... </h1> }
            {(authLoading || docLoading) && <h1> Loading... </h1> }
            {snapshot && profileRender()} 
            <UserDrawings user={userid}></UserDrawings>
        </div>
    );
}



export default Profile;