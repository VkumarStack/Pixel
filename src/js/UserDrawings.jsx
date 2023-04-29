import React, {useState, useRef, useEffect} from "react";
import { db, auth } from "./firebase";
import useIsScrollable from "./useIsScrollable";
import {  collection, query, orderBy, startAfter, limit, getDocs, doc } from 'firebase/firestore';
import { useDocument } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Drawing from "./Drawing";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "./Post";
const paginate_length = 1;
import '../css/UserDrawings.css'

function UserDrawings(props) {
    const [user, authLoading, authError] = useAuthState(auth);
    const [snapshot, docLoading, docError] = useDocument(doc(db, "users", props.user, "posts", (new Date()).toISOString().split('T')[0]));
    const [loadingData, setLoading] = useState(false);
    const [drawings, setDrawings] = useState({});
    const [more, setMore] = useState(true);
    const lastVisible = useRef(null); 
    const [isScrollable, ref, node] = useIsScrollable([drawings]);

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
    }, [props.user])

    async function paginate() {
        setLoading(true);
        let result;
        if (lastVisible.current == null)
            result = query(collection(db, "users", props.user, "posts"), orderBy("time", "desc"), limit(paginate_length));
        else
            result = query(collection(db, "users", props.user, "posts"), orderBy("time", "desc"), startAfter(lastVisible.current), limit(paginate_length));
        const snapshots = await getDocs(result);
        if (snapshots.docs.length < paginate_length)
            setMore(false);
        
        snapshots.docs.forEach((item) => {
            if (item.id != (new Date()).toISOString().split('T')[0])
                setDrawings(prevState => ({...prevState, [item.id]: { data: item.data().data, time: item.data().time }}));
        });

        lastVisible.current = snapshots.docs[snapshots.docs.length - 1]; 
        setLoading(false);
    } 

    function mapDrawings() {
        let result = [];
        for (const property in drawings) {
            result.push( <Drawing key={property} user={props.user} data={drawings[property].data}></Drawing> )
        }
        return result;
    }

    return(
        <div className="UserDrawings"
            ref={ref}
            style={{height: "100%"}}
            >
            <InfiniteScroll
                dataLength={Object.keys(drawings).length}
                next={paginate}
                hasMore={more}
                loader={<h1>Loading...</h1>}
                scrollableTarget={"UserDrawings"}
            >
                { (snapshot && snapshot.exists()) && (user && user.uid !== props.user)  && <Drawing user={props.user} data={snapshot.data().data}></Drawing>}
                { (snapshot) && (user && user.uid === props.user)  && <Post></Post>}
                { mapDrawings() }
            </InfiniteScroll>
        </div>
    );
}

export default UserDrawings;