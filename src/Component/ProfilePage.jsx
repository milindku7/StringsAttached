import React, { useState, useEffect, useCallback } from "react";
import noIcon from "../../src/assets/noicon.jpg"; // Default profile picture if the user did not upload anything yet

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState(noIcon);
  const [latestFileID, setLatestFileID] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [age, setAge] = useState(""); 
  const [tempAge, setTempAge] = useState("");



  useEffect(() => {
    autoLogin();
    fetchUserProfile();
  }, []);

  const fetchLatestProfilePicture = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");

    if (!token || !userID) {
      console.error("Authentication token or user ID missing.");
      return;
    }

    try {
      const response = await fetch(
        `https://webdev.cse.buffalo.edu/hci/api/api/claem/file-uploads?uploaderID=${userID}&take=1`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
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

      const latestImage = images.reduce((prev, current) =>
        prev.id > current.id ? prev : current
      );

      setLatestFileID(latestImage.id);
    } catch (error) {
      console.error("Error fetching latest profile picture:", error);
    }
  }, []);

  useEffect(() => {
    if (latestFileID) {
      fetchImageByID(latestFileID);
    } else {
      fetchLatestProfilePicture();
    }
  }, [latestFileID, fetchLatestProfilePicture]);

  const autoLogin = () => {
    const token = "claem|5hg9RaDbaiZopfxBX8BMXP_O8stKoagj4G77bpQYWF8"; // Manually added user session here 
    const userID = "823";

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", userID);
    console.log("Auto-login successful!");
  };

  const fetchUserProfile = async () => {
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");
    

    if (!token || !userID) {
      console.error("No token or user ID found!");
      return;
    }

    try {
      const response = await fetch(
        `https://webdev.cse.buffalo.edu/hci/api/api/claem/users/${userID}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const userData = await response.json();
      setUser(userData);
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setAge(userData.age || "");

      setEmail(userData.email || "");
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchImageByID = async (fileID) => {
    const token = sessionStorage.getItem("token");

    if (!token || !fileID) {
      console.error("Authentication token or file ID missing.");
      return;
    }

    try {
      const response = await fetch(
        `https://webdev.cse.buffalo.edu/hci/api/api/claem/file-uploads/${fileID}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!data.path) {
        console.warn("No image found for this ID.");
        return;
      }

      let imageUrl = data.path;
      if (!imageUrl.startsWith("http")) {
        imageUrl = `https://webdev.cse.buffalo.edu${imageUrl}?t=${new Date().getTime()}`;
      }

      setProfilePicUrl(imageUrl);
    } catch (error) {
      console.error("Error fetching image by ID:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("Please select a file to upload.");
      return;
    }

    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");

    if (!token || !userID) {
      setUploadMessage("Authentication required. Please log in.");
      return;
    }

    const formData = new FormData();
    formData.append("uploaderID", userID);
    formData.append("attributes", JSON.stringify({}));
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://webdev.cse.buffalo.edu/hci/api/api/claem/file-uploads",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      setUploadMessage("Profile picture uploaded successfully!");

      if (data.id) {
        setLatestFileID(data.id);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadMessage("Error uploading file: " + error.message);
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
      const response = await fetch(
        `https://webdev.cse.buffalo.edu/hci/api/api/claem/users/${userID}`, 
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ age: tempAge }), // update the age
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update age.");
      }
  
      setAge(tempAge);
      console.log("Age updated successfully!");
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
        `https://webdev.cse.buffalo.edu/hci/api/api/claem/users/${userID}`,
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
  
  const updateFullName = async () => {
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");

    if (!token || !userID) {
      console.error("Authentication token or user ID missing.");
      return;
    }

    try {
      const response = await fetch(
        `https://webdev.cse.buffalo.edu/hci/api/api/claem/users/${userID}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
          }),
        }
      );
      

      if (!response.ok) {
        throw new Error("Failed to update full name.");
      }
      console.log("Full name updated successfully!");
    } catch (error) {
      console.error("Error updating full name:", error);
    }
  };

  return (
    <div>
      <div >
        <h2>Profile Page</h2>

        {/* Profile Picture */}
        <div>
          <img 
            src={profilePicUrl} 
            alt="Profile" 
            style={{ width: "100px", height: "100px" }}
          />
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button onClick={handleUpload}>
            Upload Profile Picture
          </button>
          {uploadMessage && <p>{uploadMessage}</p>}
        </div>

        {/* User Information */}
        <div className="text-left">
          <p>Full Name: <span className="text-gray-300">{user?.firstName || "First"} {user?.lastName || "Last"}</span></p>
          <p >Email: <span className="text-gray-300">{email || "No email available"}</span></p>
          <p>Age: <span className="text-gray-300">{age || "Not provided"}</span></p>
        </div>

        {/* Update Fields */}
        <div className="mt-6 space-y-4">
          <div className="flex space-x-2">
            <input type="email" value={tempEmail} onChange={(e) => setTempEmail(e.target.value)} placeholder="Enter new email" />
            <button onClick={updateEmail} >Update Email</button>
          </div>

          <div>
            <input type="number" value={tempAge} onChange={(e) => setTempAge(e.target.value)} placeholder="Enter new age" />
            <button onClick={updateAge}>Update Age</button>
          </div>

          <div >
            <input type="text" value={firstName} placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} />
            <input type="text" value={lastName} placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} />
            <button onClick={updateFullName} >Update Name</button>
          </div>
        </div>

      </div>
    </div>
  );

};

export default ProfilePage;