import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import {  collection, query, orderBy, startAfter, limit, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import Drawing from './Drawing';
import InfiniteScroll from 'react-infinite-scroll-component';

const paginate_length = 1;


function Timeline() {
    const [user, loading, error] = useAuthState(auth);
    const [drawings, setDrawings] = useState([]);
    const [more, setMore] = useState(true);
    const lastVisible = useRef(null);

    useEffect(() => {
        if (user)
        {   
            paginate();
        }
        else if (!user)
        {
            setDrawings([]);
            setMore(true);
            lastVisible.current = null;
        }
    }, [user]);

    async function paginate() {
        let result;
        if (lastVisible.current == null)
            result = query(collection(db, "users", user.uid, "following"), orderBy("time"), limit(paginate_length));
        else
            result = query(collection(db, "users", user.uid, "following"), orderBy("time"), startAfter(lastVisible.current), limit(paginate_length));
        const snapshots = await getDocs(result);
        if (snapshots.docs.length < paginate_length)
            setMore(false);
        const ids = snapshots.docs.map(res => res.id);
        setDrawings(drawings.concat(ids));
        lastVisible.current = snapshots.docs[snapshots.docs.length - 1]; 
    }

    if (user)
        return (
            <InfiniteScroll
                dataLength={drawings.length}
                next={paginate}
                hasMore={more}
                loader={<h4>Loading...</h4>}>
                    {drawings.map((i, index) => ( <Drawing key={index} uid={i}></Drawing> ))}
            </InfiniteScroll>
        );
}

export default Timeline;