import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Settings from "./Component/Settings";
import HomePage from "./Component/HomePage";
import Navbar from "./Component/Navbar";
import Friends from "./Component/Friends";
import Groups from "./Component/Groups";
import Modal from "./Component/Modal";
import PromiseComponent from "./Component/PromiseComponent";
// import LoginForm from "./Component/LoginForm";
import RegisterForm from "./Component/RegisterForm";
import ResetPassword from "./Component/ResetPassword";
import Messaging from "./Component/Messaging";
import { io } from "socket.io-client"
import ClaemPage from "./Component/ClaemPage"; // Importing meeting team claem here
import LanaPage from "./Component/LanaPage";  // Ensure correct path
import EthanPage from "./Component/EthanPage"; // Path to Ethan's page
import MilindPage from "./Component/MilindPage"; // Path to Milind's page
import CadencePage from "./Component/CadencePage";
import "./styles/Style.css";
import AmadeoPage from "./Component/AmadeoPage"; //
import Account from "./Component/Account";
import Profiles from "./Component/Profiles";
import { ProfilePictureProvider } from "./Component/ProfilePictureContext"; // Import the context provider
import StyleGuide from "./StyleGuide";
import StyleGuide2 from "./StyleGuide2";
import StyleGuide3 from "./StyleGuide3";
import { useLocation } from "react-router-dom";
import Requests from "./Component/Requests"

import AccountActivity from "./Component/AccountActivity";
import UserProfilePage from "./Component/UserProfilePage";
import Conversations from "./Component/Conversations";
import "./styles/PageHeadings.css";




// App.jsx is the starting point for the application.  This is the component called by index, which will be rendered when
// a user goes to your app URL.  This component will handle routing to other parts of your app, and any initial setup.

// Initalize the socket with the respective path and tenantID
// NEED this in App.jsx to use the socket throughout the application for real-time connections
const socket = io(process.env.REACT_APP_API_PATH_SOCKET, {
  path: '/hci/api/realtime-socket/socket.io',
  query: {
    tenantID: "claem"
  }
})
export { socket }

function App(){
  return (
    <ProfilePictureProvider>
      <Router basename = {process.env.PUBLIC_URL}>
        <AppWithRouterLogic />
      </Router>
    </ProfilePictureProvider>
  );
}
 
function AppWithRouterLogic() {

  // logged in state, which tracks the state if the user is currently logged in or not
  // initially set to false
  // const [loggedIn, setLoggedIn] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [refreshPosts, setRefreshPosts] = useState(false);
  const location = useLocation();
  const hideNavbar = location.pathname === '/' || location.pathname === '/register' || location.pathname === '/reset-password';

  const doRefreshPosts = () => {
    console.log("CALLING DOREFRESHPOSTS IN APP.JSX");
    setRefreshPosts(true);
  };

  const toggleModal = (e) => {
    e.preventDefault();
    // Take the current state of openModal, and update it to be the negated value of that
    // ex) if openModal == false, this will update openModal to true
    setOpenModal((prev) => !prev);
    console.log(openModal);
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to HCI socket server")
    })
  }, [])

  return (
      // the app is wrapped in a router component, that will render the
      // appropriate content based on the URL path.  Since this is a
      // single page app, it allows some degree of direct linking via the URL
      // rather than by parameters.  Note that the "empty" route "/", uses the HomePage
      // component, if you look in the HomePage component you will see a ternary operation:
      // if the user is logged in, show the "home page", otherwise show the login form.
      <ProfilePictureProvider>
        <div className="App">
          <header className="App-header">

            {!hideNavbar && (
              <Navbar toggleModal={(e) => toggleModal(e)} />
            )}
            <div className="maincontent" id="mainContent">

              <Routes>
                <Route path="/claem" element={<ClaemPage />} /> {/* Go to team claem page */}
                <Route path="/lana" element={<LanaPage />} />  {/* go to lana's profile page */}
                <Route path="/ethan" element={<EthanPage />} /> {/* Go to Ethan's profile page */}
                <Route path="/milind" element={<MilindPage />} /> {/* Go to milind's profile page */}
                <Route path="/cadence" element={<CadencePage />} /> {/* Go to Cadence's profile page */}
                <Route path="/amadeo" element={<AmadeoPage />} /> {/* Go to Amadeo's profile page */}
                <Route path="/account" element={<Account />} />  {/* New Route for Account Page */}
                <Route path="/StyleGuide" element={<StyleGuide />} />
              <Route path="/StyleGuide2" element={<StyleGuide2 />} />
              <Route path="/StyleGuide3" element={<StyleGuide3 />} />
              <Route path="/requests" element={<Requests />} />
                <Route path="/account-activity" element = {<AccountActivity />} /> {/* Route to Account Activity Page*/}
                <Route path="/home-page" element={<Profiles
                 />} />  {/* New Route for Account Page */}
                 <Route path="/profile/:userID" element={<UserProfilePage />} />

                <Route path="/settings" element={<Settings />} />


                <Route
                    path="/"
                    element={
                      <HomePage
                          // setLoggedIn={setLoggedIn}
                          doRefreshPosts={doRefreshPosts}
                          appRefresh={refreshPosts}
                      />
                    }
                />
                <Route
                    path="/register"
                    element={<RegisterForm/>}
                />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/promise" element={<PromiseComponent />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/conversations" element={<Conversations />} />
                {/* Declaring a route with a URL parameter "roomID" so that React router dynamically
              captures the corresponding values in the URL when there is a match.
              It is useful when dynamically rendering the same component for multiple paths.
              You can see how this is used in the Messaging component
              as well as how this path is being set up in the FriendList component */}
                <Route path="/messages/:roomID" element={<Messaging />} />
              </Routes>
            </div>
          </header>

          <Modal show={openModal} onClose={(e) => toggleModal(e)}>
            This is a modal dialog!
          </Modal>
        </div>
      </ProfilePictureProvider>

  );
}
export default App;
