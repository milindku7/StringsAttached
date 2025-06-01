import React, { useState, useEffect, useContext } from "react";
import { PiPencilCircleThin } from "react-icons/pi";
import "../styles/Profile.css";
import ProfilePictureContext from "./ProfilePictureContext";
import checkmark from "../assets/checkmark.svg"
import redex from "../assets/red_x.svg"

const Profile = () => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { profilePicture, setProfilePicture } = useContext(ProfilePictureContext); // Use context

  // Fetch user data on mount
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
        .then((res) => res.json())
        .then((result) => {
          if (result && result.attributes) {
            setFirstName(result.attributes.firstName || "");
            setEmail(result.attributes.email || "");
            setAge(result.attributes.age || "");
            setProfilePicture(result.attributes.picture || profilePicture || ""); // Update context
          }
        })
        .catch(() => alert("Error loading profile data!"));
  }, []);

  // Submit updated profile data
  const submitHandler = (event) => {
    event.preventDefault();

    fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        attributes: {
          firstName,
          email,
          age,
          picture: profilePicture, // Include the profile picture in the update
        },
      }),
    })
        .then(() => alert("Profile updated successfully!"))
        .catch(() => alert("Error updating profile!"));
  };

  // Upload profile picture
  const uploadPicture = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("uploaderID", sessionStorage.getItem("user"));
    formData.append("attributes", JSON.stringify({}));
    formData.append("file", file);

    fetch(process.env.REACT_APP_API_PATH + "/file-uploads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: formData,
    })
        .then((res) => res.json())
        .then((result) => {
          let pictureURL = "https://webdev.cse.buffalo.edu" + result.path;
          setProfilePicture(pictureURL); // Update context
          sessionStorage.setItem("profilePicture", pictureURL); // Store in sessionStorage
        })
        .catch(() => alert("Error uploading picture!"));
  };

  // Delete profile picture
  const deletePicture = () => {
    if (!profilePicture) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this photo? It will be gone forever.");
    if (!confirmDelete) return;

    fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        attributes: {
          picture: "",
        },
      }),
    })
        .then(() => {
          setProfilePicture(""); // Update context
          sessionStorage.removeItem("profilePicture"); // Remove from sessionStorage
        })
        .catch(() => alert("Error deleting profile picture!"));
  };

    const deleteAccount = async () => {
      try {
        const user = sessionStorage.getItem("user");
        console.log("User from session:", user);

        const userDataResponse = await fetch(`${process.env.REACT_APP_API_PATH}/users/${user}`);

        const userData = await userDataResponse.json();
        console.log("User Data:", userData);

        const userId = userData.id;
        const relatedObjectsAction = "delete";

        console.log("Deleting user:", userId);

        console.log("Auth Token: ", sessionStorage.getItem("token"));

        // DELETE request
        const response = await fetch(
            `${process.env.REACT_APP_API_PATH}/users/${userId}?relatedObjectsAction=${relatedObjectsAction}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
              },
            }
        );

        if (response.status === 204) {
          alert("Account successfully deleted!");
          sessionStorage.clear();
          window.location.href = "/";
        } else {
          const errorData = await response.json();
          console.error("Delete error:", errorData);
          alert(errorData.message || "Failed to delete account.");
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account. Please try again.");
      }
    };

  return (
      <div className="profile-container">
        <div className="profile-box">
          {/* Profile Picture Upload/Delete */}
          <div className="profile-picture-container">
            <label htmlFor="file-upload" className="profile-picture">
              {profilePicture ? (
                  <img src={profilePicture} alt="Profile" onClick={deletePicture} title="Click to delete" />
              ) : (
                  "Click to upload"
              )}
              <PiPencilCircleThin className="edit-icon" />
            </label>
            <input id="file-upload" type="file" accept="image/*" onChange={uploadPicture} hidden />
          </div>

          {/* Profile Form */}
          <form onSubmit={submitHandler} className="profile-form">
            <label>First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />

            <label>Edit Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <label>Edit Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />

            <button type="submit" className="button submit-button">Submit</button>
          </form>

          {/* DELETE ACCOUNT BUTTON */}
          <button onClick={() => setDeleteOpen(true)}
                  className="button delete-button">
            Delete My Account</button>

          {deleteOpen && (
              <div className="delete-popup-overlay">
                <div className="delete-popup">
                  <p><b>Are you sure you want to delete your account?</b></p>

                  <img src={checkmark} alt="checkmark" style={{width: "75px"}}
                       onClick={() => {deleteAccount(); setDeleteOpen(false); }} />

                  <img src={redex} alt="red x" style={{width: "75px"}}
                       onClick={() => { setDeleteOpen(false); }} />
                </div>
              </div>
              )}
        </div>
      </div>
  );
};

export default Profile;