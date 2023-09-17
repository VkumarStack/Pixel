import React, { useState, useRef, useEffect } from "react";
import { db, auth } from "./firebase";
import {  collection, query, orderBy, startAfter, limit, getDocs, doc } from 'firebase/firestore';
import InfiniteScroll from "react-infinite-scroll-component";
import useIsScrollable from "./useIsScrollable";
import { useDocumentOnce } from "react-firebase-hooks/firestore";
import { Link } from "react-router-dom";
import Canvas from "./Canvas";
import "../css/Follows.css"

const paginate_length = 10;

function Follows(props) {
    const [loadingData, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [more, setMore] = useState(true);
    const lastVisible = useRef(null);

    useEffect(() => {
        setLoading(false);
        setUsers([]);
        setMore(true);
        lastVisible.current = null;
    }, [props.user, props.followers])

    useEffect(() => {
        paginate()
    }, [])

    async function paginate() {
        setLoading(true);
        let result;
        if (lastVisible.current == null)
            result = query(collection(db, "users", props.user, (props.followers && "followers") || "following"), orderBy("time", "desc"), limit(paginate_length));
        else
            result = query(collection(db, "users", props.user, (props.followers && "followers") || "following"), orderBy("time", "desc"), startAfter(lastVisible.current), limit(paginate_length));
        const snapshots = await getDocs(result);
        if (snapshots.docs.length < paginate_length)
            setMore(false);
        
        let loadedUsers = snapshots.docs.map((item) => item.id);
        setUsers([...users, ...loadedUsers]); 

        lastVisible.current = snapshots.docs[snapshots.docs.length - 1]; 
        setLoading(false);
    } 

    function mapUsers() {
        let result = [];
        users.forEach(user => {
            result.push(<ProfilePortion key={user} user={user}></ProfilePortion> )
        }) 
        return result;
    }

    return (
        <div className="Follows"
            id="Follows"
            style={{height: 200, overflow: "auto"}}
            >
                <InfiniteScroll
                    dataLength={users.length}
                    next={paginate}
                    hasMore={more}
                    loader={<h1>Loading...</h1>}
                    scrollableTarget={"Follows"}
                    height={200}
                    style={{display: 'flex', flexDirection: 'column', alignItems: 'baseline', gap: '10px', overflow:"auto"}}
                >
                    {mapUsers()}
                </InfiniteScroll>
        </div>
    )
}

function ProfilePortion(props) {
    const [snapshot, loading, error, reload] = useDocumentOnce(doc(db, "users", props.user))
    if (snapshot && snapshot.exists())
        return (
            <div className="ProfilePortion">
                <Link to={"/users/" + props.user}>
                    <Canvas dimension="50" editable={false} array={snapshot.data().avatar}></Canvas>
                    <div className="text-container">
                        <h1> {snapshot.data().username}</h1>
                    </div>
                </Link>
            </div>
        )
}

export default Follows