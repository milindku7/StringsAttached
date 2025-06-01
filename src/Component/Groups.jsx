import React, { useEffect } from "react";
import GroupList from "./GroupList";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const navigate = useNavigate();
  // variable for userToken to check authorization
  const userToken = sessionStorage.getItem("token");

  // This useEffect will run on initial render and whenever userToken or navigate changes.
  useEffect(() => {
    console.log(userToken);
    if (!userToken) {
      navigate("/");
    }
  }, [userToken, navigate]);

  return (
      <div>
        <p>Join a Group!</p>
        <GroupList userid={sessionStorage.getItem("user")} />
      </div>
  );
};

export default Groups;
