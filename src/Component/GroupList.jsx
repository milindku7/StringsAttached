import React, { useState, useEffect } from "react";
import blockIcon from "../assets/block_white_216x216.png";
import unblockIcon from "../assets/thumbsup.png";
import deleteIcon from "../assets/delete.png";

const GroupList = () => {
  // Removed unused 'userid'
  const [groups, setGroups] = useState([]);
  const [mygroups, setMygroups] = useState([]);
  const [mygroupIDs, setMygroupIDs] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  // Removed unused 'responseMessage' state

  useEffect(() => {
    loadGroups();
  }, []); // Empty dependency array ensures this effect runs once after the initial render

  // This will load all available groups
  const loadGroups = () => {
    fetch(process.env.REACT_APP_API_PATH + "/groups", {
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
                setIsLoaded(true);
                setGroups(result[0]);
              }
              // Now, pull all the groups that the current user belongs to.
              fetch(
                  process.env.REACT_APP_API_PATH +
                  "/group-members?userID=" +
                  sessionStorage.getItem("user"),
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: "Bearer " + sessionStorage.getItem("token"),
                    },
                  }
              )
                  .then((res2) => res2.json())
                  .then(
                      (result2) => {
                        if (result2) {
                          let memberships = [];
                          let membershipIDs = [];
                          if (Array.isArray(result2)) {
                            console.log("GOT MEMBERS ", result2[0]);
                            membershipIDs = result2[0].map(
                                (groupmember) => groupmember.groupID
                            );
                            memberships = result2[0];
                            console.log("GROUP LIST", memberships);
                          } else {
                            membershipIDs.push(result2.groupID);
                            memberships.push(result2);
                          }
                          setIsLoaded(true);
                          setMygroupIDs(membershipIDs);
                          setMygroups(memberships);
                        }
                      },
                      (error) => {
                        setIsLoaded(true);
                        setError(error);
                      }
                  );
            },
            (error) => {
              setIsLoaded(true);
              setError(error);
            }
        );
  };

  // Example call: update a group
  const testGroupUpdate = () => {
    fetch(process.env.REACT_APP_API_PATH + "/groups/1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      body: JSON.stringify({
        name: "test",
        attributes: { test: "test" },
      }),
    })
        .then((res) => res.json())
        .then((result) => {
          loadGroups();
        });
  };

  // Example call: add a group
  const testGroupAdd = () => {
    fetch(process.env.REACT_APP_API_PATH + "/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      body: JSON.stringify({
        name: "Test ADD Group",
        attributes: { test: "test" },
      }),
    })
        .then((res) => res.json())
        .then((result) => {
          loadGroups();
        });
  };

  // Example call: delete a group
  const deleteGroup = (gid) => {
    fetch(process.env.REACT_APP_API_PATH + "/groups/" + gid, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    }).then((result) => {
      loadGroups();
    });
  };

  const getGroupMemberId = (groupid) => {
    console.log("LOOKING FOR GROUP", groupid);
    for (const membership of mygroups) {
      console.log("MEMBERSHIP", membership);
      if (membership.groupID === groupid) {
        console.log("returning ", membership.id);
        return membership.id;
      } else {
        console.log(membership.groupID, "is not ", groupid);
      }
    }
    return -1;
  };

  // Toggle group membership for the current user
  const updateConnection = (id, status) => {
    if (status === "inactive") {
      fetch(
          process.env.REACT_APP_API_PATH +
          "/group-members/" +
          getGroupMemberId(id),
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
          }
      ).then((response) => {
        if (response.status === 204) {
          // Successful deletion
        } else if (response.status === 404) {
          // Membership not found
        }
        console.log("LOADING GROUPS");
        loadGroups();
      });
    } else {
      fetch(process.env.REACT_APP_API_PATH + "/group-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        body: JSON.stringify({
          userID: sessionStorage.getItem("user"),
          groupID: id,
        }),
      })
          .then((res) => res.json())
          .then(
              (result) => {
                console.log(result.Status);
                loadGroups();
              },
              (error) => {
                alert("error!");
              }
          );
    }
  };

  // Render membership action icon
  const conditionalAction = (id) => {
    if (mygroupIDs.includes(id)) {
      return (
          <img
              src={blockIcon}
              className="sidenav-icon deleteIcon"
              alt="Block User"
              title="Block User"
              onClick={(e) => updateConnection(id, "inactive")}
          />
      );
    } else {
      return (
          <img
              src={unblockIcon}
              className="sidenav-icon deleteIcon"
              alt="Unblock User"
              title="Unblock User"
              onClick={(e) => updateConnection(id, "active")}
          />
      );
    }
  };

  if (error) {
    return <div> Error: {error.message} </div>;
  } else if (!isLoaded) {
    return <div> Loading... </div>;
  } else {
    return (
        <div>
          <ul>
            {groups.map((group) => (
                <div key={group.id} className="userlist">
                  {group.name}
                  <div className="deletePost">
                    {conditionalAction(group.id)}
                    <img
                        src={deleteIcon}
                        className="sidenav-icon deleteIcon"
                        alt="Delete Group"
                        title="Delete Group"
                        onClick={(e) => deleteGroup(group.id)}
                    />
                  </div>
                </div>
            ))}
          </ul>
          <button onClick={testGroupUpdate}>Test Update</button>
          <button onClick={testGroupAdd}>Test Add</button>
        </div>
    );
  }
};

export default GroupList;
