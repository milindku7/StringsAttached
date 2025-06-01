import React, { useEffect } from "react";
import blockIcon from "../assets/block_white_216x216.png";
import unblockIcon from "../assets/thumbsup.png";
import messageIcon from "../assets/comment.svg";
import { useNavigate } from "react-router-dom";
import { socket } from "../App";

const FriendList = (props) => {
  const navigate = useNavigate();

  // Destructure props to get only the values you need
  const { loadFriends, userId, connections, error, isLoaded, setConnections } = props;

  useEffect(() => {
    // Now we're referring directly to loadFriends
    loadFriends();
  }, [loadFriends]); // Include loadFriends as dependency

  const updateConnection = (id, status) => {
    console.log(`Attempting to update connection ${id} to status ${status}`);

    // Make the API call to update a connection's status
    fetch(process.env.REACT_APP_API_PATH + "/connections/" + id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      body: JSON.stringify({
        attributes: { status: status, type: "friend" },
      }),
    })
        .then((res) => res.json())
        .then(
            (result) => {
              setConnections([]);
              loadFriends();
            },
            (error) => {
              alert("error!");
            }
        );
  };

  const conditionalAction = (status, id) => {
    console.log(`Rendering action based on status: ${status} for connection ${id}`);
    if (status === "active") {
      return (
          <img
              src={blockIcon}
              className="sidenav-icon deleteIcon"
              alt="Block User"
              title="Block User"
              onClick={() => updateConnection(id, "blocked")}
          />
      );
    } else {
      return (
          <img
              src={unblockIcon}
              className="sidenav-icon deleteIcon"
              alt="Unblock User"
              title="Unblock User"
              onClick={() => updateConnection(id, "active")}
          />
      );
    }
  };

  useEffect(() => {
    const handleCreateRoom = (data) => {
      console.log("Received data on /room-created event:", data);
      if (data && data.roomID) {
        console.log("Navigating to room:", data.roomID);
        navigate(`/messages/${data.roomID}`);
        sessionStorage.setItem("toUserID", userId);
      }
    };

    socket.on("/room-created", handleCreateRoom);
    return () => {
      socket.off("/room-created", handleCreateRoom);
    };
  }, [navigate, userId]);

  const handleMessageClick = (connectionUser) => {
    console.log("Attempting to message user with ID:", connectionUser.id);
    socket.emit("/chat/join-room", {
      fromUserID: sessionStorage.getItem("user"),
      toUserID: connectionUser.id,
    });
    console.log("Join room event emitted for user ID:", connectionUser.id);

    socket.once("/room-created", (data) => {
      console.log("Navigating to room with ID:", data.roomID);
      if (data && data.roomID) {
        sessionStorage.setItem("toUserID", connectionUser.id);
        sessionStorage.setItem("roomID", data.roomID);
        navigate(`/messages/${data.roomID}`);
      } else {
        console.error("Room creation failed, no roomID received.");
      }
    });
  };

  if (error) {
    return <div> Error: {error.message} </div>;
  } else if (!isLoaded) {
    return <div> Loading... </div>;
  } else {
    return (
        <div className="post">
          <ul>
            {connections.reverse().map((connection) => (
                <div key={connection.id} className="userlist">
                  <div>
                    {connection.toUser.attributes.username} - {connection.attributes.status}
                  </div>
                  <div className="friends-icons-container deletePost">
                    <div className="deletePost">
                      <img
                          src={messageIcon}
                          className="sidenav-icon messageIcon"
                          alt="Message User"
                          title="Message User"
                          onClick={() => handleMessageClick(connection.toUser)}
                      />
                    </div>
                    <div>
                      {conditionalAction(connection.attributes.status, connection.id)}
                    </div>
                  </div>
                </div>
            ))}
          </ul>
        </div>
    );
  }
};

export default FriendList;
