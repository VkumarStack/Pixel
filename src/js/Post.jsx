import React, {useRef} from "react";
import { db, auth } from './firebase';
import { getAuth } from "firebase/auth";
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
import Canvas from "./Canvas";
import '../css/Post.css'


function Post() {
    const [snapshot, loading, error] = useDocument(doc(db, "users", getAuth().currentUser.uid, "posts", (new Date()).toISOString().split('T')[0]));
    const postRef = useRef(null);

    const submitPost = async function(e) {
        const batch = writeBatch(db);
        const postDoc = doc(db, "users", getAuth().currentUser.uid, "posts", (new Date()).toISOString().split('T')[0]);
        const userDoc = doc(db, "users", getAuth().currentUser.uid);
        batch.set(postDoc, { data: Array.from(postRef.current.exportCanvas()), time: serverTimestamp() });
        batch.update(userDoc, { timestamp: serverTimestamp() });
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