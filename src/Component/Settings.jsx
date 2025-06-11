import React, { useState, useEffect, useCallback } from "react";
import noIcon from "../../src/assets/noicon.jpg"; // Default profile picture
import "../styles/Settings.css";
import "../styles/Style.css";
import { Link, useNavigate } from "react-router-dom";


const Settings = () => {
  // const [user, setUser] = useState(null);
  const [, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState(noIcon);
  // const [latestFileID, setLatestFileID] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tempFirstName, setTempFirstName] = useState("");
  const [tempLastName, setTempLastName] = useState("");   
  const [email, setEmail] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [age, setAge] = useState(""); 
  const [tempAge, setTempAge] = useState("");
  const [authToken, setAuthToken] = useState(null);
  const [userID, setUserID] = useState(null);
  const [postContent, setPostContent] = useState(""); // Stores user input for a post
  const [posts, setPosts] = useState([]); // Stores all posts linked to the user
  const [editingPostId, setEditingPostId] = useState(null);
  const [updatedContent, setUpdatedContent] = useState(null);
  const [postImage, setPostImage] = useState(null);
  const [songOfTheWeek, setSongOfTheWeek] = useState("");
  const [tempSongOfTheWeek, setTempSongOfTheWeek] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);
  const [latestImageId, setLatestImageId] = useState(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");
  const [deletionCompleted, setDeletionCompleted] = useState(false);
  const [deleteWarningMessage, setDeleteWarningMessage] = useState("");
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showPostWarningModal, setShowPostWarningModal] = useState(false);



  const handleConfirmDelete = async () => {
    if (!authToken || !userID) return;
  
    try {
      const fetchResponse = await fetch(
        `https://stringsattached.online/hci/api/default/file-uploads?uploaderID=${userID}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
  
      const data = await fetchResponse.json();
      const images = data[0];
  
      if (!Array.isArray(images) || images.length === 0) {
        setDeleteWarningMessage("No uploaded images to delete.");
        return;
      }
      
  
      const sortedImages = [...images].sort((a, b) => b.id - a.id);
      const latestImage = sortedImages[0];
      const secondLatestImage = sortedImages[1];
  
      const deleteResponse = await fetch(
        `https://stringsattached.online/hci/api/default/file-uploads/${latestImage.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
  
      if (!deleteResponse.ok) {
        throw new Error("Failed to delete the latest image.");
      }
  
      setDeleteSuccessMessage("Latest uploaded image deleted successfully.");
      setDeletionCompleted(true);
    setShowDeleteImageModal(false);

      
  
      if (secondLatestImage) {
        const imageUrl = `https://stringsattached.online/${secondLatestImage.path}`;
        setProfilePicUrl(imageUrl);
        await updateProfilePicture(secondLatestImage.path);
      } else {
        setProfilePicUrl(noIcon);
        await updateProfilePicture("");
      }
    } catch (error) {
      console.error("Error deleting latest image:", error);
      alert("Error deleting image: " + error.message);
      setShowDeleteImageModal(false);
    }
  };
  


  const navigate = useNavigate();
  const userToken = sessionStorage.getItem("token");
  const [selectedTab, setSelectedTab] = useState("Edit Profile");
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [ratings, setRatings] = useState([]);



  useEffect(() => {
    if (selectedTab === "Notifications") {
      fetchReviewsAboutMe();
    }
  
    if (selectedTab === "Reviews") {
      fetchRatings();
    }
  }, [selectedTab]);
  

  const fetchRatings = async () => {
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");
  
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
  
      const ratingsWithNames = await Promise.all(
        ratingsArray.map(async (r) => {
          if (!r.reactorID) return { ...r, name: "Anonymous" };
          const reactorRes = await fetch(
            `https://stringsattached.online/hci/api/default/users/${r.reactorID}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const reactorData = await reactorRes.json();
          return {
            ...r,
            name: `${reactorData.attributes?.firstName || "Unknown"} ${reactorData.attributes?.lastName || ""}`,
          };
        })
      );
  
      setRatings(ratingsWithNames);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };
  
  
  const fetchReviewsAboutMe = async () => {
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");
  
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
      const reviews = userData.attributes?.pendingReviews || [];
  
      const reviewerData = await Promise.all(
        reviews.map(async (review) => {
          const reviewerRes = await fetch(
            `https://stringsattached.online/hci/api/default/users/${review.reviewerID}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const reviewerInfo = await reviewerRes.json();
          return {
            ...review,
            name: `${reviewerInfo.attributes?.firstName || "Unknown"} ${reviewerInfo.attributes?.lastName || ""}`,
            profileImage: reviewerInfo.attributes?.profileImage || "",
          };
        })
      );
  
      setPendingReviews(reviewerData);
    } catch (error) {
      console.error("Failed to load reviews about me", error);
    }
  };

  const handleReviewDecision = async (reviewerID, approve) => {
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");
  
    const res = await fetch(
      `https://stringsattached.online/hci/api/default/users/${userID}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const userData = await res.json();
    let reviews = userData.attributes?.pendingReviews || [];
    let ratings = userData.attributes?.ratings || [];
  
    // Find and remove the review
    const approvedReview = reviews.find((r) => r.reviewerID === reviewerID);
    reviews = reviews.filter((r) => r.reviewerID !== reviewerID);
  
    if (approve && approvedReview) {
      ratings.push({
        value: approvedReview.value || 0,
        reactorID: reviewerID,
        reviewText: approvedReview.reviewText || "No review text provided",
      });
      
    }
  
    const updatedAttributes = {
      ...userData.attributes,
      pendingReviews: reviews,
      ratings: ratings,
    };
  
    const patchRes = await fetch(
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
  
    if (patchRes.ok) {
      fetchReviewsAboutMe();
    } else {
      console.error("Failed to update reviews");
    }
  };
  

  const updateSongOfTheWeek = async () => {
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");
  
    if (!token || !userID) {
      console.error("Authentication token or user ID missing.");
      return;
    }
  
    try {
      const userResponse = await fetch(
        `https://stringsattached.online/hci/api/default/users/${userID}`,
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
  
      const updatedAttributes = {
        ...existingAttributes,
        SongOfTheWeek: tempSongOfTheWeek,
      };
  
      const response = await fetch(
        `https://stringsattached.online/hci/api/default/users/${userID}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attributes: updatedAttributes }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update Song of the Week.");
      }
  
      setSongOfTheWeek(tempSongOfTheWeek);
      console.log("Song of the Week updated successfully!");
  
    } catch (error) {
      console.error("Error updating Song of the Week:", error);
    }
  };
  

const fetchFollowedUsers = async () => {
  const token = sessionStorage.getItem("token");
  const userID = sessionStorage.getItem("user");

  if (!token || !userID) {
    console.error(" Missing token or user ID.");
    return;
  }

  try {
    const response = await fetch(
      `https://stringsattached.online/hci/api/default/connections?fromUserID=${userID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    const connections = data[0];

    const seen = new Set();
    const follows = connections.filter((conn) => {
      const isFollowing = conn.attributes?.follow === true && conn.fromUserID === parseInt(userID);
      const isUnique = !seen.has(conn.toUserID);
      if (isFollowing && isUnique) {
        seen.add(conn.toUserID);
        return true;
      }
      return false;
    });

    const pendings = connections.filter(conn =>
      conn.attributes?.requested === true &&
      conn.attributes?.follow === false &&
      conn.fromUserID === parseInt(userID)
    );
    
    const pendingFetches = pendings.map(async (conn) => {
      try {
        const res = await fetch(
          `https://stringsattached.online/hci/api/default/users/${conn.toUserID}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const userData = await res.json();
        return { ...conn, toUser: userData };
      } catch (err) {
        console.error("Failed to fetch user info for pending:", conn.toUserID);
        return conn;
      }
    });
    
    const pendingUsers = await Promise.all(pendingFetches);
    setPendingRequests(pendingUsers);
    

    // 🔁 Fetch user data for each toUserID
    const userFetches = follows.map(async (conn) => {
      try {
        const userRes = await fetch(
          `https://stringsattached.online/hci/api/default/users/${conn.toUserID}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const userData = await userRes.json();
        return { ...conn, toUser: userData }; // attach user info
      } catch (err) {
        console.error("Failed to fetch user info for", conn.toUserID);
        return conn; // fallback with no toUser
      }
    });

    const connectionsWithUsers = await Promise.all(userFetches);
    console.log(" Friends with user data:", connectionsWithUsers);
    setFollowedUsers(connectionsWithUsers);
  } catch (error) {
    console.error(" Error fetching followed users:", error);
  }
};

  

  useEffect(() => {
    if (selectedTab === "Friends List") {
      fetchFollowedUsers();
    }
  }, [selectedTab]);
  

  const fetchBlockedUsers = async () => {
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");
  
    if (!token || !userID) {
      console.error("Missing token or user ID.");
      return;
    }
  
    try {
      const response = await fetch(
        `https://stringsattached.online/hci/api/default/connections?fromUserID=${userID}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      const data = await response.json();
      const connections = data[0];
  
      const seen = new Set();
      const blocked = connections.filter((conn) => {
        const isBlocked = conn.attributes?.blocked === true && conn.fromUserID === parseInt(userID);
        const isUnique = !seen.has(conn.toUserID);
        if (isBlocked && isUnique) {
          seen.add(conn.toUserID);
          return true;
        }
        return false;
      });
  
      const userFetches = blocked.map(async (conn) => {
        try {
          const userRes = await fetch(
            `https://stringsattached.online/hci/api/default/users/${conn.toUserID}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const userData = await userRes.json();
          return { ...conn, toUser: userData };
        } catch (err) {
          console.error("Failed to fetch user info for", conn.toUserID);
          return conn;
        }
      });
  
      const connectionsWithUsers = await Promise.all(userFetches);
      console.log(" Blocked with user data:", connectionsWithUsers);
      setBlockedUsers(connectionsWithUsers);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    }
  };
  
  
  useEffect(() => {
    if (selectedTab === "Blocked") {
      fetchBlockedUsers();
    }
  }, [selectedTab]);



  const deleteLatestImage = async () => {
    if (!authToken || !userID) {
      alert("Authentication or user ID missing.");
      return;
    }
  
    setShowDeleteAccountModal(true);
  
    try {
      // Fetch all uploaded images
      const fetchResponse = await fetch(
        `https://stringsattached.online/hci/api/default/file-uploads?uploaderID=${userID}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        }
      );
  
      const data = await fetchResponse.json();
      const images = data[0];
  
      if (!Array.isArray(images) || images.length === 0) {
        alert("No uploaded images to delete.");
        return;
      }
  
      // Sort by ID descending (latest first)
      const sortedImages = [...images].sort((a, b) => b.id - a.id);
  
      const latestImage = sortedImages[0];
      const secondLatestImage = sortedImages[1];
  
      // Delete the latest image
      const deleteResponse = await fetch(
        `https://stringsattached.online/hci/api/default/file-uploads/${latestImage.id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        }
      );
  
      if (!deleteResponse.ok) {
        throw new Error("Failed to delete the latest image.");
      }
  
      alert("Latest uploaded image deleted successfully.");
  
      if (secondLatestImage) {
        const imageUrl = `https://stringsattached.online/${secondLatestImage.path}`;
        setProfilePicUrl(imageUrl);
        // setLatestFileID(secondLatestImage.id);
        await updateProfilePicture(secondLatestImage.path);
      } else {
        // No previous image, upload to default
        setProfilePicUrl(noIcon);
        // setLatestFileID(null);
        await updateProfilePicture("");
      }
  
    } catch (error) {
      console.error("Error deleting latest image:", error);
      alert("Error deleting image: " + error.message);
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const handleImageChange = (e) => {
    setPostImage(e.target.files[0]);
  };


  const uploadImage = async (file) => {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append("uploaderID", String(userID)); // Ensure it's a string
    formData.append("file", file);
    formData.append("attributes", JSON.stringify({})); // Add an empty attributes object
  
    try {
      const response = await fetch(
        "https://stringsattached.online/hci/api/default/file-uploads",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`, 
          },
          body: formData,
        }
      );
  
      const data = await response.json();
      console.log("📢 Image Upload Response:", data); // Debugging log
  
      if (!response.ok) {
        throw new Error(`Image upload failed: ${data.message || response.statusText}`);
      }
  
      return { url: `https://stringsattached.online/${data.path}`, fileId: data.id };
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };
  
  const fetchUserPosts = async () => {
    if (!authToken || !userID) return;
  
    try {
      const response = await fetch(
        `https://stringsattached.online/hci/api/default/posts?authorID=${userID}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      const data = await response.json();
      console.log("Retrieved Posts:", data);

      // Ensure posts[1] is an array
      if (!Array.isArray(data[0])) {
        throw new Error("Unexpected response format. Expected posts[1] to be an array.");
      }

      setPosts(data[0]); // Store only posts[1] which contains the actual posts
  
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
};

  
const deleteAccount = async () => {
  const storedUserID = sessionStorage.getItem("user");
  const token = sessionStorage.getItem("token");

  console.log("🔍 Attempting to delete account for user:", storedUserID);
  console.log("🔍 Using Auth Token:", token);

  if (!storedUserID || !token) {
      alert("Error: User ID or authentication token is missing. Please log in again.");
      console.error("Missing userID or token.");
      return;
  }

  setShowDeleteAccountModal(true);


  try {
      const response = await fetch(
          `https://stringsattached.online/hci/api/default/users/${storedUserID}?relatedObjectsAction=delete`, 
          {
              method: "DELETE",
              headers: {
                  "Authorization": `Bearer ${token}`,  
                  "Content-Type": "application/json",
              },
          }
      );

      if (!response.ok) {
          let errorMessage = `Failed to delete account. Status: ${response.status}`;
          try {
              const errorData = await response.json();
              if (errorData.message) {
                  errorMessage += `, Message: ${errorData.message}`;
              }
          } catch (err) {
              console.warn("⚠️ Unable to extract error message from response.");
          }
          throw new Error(errorMessage);
      }

      sessionStorage.clear();
      window.location.href = "/"; 

  } catch (error) {
      console.error("error deleting account:", error);
      alert(`Error deleting account: ${error.message}`);
  }
};

const updateProfilePicture = async (imageUrl) => {
  if (!authToken || !userID) {
    console.error("Authentication token or user ID missing.");
    return;
  }

  try {
    // Step 1: Fetch current attributes
    const userResponse = await fetch(
      `https://stringsattached.online/hci/api/default/users/${userID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user before updating profile image.");
    }

    const userData = await userResponse.json();
    const existingAttributes = userData.attributes || {};

    // Step 2: Update only profileImage, keep everything else
    const updatedAttributes = {
      ...existingAttributes,
      profileImage: imageUrl,
    };

    // Step 3: PATCH with full updated attribute set
    const patchResponse = await fetch(
      `https://stringsattached.online/hci/api/default/users/${userID}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attributes: updatedAttributes }),
      }
    );

    if (!patchResponse.ok) {
      throw new Error("Failed to save profile picture with attributes.");
    }

    console.log("Profile picture updated and attributes preserved.");
  } catch (error) {
    console.error("Error updating profile picture with attributes:", error);
  }
};



const fetchLatestProfilePicture = useCallback(async () => {
    if (!authToken || !userID) {
        console.error("Authentication token or user ID missing.");
        return;
    }

    try {
        const response = await fetch(
            `https://stringsattached.online/hci/api/default/file-uploads?uploaderID=${userID}&take=1`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.json();
        const images = data[0];

        if (!Array.isArray(images) || images.length === 0) {
            console.warn("No uploaded images found for this user.");
            setProfilePicUrl(noIcon);
            return;
        }

        // const latestImage = images.reduce((prev, current) =>
        //     prev.id > current.id ? prev : current
        // );

        // setLatestFileID(latestImage.id);
    } catch (error) {
        console.error("Error fetching latest profile picture:", error);
    }
}, [authToken, userID]);

const fetchUserProfile = useCallback(async () => {
  const storedUserID = sessionStorage.getItem("user");
  const storedToken = sessionStorage.getItem("token");

  if (!storedToken || !storedUserID) {
      console.error("Authentication token or user ID missing.");
      return;
  }

  try {
      const response = await fetch(
          `https://stringsattached.online/hci/api/default/users/${storedUserID}`,
          {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${storedToken}`,
                  "Content-Type": "application/json",
              },
          }
      );

      if (!response.ok) throw new Error("Failed to fetch user profile.");
      const userData = await response.json();
      console.log("📢 Updated User Data from API:", userData);

      // setUser({ ...userData });
      setFirstName(userData.attributes?.firstName || "First");
      setLastName(userData.attributes?.lastName || "Last");
      setAge(userData.attributes?.age || "Not provided");
      setEmail(userData.email || "No email available");
      setSongOfTheWeek(userData.attributes?.SongOfTheWeek || "");

      const imageUrl = userData.attributes?.profileImage;
      if (!imageUrl || imageUrl === "undefined" || imageUrl === "") {
        setProfilePicUrl(noIcon);
      } else {
        // If it's a full URL or path, prefix it
        const isFullUrl = imageUrl.startsWith("http") || imageUrl.startsWith("data:");
        const fullPath = isFullUrl ? imageUrl : `https://stringsattached.online/${imageUrl}`;
        setProfilePicUrl(fullPath);
        console.log('no icon');
      }

  } catch (error) {
      console.error("error fetching user profile:", error);
  }
}, []);
const handlePostSubmit = async (e) => {
  e.preventDefault();
  // let imageUrl = null;
let fileId = null;
if (!postContent.trim()) {
  setShowPostWarningModal(true);
  return;
}

  if (postImage && postImage.size > 1 * 1024 * 1024) {
    alert("Post image must be less than or equal to 1MB.");
    return;
  }
  

  try {
    let imageUrl = null;
    if (postImage) {
      const uploadResult = await uploadImage(postImage);
      if (!uploadResult) throw new Error("Image upload failed.");
      imageUrl = uploadResult.url;
      fileId = uploadResult.fileId;
    }

    const postData = {
      authorID: userID,
      content: postContent,
      attributes: imageUrl ? { image: imageUrl, fileId: fileId } : {},
      visibility: "public",
    };
    

    console.log("📢 Sending Post Data:", postData);

    const response = await fetch(
      "https://stringsattached.online/hci/api/default/posts",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      }
    );

    const responseData = await response.json();
    if (!response.ok) throw new Error(`Failed to create post: ${responseData.message || response.statusText}`);

    console.log("Post created successfully!");

    fetchUserPosts();

    // Reset input fields
    setPostContent("");
    setPostImage(null);
  } catch (error) {
    console.error("Error creating post:", error);
    alert(`Error creating post: ${error.message}`);
  }
};

useEffect(() => {
    retrieveAuthDetails();
});
useEffect(() => {
  console.log("📢 Updated Posts State:", posts);
}, [posts]);

useEffect(() => {
    if (authToken && userID) {
        console.log("🚀 Fetching profile for user:", userID);
        fetchLatestProfilePicture();
        fetchUserProfile();
        // fetchUserPosts();
    }
}, [authToken, userID, fetchUserProfile, fetchLatestProfilePicture]);

useEffect(() => {
  console.log(userToken);
  if (!userToken) {
    navigate("/");
  }
}, [userToken, navigate]);

const confirmAccountDeletion = async () => {
  const storedUserID = sessionStorage.getItem("user");
  const token = sessionStorage.getItem("token");

  if (!storedUserID || !token) {
    alert("Error: User ID or authentication token is missing. Please log in again.");
    return;
  }

  try {
    const response = await fetch(
      `https://stringsattached.online/hci/api/default/users/${storedUserID}?relatedObjectsAction=delete`, 
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,  
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete account. ${errorData.message || ""}`);
    }

    alert("Your account has been successfully deleted.");
    sessionStorage.clear();
    window.location.href = "/";

  } catch (error) {
    console.error("Error deleting account:", error);
    alert(`Error deleting account: ${error.message}`);
  }
};

const retrieveAuthDetails = () => {
  let token = sessionStorage.getItem("token");
  let userID = sessionStorage.getItem("user");

  console.log("🔍 Checking stored auth details...");
  console.log("Auth Token:", token ? token : "NOT FOUND");
  console.log("User ID:", userID ? userID : "NOT FOUND");

  if (token && userID) {
      setAuthToken(token);
      setUserID(userID);
      console.log("Successfully retrieved auth details.");

      // Fetch user profile and posts immediately
      fetchUserProfile();
      fetchUserPosts();
  } else {
      console.error("No auth token or user ID found in sessionStorage.");
  }
};


// const deleteAllPosts = async () => {
//   if (!authToken || !userID) {
//     console.error("Authentication token or user ID missing.");
//     return;
//   }
//
//   try {
//     // Ensure posts[1] is an array containing the user's posts
//     const userPosts = Array.isArray(posts[1]) ? posts[1] : [];
//
//     if (userPosts.length === 0) {
//       console.warn("No posts found to delete.");
//       return;
//     }
//
//     console.log(`Found ${userPosts.length} posts. Deleting...`);
//
//     // Loop through all posts and delete them one by one
//     for (const post of userPosts) {
//       if (!post.id) {
//         console.error("Invalid post ID:", post);
//         continue; // Skip if the post ID is missing
//       }
//
//       const deleteResponse = await fetch(
//         `https://stringsattached.online/hci/api/default/posts/${post.id}`,
//         {
//           method: "DELETE",
//           headers: {
//             "Authorization": `Bearer ${authToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//
//       if (!deleteResponse.ok) {
//         console.error(`Failed to delete post ID ${post.id}`);
//       } else {
//         console.log(`Deleted post ID: ${post.id}`);
//       }
//     }
//
//     // Clear posts from the UI after deletion
//     setPosts([]);
//     console.log(" All posts deleted successfully.");
//     alert("All posts deleted successfully.");
//
//   } catch (error) {
//     console.error("Error deleting posts:", error);
//   }
// };


// Run this when the page loads
// useEffect(() => {
//   retrieveAuthDetails();
// });


  useEffect(() => {
    if (authToken && userID) {
        fetchUserProfile();
        fetchLatestProfilePicture();
        // fetchUserPosts();
    }
}, [authToken, userID, fetchUserProfile, fetchLatestProfilePicture]); 


//   const autoLogin = () => {
//     const token = sessionStorage.getItem("token");
//     const user = sessionStorage.getItem("user");
//
//     if (token && user) {
//       setAuthToken(token);
//       setUserID(user);
//       console.log("User authenticated:", { token, user });
//     } else {
//       console.error("No auth token or user ID found. Please log in.");
//     }
// };

const handleFileChange = async (e) => {
  const selectedFile = e.target.files[0];

  if (!selectedFile) return;

  if (selectedFile.size > 1 * 1024 * 1024) {
    alert("File size must be less than or equal to 1MB.");
    return;
  }

  setFile(selectedFile);

  // Immediately upload the selected image
  try {
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");

    const formData = new FormData();
    formData.append("uploaderID", userID);
    formData.append("attributes", JSON.stringify({}));
    formData.append("file", selectedFile);

    const response = await fetch(
      `https://stringsattached.online/hci/api/default/file-uploads`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();
    if (!data.id) throw new Error("Upload failed");

    const newImageUrl = `https://stringsattached.online/${data.path}`;
    setProfilePicUrl(newImageUrl);
    await updateProfilePicture(data.path);

    setUploadMessage("Profile picture updated successfully!");
    setTimeout(() => setUploadMessage(""), 5000);
  } catch (error) {
    console.error("Upload failed:", error);
    setUploadMessage("Error uploading image: " + error.message);
  }
};
  
const updateAge = async () => {
  const token = sessionStorage.getItem("token");
  const userID = sessionStorage.getItem("user");

  if (!token || !userID) {
    console.error("Authentication token or user ID missing.");
    return;
  }

  try {
    // Fetch the existing user data to preserve other attributes
    const userResponse = await fetch(
      `https://stringsattached.online/hci/api/default/users/${userID}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error("Failed to fetch current user attributes.");
    }

    const userData = await userResponse.json();
    const existingAttributes = userData.attributes || {}; // Preserve existing attributes

    const updatedAttributes = {
      ...existingAttributes, 
      age: tempAge, 
    };

    // Send the updated attributes to the server
    const response = await fetch(
      `https://stringsattached.online/hci/api/default/users/${userID}`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attributes: updatedAttributes }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update age.");
    }

    setAge(tempAge); // Update UI state
    console.log("Age updated successfully!");

    // Fetch updated profile data to ensure the correct values are displayed
    fetchUserProfile();
  } catch (error) {
    console.error("Error updating age:", error);
  }
};

  const updateEmail = async () => {
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");
  
    if (!token || !userID) {
      console.error("Authentication token or user ID missing.");
      return;
    }
  
    try {
      const response = await fetch(
        `https://stringsattached.online/hci/api/default/users/${userID}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: tempEmail }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update email.");
      }
  
      setEmail(tempEmail);
      console.log("Email updated successfully!");

    } catch (error) {
      console.error("Error updating email:", error);
    }
  };

  const deletePost = async (postId, fileId = null) => {
    if (!authToken || !userID) {
      console.error("Authentication token or user ID missing.");
      return;
    }
  
    try {
      const deleteResponse = await fetch(
        `https://stringsattached.online/hci/api/default/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!deleteResponse.ok) {
        console.error(`Failed to delete post ID ${postId}`);
      } else {
        console.log(`Deleted post ID: ${postId}`);
        setPosts((prevPosts) => prevPosts.filter(post => post.id !== postId));

      }
  
      // If the post had an associated file, delete it
      if (fileId) {
        const fileDeleteResponse = await fetch(
          `https://stringsattached.online/hci/api/default/file-uploads/${fileId}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        if (!fileDeleteResponse.ok) {
          console.warn(`Failed to delete file with ID ${fileId}`);
        } else {
          console.log(`Deleted associated file with ID: ${fileId}`);
        }
      }

    } catch (error) {
      console.error("Error deleting post and file:", error);
    }
  };
  
  const editPost = (postID, updatedContent) => {

      fetch(process.env.REACT_APP_API_PATH + "/posts/" + postID, {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
          body: JSON.stringify({
              content: updatedContent, // Make sure this matches your API's expected format
          }),
      })
          .then((response) => {
              if (!response.ok) {
                  throw new Error("Failed to update post");
              }
              return response.json();
          })
          .then((data) => {
              console.log("Post updated:", data);
              fetchUserPosts(); // Refresh posts after editing
          })
          .catch((error) => {
              console.error("Error updating post:", error);
              alert("Error updating post!");
          });
  };


  const updateFullName = async () => {
    if (!authToken || !userID) {
        console.error("Authentication token or user ID missing.");
        return;
    }

    const newFirstName = tempFirstName.trim();
    const newLastName = tempLastName.trim();

    if (!newFirstName || !newLastName) {
        console.warn("⚠️ First and Last Name cannot be empty!");
        return;
    }

    let userResponse = null;
    try {
      // Fetch existing attributes to preserve them
      userResponse = await fetch(
        `https://stringsattached.online/hci/api/default/users/${userID}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    }catch (error) {
      console.error("Error fetching user:", error);
    }

    const userData = await userResponse.json();
    
    const existingAttributes = userData.attributes || {};

    const requestBody = { 
        attributes: {
          ...existingAttributes,
            firstName: newFirstName, 
            lastName: newLastName
        }
    };

    console.log("📢 Sending update request to API:", requestBody);

    try {
        const response = await fetch(
            `https://stringsattached.online/hci/api/default/users/${userID}`,
            {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update full name in API.");
        }

        console.log("Full name updated successfully in API!");

        // Update local state to reflect the changes
        setFirstName(newFirstName);
        setLastName(newLastName);

        // Log updated values
        console.log("Updated First Name:", newFirstName);
        console.log("Updated Last Name:", newLastName);

    } catch (error) {
        console.error("Error updating full name:", error);
    }
};

return (
    <div className="settings-container">

      <div className="settings-dark-container">
      {/* Sidebar Navigation */}
      <aside className="settings-sidebar">
  <ul>
    {[
      "Edit Profile",
      "Blocked",
      "Posts",
      "Friends List",
      "Notifications",
      "Reviews"
    ].map((tab) => (
      <li
        key={tab}
        onClick={() => setSelectedTab(tab)}
        className={selectedTab === tab ? "active" : ""}
      >
        {tab}
      </li>
    ))}
  </ul>
</aside>

  
      {/* Main Settings Panel */}
      <main className="settings-main-content">
        <h1 className="page-heading">Settings</h1>

        <h2>{selectedTab}</h2>

  {selectedTab === "Edit Profile" && (
    <>
    <div>
    
            {/* Profile Picture */}
            <div className="profile-picture-container">
  <label htmlFor="fileUpload">
    <img
      src={profilePicUrl}
      alt="Profile"
      className="profile-picture"
      style={{ cursor: "pointer" }}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = noIcon;
      }}
    />
  </label>

  {/* Hidden file input triggered by image click */}
  <input
    id="fileUpload"
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    style={{ display: "none" }}
  />

<button
  onClick={() => setShowDeleteImageModal(true)}
  style={{
    backgroundColor: '#9a001a',
    color: '#ffffff',
    fontWeight: 'bold',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  }}
>
  Delete Latest Uploaded Image
</button>

{showDeleteImageModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "16px",
        width: "90%",
        maxWidth: "420px",
        boxShadow: "0 5px 25px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "10px", fontSize: "22px" }}>
        Confirm Deletion
      </h2>
      <p style={{ fontSize: "16px", marginBottom: "25px", color: "#444" }}>
        Are you sure you want to delete your most recent uploaded image?
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
        <button
          onClick={async () => {
            await handleConfirmDelete();
          }}
          style={{
            backgroundColor: "#d63031",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          OK
        </button>
        <button
          onClick={() => {
            setShowDeleteImageModal(false);
            setDeleteSuccessMessage("");
            setDeleteWarningMessage("");
          }}
          style={{
            backgroundColor: "#b2bec3",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>

      {deleteWarningMessage && (
        <p
          style={{
            color: "orange",
            fontWeight: "bold",
            marginTop: "20px",
          }}
        >
          {deleteWarningMessage}
        </p>
      )}

      {deleteSuccessMessage && (
        <p
          style={{
            color: "green",
            fontWeight: "bold",
            marginTop: "20px",
          }}
        >
          {deleteSuccessMessage}
        </p>
      )}
    </div>
  </div>
)}



{deleteSuccessMessage && (
  <p style={{ color: "green", fontWeight: "bold", marginTop: "10px" }}>
    {deleteSuccessMessage}
  </p>
)}



  <div className="profile-picture-upload">
    {uploadMessage && <p>{uploadMessage}</p>}
  </div>
</div>


            {/* User Information */}
            <div className="user-info" onClick={() => setShowEditModal(true)}>
  <div className="profile-item">
    <span className="label">Full Name</span>
    <span className="value">{firstName || "First"} {lastName || "Last"}</span>
  </div>
  <div className="profile-item">
    <span className="label">Email</span>
    <span className="value">{email || "No email available"}</span>
  </div>
  <div className="profile-item">
    <span className="label">Age</span>
    <span className="value">{age || "Not provided"}</span>
  </div>
  <div className="profile-item">
    <span className="label">Song of the Week</span>
    <div className="value" style={{ wordBreak: "break-word" }}>
      {songOfTheWeek || "No song added"}
      {songOfTheWeek.includes("v=") && (
        <div style={{ marginTop: "10px" }}>
          <iframe
            width="300"
            height="169"
            src={`https://www.youtube.com/embed/${songOfTheWeek.split("v=")[1]?.split("&")[0]}`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
    </div>
</div>

          {showEditModal && (
  <div className="modal-overlay">
    <div className="modal-content">
    <button className="modal-close-x" onClick={() => setShowEditModal(false)}>×</button>

      <h2>Edit Profile</h2>
      <div className="modal-update-fields">
        <input
          type="email"
          placeholder="Enter new email"
          value={tempEmail}
          onChange={(e) => setTempEmail(e.target.value)}
        />
        <button onClick={updateEmail}>Update Email</button>

        <input
          type="number"
          placeholder="Enter new age"
          value={tempAge}
          onChange={(e) => setTempAge(e.target.value)}
        />
        <button onClick={updateAge}>Update Age</button>

        <input
          type="text"
          placeholder="First Name"
          value={tempFirstName}
          onChange={(e) => setTempFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={tempLastName}
          onChange={(e) => setTempLastName(e.target.value)}
        />
        <button onClick={updateFullName}>Update Name</button>
        <input
        type="text"
        placeholder="Enter YouTube URL"
        value={tempSongOfTheWeek}
        onChange={(e) => setTempSongOfTheWeek(e.target.value)}
      />
      <button onClick={updateSongOfTheWeek}>Update Song of the Week</button>

      </div>
      

    </div>
    
  </div>
)}

<Link to="/requests">Requests</Link>
<br></br>

            {/* Delete Account Button */}
            
            
            <button className="delete-button" style={{
    backgroundColor: '#9a001a',
    color: '#ffffff',
    fontWeight: 'bold',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  }}onClick={() => setShowDeleteAccountModal(true)}>
                Delete My Account
            </button> <br/>
            {showDeleteAccountModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "16px",
        width: "90%",
        maxWidth: "420px",
        boxShadow: "0 5px 25px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "16px", marginBottom: "25px", color: "#444" }}>
        Are you sure you want to delete your account? This action cannot be undone.
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
        <button
          onClick={async () => {
            await confirmAccountDeletion();
            setShowDeleteAccountModal(false);
          }}
          style={{
            backgroundColor: "#d63031",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          OK
        </button>
        <button
          onClick={() => setShowDeleteAccountModal(false)}
          style={{
            backgroundColor: "#b2bec3",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}



            <button className="delete-button" style={{
    backgroundColor: '#9a001a',
    color: '#ffffff',
    fontWeight: 'bold',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  }}onClick={handleLogout}>
                  Logout
                </button>
            <br/>
            <br/>
            <br/>
            <br/>

            <br/>
            <br/>
            <br/>
            
        </div>
    </>
  )}

{selectedTab === "Blocked" && (
  <div>
    <h3>Blocked Users</h3>
    {blockedUsers.length === 0 ? (
      <p>No blocked users found.</p>
    ) : (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {blockedUsers.map((user) => {
          const profileImage =
            user.toUser?.attributes?.profileImage &&
            user.toUser?.attributes?.profileImage !== "undefined"
              ? `https://stringsattached.online/${user.toUser.attributes.profileImage}`
              : noIcon;

          const fullName = `${user.toUser?.attributes?.firstName || "Unknown"} ${
            user.toUser?.attributes?.lastName || ""
          }`;

          return (
            <div
              key={user.toUserID}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                width: "120px",
              }}
              onClick={() => navigate(`/profile/${user.toUserID}`)}
            >
              <img
                src={profileImage}
                alt={fullName}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #888",
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = noIcon;
                }}
              />
              <p
                style={{
                  marginTop: "8px",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {fullName}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  textAlign: "center",
                  wordWrap: "break-word",
                }}
              >
                {user.toUser?.email || "No email"}
              </p>
            </div>
          );
        })}
      </div>
    )}
    
  </div>
)}

  {selectedTab === "Posts" && (
     <>
     <div className="settings-container">
     {showPostWarningModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "400px",
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px", color: "#333" }}>
        Post content cannot be empty!
      </p>
      <button
        onClick={() => setShowPostWarningModal(false)}
        style={{
          backgroundColor: "#6c5ce7",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        OK
      </button>
    </div>
  </div>
)}

                {/* Post Creation Form */}
                <div className="post-creation">
                <h3>Create a Post</h3>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                <form onSubmit={handlePostSubmit}>
          <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write something..."
              rows="4"
              cols="50"
          />
                    <br />
                    <button type="submit"
                            style = {{backgroundColor: "#FF7F50"}}
                    >Post</button>
                </form>
            </div>
            
            {/* Display User Posts */}
            <div className="user-posts">
                <h3>Your Posts</h3>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <div key={post.id || index} className="post-container">
                            <p style={{wordWrap: "break-word", overflowWrap: "break-word",whiteSpace: "normal",maxWidth: "75%"}}>{post.content}</p>
                            {post.attributes?.image && (
                                <img
                                    src={post.attributes.image}
                                    alt="User Post"
                                />
                            )}
                            <button onClick={() => deletePost(post.id)}
                            style={{
                                backgroundColor: '#9a001a',  // Your dark red color
                                color: '#ffffff',           // White text
                                border: "none",
                                borderRadius: "5px",
                                padding: "5px 10px",
                                cursor: "pointer",
                            }}>
                            Delete
                        </button>
                            <button
                                onClick={() => { setEditingPostId(post.id); setUpdatedContent(post.content); }}
                                style={{
                                    position: "absolute",
                                    top: "7.5px",
                                    right: "75px",
                                    backgroundColor: "purple",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    padding: "5px 10px",
                                    cursor: "pointer",
                                }}>
                                Edit
                            </button>
                            {editingPostId === post.id && (
                                <div className="edit-section">
                              <textarea
                                  value={updatedContent}
                                  onChange={(e) => setUpdatedContent(e.target.value)}
                                  rows={3}/>
                                    <div className="button-group">
                                        <button
                                            onClick={() => {
                                                editPost(post.id, updatedContent);
                                                setEditingPostId(null);
                                                setUpdatedContent("");
                                            }}
                                            style={{
                                                position: "absolute",
                                                top: "7.5px",
                                                right: "75px",
                                                backgroundColor: "grey",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "5px",
                                                padding: "5px 10px",
                                                cursor: "pointer",
                                            }}>
                                            Save
                                        </button>
                                        <button onClick={() => setEditingPostId(null)}>Cancel</button>
                                        
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No posts yet.</p>
                )}
            </div>
            </div>
            </>
  )}

{selectedTab === "Friends List" && (
  <div>
    <h3>Friends</h3>
    {followedUsers.length === 0 ? (
      <p>No friends found.</p>
    ) : (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {followedUsers.map((user) => {
          const profileImage =
            user.toUser?.attributes?.profileImage &&
            user.toUser?.attributes?.profileImage !== "undefined"
              ? `https://stringsattached.online/${user.toUser.attributes.profileImage}`
              : noIcon;

          const fullName = `${user.toUser?.attributes?.firstName || "Unknown"} ${
            user.toUser?.attributes?.lastName || ""
          }`;

          return (
            <div
              key={user.toUserID}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                width: "120px",
              }}
              onClick={() => navigate(`/profile/${user.toUserID}`)}
            >
              <img
                src={profileImage}
                alt={fullName}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #888",
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = noIcon;
                }}
              />
              <p
                style={{
                  marginTop: "8px",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {fullName}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  textAlign: "center",
                  wordWrap: "break-word",
                }}
              >
                {user.toUser?.email || "No email"}
              </p>
              
            </div>
            
            
          );
        })}
      </div>
    )}
    <button
  onClick={() => setShowPendingModal(true)}
  style={{
    backgroundColor: "#6c5ce7",
    color: "white",
    padding: "8px 16px",
    margin: "20px auto",
    display: "block",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  }}
>
  View Pending Requests
</button>

{showPendingModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Pending Friend Requests</h3>
      <button onClick={() => setShowPendingModal(false)} style={{ float: "right" }}>
        Close
      </button>
      {pendingRequests.length === 0 ? (
        <p>No pending requests found.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
          {pendingRequests.map((user) => {
            const profileImage = user.toUser?.attributes?.profileImage &&
              user.toUser?.attributes?.profileImage !== "undefined"
              ? `https://stringsattached.online/${user.toUser.attributes.profileImage}`
              : noIcon;

            const fullName = `${user.toUser?.attributes?.firstName || "Unknown"} ${user.toUser?.attributes?.lastName || ""}`;

            return (
              <div
                key={user.toUserID}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  width: "120px",
                }}
                onClick={() => navigate(`/profile/${user.toUserID}`)}
              >
                <img
                  src={profileImage}
                  alt={fullName}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #888",
                  }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = noIcon;
                  }}
                />
                <p style={{ marginTop: "8px", textAlign: "center", fontSize: "14px", fontWeight: "bold" }}>
                  {fullName}
                </p>
                <p style={{ fontSize: "12px", color: "#666", textAlign: "center" }}>
                  {user.toUser?.email || "No email"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
)}

  </div>
)}

{selectedTab === "Notifications" && (
  <div>
    <h3>Pending Reviews</h3>
    {pendingReviews.length === 0 ? (
      <p>You have no pending reviews to complete.</p>
    ) : (

      <ul style={{ listStyle: "none", padding: 0 }}>
<>
  <p style={{ textAlign: "center", fontWeight: "bold", marginBottom: "20px" }}>
     Only approve reviews from people you have gone on a date with.
  </p>

  <ul style={{ listStyle: "none", padding: 0 }}>
    {pendingReviews.map((review) => {
      const imageSrc = review.profileImage && review.profileImage !== "undefined"
        ? `https://stringsattached.online/${review.profileImage}`
        : noIcon;

      return (
        <li
          key={review.reviewerID}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
            padding: "10px 15px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            backgroundColor: "#fff",
            boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
            maxWidth: "500px",
            marginInline: "auto",
          }}
        >
          <img
            src={imageSrc}
            alt={review.name}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #888",
            }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = noIcon;
            }}
          />

          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "16px" }}>
              {review.name}
            </p>

            {/* Blurred review preview */}
            <p
              style={{
                margin: 0,
                filter: "blur(4px)",
                color: "#999",
                fontStyle: "italic",
                userSelect: "none",
              }}
            >
              {review.reviewText}
            </p>

            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => handleReviewDecision(review.reviewerID, true)}
                style={{
                  marginRight: "10px",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  backgroundColor: "#4caf50",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Approve
              </button>
              <button
                onClick={() => handleReviewDecision(review.reviewerID, false)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "5px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Deny
              </button>
            </div>
          </div>
        </li>
      );
    })}
  </ul>
</>

</ul>


    )}
  </div>
)}

{selectedTab === "Reviews" && (
  <div>
    <h3>⭐ Reviews</h3>
    {ratings.length === 0 ? (
      <p>No reviews available.</p>
    ) : (
      <ul style={{ listStyle: "none", padding: 0 }}>
        {ratings.map((review, index) => (
          <li key={index} style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "10px",
            maxWidth: "500px",
            marginInline: "auto",
            backgroundColor: "#fff",
          }}>
            <p><strong>From:</strong> {review.name}</p>
            <p><strong>Rating:</strong> {review.value}</p>
            {review.reviewText && (
              <p style={{ marginTop: "8px", color: "#555" }}>
                <strong>Review:</strong> {review.reviewText}
              </p>
            )}

          </li>
        ))}
      </ul>
    )}
  </div>
)}


</main>

    </div>
    </div>
  );
  
};

export default Settings;
