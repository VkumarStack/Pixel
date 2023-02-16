import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Canvas from './Canvas';

function Drawing(props) {
    const [data, setData] = useState(null);
    const unsub = onSnapshot(doc(db, "users", props.uid, "posts", (new Date()).toISOString().split('T')[0]), (doc) => {
        if (doc.exists())
            setData(doc.data().data);
    })
    const drawing = useRef(null);

    useEffect(() => {
        return () => {
            console.log("Unsubbing");
            unsub();
        }
    }, [])

    if (data)
        return (
            <div className="Drawing">
                <Canvas dimension="100" size="500px" editable={false} array={data} ref={drawing}></Canvas>
            </div>
        );
}

export default Drawing;