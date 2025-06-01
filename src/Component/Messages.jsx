import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import "../styles/Login.css";
import "../styles/Style.css";
import Posts from "./Posts";

const Messages = ({ isLoggedIn, setLoggedIn, doRefreshPosts, appRefresh }) => {
    // state variable for userToken, intiially set to an empty string
    const [userToken, setUserToken] = useState("");

    useEffect(() => {
        setUserToken(sessionStorage.getItem("token"));
    }, []);

    // if the user is not logged in, show the login form.  Otherwise, show the post form
    return (
        <div>
            ) : (
            <Posts doRefreshPosts={doRefreshPosts} appRefresh={appRefresh} />
            )}
        </div>
    );
};

export default Messages;

