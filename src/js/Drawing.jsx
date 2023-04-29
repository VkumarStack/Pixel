import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from './firebase';
import { doc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
import Canvas from './Canvas';
import '../css/Drawing.css'

function Drawing(props) {
    const [user, loading, error] = useDocument(doc(db, "users", props.user))

    if (props.data) 
        return (
            <div className="Drawing">
                { loading && <Link> Loading... </Link> }
                { user && user.exists() && <Link to={"/users/" + props.user}> {user.data().username} </Link> }
                <Canvas dimension="100" size="500px" editable={false} array={props.data}></Canvas>
            </div>
        );
}

/*
function Drawing(props) {
    const [data, setData] = useState(null);
    const unsub = onSnapshot(doc(db, "users", props.uid, "posts", (new Date()).toISOString().split('T')[0]), (doc) => {
        if (doc.exists())
            setData(doc.data().data);
    })
    const drawing = useRef(null);

    useEffect(() => {
        return () => {
            unsub();
        }
    }, [])

    if (data)
        return (
            <div className="Drawing">
                <Canvas dimension="100" size="500px" editable={false} array={data} ref={drawing}></Canvas>
            </div>
        );
}*/

export default Drawing;