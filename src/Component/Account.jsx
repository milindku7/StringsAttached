import React, { useState, useEffect, useContext } from "react";
import "../styles/Account.css";
import ProfilePictureContext from "./ProfilePictureContext";
// import {Link, useNavigate} from "react-router-dom"
import {Link, useNavigate} from "react-router-dom"

const Account = () => {
    const [uploadedImages, setUploadedImages] = useState(["", "", "", "", ""]);
    const { profilePicture, setProfilePicture } = useContext(ProfilePictureContext); // Use context
    const navigate = useNavigate();
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 680);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth > 680);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const imageBoxStyle = isMobileView
    ? {
        width: "110px",
        height: "140px",
        fontSize: "12px",
        borderRadius: "8px"
    }
    : {
        width: "70px",
        height: "90px",
        fontSize: "10px",
        borderRadius: "6px"
    };

    useEffect(() => {
      console.log(sessionStorage.getItem("token"));
      if (!sessionStorage.getItem("token")) {
        navigate("/");
      }
    }, [navigate]);

    // const imageStyle = {
    //     maxWidth: "100%",
    //     maxHeight: "100%",
    //     objectFit: "contain",
    //     borderRadius: imageBoxStyle.borderRadius
    // };

    // Handle image upload
    const handleImageUpload = (event, index) => {
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
                let imageUrl = "https://www.stringsattached.online" + result.path;

                if (index === -1) {
                    // Update the profile picture in the context
                    setProfilePicture(imageUrl);
                    sessionStorage.setItem("profilePicture", imageUrl); // Store in sessionStorage
                } else {
                    // Update the additional images
                    let newImages = [...uploadedImages];
                    newImages[index] = imageUrl;
                    setUploadedImages(newImages);
                }
            })
            .catch(() => alert("Error uploading picture!"));
    };

    // Delete profile picture
    const deleteProfilePicture = () => {
        if (!profilePicture) return;

        const confirmDelete = window.confirm("Are you sure you want to delete your photo? It will be gone forever.");
        if (!confirmDelete) return;

        // Clear the profile picture in the context
        setProfilePicture("");
        sessionStorage.removeItem("profilePicture"); // Remove from sessionStorage
    };

    return (
        <div className="account-container">
            <h2 className="account-title">My Profile</h2>
            
            <div className="image-grid">
                {/* Profile Picture */}
                <label
                    className="image-box"
                    style={imageBoxStyle}

                >
                    {profilePicture ? (
                        <img
                            src={profilePicture}
                            alt="Profile"
                            onClick={deleteProfilePicture} // Add delete functionality
                            title="Click to delete"
                        />
                    ) : (
                        "Click to upload"
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, -1)} // Use index -1 for profile picture
                        hidden
                    />
                </label>

                {/* Additional Uploadable Image Boxes */}
                {uploadedImages.map((image, index) => (
    <label
        key={index}
        className="image-box"
        style={imageBoxStyle}

    >
        {image ? (
            <img
                src={image}
                alt={`Uploaded ${index + 1}`}
                style={imageBoxStyle}

            />
        ) : (
            "Click to upload"
        )}
        <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, index)}
            hidden
        />
    </label>
))}

            </div>

            {/* Account Activity Updates Button */}
            <Link to ="/account-activity">
            <button className="activity-button">Account Activity Updates</button>
            </Link>
        </div>
    );
};

export default Account;
