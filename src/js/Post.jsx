import React, {useRef} from "react";
import { db, auth } from './firebase';
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, updateDoc, runTransaction, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import Canvas from "./Canvas";


function Post() {
    const [snapshot, loading, error] = useDocument(doc(db, "users", getAuth().currentUser.uid, "posts", (new Date()).toISOString().split('T')[0]));
    const postRef = useRef(null);

    const submitPost = async function(e) {
        console.log(postRef);
        const batch = writeBatch(db);
        const postDoc = doc(db, "users", getAuth().currentUser.uid, "posts", (new Date()).toISOString().split('T')[0]);
        const userDoc = doc(db, "users", getAuth().currentUser.uid);
        batch.set(postDoc, { data: Array.from(postRef.current.exportCanvas()), time: serverTimestamp() });
        batch.update(userDoc, { timestamp: serverTimestamp() });
        console.log("commit attempt");
        await batch.commit();
    }

    if (!snapshot)
        return;
    else if (!snapshot.exists())
        return (
            <div className="Post">
                <Canvas dimension="100" size="500px" editable={true} ref={postRef}></Canvas>
                <button onClick={(e) => submitPost(e)}> Post Today's Drawing </button>
            </div>
        );
    else
        return (
            <div className="Post">
                <Canvas dimension="100" size="500px" editable={true} ref={postRef} array={snapshot.data().data}></Canvas>
                <button onClick={(e) => submitPost(e)}> Update Today's Drawing </button>
            </div>
        );
}

export default Post;