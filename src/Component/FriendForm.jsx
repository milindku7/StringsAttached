import React, { useState, useEffect } from "react";
import Autocomplete from "./Autocomplete.jsx";

const FriendForm = ({ userid, loadFriends }) => {
  const [friendid, setFriendid] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch data and update users state
    fetch(process.env.REACT_APP_API_PATH + "/users/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    })
        .then((res) => res.json())
        .then(
            (result) => {
              if (result) {
                let names = [];
                result[0].forEach((element) => {
                  if (element.attributes && element.attributes.username) {
                    names.push(element);
                  }
                });
                setUsers(names);
                setResponseMessage(result.Status);
              }
            },
            (error) => {
              alert("error!");
            }
        );
  }, []);

  // Set the friendid state to the user id that is selected from the autocomplete for the connection
  const selectAutocomplete = (friendID) => {
    setFriendid(friendID);
    console.log("Set Friend ID to " + friendID);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    console.log("friend is ", friendid);

    // Make the API call to the user controller
    fetch(process.env.REACT_APP_API_PATH + "/connections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      body: JSON.stringify({
        toUserID: friendid,
        fromUserID: sessionStorage.getItem("user"),
        attributes: { type: "friend", status: "active" },
      }),
    })
        .then((res) => res.json())
        .then(
            (result) => {
              setResponseMessage(result.Status);
              loadFriends(); // refresh friends list
            },
            (error) => {
              alert("error!");
            }
        );
  };

  return (
      <form onSubmit={submitHandler} className="profileform">
        <label>
          Find a Friend!
          <br />
          <div className="autocomplete">
            <Autocomplete
                suggestions={users}
                selectAutocomplete={(e) => selectAutocomplete(e)}
            />
          </div>
        </label>
        <input type="submit" value="submit" />
        {responseMessage}
      </form>
  );
};

export default FriendForm;
