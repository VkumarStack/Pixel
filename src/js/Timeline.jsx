import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import { getAuth } from 'firebase/auth';
import {  collection, query, orderBy, startAfter, limit, getDocs, doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import Drawing from './Drawing';
import InfiniteScroll from 'react-infinite-scroll-component';
import useIsScrollable from './useIsScrollable';
import '../css/Timeline.css'

const paginate_length = 1;

function Timeline(props) {
    const [user, loading, error] = useAuthState(auth);
    const [loadingData, setLoading] = useState(false);
    const [drawings, setDrawings] = useState({});
    const [more, setMore] = useState(true);
    const lastVisible = useRef(null); 
    const [isScrollable, ref, node] = useIsScrollable([drawings]);
    const drawingsRef = useRef({});

    // Unmount method, update following timestamps
    useEffect(() => {
        return () => {
            if (getAuth().currentUser) {
                for (const property in drawingsRef.current) {
                    setDoc(doc(db, "users", getAuth().currentUser.uid, "following", property), { time: serverTimestamp() });
                }
            }
        }
    }, [])

    useEffect(() => {
        if (!node || loadingData)
            return;
        
        if (!isScrollable && more)
            paginate();
        
    }, [loadingData, isScrollable, more, node]);

    useEffect(() => {
        setLoading(false);
        setDrawings({});
        setMore(true);
        lastVisible.current = null;
    }, [user])

    useEffect(() => {
        drawingsRef.current = drawings;
    }, [drawings])

    async function paginate() {
        setLoading(true);
        let result;
        if (lastVisible.current == null)
            result = query(collection(db, "users", user.uid, "following"), orderBy("time", "desc"), limit(paginate_length));
        else
            result = query(collection(db, "users", user.uid, "following"), orderBy("time", "desc"), startAfter(lastVisible.current), limit(paginate_length));
        const snapshots = await getDocs(result);
        if (snapshots.docs.length < paginate_length)
            setMore(false);
        
        snapshots.docs.forEach((item) => {
            onSnapshot(doc(db, "users", item.id, "posts", (new Date()).toISOString().split('T')[0]), (ref) => {
                if (ref.exists()) {
                    setDrawings(prevState => ({...prevState, [item.id]: { data: ref.data().data, time: ref.data().time }}))
                }
            });
        })

        lastVisible.current = snapshots.docs[snapshots.docs.length - 1]; 
        setLoading(false);
    } 

    function mapDrawings() {
        let result = [];
        for (const property in drawings) {
            result.push( <Drawing key={property} user={property} data={drawings[property].data}></Drawing> )
        }
        return result;
    }

    if (user)
        return(
            <div className="Timeline"
                ref={ref}>
                <InfiniteScroll
                    dataLength={Object.keys(drawings).length}
                    next={paginate}
                    hasMore={more}
                    loader={<h1>Loading...</h1>}
                    scrollableTarget={"Timeline"}
                >
                    { mapDrawings() }
                </InfiniteScroll>
            </div>
        );
}

export default Timeline;