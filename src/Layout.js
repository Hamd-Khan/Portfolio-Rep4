import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, Link, Navigate } from "react-router-dom";
import NoteList from "./NoteList";
import { v4 as uuidv4 } from "uuid";
import { currentDate } from "./utils";
import { GoogleLogin,googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';


const localStorageKey = "lotion-v1";


function Layout() { 
 const navigate = useNavigate();
 const mainContainerRef = useRef(null);
 const [collapse, setCollapse] = useState(false);
 const [notes, setNotes] = useState([]);
 const [editMode, setEditMode] = useState(false);
 const [currentNote, setCurrentNote] = useState(-1);
 const [userdata, setUserData] = useState(null);
 const [user, setUser] = useState([]);
 const [activeUser, setactiveUser] = useState(false);
 const [isLoggedIn, setIsLoggedIn] = useState(false);




 useEffect(() => {
   if (currentNote < 0) {
     return;
   }
   if (!editMode) {
     navigate(`/notes/${currentNote + 1}`);
     return;
   }
   navigate(`/notes/${currentNote + 1}/edit`);
 }, [notes]);


 useEffect(
   () => {
       if (user && user.access_token) {
           axios
               .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                   headers: {
                       Authorization: `Bearer ${user.access_token}`,
                       Accept: 'application/json'
                   }
               })
               .then((res) => { setUserData(res.data); })
               .catch((err) => { console.log(err)});
       }
   },[user]);


 useEffect(() => {
   const fetchNotes = async () => {
     const email = userdata.email;
     const res = await fetch(
       `INSERT UR OWN LAMBDA URL '=${email}`,
       {
         method: "GET",
         headers: {
           "Content-Type":"application/json",
         }
       }
     );
     const data = await res.json();
     setNotes(data.data);
   }
   if (userdata) {
     const email = userdata.email;
     fetchNotes();
     localStorage.setItem('userdata', JSON.stringify(userdata));
   }
   if(!userdata) {
     navigate("/");
   }
 }, [userdata]);
  useEffect(() => {
   const storedToken = localStorage.getItem(localStorageKey);
   if (storedToken) {
     setUser(JSON.parse(storedToken));
     setIsLoggedIn(true);
   }
 }, []);




 const handleLogIn = useGoogleLogin({
   onSuccess: (codeResponse) => {
     setUser(codeResponse);
     setactiveUser(true);
     setIsLoggedIn(true);
     localStorage.setItem(localStorageKey, JSON.stringify(codeResponse));
   },
   onError: (error) => console.log(error)
 });
  const handleLogOut = () => {
   setactiveUser(false);
   googleLogout();
   setUserData(null);
   setIsLoggedIn(false);
   localStorage.removeItem(localStorageKey);
 };
 


 const saveNote = async(note, index) => {
   setEditMode(false);
   note.body = note.body.replaceAll("<p><br></p>", "");
   setNotes([
     ...notes.slice(0, index),
     { ...note },
     ...notes.slice(index + 1),
   ]);
   setCurrentNote(index);
   setEditMode(false);
   const res = await fetch(
      "INSERT YOUR OWN LAMBDAURL",
      {
         method:"POST",
         headers:{
           "Content-Type":"application/json",
         },
         body:JSON.stringify({
           email: userdata.email,
           id: note.id,
           body: note.body,
           title: note.title,
           when: note.when
         })
      }
   );
 };


 const deleteNote = async (index) => {
   const noteId = notes[index].id;
   const email = userdata.email;
   const res = await fetch(
     "INSERT YOUR OWN LAMBDA URL",
     {
       method: "DELETE",
       headers: {
         "Content-Type":"application/json",
       },
       body: JSON.stringify({email:email,...notes[index]})
     }
   )
   setNotes([...notes.slice(0, index), ...notes.slice(index + 1)]);
   setCurrentNote(0);
   setEditMode(false);
 };


 const addNote = () => {
   setNotes([
     {
       id: uuidv4(),
       title: "Untitled",
       body: "",
       when: currentDate(),
     },
     ...notes,
   ]);
   setEditMode(true);
   setCurrentNote(0);
 };
   return (
     <div>
       {userdata ? (<div id="container">
         <header>
           <aside>
             <button id="menu-button" onClick={() => setCollapse(!collapse)}>
               &#9776;
             </button>
           </aside>
           <div id="app-header">
             <h1>
               <Link to="/notes">Lotion</Link>
             </h1>
             <h6 id="app-moto">Like Notion, but worse.</h6>
           </div>
           <div id="user-display">
             <div className ="user">{isLoggedIn ? userdata.name : ""}</div>
             <p className="logout-btn" style={{ display: isLoggedIn ? "" : "none" }} onClick={() => handleLogOut()}>Log out</p>
           </div>
         </header>
         <div id="main-container" ref={mainContainerRef}>
           <aside id="sidebar" className={collapse ? "hidden" : null}>
             <header>
               <div id="notes-list-heading">
                 <h2>Notes</h2>
                 <button id="new-note-button" onClick={addNote}>
                   +
                 </button>
               </div>
             </header>
             <div id="notes-holder">
               <NoteList notes={notes} />
             </div>
           </aside>
           <div id="write-box">
             <Outlet context={[notes, saveNote, deleteNote]} />
           </div>
         </div>
       </div>):(
         <div className="userlogin">
           <header>
           <aside>
             <button id="menu-button" onClick={() => setCollapse(!collapse)}>
               &#9776;
             </button>
           </aside>
           <div id="app-header">
             <h1>
               <Link to="/notes">Lotion</Link>
             </h1>
             <h6 id="app-moto">Like Notion, but worse.</h6>
           </div>
           <aside>&nbsp;</aside>
         </header>
         <div className="login-button">
         <GoogleLogin onSuccess={() => {handleLogIn();setactiveUser(true);}}
           onError={(error) => console.log(error)} />
       </div>
         </div>
         )}
     </div>
   );
}


export default Layout;