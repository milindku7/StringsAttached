import React, { useState, useEffect, useCallback } from "react";
import noIcon from "../../src/assets/noicon.jpg";
import "../styles/Conversations.css";
import { socket } from "../App";
import Messaging from "./Messaging";
import { Link, useNavigate } from "react-router-dom";

const Conversations = () => {
    const [users, setUsers] = useState([]); // All users from API
    const [friendIds, setFriendIds] = useState([]); // IDs of mutual friends
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [roomID, setRoomID] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [instrumentQuery, setInstrumentQuery] = useState("");
    const loggedInUserId = sessionStorage.getItem("user");
    const [chats, setChats] = useState(["All","Groups"]);
    const [bubblebuttonColor, setbubbleButtonColor] = useState([]);
    const [bubblebuttonColorback, setbubbleButtonColorback] = useState([]);
    const [groupshow, setgroupshow] = useState(false);
    const [grouparr, setgrouparr] = useState([]);
    const [groupselected, setgroupselected] = useState(null);
    const [postsmadebyusers, setpostsmadebyusers] = useState([]);
    const [creategroup, setcreategroup] = useState(false);
    const [grouptype, setgrouptype] = useState(["General", "Music", "Dating", "Friends"]);
    const [selectedgrouptype, setselectedgrouptype] = useState(null);
    const [grouptypecolor, setgrouptypecolor] = useState(["black","black","black","black",]);
    const [grouptypecolorback, setgrouptypecolorback] = useState(["white","white","white","white"]);
    const [createagroupname, setcreateagroupname] = useState("");
    const [uploadfile, setuploadfile] = useState(null);
    const [newmember, setnewmember] = useState(null);
    const [groupmemberstoadd, setgroupmemberstoadd] = useState([]);
    const [gnameerror, setgnameerror] = useState("");
    const [gtypeerror, setgtypeerror] = useState("");
    const [gfileerror,setgfileerror] = useState("");
    const [gmembererror, setgmembererror] = useState("");
    const userToken = sessionStorage.getItem("token");
    const navigate = useNavigate();
    const [grouposts, setgrouposts] = useState([]);
    const [isHovering, setIsHovering] = useState("");
    const [posthovered, setposthovered] = useState("");
    const [blockedposts, setblockedposts] = useState([]);
    const [clickblock, setclickblock] = useState("");
    const [unblockhover, setunblockhover] = useState("");
    const [useradded, setuseradded] = useState("");
    const [memberaddedlist, setmemberaddedlist] = useState([]);
    const [imageurl, setimageurl] = useState([]);


    useEffect(() => {
      console.log(userToken);
      if (!userToken) {
        navigate("/");
      }
    }, [userToken, navigate]);

    useEffect(() => {
        setposthovered(isHovering.id);
      }, [isHovering]);


      useEffect(() => {
        const fetchblockedposts = async () => {
            const userid = sessionStorage.getItem("user");
            const response = await fetch(
            `https://www.stringsattached.online/api/api/default/users/${userid}`,
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            }
        );
        const data = await response.json();
        const blockedlist = data.attributes.blockedPosts;
        setblockedposts(blockedlist);
        console.log(data);
          };
        
      fetchblockedposts();    
      }, []);

    useEffect(() => {
        const userID = sessionStorage.getItem("user");
        const token = sessionStorage.getItem("token")
        fetch(
            `https://www.stringsattached.online/api/api/default/users/${userID}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
        )
        .then((res) => res.json())
        .then((result) => {
            let instruments = ["All", "Groups"];
            const ins = result.attributes.instruments;
            for (let i = 0; i < ins.length; i++){
                instruments.push(ins[i]);
            }
            let backc = [];
            let c = [];
            for (let i = 0; i < instruments.length; i++) {
                backc.push("white");
                c.push("black");
            }
            setbubbleButtonColor(c);
            setbubbleButtonColorback(backc)
            setChats(instruments)
        });
      }, []);

    // Fetch all users from the API
    const fetchAllUsers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(
                "https://www.stringsattached.online/api/api/default/users",
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch users.");
            }
            const data = await response.json();
            console.log("Fetched Users:", data);

            if (Array.isArray(data) && data.length > 0) {
                // Filter out users with no name and remove the logged-in user.
                
                const filtered = data[0].filter((user) => {
                    if (Number(user.id) === Number(loggedInUserId)) return false;
                    const firstName = user.attributes?.firstName?.trim();
                    const lastName = user.attributes?.lastName?.trim();
                    return (firstName || lastName);
                });
                setUsers(filtered);
            } else {
                setError("No users found.");
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Error fetching users.");
        } finally {
            setLoading(false);
        }
    }, [loggedInUserId]);

    const fetchConnections = useCallback(async () => {
        try {
            const response = await fetch(
                `https://www.stringsattached.online/api/api/default/connections?fromUserID=${loggedInUserId}`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch connections.");
            }
            const data = await response.json();
            // Assuming data[0] contains an array of connection objects.
            // Here we treat a connection as a "friend" if the connection's attributes indicate follow === true.
            const friends = data[0].filter((conn) => {
                return conn.attributes && conn.attributes.follow === true;
            });
            // Get an array of friend IDs (as strings for easy comparison).
            const ids = friends.map((conn) => String(conn.toUserID));
            setFriendIds(ids);
        } catch (error) {
            console.error("Error fetching connections:", error);
        }
    },[loggedInUserId])
    
    useEffect(() => {
        fetchConnections();
    }, [loggedInUserId,fetchConnections]);

    // Set up socket listener for room-created event
    useEffect(() => {
        const handleRoomCreated = (data) => {
            console.log("Received data on /room-created event:", data);
            if (data && data.roomID) {
                console.log("Room created with ID:", data.roomID);
                setRoomID(data.roomID);
                sessionStorage.setItem("roomID", data.roomID);
            }
        };

        socket.on("/room-created", handleRoomCreated);
        return () => {
            socket.off("/room-created", handleRoomCreated);
        };
    }, []);

    // Fetch users on mount
    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    // When a user is clicked, join a chat room.
    const handleUserClick = (user) => {
        console.log("Attempting to message user with ID:", user.id);
        setSelectedUser(user);
        sessionStorage.setItem("toUserID", user.id);
        socket.emit("/chat/join-room", {
            fromUserID: loggedInUserId,
            toUserID: user.id,
        });
        console.log("Join room event emitted for user ID:", user.id);
    };

    // Close the messaging modal.
    const closeModal = () => {
        setSelectedUser(null);

    };

    // Only show users that are friends and also match search & instrument queries.
    const filteredUsers = users.filter((user) => {
        // First, filter out non-friends:
        if (!friendIds.includes(String(user.id))) {
            return false;
        }

        const fullName = `${user.attributes?.firstName || ""} ${user.attributes?.lastName || ""}`.toLowerCase();
        const displayName = fullName.trim().length > 0 ? fullName : user.email;
        const instruments = user.attributes?.instruments || "";
        const instrumentsString = Array.isArray(instruments)
            ? instruments.join(", ").toLowerCase()
            : instruments.toLowerCase();

        return (
            displayName.includes(searchQuery.toLowerCase()) &&
            instrumentsString.includes(instrumentQuery.toLowerCase())
        );
    });

    const fetchCommunities = useCallback(async () => {
        const token = sessionStorage.getItem("token");
        const userID = sessionStorage.getItem("user");
        
        const response = await fetch(
            `https://www.stringsattached.online/api/api/default/group-members?userID=${userID}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          let final_glist = [];
          const data = await response.json();
          const groupslist = data[0];
          console.log(groupslist[0].group);
          for (let i = 0; i < groupslist.length; i++) {
            let gup = groupslist[i];
            final_glist.push(gup.group);
          }
          setgrouparr(final_glist);
    },[])

    const handleGroupClick = useCallback(async (group) => {
        const token = sessionStorage.getItem("token");
        console.log(group.id)
        if (group === groupselected) {
            setgroupselected(null);
        }
        else if (group === "" || group === null) {
            setgroupselected(null);
        }
        else {
            setgroupselected(group);
            const response = await fetch(
                `https://www.stringsattached.online/api/api/default/group-members?groupID=${group.id}`,
                {
                  method: "GET",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              let mem_list = [];

              const data = await response.json();
              const member_list = data[0];
              for (let i = 0; i < member_list.length; i++) {
                mem_list.push(member_list[i].user.id);
              }

              let fin_list = []

              for (let j = 0; j < mem_list.length; j++) {
                const response = await fetch(
                    `https://www.stringsattached.online/api/api/default/posts?authorID=${mem_list[j]}&sort=newest`,
                    {
                      method: "GET",
                      headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
        
                  const data2 = await response.json();
                  const posts_list = data2[0];

                  let blo = false;
                    for (let k=0; k < posts_list.length; k++) {
                        blo = false;
                        for (let l = 0; l < blockedposts.length; l++) {
                            let curr_post_id = posts_list[k].id;
                            if (curr_post_id === blockedposts[l]) {
                                blo = true;
                            }
                        }
                        if (!blo) {
                            fin_list.push(posts_list[k]);
                        }
                    }
              }
              setpostsmadebyusers(fin_list);
        }
    },[groupselected, blockedposts])

    const handleCreateGroup = () => {
        if (creategroup === false) {
            setcreategroup(true);
        }
        else {
            setcreategroup(false);

        }
        
    }

    const populateposts = async (id) => {
        const token = sessionStorage.getItem("token");

        const response3 = await fetch(
            `https://www.stringsattached.online/api/api/default/groups?name=${id}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

        const returnedg = await response3.json();
        const actualgid = returnedg[0][0].id;

        const response = await fetch(
            `https://www.stringsattached.online/api/api/default/group-members?groupID=${actualgid}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          let mem_list = [];
          

          const data = await response.json();
          const member_list = data[0];
          for (let i = 0; i < member_list.length; i++) {
            mem_list.push(member_list[i].user.id);
          }

          

          let fin_list = []

          for (let j = 0; j < mem_list.length; j++) {
            const response = await fetch(
                `https://www.stringsattached.online/api/api/default/posts?authorID=${mem_list[j]}&sort=newest`,
                {
                  method: "GET",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              const data2 = await response.json();
              const posts_list = data2[0];
              let blo = false;
              for (let k=0; k < posts_list.length; k++) {
                blo = false;
                for (let l = 0; l < blockedposts.length; l++) {
                    let curr_post_id = posts_list[k].id;
                    if (curr_post_id === blockedposts[l]) {
                        blo = true;
                    }
                }
                if (!blo) {
                    fin_list.push(posts_list[k]);
                }
              }
          }
          console.log("fin list are", fin_list)
          setgrouposts(fin_list);
    };

    const handleChatClick = (id, index) => {
        console.log(id)
        if (index === 0) {
            fetchAllUsers();
            setInstrumentQuery("");
            setgroupshow(false);
            setgrouposts([]);
            setgroupselected(id);
            setpostsmadebyusers([]);
        }
        else if (index === 1) {
            setInstrumentQuery("");
            fetchCommunities();
            setgroupshow(true);
            setgrouposts([]);
            setpostsmadebyusers([]);
            setgroupselected(id);
        }
        else {
            setgroupshow(false);
            setInstrumentQuery("");
            setgroupselected(id);
            populateposts(id);
        }

        let changedcolor = [];
        let changedcolorback = [];
            for (let i = 0; i < bubblebuttonColor.length; i++) {
                changedcolorback.push("white");
                changedcolor.push("black");
            }
        changedcolor[index] = "white";
        changedcolorback[index] = "black";
        setbubbleButtonColor(changedcolor);
        setbubbleButtonColorback(changedcolorback);
    };


    const handleGroupTypeSelect = (e,id, index) => {
        e.preventDefault();
        errorShow(2, "");
        setselectedgrouptype(id);
        let changedcolor = [];
        let changedcolorback = [];
            for (let i = 0; i < grouptypecolor.length; i++) {
                changedcolorback.push("white");
                changedcolor.push("black");
            }
        changedcolor[index] = "white";
        changedcolorback[index] = "black";
        setgrouptypecolor(changedcolor);
        setgrouptypecolorback(changedcolorback);
    };

    const errorShow = (where, what) => {
        if (where === 1) {
            setgnameerror(what);
        }
        else if (where === 2) {
            setgtypeerror(what);
        }
        else if (where === 3) {
            setgfileerror(what);
        }
        else {
            setgmembererror(what);
        }
    }

    const persisterror = (e) => {
        e.preventDefault();
        if (createagroupname === "") {
            errorShow(1,"Please give the group a name");
            
        }
        else {
            errorShow(1,"");
        }
    }

    const handleInputChange = (e) => {
        // e.preventDefault();
        const value = e.target.value;
        setcreateagroupname(value);
        if (createagroupname === "") {
            errorShow(1,"Please give the group a name");
            
        }
        else {
            errorShow(1,"");
        }
        
        }

    const handleFileChange = useCallback((e, picture) => {
        if (e.target.files && e.target.files[0]) {
            setuploadfile(e.target.files[0]);
            errorShow(3, "");
        }
        else {
            errorShow(3, "Please upload an image");
        }
    }, []);
    
    const handleaddingmembers = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const token = sessionStorage.getItem("token");
        if (!newmember.trim() || newmember.trim() === "") {
            e.preventDefault();
            errorShow(4, "Invalid Member");
        }
        else {
            errorShow(4, "");
        const searchQuery = newmember.trim();
        const response = await fetch(
            `https://www.stringsattached.online/api/api/default/users?email=${encodeURIComponent(searchQuery)}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        const data = await response.json();
        if (data[1] === 0) {
            e.preventDefault();
            errorShow(4, "User does not exist")
        }
        else {
            errorShow(4, "");
            const usertoaddid = data[0][0].id;
            let existsornah = false;
            for (let i = 0; i < groupmemberstoadd.length; i++) {
                if (usertoaddid === groupmemberstoadd[i]) {
                    existsornah = true;
                }
            }
            if (!existsornah){
                e.preventDefault();
                let lister = groupmemberstoadd;
                lister.push(usertoaddid);
                setgroupmemberstoadd(lister);
                let oldL = memberaddedlist;
                oldL.push(searchQuery);
                setmemberaddedlist(oldL);
                setuseradded("User successfully added")
            }
            else {
                e.preventDefault();
                errorShow(4, "User already exists");
            }
        }
        }
    }

    const handleSubmit = useCallback(async (e) => {
            const formData = new FormData();
            e.preventDefault();
            if (!uploadfile) {
                e.preventDefault();
                errorShow(3, "Please upload a valid file");
                return;
            }
            if (createagroupname === "" || createagroupname.trim() === "") {
                e.preventDefault();
                errorShow(1, "Please enter a group name");
                return;
            }
            if (selectedgrouptype === null || selectedgrouptype === "") {
                e.preventDefault();
                errorShow(2, "Please select the type of group chat");
                return;
            }
            if (groupmemberstoadd === null || groupmemberstoadd.length === 0) {
                e.preventDefault();
                errorShow(3, "Add at least one other member");
                return;
            }
            

            formData.append("uploaderID", sessionStorage.getItem("user"));
            formData.append("attributes", JSON.stringify({}));
            formData.append("file", uploadfile);
            const token = sessionStorage.getItem("token");
            const uploadResponse = await fetch(
                `https://www.stringsattached.online/api/api/default/file-uploads`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: formData,
                }
              );
      
              const uploadData = await uploadResponse.json();
              console.log("upload data",uploadData?.path)
              const path = uploadData.path;
              const response2 = await fetch(
                `https://www.stringsattached.online/api/api/default/groups`,
                {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name: createagroupname,
                    attributes: {
                        image: path,
                        type: selectedgrouptype,
                    }
                  })
                }
            );
            if (!response2.ok) {
              throw new Error("There's an error creating groups.");
            }
            const JD = await response2.json();
            const groupid = JD.id;
            console.log(groupid);

            const response3 = await fetch(
                `https://www.stringsattached.online/api/api/default/group-members`,
                {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    userID: sessionStorage.getItem("user"),
                    groupID: groupid,
                    attributes: {}
                  })
                }
            );

            for (let i = 0; i < groupmemberstoadd.length; i++) {
                const response4 = await fetch(
                    `https://www.stringsattached.online/api/api/default/group-members`,
                    {
                      method: "POST",
                      headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        userID: groupmemberstoadd[i],
                        groupID: groupid,
                        attributes: {}
                      })
                    }
                );
            }

    }, [createagroupname, groupmemberstoadd, selectedgrouptype, uploadfile]);

    const handleblockingposts = async (id) => {
        setclickblock(id);
        const userID = sessionStorage.getItem("user");
        const token = sessionStorage.getItem("token");

        const userResponse = await fetch(
            `https://www.stringsattached.online/api/api/default/users/${userID}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
    
          const userData = await userResponse.json();
          const existingAttributes = userData.attributes || {};

          console.log("existing attributes", existingAttributes);

          const blockedp = existingAttributes.blockedPosts;
            blockedp.push(id);
    
          // Update with new gender preferences
          const updatedAttributes = {
            ...existingAttributes,
            blockedPosts: blockedp
          };
          setblockedposts(blockedp);
          let newgrouposts = [];
          for (let i = 0; i < grouposts.length; i ++) {
                if (grouposts[i].id !== id) {
                    newgrouposts.push(grouposts[i]);
                }
          }
          setgrouposts(newgrouposts);

          let postsalreadythere = [];
          console.log("posts by users",postsmadebyusers)
          for (let i = 0; i < postsmadebyusers.length; i++) {
                if (postsmadebyusers[i].id !== id) {
                    postsalreadythere.push(postsmadebyusers[i]);
                }
          }
          setpostsmadebyusers(postsalreadythere);


          const response = await fetch(
            `https://www.stringsattached.online/api/api/default/users/${userID}`,
            {
              method: "PATCH",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ attributes: updatedAttributes }),
            }
          );
    };

    const handleunblockingposts = async(id,e) => {
        e.preventDefault();
        const userID = sessionStorage.getItem("user");
        const token = sessionStorage.getItem("token");

        const userResponse = await fetch(
            `https://www.stringsattached.online/api/api/default/users/${userID}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("blocked posts", blockedposts)
          const userData = await userResponse.json();
          const existingAttributes = userData.attributes || {};

          console.log("existing attributes", existingAttributes);

          const blockedp = existingAttributes.blockedPosts;
          let newlist = [];
          for (let i = 0; i < blockedp.length; i++) {
            if (blockedp[i] !== id) {
                newlist.push(blockedp[i]);
            }
          }
            
    
          // Update with new gender preferences
          const updatedAttributes = {
            ...existingAttributes,
            blockedPosts: newlist
          };

          let currgrp = grouposts;
          console.log(id)
          const postresponse = await fetch (
            `https://www.stringsattached.online/api/api/default/posts/${id}`,
            {
                method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          const postdetails = await postresponse.json();
          currgrp.push(postdetails);
          setgrouposts(currgrp);


          let newblocked = [];
          for (let i = 0; i < blockedposts.length; i ++) {
                if (blockedposts[i] !== id) {
                    newblocked.push(blockedposts[i]);
                }
          }
          setblockedposts(newblocked);
    
          const response = await fetch(
            `https://www.stringsattached.online/api/api/default/users/${userID}`,
            {
              method: "PATCH",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ attributes: updatedAttributes }),
            }
          );
    };

    const handleunblockingpostsalt = async(id,e) => {
        e.preventDefault();
        const userID = sessionStorage.getItem("user");
        const token = sessionStorage.getItem("token");

        const userResponse = await fetch(
            `https://www.stringsattached.online/api/api/default/users/${userID}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("blocked posts", blockedposts)
          const userData = await userResponse.json();
          const existingAttributes = userData.attributes || {};

          console.log("existing attributes", existingAttributes);

          const blockedp = existingAttributes.blockedPosts;
          let newlist = [];
          for (let i = 0; i < blockedp.length; i++) {
            if (blockedp[i] !== id) {
                newlist.push(blockedp[i]);
            }
          }
            
    
          // Update with new gender preferences
          const updatedAttributes = {
            ...existingAttributes,
            blockedPosts: newlist
          };

          let currgrp = grouposts;
          console.log(id)
          const postresponse = await fetch (
            `https://www.stringsattached.online/api/api/default/posts/${id}`,
            {
                method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          const postdetails = await postresponse.json();

          console.log("unblocking help", postsmadebyusers)
          let before = postsmadebyusers;
          before.push(postdetails);
          console.log("before", before)
          setpostsmadebyusers(before);

          e.preventDefault();

          let newblocked = [];
          for (let i = 0; i < blockedposts.length; i ++) {
                if (blockedposts[i] !== id) {
                    newblocked.push(blockedposts[i]);
                }
          }
          setblockedposts(newblocked);
    
          const response = await fetch(
            `https://www.stringsattached.online/api/api/default/users/${userID}`,
            {
              method: "PATCH",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ attributes: updatedAttributes }),
            }
          );
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setnewmember(value);
        errorShow(4,validateEmail(value));
        setuseradded("")
    };

    const validateEmail = (email) => {
        if (!email) return "Please enter your email.";
  
        // More comprehensive email regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          return "Please enter a valid email address (e.g., user@example.com)";
        }
        return "";
      };

    return (
        <div className="conversations-container">
            <div>
            <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    style={{marginLeft: "-20%"}}
                />
                
                <input
                    type="text"
                    placeholder="Search by instrument..."
                    value={instrumentQuery}
                    onChange={(e) => setInstrumentQuery(e.target.value)}
                    className="search-input"
                    style={{marginRight: "-20%"}}
                    
                />
            </div>
            <div>
                {chats.map((chat, index) => (
                    <button
                    key={index}
                    id={chat}
                    className="bubble-buttons"
                    style={{backgroundColor: bubblebuttonColorback[index], color: bubblebuttonColor[index]}}
                    onClick={() => handleChatClick(chat, index)}>
                        {chat}</button>
                ))}
            </div>
            {/* Users List */}
            <div className="users-list">
                <h2>Friends</h2>
                {/* Search inputs */}
                

                {loading ? (
                    <p>Loading users...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : grouposts.length > 0 ? (
                    <div className="post-contain-all">
                        {grouposts.map((post,index) => (
                            <div className="posts-container-big"
                            onMouseEnter={() => setIsHovering(post)}
                            onMouseLeave={() => setIsHovering("")}
                            >
                                {post.content}
                            
                            <br></br>
                            <p style={{fontSize: 10}}>By: {post.author.attributes.firstName} {post.author.attributes.lastName}</p>
                            {posthovered === post.id && <button onClick={() => handleblockingposts(post.id,index)}>Block Post</button>}
                            </div>
                        ))}
                        {blockedposts.map((post,index) => (
                            <div className="posts-container-big" onMouseEnter={() => setunblockhover(post)} onMouseLeave={() => setunblockhover("")}>
                                BLOCKED!
                                <br></br>
                                {unblockhover === post && <button onClick={(e) => handleunblockingposts(post,e)}>Unblock Post</button>}
                            </div>
                        ))}
                    </div>
                ) : groupshow ? (

                    <div className="users-list-container">
                        {grouparr.map((gr,index) => (
                            <div>
                            <div
                            key={gr.id}
                            className="group-item"
                            onClick={() => handleGroupClick(gr)}
                        >
                            {gr.attributes.image && 
                                <img
                            src={"https://www.stringsattached.online/" + gr.attributes.image}
                            width="100px"
                            alt="Profile"
                        />
                            }
                            
                            
                            <div className="user-details">
                                <p className="user-name">
                                    {gr.name
                                        ? `${gr.name || ''}`.trim():
                                        gr.id}
                                </p>
                            </div>
                                
                        </div>
                        <div>
                                {groupselected === gr && (
                    <div className="post-contain-all">
                        {postsmadebyusers.map((post,index) => (
                            <div className="posts-container-big"
                            onMouseEnter={() => setIsHovering(post)}
                            onMouseLeave={() => setIsHovering("")}
                            >
                            {post.content}
                            <br></br>
                            <p style={{fontSize: 10}}>By: {post.author.attributes.firstName} {post.author.attributes.lastName}</p>
                            {posthovered === post.id && <button onClick={() => handleblockingposts(post.id,index)}>Block Post</button>}
                            </div>
                        ))}
                        {blockedposts.map((post,index) => (
                            <div className="posts-container-big" onMouseEnter={() => setunblockhover(post)} onMouseLeave={() => setunblockhover("")}>
                                BLOCKED!
                                <br></br>
                                {unblockhover === post && <button onClick={(e) => handleunblockingpostsalt(post,e)}>Unblock Post</button>}
                            </div>
                        ))}
                    </div>
                )}
                            </div>
                        </div>
                        
                        ))}
                        <div style={{alignContent: "center"}}>
                        
                        {creategroup ? (
                            <div>
                            <div style={{display:"flex", justifyContent:"end"}}>
                                <button
                                className="create-a-group"
                                onClick={() => handleCreateGroup()}
                                style={{padding: "1%", minWidth: "4%", color:"#ffffff", backgroundColor:"#ff0000", fontWeight:"bold"}}>
                                    X</button>
                            </div>
                            <div style={{alignContent: "center", justifyContent: "center", alignItems: "center", marginBottom: "3%"}}>
                                <div className="create-a-group-box">
                                <h1>
                                Make your own Group
                                </h1>
                                <form onSubmit={(e) => handleSubmit(e)}>
                                <br></br>
                                <p className="error-message">{gnameerror}</p>
                                <br></br>
                                    <label style={{fontSize: "2rem", fontWeight: "bold"}}>Group Name  </label>
                                    <input
                                    id="groupName"
                                    type="text"
                                    value={createagroupname}
                                    onChange={handleInputChange}
                                    onBlur={persisterror}
                                    placeholder="Enter group name"
                                    className="search-input"
                                    style={{width: "23.5%", padding: "1%", marginTop: "3%"}}
                                />
                                <div style={{marginTop: "3%"}}>
                                <p className="error-message">{gtypeerror}</p>
                                <label style={{fontSize: "2rem", fontWeight: "bold"}}>Group Type  </label>
                                {grouptype.map((group, index) => (
                                    <button
                                    key={index}
                                    id={group}
                                    className="bubble-buttons"
                                    style={{backgroundColor: grouptypecolorback[index], color: grouptypecolor[index], padding: "1%"}}
                                    onClick={(e) => handleGroupTypeSelect(e,group, index)}>
                                        {group}</button>
                                ))}
                                </div>
                                <div>
                                <p className="error-message">{gfileerror}</p>
                                <label style={{fontSize: "2rem", fontWeight: "bold"}}>Group Picture  </label>
                                <input
                                    id="groupPicture"
                                    type="file"
                                    className="file-upload-group"
                                    onChange={(e) => handleFileChange(e, 'groupPicture')}
                                    accept="image/*" // Optional: Accept only images
                                />
                                </div>
                                <div style={{marginBottom: "2%"}}>
                                <p className="error-message">{gmembererror}</p>
                                <p className="error-message" style={{color: "#32CD32"}}>{useradded}</p>
                                <label style={{fontSize: "2rem", fontWeight: "bold"}}>Add Members  </label>
                                <input
                                    id="memberadd"
                                    type="text"
                                    value={newmember}
                                    onChange={handleEmailChange} // Real-time validation
                                    onBlur={() => errorShow(4,validateEmail(newmember))} // Ensure errors persist on blur
                                    // onChange={(e) => setnewmember(e.target.value)}
                                    // onBlur={handlememberverification}
                                    placeholder="Enter member Email"
                                    className="search-input"
                                    style={{width: "18%", padding: "0.8%", marginTop: "3%"}}
                                />
                                <button
                                    id="Add"
                                    className="bubble-buttons"
                                    style={{ padding: "0.85%"}}
                                    onClick={(e) => handleaddingmembers(e)}
                                    >
                                        Add</button>
                                <div>
                                            {memberaddedlist.map((member, index) => (
                                                <p>{member}</p>
                                            ))}
                                </div>
                                </div>
                                <div>
                                <input
                                    id="Submit"
                                    type="submit"
                                    className="submit-button"
                                />
                                </div>
                                </form>
                                    </div>
                                
                            </div>
                            </div>
                        ) : (
                            <button
                    className="create-a-group"
                    onClick={() => handleCreateGroup()}
                    style={{padding: "1%"}}>
                        Create a Group</button>
                        )}
                    </div>
                    </div>
                                        
                ) : filteredUsers.length > 0 ? (
                    <div className="users-list-container">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="user-item"
                                onClick={() => handleUserClick(user)}
                            >
                                <img
                                    src={user.attributes?.profileImage || noIcon}
                                    alt="Profile"
                                    className="user-avatar"
                                />
                                <div className="user-details">
                                    <p className="user-name">
                                        {user.attributes?.firstName || user.attributes?.lastName
                                            ? `${user.attributes?.firstName || ""} ${user.attributes?.lastName || ""}`.trim()
                                            : user.email}
                                    </p>
                                    <p className="user-instruments">
                                        🎵 {Array.isArray(user.attributes?.instruments)
                                        ? user.attributes?.instruments.join(", ")
                                        : user.attributes?.instruments || "No instruments listed"}
                                    </p>
                                </div>
                                <div className="email-tooltip">{user.email}</div>
                            </div>
                        ))}
                    </div>
                ) : groupselected === "All" || groupselected === null ? ( 
                    <p>No friends Found</p>
                ) : (
                    <div>
                    
                    {blockedposts.map((post,index) => (
                            <div className="posts-container-big" onMouseEnter={() => setunblockhover(post)} onMouseLeave={() => setunblockhover("")}>
                                BLOCKED!
                                <br></br>
                                {unblockhover === post && <button onClick={(e) => handleunblockingposts(post,e)}>Unblock Post</button>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            

            {/* Messaging Modal Overlay */}
            {selectedUser && (
                <div className="messaging-modal-overlay" onClick={closeModal}>
                    <div className="messaging-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={closeModal}>&times;</button>
                        <Messaging selectedUser={selectedUser} roomID={roomID} />
                    </div>
                </div>
            )}

        </div>
    );
};

export default Conversations;
