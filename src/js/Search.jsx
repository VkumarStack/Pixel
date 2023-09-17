import React, { useState } from "react";
import { debounce } from "lodash";
import { db } from './firebase';
import { collection, getDocs, query, where, limit, documentId } from "firebase/firestore";
import { Link } from "react-router-dom";
import "../css/Search.css"

function Search() {
    const [users, setUsers] = useState([]);
    const findUsers = async function(e) {    
        if (e.target.value.length === 0 || !e.target.checkValidity()) {
            setUsers([]);
            return;
        }
        const start = e.target.value.toLowerCase();
        const end = start.slice(0, start.length - 1) + (String.fromCharCode(start.charCodeAt(start.length - 1) + 1));
        const q = query(collection(db, "usernames"), where(documentId(), ">=", start), where(documentId(), "<", end), limit(10));
        
        const docs = await getDocs(q);
        const links = [];
        docs.forEach((doc) => {
            
            // links.push(<li key={doc.id}> <Link to={"/users/" + doc.data().uid}> { doc.id } </Link> </li>)
            links.push(<Link to={"/users/" + doc.data().uid} key={doc.id}> <li> { doc.id }  </li> </Link>)
        });
        setUsers(links);
        
    }
    return (
        <div className="SearchBar">
            <input type="text" pattern="[A-Za-z0-9_]+" 
            placeholder="Find a user" onChange={debounce( (e) => findUsers(e), 500)}/>
            <ul> {users} </ul>
        </div>
    );
}

export default Search;