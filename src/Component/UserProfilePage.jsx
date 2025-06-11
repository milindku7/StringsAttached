import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import noIcon from "../../src/assets/noicon.jpg";
import { socket } from "../App";
import DecorBackground from "./DecorBackground"; 


const UserProfilePage = () => {
    const { userID } = useParams();
    const [user, setUser] = useState(null);
    const [profilePicUrl, setProfilePicUrl] = useState(noIcon);
    const [posts, setPosts] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState({});
    const [commentDrafts, setCommentDrafts] = useState({});
    const [isBlocked, setIsBlocked] = useState(false);
    const [isFollowing, setIsFollowing] = useState('follow');
    const [conexist, setconexist] = useState(false);
    const currentUserId = sessionStorage.getItem("user");
    const [, setConnectionId] = useState(null);
    const [, setConnections] = useState([]);
    const [postReactions, setPostReactions] = useState({});
    const [isReacting, setIsReacting] = useState(false);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [reviewText, setReviewText] = useState("");
    const [hasReviewed, setHasReviewed] = useState(false);
    const [ratingValue, setRatingValue] = useState("");
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [userReviews, setUserReviews] = useState([]);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [blockMessage, setBlockMessage] = useState("");
    const [showBlockModal, setShowBlockModal] = useState(false);



    useEffect(() => {
        socket.on('connect', () => {
            console.log("Connected to WebSocket");
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log("Disconnected from WebSocket");
            setIsConnected(false);
        });

        socket.on('reaction-update', (data) => {
            const { postId, counts, userReaction, userId } = data;
            if (userId !== currentUserId) {
                setPostReactions(prev => ({
                    ...prev,
                    [postId]: { counts, userReaction }
                }));
            }
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('reaction-update');
        };
    }, [currentUserId]);

    useEffect(() => {
        fetch(
            process.env.REACT_APP_API_PATH +
            "/connections?fromUserID=" +
            currentUserId +
            "&toUserID=" +
            userID,
            {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
            }
        )
      .then((res) => res.json())
        .then(
          (result) => {
            setConnections(result[0]);
            console.log(result[0]);
            console.log("connection length", result[1])
            if (result[1] === 0) {
              setIsFollowing("follow");
              setconexist(false);
            }
            else {
              setconexist(true);
              const firstcon = result[0][0];
              console.log("first connection", firstcon);
              var att = firstcon.attributes;
              console.log("required attributes",att);
              if (att.blocked === true) {
                setIsFollowing("blocked");
              }
              else if (att.follow === true) {
                setIsFollowing("unfollow");
              }
              else if (att.requested === true) {
                setIsFollowing("requested");
                setPosts([]);
              }
              else if (att.blocked === false && att.follow === false) {
                setIsFollowing("follow");
                setPosts([]);
              }
            }
          },
        );
      }, [currentUserId,userID]);

      const fetchUserReviews = async () => {
        const token = sessionStorage.getItem("token");
      
        try {
          const res = await fetch(
            `https://stringsattached.online/hci/api/default/users/${userID}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
      
          const userData = await res.json();
          const ratingsArray = userData.attributes?.ratings || [];
      
          const enriched = await Promise.all(
            ratingsArray.map(async (r) => {
              if (!r.reactorID) return { ...r, name: "Anonymous" };
              const reactorRes = await fetch(
                `https://stringsattached.online/hci/api/default/users/${r.reactorID}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const reactorData = await reactorRes.json();
              return {
                ...r,
                name: `${reactorData.attributes?.firstName || "Unknown"} ${reactorData.attributes?.lastName || ""}`,
              };
            })
          );
      
          setUserReviews(enriched);
        } catch (err) {
          console.error("Error fetching user reviews:", err);
        }
      };
      

      const handleSubmitReviewAndRating = async () => {
        const token = sessionStorage.getItem("token");
        const currentUserID = sessionStorage.getItem("user");
      
        if (!reviewText.trim() || !ratingValue) {
          alert("Both rating and review are required.");
          return;
        }
      
        const rating = parseFloat(ratingValue);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          alert("Rating must be a number between 1 and 5.");
          return;
        }
      
        try {
          const res = await fetch(
            `https://stringsattached.online/hci/api/default/users/${userID}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
      
          const userData = await res.json();
          const attributes = userData.attributes || {};
      
          // Append to pendingReviews, including both reviewText and rating
          const updatedPending = [
            ...(attributes.pendingReviews || []).filter(r => r.reviewerID !== currentUserID),
            { reviewerID: currentUserID, reviewText: reviewText.trim(), value: rating }
          ];
      
          const updatedAttributes = {
            ...attributes,
            pendingReviews: updatedPending
          };
      
          const updateResponse = await fetch(
            `https://stringsattached.online/hci/api/default/users/${userID}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ attributes: updatedAttributes }),
            }
          );
      
          if (!updateResponse.ok) throw new Error("Failed to submit review and rating");
      
          setShowSuccessModal(true);
          setHasReviewed(true);
          setReviewText("");
          setRatingValue("");
          fetchUserRating(userID);
        } catch (err) {
          console.error("Error submitting review and rating:", err);
          alert("Something went wrong.");
        }
      };
      
      
  const handleClick = async () => {
  console.log("this starts first")
  var connID = 0;

  const response = await fetch(
    process.env.REACT_APP_API_PATH +
    "/connections?fromUserID=" +
    currentUserId +
    "&toUserID=" +
    userID,
    {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    }
  )

  console.log(response)

  const result = await response.json();

  setConnections(result[0]);
  console.log("this starts next and shows result[0]",result[0]);
  if (result[0].length === 0) {
    setconexist(false);
    connID = 0;
    setConnectionId(0);
  }
  else {
    console.log("third start connection is there and id is ", result[0][0].id)
    setconexist(true);
    const firstcon = result[0][0];
    connID = firstcon.id;
    setConnectionId(firstcon.id);
  }

  console.log("fourth isfollowing status",isFollowing);
  var noconatt = {};
  if (isFollowing === 'follow') {
    setIsFollowing('requested');
    noconatt = { blocked: false, requested: true, follow: false };
  }
  else if (isFollowing === 'requested') {
    setIsFollowing('follow');
    noconatt = { blocked: false, requested: false, follow: false };
  }
  else if (isFollowing === 'unfollow') {
    setIsFollowing('follow');
  
    const clearAttrs = { follow: false, requested: false, blocked: false };
  
    // PATCH current ➝ other
    if (connID) {
      const res1 = await fetch(`${process.env.REACT_APP_API_PATH}/connections/${connID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        body: JSON.stringify({
          attributes: {
            attributes: {
                blocked: false,
                follow: false,
                requested: true,
              },   
          },
        }),
      });
  
      if (!res1.ok) {
        console.error("Failed to unfriend (current ➝ other)");
      }
    }
  
    // GET reverse connection (other ➝ current)
    const reverseRes = await fetch(
      `${process.env.REACT_APP_API_PATH}/connections?fromUserID=${userID}&toUserID=${currentUserId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      }
    );
  
    const reverseData = await reverseRes.json();
    const reverseConn = reverseData[0]?.[0];
  
    if (reverseConn) {
        console.log("PATCHING current to other with preserved attributes + follow: false");
      
        const currentAttributes = reverseConn.attributes || {};
      
        const updatedAttributes = {
          ...currentAttributes,
          follow: false
        };
      
        const res2 = await fetch(`${process.env.REACT_APP_API_PATH}/connections/${reverseConn.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
          body: JSON.stringify({ attributes: updatedAttributes }),
        });
      
        if (!res2.ok) {
          console.error("Failed to unfriend (other ➝ current)");
        }
      }
      
    else {
      // CREATE reverse if not exists
      const createRes = await fetch(`${process.env.REACT_APP_API_PATH}/connections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        body: JSON.stringify({
          fromUserID: parseInt(userID),
          toUserID: parseInt(currentUserId),
          attributes: clearAttrs,
        }),
      });
  
      if (!createRes.ok) {
        console.error("Failed to create reverse connection during unfollow");
      }
    }
  }
  
  
  
  else {
    setIsFollowing('unfollow');
    noconatt = { blocked: false, requested: false, follow: false };
  }
  if (conexist === false) {
    const response2 = await fetch(
      `https://stringsattached.online/hci/api/default/connections`,
      {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + sessionStorage.getItem('token'),
          },
          body: JSON.stringify({
              fromUserID: parseInt(currentUserId),
              toUserID: parseInt(userID),
              attributes: noconatt,
          }),
      }
  )
  const result2 = await response2.json();
  console.log(result2);
  }
  else if (isFollowing === 'follow'){
    console.log("fifth conn exist and connectino ID", connID);
    const response3 = await fetch(process.env.REACT_APP_API_PATH + "/connections/" + connID, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      body: JSON.stringify({
        attributes: noconatt,
      }
      ),
    })

    console.log("no conc", response3);
  }
  else {
    noconatt = { blocked: false, requested: false, follow: false };

    console.log("fifth conn exist and connectino ID", connID);
    const response3 = await fetch(process.env.REACT_APP_API_PATH + "/connections/" + connID, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      body: JSON.stringify({
        attributes: noconatt,
      }
      ),
    })
    console.log("no conc", response3);
  }
}

    let buttonText;
let buttonStyle;

  if (isFollowing === 'follow') {
    buttonText = 'Add Friend';
    buttonStyle = { backgroundColor: '#662d91', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', 

     };
  } else if (isFollowing === 'requested') {
    buttonText = 'Requested';
    buttonStyle = { backgroundColor: 'lightgray', color: 'black', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' };
  }
  else if (isFollowing === 'blocked') {
    buttonText = 'Blocked';
    buttonStyle = { backgroundColor: 'lightgray', color: 'black', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' };
  } else {
    buttonText = 'Remove Friend';
    buttonStyle = { backgroundColor: 'darkred', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' };
  }


    const checkIfBlocked = useCallback(async () => {
        const token = sessionStorage.getItem("token");
        const currentUserId = sessionStorage.getItem("user");
        if (!token || !currentUserId || !userID) return;
        try {
            const response = await fetch(
                `https://stringsattached.online/hci/api/default/connections?fromUserID=${currentUserId}&toUserID=${userID}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to check block status.");
            }

            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                const connection = data[0][0];
                if (connection.attributes?.blocked) {
                    if (!isBlocked) {
                        setIsBlocked(true);
                        setConnectionId(connection.id);
                    }
                } else {
                    if (isBlocked) {
                        setIsBlocked(false);
                        setIsFollowing("follow");
                        setConnectionId(null);
                    }
                }
            } else {
                if (isBlocked) {
                    setIsBlocked(false);
                    setIsFollowing("follow");

                    setConnectionId(null);
                }
            }
        } catch (error) {
            console.error("Error checking block status:", error);
        }
    },[isBlocked,userID]);

    const fetchUserProfile = useCallback(async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            window.location.href = "/";
            return;
        }

        try {
            const response = await fetch(
                `https://stringsattached.online/hci/api/default/users/${userID}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch user profile.");
            }

            const data = await response.json();
            setUser(data);
            setProfilePicUrl(data.attributes?.profileImage || noIcon);
            const existingReviews = data.attributes?.pendingReviews || [];
        const hasUserReviewed = existingReviews.some(
            (r) => r.reviewerID === currentUserId
        );
        setHasReviewed(hasUserReviewed);
        } catch (err) {
            console.error("Error fetching user profile:", err);
            setError("Error fetching user profile.");
        } finally {
            setLoading(false);
        }
    },[userID, currentUserId]);

    const fetchUserRating = useCallback(async (userID) => {  // Accept userID as parameter
        const token = sessionStorage.getItem("token");
        try {
            const response = await fetch(
                `https://stringsattached.online/hci/api/default/users/${userID}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) throw new Error("Failed to fetch ratings");

            const userData = await response.json();
            const firstRatings = userData.attributes?.ratings || [];
            const savedRatings = firstRatings.filter(rating => rating.hasOwnProperty("reactorID"));

            if (Array.isArray(savedRatings) && savedRatings.length > 0) {
            } else {
            }
        } catch (err) {
            console.error("Error fetching ratings:", err);
        }
    }, []);

    useEffect(() => {
        fetchUserRating(userID);  // Pass userID of the profile
    }, [fetchUserRating, userID]);

    
    const fetchPostReactions = useCallback(async (postId) => {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(
                `https://stringsattached.online/hci/api/default/post-reactions?postID=${postId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                const reactions = data[0] || [];

                const counts = {};
                reactions.forEach(reaction => {
                    const type = reaction.name;
                    counts[type] = (counts[type] || 0) + 1;
                });

                const userReaction = reactions.find(
                    r => r.reactorID.toString() === currentUserId
                )?.name || null;

                setPostReactions(prev => ({
                    ...prev,
                    [postId]: {
                        counts,
                        userReaction
                    }
                }));

                return { counts, userReaction };
            }
        } catch (err) {
            console.error("Error fetching post reactions:", err);
        }
        return null;
    },[currentUserId]);

    const fetchUserPosts = useCallback(async () => {
        const token = sessionStorage.getItem("token");
        if (!token || !userID) return;

        try {
            const response = await fetch(
                `https://stringsattached.online/hci/api/default/posts?authorID=${userID}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();
            if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
                const userPosts = data[0].filter((post) => !post.parentID);
                setPosts(userPosts);
                userPosts.forEach((post) => {
                    fetchCommentsForPost(post.id);
                    fetchPostReactions(post.id);
                });
            } else {
                setPosts([]);
            }
        } catch (err) {
            console.error("Error fetching user posts:", err);
        }
    },[fetchPostReactions,userID]);

    useEffect(() => {
        fetchUserProfile();
    }, [userID, fetchUserProfile]);

    useEffect(() => {
        checkIfBlocked();
    }, [checkIfBlocked]);
    
    useEffect(() => {
        if (!isBlocked) {
            fetchUserPosts();
        } else {
            setPosts([]);
        }
    }, [isBlocked, fetchUserPosts]);
    
    const handleBlockUser = async () => {
        const token = sessionStorage.getItem("token");
        const currentUserId = sessionStorage.getItem("user");
    
        if (!token || !currentUserId || !userID) {
            console.error("Missing authentication token or user ID.");
            return;
        }
    
        try {
            const res = await fetch(
                `https://stringsattached.online/hci/api/default/connections?fromUserID=${currentUserId}&toUserID=${userID}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
    
            const data = await res.json();
            const connections = data[0] || [];
            const existingConnection = connections.find(
                conn => conn.fromUserID === Number(currentUserId) && conn.toUserID === Number(userID)
            );
    
            // 🔁 Full attribute object
            const newAttributes = {
                blocked: !isBlocked,
                follow: false,
                requested: false
            };
    
            if (existingConnection) {
                // PATCH connection
                console.log("PATCHing connection", existingConnection.id, newAttributes);
                const patchResponse = await fetch(
                    `https://stringsattached.online/hci/api/default/connections/${existingConnection.id}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ attributes: newAttributes }),
                    }
                );
    
                const patchResult = await patchResponse.json();
                console.log("PATCH result:", patchResult);
    
                if (!patchResponse.ok) throw new Error("Failed to update block state.");
    
                setIsBlocked(newAttributes.blocked);
                setConnectionId(newAttributes.blocked ? existingConnection.id : null);
                setPosts(newAttributes.blocked ? [] : posts);
            } else {
                // POST connection
                console.log("POSTing new connection with", newAttributes);
                const createResponse = await fetch(
                    `https://stringsattached.online/hci/api/default/connections`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            fromUserID: parseInt(currentUserId),
                            toUserID: parseInt(userID),
                            attributes: newAttributes,
                        }),
                    }
                );
    
                const newConnection = await createResponse.json();
                console.log("Created new connection:", newConnection);
    
                if (!createResponse.ok) throw new Error("Failed to create block connection.");
    
                setIsBlocked(true);
                setConnectionId(newConnection.id);
                setPosts([]);
            }
    
            await new Promise(resolve => setTimeout(resolve, 300));
            await checkIfBlocked();
            fetchUserPosts();
    
            setBlockMessage(`User has been ${newAttributes.blocked ? 'blocked' : 'unblocked'}.`);
            setShowBlockModal(true);
            } catch (err) {
            console.error("Error blocking/unblocking user:", err);
        }
    };

    const fetchCommentsForPost = async (postId) => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            window.location.href = "/";
            return;
        }

        try {
            const response = await fetch(
                `https://stringsattached.online/hci/api/default/posts?parentPostID=${postId}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch comments.");
            }

            const data = await response.json();
            const filteredComments = data[0].filter(
                (item) =>
                    item.attributes?.type === "comment" &&
                    item.attributes?.parentPostID === postId
            );

            setComments((prevComments) => ({
                ...prevComments,
                [postId]: filteredComments,
            }));
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    const handleCommentChange = (postId, value) => {
        setCommentDrafts((prevDrafts) => ({
            ...prevDrafts,
            [postId]: value,
        }));
    };

    const handleCommentSubmit = async (postId) => {
        const commentText = commentDrafts[postId]?.trim();
        if (!commentText) return;

        const token = sessionStorage.getItem("token");
        if (!token) {
            window.location.href = "/";
            return;
        }

        try {
            const commentData = {
                authorID: parseInt(currentUserId),
                content: commentText,
                parentID: postId,
                attributes: {
                    parentPostID: postId,
                    type: "comment",
                },
            };

            const response = await fetch(
                "https://stringsattached.online/hci/api/default/posts",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(commentData),
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to submit comment. Status: ${response.status}`);
            }
            const newComment = await response.json();
            setComments((prevComments) => ({
                ...prevComments,
                [postId]: [...(prevComments[postId] || []), newComment],
            }));
            setCommentDrafts((prevDrafts) => ({
                ...prevDrafts,
                [postId]: "",
            }));
        } catch (err) {
            console.error("Error submitting comment:", err);
        }
    };

    const handleReaction = async (postId, reactionType) => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            window.location.href = "/";
            return;
        }

        // Save the current state before making changes
        const originalState = postReactions[postId];
        setIsReacting(true);

        try {
            const existingResponse = await fetch(
                `https://stringsattached.online/hci/api/default/post-reactions?postID=${postId}&reactorID=${currentUserId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const existingData = await existingResponse.json();
            const existingReaction = existingData[0]?.[0];

            let newCounts = {...originalState?.counts || {}};
            let newUserReaction = originalState?.userReaction || null;

            if (existingReaction?.name === reactionType) {
                await fetch(
                    `https://stringsattached.online/hci/api/default/post-reactions/${existingReaction.id}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (newCounts[reactionType]) {
                    newCounts[reactionType]--;
                    if (newCounts[reactionType] <= 0) {
                        delete newCounts[reactionType];
                    }
                }
                newUserReaction = null;
            }
            else if (existingReaction) {
                await fetch(
                    `https://stringsattached.online/hci/api/default/post-reactions/${existingReaction.id}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            name: reactionType,
                            value: 1,
                            attributes: {}
                        }),
                    }
                );

                if (existingReaction.name) {
                    newCounts[existingReaction.name] = (newCounts[existingReaction.name] || 1) - 1;
                    if (newCounts[existingReaction.name] <= 0) {
                        delete newCounts[existingReaction.name];
                    }
                }
                newCounts[reactionType] = (newCounts[reactionType] || 0) + 1;
                newUserReaction = reactionType;
            }
            else {
                await fetch(
                    `https://stringsattached.online/hci/api/default/post-reactions`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            postID: postId,
                            reactorID: currentUserId,
                            name: reactionType,
                            value: 1,
                            attributes: {}
                        }),
                    }
                );

                newCounts[reactionType] = (newCounts[reactionType] || 0) + 1;
                newUserReaction = reactionType;
            }

            setPostReactions(prev => ({
                ...prev,
                [postId]: {
                    counts: newCounts,
                    userReaction: newUserReaction
                }
            }));

            if (isConnected) {
                socket.emit('reaction-change', {
                    postId,
                    counts: newCounts,
                    userReaction: newUserReaction,
                    userId: currentUserId
                });
            }

        } catch (error) {
            console.error("Error handling reaction:", error);
            // Rollback to original state on error
            setPostReactions(prev => ({
                ...prev,
                [postId]: originalState
            }));
            alert("Failed to update reaction");
        } finally {
            setIsReacting(false);
        }
    };

    const fetchUserInstruments = useCallback(async () => {
        const token = sessionStorage.getItem("token");

        if (!token || !userID) return;

        try {
            const response = await fetch(
                `https://stringsattached.online/hci/api/default/users/${userID}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch user instruments.");
            }

            const userData = await response.json();
            setInstruments(userData.attributes?.instruments || []);
        } catch (error) {
            console.error("Error fetching user instruments:", error);
        }
    },[userID]);


    useEffect(() => {
        fetchUserInstruments();
    }, [userID,fetchUserInstruments]);

    if (loading) return <p>Loading user profile...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!user) return <p>No user found.</p>;

    return (
        <div style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto", color: "black", paddingBottom: "50px" }}>
                <DecorBackground />

            <h2 style={{ color: "black", textAlign: "center" }}>User Profile</h2>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <img
                    src={`https://stringsattached.online/${profilePicUrl}`}
                    alt="Profile"
                    style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = noIcon;
                    }}
                />
            </div>

            <div className="text-left" style={{ textAlign: "center" }}>
            <div style={{ 
  backgroundColor: "#f5f5f5", 
  borderRadius: "8px", 
  padding: "10px", 
  margin: "10px auto", 
  maxWidth: "400px",
  textAlign: "center"
}}>
  <div 
    onClick={() => setShowUserInfo(!showUserInfo)}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      padding: "8px",
      backgroundColor: "rgb(255,127,80)",
      border: "orange",
    }}
  >
    <span style={{ fontWeight: "bold", color: "black" }}>Information</span>
    <span>{showUserInfo ? "▼" : "►"}</span>
  </div>
  
  {showUserInfo && (
    <div style={{ 
      padding: "10px", 
      backgroundColor: "#f8f2e6", 
      borderRadius: "5px", 
      marginTop: "5px",
      textAlign: "left"
    }}>
      <p style={{ color: "black", margin: "8px 0" }}>
        <strong>Full Name:</strong> {user?.attributes?.firstName || "First"} {user?.attributes?.lastName || "Last"}
      </p>
      <p style={{ color: "black", margin: "8px 0" }}>
        <strong>Email:</strong> {user?.email || "No email provided"}
      </p>
      <p style={{ color: "black", margin: "8px 0" }}>
        <strong>Age:</strong> {user?.attributes?.age || "Not provided"}
      </p>
      <p style={{ color: "black", margin: "8px 0" }}>
        <strong>Average Rating:</strong> {user?.attributes?.ratings?.filter(r => r.reactorID)?.length > 0
          ? (
              user.attributes.ratings
                .filter(r => r.reactorID)
                .reduce((acc, r) => acc + (r.value || 0), 0) /
              user.attributes.ratings.filter(r => r.reactorID).length
            ).toFixed(1) + " ★"
          : "Not yet rated"}
      </p>
    </div>
  )}
</div>

            <div style={{ textAlign: "center", marginTop: "10px" }}>
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                {currentUserId !== userID && !isBlocked && (
                    <button style={buttonStyle} onClick={handleClick}>
                        {buttonText}
                    </button>
                    )}


                    <br/>

                    {isFollowing === 'unfollow' && !isBlocked && !hasReviewed && (
  <>
    <button
      onClick={() => setShowReviewModal(true)}
      style={{
        padding: "8px 15px",
        backgroundColor: "#662d91",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "10px",
      }}
    >
      Rate & Review
    </button>

    {showReviewModal && (
      <div
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center",
          }}
        >
          <h3>Rate & Review</h3>

          <input
            type="number"
            min="1"
            max="5"
            value={ratingValue}
            onChange={(e) => setRatingValue(e.target.value)}
            placeholder="Rating (1-5)"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write a short review..."
            style={{
              width: "100%",
              height: "80px",
              borderRadius: "5px",
              padding: "10px",
              border: "1px solid #ccc",
              marginBottom: "10px",
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => {
                handleSubmitReviewAndRating();
                setShowReviewModal(false);
              }}
              style={{
                padding: "8px 12px",
                backgroundColor: "purple",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Submit
            </button>

            <button
              onClick={() => setShowReviewModal(false)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#9a001a",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </>
)}


                    {isFollowing === 'unfollow' && !isBlocked && !hasReviewed && (
    <div style={{ marginTop: "10px", textAlign: "center" }}>

        </div>
    )}

                    <br />
                    {currentUserId !== userID && (
                        <button
                            onClick={handleBlockUser}
                            style={{
                                padding: "8px 15px",
                                backgroundColor: isBlocked ? "#ff8c00" : "#9a001a",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}>
                            {isBlocked ? "Unblock User" : "Block User"}
                        </button>
                    )}
                </div>
            </div>

            <button
  onClick={() => {
    fetchUserReviews();
    setShowReviewsModal(true);
  }}
  style={{
    padding: "8px 17px",
    marginTop: "35px",
    backgroundColor: "#662d91",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  }}
>
  Reviews
</button>


{showReviewsModal && (
  <div style={{
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  }}>
    <div style={{
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "10px",
      maxWidth: "500px",
      width: "90%",
      maxHeight: "80vh",
      overflowY: "auto"
    }}>
      <h3 style={{ textAlign: "center", marginBottom: "20px" , color: "black"}}>⭐ Reviews</h3>

      {userReviews.length === 0 ? (
        <p style={{color: "black"}}>No reviews available.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 , color: "black"}}>
          {userReviews.map((review, index) => (
            <li key={index} style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: "#f9f9f9",
            }}>
              <p><strong>From:</strong> {review.name}</p>
              <p><strong>Rating:</strong> {review.value}</p>
              {review.reviewText && (
                <p><strong>Review:</strong> {review.reviewText}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => setShowReviewsModal(false)}
        style={{
          marginTop: "10px",
          padding: "8px 15px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto"
        }}
      >
        Close
      </button>
    </div>
  </div>
)}

{showBlockModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      color: "black"
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "10px",
        maxWidth: "400px",
        width: "80%",
        textAlign: "center",
        color: "black"
      }}
    >
      <p style={{ marginBottom: "20px" }}>{blockMessage}</p>
      <button
        onClick={() => setShowBlockModal(false)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        OK
      </button>
    </div>
  </div>
)}


{showSuccessModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "10px",
        maxWidth: "400px",
        width: "80%",
        textAlign: "center",
      }}
    >
      <h3 style={{ marginBottom: "20px" }}>Success!</h3>
      <p style={{ marginBottom: "20px" }}>Review and rating submitted for moderation.</p>
      <button
        onClick={() => setShowSuccessModal(false)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        OK
      </button>
    </div>
  </div>
)}

            <div style={{
                border: "1px solid #ddd",
                borderRadius: "16px",
                padding: "5px",
                maxWidth: "400px",
                backgroundColor: "rgb(255,127,80)",
                boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
                marginTop: "20px",
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "center"
            }}>
                <h3 style={{ marginBottom: "10px", color: "black"}}>User's Instruments</h3>
                {instruments.length > 0 ? (
                    <ul style={{
                        listStyle: "none",
                        padding: "0",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: "8px"
                    }}>
                        {instruments.map((instrument, index) => (
                            <li key={index} style={{
                                padding: "8px 12px",
                                borderRadius: "20px",
                                display: "inline-block",
                            }}>
                                {instrument}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: "black" }}>No instruments listed.</p>
                )}
            </div>

            {isBlocked ? (
                <p
                    style={{
                        color: "red",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "20px",
                        marginTop: "20px",
                    }}
                >
                    This user is blocked. You cannot view their posts unless you unblock.
                </p>
            ) : (
                <>
                    <h3 style={{ textAlign: "center", fontSize: "22px", fontWeight: "bold", marginTop: "20px", color: "#f8f2e6" }}>
                        Posts
                    </h3>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                        }}
                    >
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div
                                    key={post.id}
                                    style={{
                                        width: "90%",
                                        maxWidth: "500px",
                                        marginBottom: "20px",
                                    }}
                                >
                                    <div
                                        style={{
                                            border: "1px solid #ddd",
                                            borderRadius: "10px",
                                            padding: "15px",
                                            backgroundColor: "#fff",
                                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                        }}
                                    >
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                marginBottom: "10px",
                                                overflowWrap: "break-word",
                                                display: "flex",
                                                flexDirection: "column"
                                            }}
                                        >
                                            {post.content}
                                        </p>

                                        {post.attributes?.image && (
                                            <img
                                                src={post.attributes.image}
                                                alt="User Post"
                                                style={{
                                                    width: "100%",
                                                    maxHeight: "300px",
                                                    objectFit: "contain",
                                                    borderRadius: "8px",
                                                    marginTop: "10px",
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div style={{ display: "flex", gap: "10px", marginTop: "10px", }}>
                                        <button
                                            onClick={() => handleReaction(post.id, "like")}
                                            disabled={isReacting}
                                            style={{
                                                padding: "5px 10px",
                                                cursor: isReacting ? "not-allowed" : "pointer",
                                                backgroundColor: postReactions[post.id]?.userReaction === "like" ? "#2e7d32" : "#f0f0f0",
                                                color: postReactions[post.id]?.userReaction === "like" ? "white" : "black",
                                                border: "none",
                                                borderRadius: "4px",
                                                minWidth: "80px",
                                                opacity: isReacting ? 0.7 : 1
                                            }}
                                        >
                                            {isReacting && postReactions[post.id]?.userReaction === "like" ?
                                                "..." :
                                                `Like (${postReactions[post.id]?.counts?.like || 0})`
                                            }
                                        </button>
                                        <button
                                            onClick={() => handleReaction(post.id, "dislike")}
                                            disabled={isReacting}
                                            style={{
                                                padding: "5px 10px",
                                                cursor: isReacting ? "not-allowed" : "pointer",
                                                backgroundColor: postReactions[post.id]?.userReaction === "dislike" ? "#F44336" : "#f0f0f0",
                                                color: postReactions[post.id]?.userReaction === "dislike" ? "white" : "black",
                                                border: "none",
                                                borderRadius: "4px",
                                                minWidth: "80px",
                                                opacity: isReacting ? 0.7 : 1
                                            }}
                                        >
                                            {isReacting && postReactions[post.id]?.userReaction === "dislike" ?
                                                "..." :
                                                `Dislike (${postReactions[post.id]?.counts?.dislike || 0})`
                                            }
                                        </button>
                                        <button
                                            onClick={() => handleReaction(post.id, "😊")}
                                            disabled={isReacting}
                                            style={{
                                                padding: "5px 10px",
                                                cursor: isReacting ? "not-allowed" : "pointer",
                                                backgroundColor: postReactions[post.id]?.userReaction === "😊" ? "#FFEB3B" : "#f0f0f0",
                                                color: "black",
                                                border: "none",
                                                borderRadius: "4px",
                                                minWidth: "80px",
                                                opacity: isReacting ? 0.7 : 1
                                            }}
                                        >
                                            {isReacting && postReactions[post.id]?.userReaction === "😊" ?
                                                "..." :
                                                `😊 (${postReactions[post.id]?.counts?.["😊"] || 0})`
                                            }
                                        </button>
                                    </div>

                                    <div
                                        style={{
                                            border: "1px solid #eee",
                                            borderRadius: "8px",
                                            padding: "10px",
                                            marginTop: "10px",
                                            backgroundColor: "#f9f9f9",
                                            width: "90%",
                                            marginLeft: "auto",
                                            marginRight: "auto",
                                        }}
                                    >
                                        <h4 style={{ fontSize: "16px", marginBottom: "5px", color: "black", }}>
                                            Comments
                                        </h4>

                                        <div style={{
                                            textAlign: "left",
                                            width: "100%",
                                            overflowWrap: "break-word",
                                            display: "flex",
                                            flexDirection: "column"
                                        }}>
                                            {(comments[post.id] || []).map((comment) => (
                                                <p
                                                    key={comment.id}
                                                    style={{ fontSize: "14px", color: "#555" }}
                                                >
                                                    {comment.content}
                                                </p>
                                            ))}
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Write a comment..."
                                            value={commentDrafts[post.id] || ""}
                                            onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                            style={{
                                                width: "90%",
                                                padding: "8px",
                                                marginTop: "5px",
                                                borderRadius: "5px",
                                                border: "1px solid #ccc",
                                            }}
                                        />

                                        <button
                                            onClick={() => handleCommentSubmit(post.id)}
                                            style={{
                                                marginTop: "5px",
                                                padding: "5px 10px",
                                                backgroundColor: "purple",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Post Comment
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: "center", fontSize: "16px", color: "white" }}>
                                No posts yet.
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
        </div>
    );
};

export default UserProfilePage;