import React, { useState, useEffect, useCallback } from "react";
import noIcon from "../../src/assets/noicon.jpg";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import "../styles/Account-Activity.css";
import { FaFilter } from "react-icons/fa";
import DecorBackground from "./DecorBackground"; 



const Profiles = () => {
  const [userProfile, setUserProfile] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const authToken = sessionStorage.getItem("token");
  const currentUserId = sessionStorage.getItem("user");
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 768);
  const [, setConnectedUserIds] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [isEditingAge, setIsEditingAge] = useState(false);
  const [tempAge, setTempAge] = useState("");
  const [isEditingInstruments, setIsEditingInstruments] = useState(false);
  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const [customInstrument, setCustomInstrument] = useState("");
  const [dynamicInstruments, setDynamicInstruments] = useState([]);
  const [isEditingSong, setIsEditingSong] = useState(false);
  const [tempSongUrl, setTempSongUrl] = useState("");
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempFirstName, setTempFirstName] = useState("");
  const [tempLastName, setTempLastName] = useState("");
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const [instrumentFilterList, setInstrumentFilterList] = useState([]);
  const [tempInstrumentSelection, setTempInstrumentSelection] = useState([]);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [genderFilterList, setGenderFilterList] = useState([]);
  const [tempGenderSelection, setTempGenderSelection] = useState([]);
  const [tempMinAge, setTempMinAge] = useState("");
  const [tempMaxAge, setTempMaxAge] = useState("");
  const [minAgeFilter, setMinAgeFilter] = useState("");
  const [maxAgeFilter, setMaxAgeFilter] = useState("");
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [isEditingGender, setIsEditingGender] = useState(false);
  const [userGender, setUserGender] = useState("");
  const genderOptions = ["male", "female", "nonbinary"];
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviewers, setReviewers] = useState({});
  const [activeProfileRatings, setActiveProfileRatings] = useState([]);
  const [activeProfileReviewers, setActiveProfileReviewers] = useState({});
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const fetchReviewerNames = useCallback(async (ratings) => {
    const token = sessionStorage.getItem("token");
    if (!token || !ratings?.length) return;

    const uniqueIds = [...new Set(ratings.map((r) => r.reviewerID))];
    const names = {};

    await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const res = await fetch(
            `https://stringsattached.online/hci/api/api/claem/users/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await res.json();
          names[id] =
            `${data.attributes?.firstName || ""} ${data.attributes?.lastName || ""}`;
        } catch {
          names[id] = "Unknown";
        }
      })
    );

    setReviewers(names);
  }, []);

  const openReviewsModal = async () => {
    const displayedProfile = userProfile[currentIndex];
    const ratings = displayedProfile?.attributes?.ratings || [];

    setActiveProfileRatings(ratings);

    if (ratings.length === 0) {
      setActiveProfileReviewers({});
      setShowReviewsModal(true);
      return;
    }

    const token = sessionStorage.getItem("token");
    const names = {};
    const uniqueIds = [...new Set(ratings.map((r) => r.reviewerID))];

    await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const res = await fetch(
            `https://stringsattached.online/hci/api/api/claem/users/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await res.json();
          names[id] =
            `${data.attributes?.firstName || ""} ${data.attributes?.lastName || ""}`;
        } catch {
          names[id] = "Unknown";
        }
      })
    );

    setActiveProfileReviewers(names);
    setShowReviewsModal(true);
  };

  const handleSaveName = async () => {
    if (!authToken || !currentUserId) return;

    try {
      const userRes = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${currentUserId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const userData = await userRes.json();
      const existingAttributes = userData.attributes || {};

      const updatedAttributes = {
        ...existingAttributes,
        firstName: tempFirstName,
        lastName: tempLastName,
      };

      const patchRes = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attributes: updatedAttributes }),
        }
      );

      if (!patchRes.ok) throw new Error("Failed to update name");

      setIsEditingName(false);
      fetchCurrentUser(); // refresh
    } catch (err) {
      console.error("Error saving name:", err);
    }
  };
  const handleSaveGender = async () => {
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");

    if (!token || !userID) {
      return;
    }

    try {
      // First get current user attributes
      const userResponse = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${userID}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const userData = await userResponse.json();
      const existingAttributes = userData.attributes || {};

      // Update with new gender
      const updatedAttributes = {
        ...existingAttributes,
        gender: userGender,
      };

      const response = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${userID}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attributes: updatedAttributes }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update gender.");
      }

      setIsEditingGender(false);
    } catch (error) {
      console.error("Error updating gender:", error);
    }
  };
  useEffect(() => {
    const fetchUserGender = async () => {
      const token = sessionStorage.getItem("token");
      const userID = sessionStorage.getItem("user");

      if (!token || !userID) return;

      try {
        const response = await fetch(
          `https://stringsattached.online/hci/api/api/claem/users/${userID}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const userData = await response.json();
        const savedGender = userData.attributes?.gender || "";
        setUserGender(savedGender);
      } catch (error) {
        console.error("Error fetching user gender:", error);
      }
    };

    fetchUserGender();
  }, []);

  useEffect(() => {
    console.log(sessionStorage.getItem("token"));
    if (!sessionStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  // Fetch potential matches
  const fetchUserProfile = useCallback(
    async (excludedIds = []) => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "https://stringsattached.online/hci/api/api/claem/users",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const profiles = data[0].filter(
            (user) =>
              user.id !== parseInt(currentUserId) &&
              !excludedIds.includes(user.id)
          );

          setUserProfile(profiles);
          setCurrentIndex(0);
        } else {
          throw new Error("Unexpected data format");
        }
      } catch (err) {
        console.error("Error fetching user profiles:", err);
        setError(err.message);
        setUserProfile([]);
      } finally {
        setLoading(false);
      }
    },
    [authToken, currentUserId]
  );

  const fetchConnections = useCallback(async () => {
    try {
      const response = await fetch(
        `https://stringsattached.online/hci/api/api/claem/connections`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const allConnections = data[0];

        // Only valid ones (not blocked, and requested/follow)
        const validConnections = allConnections.filter(
          (conn) =>
            conn.attributes &&
            (conn.attributes.follow === true ||
              conn.attributes.requested === true ||
              conn.attributes.blocked === true) &&
            (conn.fromUserID === parseInt(currentUserId) ||
              conn.toUserID === parseInt(currentUserId))
        );

        // Extract the connected user IDs
        const connectedIds = validConnections.map((conn) => {
          return conn.fromUserID === parseInt(currentUserId)
            ? conn.toUserID
            : conn.fromUserID;
        });

        console.log("Filtered connected user IDs:", connectedIds);
        setConnectedUserIds(connectedIds);
        return connectedIds;
      }
    } catch (err) {
      console.error("Failed to fetch connections", err);
    }

    return [];
  }, [authToken, currentUserId]);

  const handleSaveSong = async () => {
    if (!authToken || !currentUserId) return;

    try {
      const userRes = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${currentUserId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const userData = await userRes.json();
      const existingAttributes = userData.attributes || {};

      const updatedAttributes = {
        ...existingAttributes,
        SongOfTheWeek: tempSongUrl,
      };

      const patchRes = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attributes: updatedAttributes }),
        }
      );

      if (!patchRes.ok) throw new Error("Failed to update song");

      console.log("Song updated");
      setIsEditingSong(false);
      fetchCurrentUser();
    } catch (err) {
      console.error("Error saving song of the week:", err);
    }
  };

  const [allInstruments] = useState([
    "Guitar",
    "Piano",
    "Drums",
    "Violin",
    "Bass",
    "Saxophone",
    "Trumpet",
    "Trombone",
    "Tuba",
    "Clarinet",
    "Flute",
    "Euphonium",
    "Cello",
    "French Horn",
    "Vocals",
  ]);

  const handleAddCustomInstrument = () => {
    const trimmed = customInstrument.trim();
    if (!trimmed) return;

    // Add to selected instruments
    setSelectedInstruments((prev) => [...prev, trimmed]);

    // Add to temporary dynamic list (for UI display only)
    setDynamicInstruments((prev) => [...prev, trimmed]);

    setCustomInstrument("");
  };

  const handleInstrumentToggle = (instrument) => {
    setSelectedInstruments((prev) => {
      const updated = prev.includes(instrument)
        ? prev.filter((i) => i !== instrument)
        : [...prev, instrument];

      // If it's a custom instrument and now removed, also remove it from the dynamic list
      if (
        !updated.includes(instrument) &&
        dynamicInstruments.includes(instrument)
      ) {
        setDynamicInstruments((prev) => prev.filter((i) => i !== instrument));
      }

      return updated;
    });
  };

  const handleSaveInstruments = async () => {
    if (!authToken || !currentUserId) return;

    try {
      const userRes = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${currentUserId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const userData = await userRes.json();
      const existingAttributes = userData.attributes || {};

      const updatedAttributes = {
        ...existingAttributes,
        instruments: selectedInstruments,
      };

      const patchRes = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attributes: updatedAttributes }),
        }
      );

      if (!patchRes.ok) throw new Error("Failed to update instruments");
      setIsEditingInstruments(false);
      fetchCurrentUser(); // Refresh data
    } catch (err) {
      console.error("Error updating instruments:", err);
    }
  };

  const handleSaveAge = async () => {
    if (!tempAge || !authToken || !currentUserId) return;

    try {
      // Fetch current attributes to preserve them
      const userResponse = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${currentUserId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const userData = await userResponse.json();
      const existingAttributes = userData.attributes || {};

      // Merge in updated age
      const updatedAttributes = {
        ...existingAttributes,
        age: tempAge,
      };

      const patchResponse = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attributes: updatedAttributes }),
        }
      );

      if (!patchResponse.ok) throw new Error("Failed to update age");

      console.log("Age updated!");
      setIsEditingAge(false);
      fetchCurrentUser(); // Refresh the UI
    } catch (err) {
      console.error("Error updating age:", err);
    }
  };

  const handleSaveEmail = async () => {
    if (!tempEmail || !authToken || !currentUserId) return;

    try {
      const patchResponse = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: tempEmail }),
        }
      );

      if (!patchResponse.ok) throw new Error("Failed to update email");

      console.log("Email updated.");
      setTempEmail("");
      setIsEditingEmail(false); // exit edit mode
      fetchCurrentUser(); // Refresh UI
    } catch (err) {
      console.error("Error updating email:", err);
    }
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${currentUserId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("🧍Current user data:", data);
      setCurrentUserProfile(data);

      const savedInstruments = data.attributes?.instruments || [];
      setSelectedInstruments(savedInstruments);
      const customOnly = savedInstruments.filter(
        (inst) => !allInstruments.includes(inst)
      );
      setDynamicInstruments(customOnly);
    } catch (err) {
      console.error("Error fetching current user profile:", err);
    }
  }, [allInstruments, authToken, currentUserId]);

  useEffect(() => {
    if (authToken && currentUserId) {
      fetchConnections().then((connectedIds) => {
        fetchUserProfile(connectedIds); // Pass the filtered list here
      });
      fetchCurrentUser();
    }
  }, [
    authToken,
    currentUserId,
    fetchConnections,
    fetchUserProfile,
    fetchCurrentUser,
  ]);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 830);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextProfileLoad = () => {
    setCurrentIndex((prev) => {
      if (prev >= userProfile.length - 1) {
        fetchUserProfile();
        return 0;
      }
      return prev + 1;
    });
  };

  // Handle like/accept with proper user IDs
  const handleLike = async () => {
    const likedUser = filteredProfiles[currentIndex];
    if (!likedUser?.id) return;

    try {
      // Step 1: Check existing connections
      const connRes = await fetch(
        `https://stringsattached.online/hci/api/api/claem/connections`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const connData = await connRes.json();
      const allConnections = connData[0] || [];

      const existingConnection = allConnections.find(
        (conn) =>
          (conn.fromUserID === parseInt(currentUserId) &&
            conn.toUserID === likedUser.id) ||
          (conn.fromUserID === likedUser.id &&
            conn.toUserID === parseInt(currentUserId))
      );

      if (existingConnection) {
        // Step 2: PATCH the existing connection
        const patchRes = await fetch(
          `https://stringsattached.online/hci/api/api/claem/connections/${existingConnection.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fromUserID: parseInt(currentUserId),
              toUserID: likedUser.id,
              attributes: {
                requested: true,
                follow: false,
                blocked: false,
              },
            }),
          }
        );

        if (!patchRes.ok) throw new Error("Failed to update connection");
      } else {
        // Step 3: POST a new connection
        const postRes = await fetch(
          `https://stringsattached.online/hci/api/api/claem/connections`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fromUserID: parseInt(currentUserId),
              toUserID: likedUser.id,
              attributes: {
                requested: true,
                follow: false,
                blocked: false,
              },
            }),
          }
        );

        if (!postRes.ok) throw new Error("Failed to create new connection");
      }

      console.log("Like handled successfully");

      // After connection (POST or PATCH) is successful:
      console.log("Like handled successfully");

      setFilteredProfiles((prevFiltered) => {
        const updatedProfiles = [...prevFiltered];
        updatedProfiles.splice(currentIndex, 1); // Remove liked profile

        setCurrentIndex((prevIndex) => {
          if (updatedProfiles.length === 0) return 0;
          return prevIndex >= updatedProfiles.length ? 0 : prevIndex;
        });

        return updatedProfiles;
      });
    } catch (err) {
      console.error("Error handling like:", err);
      setError(err.message);
    }
  };

  // Handle reject with proper user IDs
  const handleReject = () => {
    console.log("Rejected profile:", userProfile[currentIndex]?.id);
    nextProfileLoad(); // Simply move to the next profile
  };

  useEffect(() => {
    if (authToken && currentUserId) {
      fetchConnections().then((ids) => {
        fetchUserProfile(ids);
      });
    }
  }, [authToken, currentUserId, fetchConnections, fetchUserProfile]);

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Show preview & wait for user to click "Save"
    setNewProfileImage(file);
  };
  const handleSaveImage = async () => {
    if (!newProfileImage || !authToken || !currentUserId) return;

    try {
      // 1. Upload file to get the path
      const formData = new FormData();
      formData.append("uploaderID", currentUserId);
      formData.append("file", newProfileImage);
      formData.append("attributes", JSON.stringify({}));

      const uploadResponse = await fetch(
        `https://stringsattached.online/hci/api/api/claem/file-uploads`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadData?.path) {
        throw new Error("Failed to upload image");
      }

      const imagePath = uploadData.path;

      // 2. Get current attributes
      const userResponse = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${currentUserId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const userData = await userResponse.json();
      const existingAttributes = userData.attributes || {};

      // 3. Merge profileImage path into existing attributes
      const updatedAttributes = {
        ...existingAttributes,
        profileImage: imagePath,
      };

      // 4. Save changes with PATCH
      const patchResponse = await fetch(
        `https://stringsattached.online/hci/api/api/claem/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attributes: updatedAttributes }),
        }
      );

      if (!patchResponse.ok) throw new Error("Failed to update profile image");

      console.log("Profile image successfully updated.");
      setNewProfileImage(null);
      fetchCurrentUser(); // Refresh UI
    } catch (err) {
      console.error("Error saving image:", err);
    }
  };

  useEffect(() => {
    const newFiltered = userProfile.filter((user) => {
      const hasRequiredInfo =
        user.attributes?.firstName &&
        user.attributes?.lastName &&
        user.attributes?.age;
      if (!hasRequiredInfo) return false;

      const matchesInstrument =
        instrumentFilterList.length === 0 ||
        user.attributes?.instruments?.some((inst) =>
          instrumentFilterList.includes(inst)
        );
      const matchesGender =
        genderFilterList.length === 0 ||
        (typeof user.attributes?.gender === "string" &&
          genderFilterList.includes(
            user.attributes.gender.charAt(0).toUpperCase() +
              user.attributes.gender.slice(1).toLowerCase()
          ));
      const userAge = user.attributes?.age;
      const matchesAge =
        (!minAgeFilter || userAge >= parseInt(minAgeFilter)) &&
        (!maxAgeFilter || userAge <= parseInt(maxAgeFilter));
      return matchesInstrument && matchesGender && matchesAge;
    });

    setFilteredProfiles(newFiltered);
    setCurrentIndex(0); // Optional: reset index to prevent out-of-bounds
  }, [
    userProfile,
    instrumentFilterList,
    genderFilterList,
    minAgeFilter,
    maxAgeFilter,
  ]);

  return (
    <div
    style={{
      position: "relative",
      minHeight: "100vh",
      overflowX: "hidden",
      fontFamily: '"JetBrains Mono", monospace',
      backgroundColor: "transparent", // ensures body background doesn't interfere
    }}
  >
    <DecorBackground />

      <div
        className="Text"
        style={{
          display: "flex",
          justifyContent: "center",
          zIndex: 1,
          position: "relative",
          width: "100%",
        }}
      >
        
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            {showInstrumentModal && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  height: "100vh",
                  width: "100vw",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    width: "450px",
                  }}
                >
                  <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                    🎶 Select Instruments
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr", // 2 columns
                      gap: "10px",
                    }}
                  >
                    {[...allInstruments, ...dynamicInstruments].map(
                      (instrument, index) => (
                        <label key={index}>
                          <input
                            type="checkbox"
                            checked={tempInstrumentSelection.includes(
                              instrument
                            )}
                            onChange={() => {
                              setTempInstrumentSelection((prev) =>
                                prev.includes(instrument)
                                  ? prev.filter((i) => i !== instrument)
                                  : [...prev, instrument]
                              );
                            }}
                          />{" "}
                          {instrument}
                        </label>
                      )
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "20px",
                    }}
                  >
                    <button
                      onClick={() => setShowInstrumentModal(false)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#ccc",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setInstrumentFilterList(tempInstrumentSelection);
                        setShowInstrumentModal(false);
                      }}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showGenderModal && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  height: "100vh",
                  width: "100vw",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    width: "300px",
                  }}
                >
                  <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                    🚻 Select Gender
                  </h3>

                  {["Male", "Female", "Nonbinary"].map(
                    (genderOption, index) => (
                      <label
                        key={index}
                        style={{ display: "block", marginBottom: "8px" }}
                      >
                        <input
                          type="checkbox"
                          checked={tempGenderSelection.includes(genderOption)}
                          onChange={() => {
                            setTempGenderSelection((prev) =>
                              prev.includes(genderOption)
                                ? prev.filter((g) => g !== genderOption)
                                : [...prev, genderOption]
                            );
                          }}
                        />{" "}
                        {genderOption}
                      </label>
                    )
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "20px",
                    }}
                  >
                    <button
                      onClick={() => setShowGenderModal(false)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#ccc",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setGenderFilterList(tempGenderSelection);
                        setShowGenderModal(false);
                      }}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showAgeModal && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  height: "100vh",
                  width: "100vw",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    width: "300px",
                  }}
                >
                  <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                    🎂 Filter by Age
                  </h3>

                  <div style={{ marginBottom: "15px" }}>
                    <label>Min Age:</label>
                    <input
                      type="number"
                      value={tempMinAge}
                      onChange={(e) => setTempMinAge(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginTop: "5px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                      }}
                      placeholder="Enter minimum age"
                    />
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label>Max Age:</label>
                    <input
                      type="number"
                      value={tempMaxAge}
                      onChange={(e) => setTempMaxAge(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginTop: "5px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                      }}
                      placeholder="Enter maximum age"
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "20px",
                    }}
                  >
                    <button
                      onClick={() => setShowAgeModal(false)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#ccc",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setMinAgeFilter(tempMinAge);
                        setMaxAgeFilter(tempMaxAge);
                        setShowAgeModal(false);
                      }}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            <h2 style={{ fontSize: "40px" }}>Discover Profiles</h2>
            {/* <button
              onClick={() => {
                setTempInstrumentSelection(instrumentFilterList);
                setShowInstrumentModal(true);
              }}
              className="add-song-button"
              style={{ backgroundColor: "#FF7F50" }}
            >
              Filter by Instrument
            </button> */}

            {/* <button
              onClick={() => {
                setTempGenderSelection(genderFilterList);
                setShowGenderModal(true);
              }}
              className="add-song-button"
              style={{ backgroundColor: "#FF7F50" }}
            >
              Filter by Gender
            </button>

            <button
              onClick={() => {
                setTempMinAge(minAgeFilter);
                setTempMaxAge(maxAgeFilter);
                setShowAgeModal(true);
              }}
              className="add-song-button"
              style={{ backgroundColor: "#FF7F50" }}
            >
              Filter by Age
            </button> */}
          </div>
          {loading ? (
            <p>Loading profile...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : userProfile.length > 0 ? (
            (() => {
              if (filteredProfiles.length === 0) {
                return (
                  <p
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "18px",
                      marginTop: "30px",
                    }}
                  >
                    No profiles found. Broaden your filters.
                  </p>
                );
              }

              const currentUser =
                filteredProfiles[currentIndex % filteredProfiles.length];

              return (
                <div
                  className="profile-card"
                  style={{
                    position: "relative",
                    backgroundColor: "#f0f0f0",
                    padding: "30px",
                    borderRadius: "16px",
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                    textAlign: "center",
                    maxWidth: "500px",
                    margin: "auto",
                    marginTop: "40px",
                    fontSize: "16px",
                    display: "flex",
                    flexDirection: "column",
                    paddingBottom: "200px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "20px",
                      left: "20px",
                      zIndex: 10,
                    }}
                    onMouseEnter={() => setShowFilterDropdown(true)}
                    onMouseLeave={() => setShowFilterDropdown(false)}
                  >
                    <div
                      style={{
                        backgroundColor: "#673ab7",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                      }}
                    >
                      <FaFilter size={18} />
                    </div>

                    {showFilterDropdown && (
                      <div
                        style={{
                          marginTop: "10px",
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "10px",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          padding: "10px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          zIndex: 100,
                        }}
                      >
                        <button
                          onClick={() => {
                            setTempInstrumentSelection(instrumentFilterList);
                            setShowInstrumentModal(true);
                            setShowFilterDropdown(false);
                          }}
                          style={{
                            backgroundColor: "#FF7F50",
                            padding: "6px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Filter by Instrument
                        </button>

                        <button
                          onClick={() => {
                            setTempGenderSelection(genderFilterList);
                            setShowGenderModal(true);
                            setShowFilterDropdown(false);
                          }}
                          style={{
                            backgroundColor: "#FF7F50",
                            padding: "6px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Filter by Gender
                        </button>

                        <button
                          onClick={() => {
                            setTempMinAge(minAgeFilter);
                            setTempMaxAge(maxAgeFilter);
                            setShowAgeModal(true);
                            setShowFilterDropdown(false);
                          }}
                          style={{
                            backgroundColor: "#FF7F50",
                            padding: "6px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Filter by Age
                        </button>
                      </div>
                    )}
                  </div>

                  <img
                    src={
                      currentUser?.attributes?.profileImage
                        ? `https://stringsattached.online${currentUser.attributes.profileImage}`
                        : noIcon
                    }
                    alt="Profile"
                    className="profile-picture"
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      margin: "0 auto",
                    }}
                    onError={(e) => {
                      e.target.src = noIcon;
                    }}
                  />

                  <h3>
                    {currentUser?.attributes?.firstName}{" "}
                    {currentUser?.attributes?.lastName}
                  </h3>
                  <p>
                    <strong>Email:</strong>{" "}
                    {currentUser?.email || "Not provided"}
                  </p>
                  <p>
                    <strong>Age:</strong>{" "}
                    {currentUser?.attributes?.age || "N/A"}
                  </p>
                  <p>
                    <strong>Gender:</strong>{" "}
                    {currentUser?.attributes?.gender &&
                    typeof currentUser.attributes.gender === "string"
                      ? currentUser.attributes.gender.charAt(0).toUpperCase() +
                        currentUser.attributes.gender.slice(1)
                      : "Not specified"}
                  </p>
                  {currentUser?.attributes?.instruments &&
                  currentUser.attributes.instruments.length > 0 ? (
                    <p>
                      <strong>Instruments:</strong>{" "}
                      {currentUser.attributes.instruments.join(", ")}
                    </p>
                  ) : (
                    <p>No instruments listed.</p>
                  )}

                  <div className="song-of-the-week">
                    <h4>Song of the Week</h4>
                    {currentUser?.attributes?.SongOfTheWeek ? (
                      <>
                        <iframe
                          width="300"
                          height="170"
                          src={`https://www.youtube.com/embed/${currentUser.attributes.SongOfTheWeek.split("v=")[1]?.split("&")[0]}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                      </>
                    ) : (
                      <p>No song of the week.</p>
                    )}
                  </div>
                  <div
                    className="button-container"
                    style={{
                      marginTop: "20px",
                      marginBottom: "40px",
                      display: "flex",
                      justifyContent: "center",
                      gap: "20px",
                    }}
                  >
                    <button className="like-button" onClick={handleLike}>
                      ❤️ Like
                    </button>
                    <button className="reject-button" onClick={handleReject}>
                      ❌ Reject
                    </button>
                  </div>
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button
                      onClick={openReviewsModal}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#673ab7",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      View Reviews
                    </button>
                  </div>

                  {showReviewsModal && (
                    <div
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 2000,
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "white",
                          padding: "20px",
                          borderRadius: "12px",
                          width: "350px",
                          maxHeight: "80vh",
                          overflowY: "auto",
                        }}
                      >
                        <h3 style={{ textAlign: "center" }}>⭐ Reviews</h3>
                        {activeProfileRatings.length > 0 && (
                          <p
                            style={{
                              textAlign: "center",
                              fontWeight: "bold",
                              fontSize: "16px",
                              margin: "10px 0",
                            }}
                          >
                            Average Rating:{" "}
                            {(
                              activeProfileRatings.reduce(
                                (sum, r) => sum + (parseFloat(r.value) || 0),
                                0
                              ) / activeProfileRatings.length
                            ).toFixed(1)}{" "}
                            / 5
                          </p>
                        )}

                        {activeProfileRatings.length === 0 ? (
                          <p
                            style={{ textAlign: "center", fontStyle: "italic" }}
                          >
                            No reviews for this user.
                          </p>
                        ) : (
                          activeProfileRatings.map((review, idx) => (
                            <div
                              key={idx}
                              style={{
                                borderBottom: "1px solid #ccc",
                                marginBottom: "10px",
                                paddingBottom: "8px",
                              }}
                            >
                              <p>
                                <strong>From:</strong>{" "}
                                {reviewers[review.reactorID] || "Anonymous"}
                              </p>
                              <p>
                                <strong>Rating:</strong> {review.value}
                              </p>
                              {review.reviewText ? (
                                <p>
                                  <em>"{review.reviewText}"</em>
                                </p>
                              ) : null}
                            </div>
                          ))
                        )}

                        <div style={{ textAlign: "center" }}>
                          <button
                            onClick={() => setShowReviewsModal(false)}
                            style={{
                              marginTop: "12px",
                              padding: "6px 14px",
                              backgroundColor: "#f44336",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="my-profile-hover">
                    <div className="hover-trigger">
                      <img
                        src={
                          currentUserProfile?.attributes?.profileImage
                            ? `https://stringsattached.online${currentUserProfile.attributes.profileImage}`
                            : noIcon
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = noIcon;
                        }}
                        alt="My Profile"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          cursor: "pointer",
                        }}
                      />
                      <div className="hover-card">
                        {currentUserProfile && (
                          <div
                            className="profile-card"
                            style={{
                              padding: "20px",
                              borderRadius: "12px",
                              textAlign: "center",
                              width: "300px",
                            }}
                          >
                            <h4>My Profile</h4>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <img
                                  src={
                                    newProfileImage
                                      ? URL.createObjectURL(newProfileImage)
                                      : currentUserProfile?.attributes
                                            ?.profileImage
                                        ? `https://stringsattached.online${currentUserProfile.attributes.profileImage}`
                                        : noIcon
                                  }
                                  onError={(e) => {
                                    e.target.onerror = null; // Prevent infinite loop
                                    e.target.src = noIcon;
                                  }}
                                  alt="My Profile"
                                  style={{
                                    width: "70px",
                                    height: "70px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                                <label
                                  htmlFor="upload-input"
                                  style={{
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    color: "#4285F4",
                                    textDecoration: "underline",
                                  }}
                                >
                                  Change Picture
                                </label>
                                <input
                                  type="file"
                                  id="upload-input"
                                  accept="image/*"
                                  onChange={handleProfileImageUpload}
                                  style={{ display: "none" }}
                                />
                                {newProfileImage && (
                                  <button
                                    onClick={handleSaveImage}
                                    style={{
                                      marginTop: "8px",
                                      padding: "6px 12px",
                                      fontSize: "12px",
                                      borderRadius: "6px",
                                      backgroundColor: "#4285F4",
                                      color: "white",
                                      border: "none",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Save Image
                                  </button>
                                )}
                              </div>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                flexWrap: "wrap",
                              }}
                            >
                              {isEditingName ? (
                                <>
                                  <input
                                    type="text"
                                    value={tempFirstName}
                                    onChange={(e) =>
                                      setTempFirstName(e.target.value)
                                    }
                                    placeholder="First name"
                                    style={{
                                      padding: "4px",
                                      fontSize: "12px",
                                      borderRadius: "4px",
                                    }}
                                  />
                                  <input
                                    type="text"
                                    value={tempLastName}
                                    onChange={(e) =>
                                      setTempLastName(e.target.value)
                                    }
                                    placeholder="Last name"
                                    style={{
                                      padding: "4px",
                                      fontSize: "12px",
                                      borderRadius: "4px",
                                    }}
                                  />
                                  <button
                                    onClick={handleSaveName}
                                    style={{
                                      backgroundColor: "#4CAF50",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      padding: "4px 8px",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Save
                                  </button>
                                </>
                              ) : (
                                <>
                                  <p>
                                    {currentUserProfile?.attributes?.firstName}{" "}
                                    {currentUserProfile?.attributes?.lastName}
                                  </p>
                                  <button
                                    onClick={() => {
                                      setTempFirstName(
                                        currentUserProfile?.attributes
                                          ?.firstName || ""
                                      );
                                      setTempLastName(
                                        currentUserProfile?.attributes
                                          ?.lastName || ""
                                      );
                                      setIsEditingName(true);
                                    }}
                                    style={{
                                      backgroundColor: "#007bff",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      padding: "4px 8px",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Edit
                                  </button>
                                </>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                justifyContent: "center",
                              }}
                            >
                              {isEditingEmail ? (
                                <>
                                  <input
                                    type="email"
                                    value={tempEmail}
                                    onChange={(e) =>
                                      setTempEmail(e.target.value)
                                    }
                                    placeholder="Enter new email"
                                    style={{
                                      padding: "4px",
                                      fontSize: "12px",
                                      borderRadius: "4px",
                                      width: "180px",
                                    }}
                                  />
                                  <button
                                    onClick={handleSaveEmail}
                                    style={{
                                      backgroundColor: "#4CAF50",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      padding: "4px 8px",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Save
                                  </button>
                                </>
                              ) : (
                                <>
                                  <p>
                                    <strong>Email:</strong>{" "}
                                    {currentUserProfile?.email ||
                                      "Not provided"}
                                  </p>
                                  <button
                                    onClick={() => {
                                      setTempEmail(
                                        currentUserProfile?.email || ""
                                      );
                                      setIsEditingEmail(true);
                                    }}
                                    style={{
                                      backgroundColor: "#007bff",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      padding: "4px 8px",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Edit
                                  </button>
                                </>
                              )}
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                justifyContent: "center",
                              }}
                            >
                              {isEditingAge ? (
                                <>
                                  <input
                                    type="number"
                                    value={tempAge}
                                    onChange={(e) => setTempAge(e.target.value)}
                                    placeholder="Enter age"
                                    style={{
                                      padding: "4px",
                                      fontSize: "12px",
                                      borderRadius: "4px",
                                      width: "100px",
                                    }}
                                  />
                                  <button
                                    onClick={handleSaveAge}
                                    style={{
                                      backgroundColor: "#4CAF50",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      padding: "4px 8px",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Save
                                  </button>
                                </>
                              ) : (
                                <>
                                  <p>
                                    <strong>Age:</strong>{" "}
                                    {currentUserProfile?.attributes?.age ||
                                      "N/A"}
                                  </p>
                                  <button
                                    onClick={() => {
                                      setTempAge(
                                        currentUserProfile?.attributes?.age ||
                                          ""
                                      );
                                      setIsEditingAge(true);
                                    }}
                                    style={{
                                      backgroundColor: "#007bff",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      padding: "4px 8px",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Edit
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="edit-gender-section">
                              <h3>Gender:</h3>
                              {isEditingGender ? (
                                <div className="gender-edit-container">
                                  <select
                                    value={userGender}
                                    onChange={(e) =>
                                      setUserGender(e.target.value)
                                    }
                                    className="gender-select"
                                  >
                                    <option value="">Select your gender</option>
                                    {genderOptions.map((gender) => (
                                      <option key={gender} value={gender}>
                                        {gender.charAt(0).toUpperCase() +
                                          gender.slice(1)}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={handleSaveGender}
                                    className="save-button"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setIsEditingGender(false)}
                                    className="cancel-button"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="gender-display">
                                  <p>
                                    {typeof userGender === "string" &&
                                    userGender
                                      ? userGender.charAt(0).toUpperCase() +
                                        userGender.slice(1)
                                      : "Not specified"}
                                  </p>
                                  <button
                                    onClick={() => setIsEditingGender(true)}
                                    className="edit-button"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </div>
                            {isEditingInstruments ? (
                              <div>
                                {[...allInstruments, ...dynamicInstruments].map(
                                  (instrument) => (
                                    <label
                                      key={instrument}
                                      style={{
                                        display: "block",
                                        margin: "4px 0",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedInstruments.includes(
                                          instrument
                                        )}
                                        onChange={() =>
                                          handleInstrumentToggle(instrument)
                                        }
                                      />
                                      {instrument}
                                    </label>
                                  )
                                )}

                                <div style={{ marginTop: "10px" }}>
                                  <input
                                    type="text"
                                    placeholder="Add custom instrument"
                                    value={customInstrument}
                                    onChange={(e) =>
                                      setCustomInstrument(e.target.value)
                                    }
                                    style={{
                                      padding: "4px",
                                      fontSize: "12px",
                                      borderRadius: "4px",
                                      marginRight: "6px",
                                    }}
                                  />
                                  <button
                                    onClick={handleAddCustomInstrument}
                                    style={{
                                      backgroundColor: "#28a745",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      padding: "4px 8px",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Add
                                  </button>
                                </div>

                                <button
                                  onClick={handleSaveInstruments}
                                  style={{
                                    marginTop: "10px",
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    borderRadius: "6px",
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <div>
                                <strong>Instruments:</strong>
                                <ul
                                  style={{ listStyleType: "none", padding: 0 }}
                                >
                                  {currentUserProfile?.attributes?.instruments?.map(
                                    (i, idx) => <li key={idx}>- {i}</li>
                                  ) || <li>No instruments listed.</li>}
                                </ul>
                                <button
                                  onClick={() => {
                                    setSelectedInstruments(
                                      currentUserProfile?.attributes
                                        ?.instruments || []
                                    );
                                    setIsEditingInstruments(true);
                                  }}
                                  style={{
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    marginTop: "5px",
                                  }}
                                >
                                  Edit
                                </button>

                                <div
                                  className="song-of-the-week"
                                  style={{ marginTop: "20px" }}
                                >
                                  <h4 style={{ fontWeight: "bold" }}>
                                    Song of the Week
                                  </h4>

                                  {isEditingSong ? (
                                    <>
                                      <input
                                        type="text"
                                        value={tempSongUrl}
                                        onChange={(e) =>
                                          setTempSongUrl(e.target.value)
                                        }
                                        placeholder="Enter YouTube URL"
                                        style={{
                                          padding: "4px",
                                          fontSize: "12px",
                                          borderRadius: "4px",
                                          width: "100%",
                                        }}
                                      />
                                      <div
                                        style={{
                                          marginTop: "8px",
                                          display: "flex",
                                          justifyContent: "center",
                                          gap: "8px",
                                        }}
                                      >
                                        <button
                                          onClick={handleSaveSong}
                                          style={{
                                            backgroundColor: "#4CAF50",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            padding: "4px 8px",
                                            fontSize: "12px",
                                            cursor: "pointer",
                                          }}
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() =>
                                            setIsEditingSong(false)
                                          }
                                          style={{
                                            backgroundColor: "#ccc",
                                            border: "none",
                                            borderRadius: "4px",
                                            padding: "4px 8px",
                                            fontSize: "12px",
                                            cursor: "pointer",
                                          }}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      {currentUserProfile?.attributes
                                        ?.SongOfTheWeek ? (
                                        <iframe
                                          width="300"
                                          height="170"
                                          src={`https://www.youtube.com/embed/${currentUserProfile.attributes.SongOfTheWeek.split("v=")[1]?.split("&")[0]}`}
                                          title="YouTube video player"
                                          frameBorder="0"
                                          allowFullScreen
                                        ></iframe>
                                      ) : (
                                        <p style={{ fontFamily: "monospace" }}>
                                          No song of the week.
                                        </p>
                                      )}
                                      <button
                                        onClick={() => {
                                          setTempSongUrl(
                                            currentUserProfile?.attributes
                                              ?.SongOfTheWeek || ""
                                          );
                                          setIsEditingSong(true);
                                        }}
                                        style={{
                                          marginTop: "8px",
                                          backgroundColor: "#007bff",
                                          color: "white",
                                          border: "none",
                                          borderRadius: "4px",
                                          padding: "4px 8px",
                                          fontSize: "12px",
                                          cursor: "pointer",
                                        }}
                                      >
                                        Edit
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <p>No profiles available.</p>
          )}
        
      </div>
    </div>
  );
};

export default Profiles;
