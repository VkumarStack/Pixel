import React, { useState } from "react";
import { debounce } from "lodash";
import { db } from './firebase';
import { doc, collection, FieldPath, getDocs, query, where, limit, documentId} from "firebase/firestore";
import { Link } from "react-router-dom";

function Search() {
    const [users, setUsers] = useState([]);
    const findUsers = async function(e) {    
        if (e.target.value.length === 0)
            return;
        const start = e.target.value;
        const end = start.slice(0, start.length - 1) + (String.fromCharCode(start.charCodeAt(start.length - 1) + 1));
        const q = query(collection(db, "usernames"), where(documentId(), ">=", start), where(documentId(), "<", end), limit(10));
        const docs = await getDocs(q);
        const links = [];
        docs.forEach((doc) => {
            links.push(<li key={doc.id}> <Link to={"/users/" + doc.data().uid}> { doc.id } </Link> </li>)
        });
        setUsers(links);
        
    }
    return (
        <div className="SearchBar">
            <input type="text" placeholder="Find a user" onChange={debounce( (e) => findUsers(e), 500)}/>
            {users}
        </div>
    );
}

export default Search;