import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import "../styles/Login.css";
import "../styles/Style.css";

const HomePage = ({ isLoggedIn, setLoggedIn, doRefreshPosts, appRefresh }) => {
  // state variable for userToken, intiially set to an empty string
  const [userToken, setUserToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUserToken(sessionStorage.getItem("token"));
  }, []);

  // if the user is not logged in, show the login form.  Otherwise, show the post form
  return (
    <div>
      {!userToken ? (
        <>
          <LoginForm setLoggedIn={setLoggedIn} />
        </>
      ) : (
        navigate("/settings")
      )}
    </div>
  );
};

export default HomePage;

