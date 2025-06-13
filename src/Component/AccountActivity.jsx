import React, {useState, useEffect, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import "../styles/Style.css";
import "../styles/Account-Activity.css"
import DecorBackground from "./DecorBackground"; // update path if needed


// AccountActivity component simulates an account activity page
function AccountActivity() {
  const [url, setUrl] = useState(""); // Store the YouTube URL
  const [showUrlInput, setShowUrlInput] = useState(false); // Control visibility of YouTube URL input field
  const [successMessage, setSuccessMessage] = useState("");
  // const [isURLAdded, setURLAdded] = useState(false);
  // const [user, setUser] = useState(null);
  const [instrumentsList, setInstrumentsList] = useState([
    "Guitar", "Piano", "Drums", "Violin", "Bass", "Saxophone",
    "Trumpet", "Trombone", "Tuba", "Clarinet", "Flute", "Euphonium",
    "Cello", "French Horn", "Vocals"
  ]);
  const [customInstrument, setCustomInstrument] = useState("");
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const [showGenderPreferences, setShowGenderPreferences] = useState(false);
  const [genderPreferences, setGenderPreferences] = useState({
    male: true,
    female: true,
    nonbinary: true
  });
  const userToken = sessionStorage.getItem("token");
      const navigate = useNavigate();
  
  
      useEffect(() => {
        console.log(userToken);
        if (!userToken) {
          navigate("/");
        }
      }, [userToken, navigate]);
  
  // Handle input change for the URL
  const handleUrlChange = (e) => {
    setUrl(e.target.value); // Update URL as the user types
  };

  // Handle the "Add Song" button click
  const handleAddSongClick = () => {
    setShowUrlInput((prev) => !prev); // Show the URL input field when the "Add Song" button is clicked
  };
  const handleGenderPreferenceChange = (gender) => {
    setGenderPreferences (prev => ({
      ...prev,
      [gender]: !prev[gender]
    }));
  };
  const handleSaveGenderPreferences = async () => {
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");

    if (!token || !userID) {
      console.error("Authentication token or user ID missing.");
      return;
    }

    try {
      // First get current user attributes
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

      

      // Update with new gender preferences
      const updatedAttributes = {
        ...existingAttributes,
        genderPreferences: genderPreferences
      };

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

      if (!response.ok) {
        throw new Error("Failed to update gender preferences.");
      }

      setSuccessMessage("Gender preferences updated successfully!");
      setShowGenderPreferences(false);

    } catch (error) {
      console.error("Error updating gender preferences:", error);
      setSuccessMessage("Failed to update gender preferences.");
    }
  };
  useEffect(() => {
    const fetchGenderPreferences = async () => {
      const token = sessionStorage.getItem("token");
      const userID = sessionStorage.getItem("user");

      if (!token || !userID) return;

      try {
        const response = await fetch(
          `https://www.stringsattached.online/api/api/default/users/${userID}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const userData = await response.json();
        const savedPreferences = userData.attributes?.genderPreferences || {
          male: true,
          female: true,
          nonbinary: true
        };

        setGenderPreferences(savedPreferences);

      } catch (error) {
        console.error("Error fetching gender preferences:", error);
      }
    };

    fetchGenderPreferences();
  }, []);

  const handleDelete = async () => {
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");
  
    if (!token || !userID) {
      setSuccessMessage("Authentication required.");
      return;
    }
  
    try {
      // Fetch current user attributes
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
      const currentAttributes = userData.attributes || {};
  
      // Clear the SongOfTheWeek field
      const response = await fetch(
        `https://www.stringsattached.online/api/api/default/users/${userID}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attributes: {
              ...currentAttributes,
              SongOfTheWeek: "",
            },
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to delete Song of the Week.");
      }
  
      setUrl("");
      // setURLAdded(false);
      setSuccessMessage("YouTube Link has been removed!");
  
    } catch (error) {
      console.error("Error deleting Song of the Week:", error);
      setSuccessMessage("Failed to remove the YouTube link.");
    }
  };
  useEffect(() => {
    let timer;
    
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000); // Auto-dismiss after 5 seconds
      
      const handleClick = () => {
        setSuccessMessage("");
      };
      
      document.addEventListener("click", handleClick);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handleClick);
      };
    }
  }, [successMessage]);


  const handleSubmitUrl = async () => {
    const regex = new RegExp(
        '(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/(?:[^\\/]+\\/[^?]+|\\S*\\?v=|v\\/|e\\/|u\\/\\w\\/)?([^#&?]*)|youtu\\.be\\/([^#&?]*)'
    );
    const match = url.match(regex);
    const videoId = match?.[1] || match?.[2];
  
    if (!videoId) {
      setSuccessMessage("Invalid Youtube URL, please try a valid link!");
      return;
    }
  
    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");
  
    try {
      // Get current user attributes
      const userResponse = await fetch(
        `https://www.stringsattached.online/api/api/default/users/${userID}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const userData = await userResponse.json();
      const existingAttributes = userData.attributes || {};
  
      // Update SongOfTheWeek attribute
      const patchResponse = await fetch(
        `https://www.stringsattached.online/api/api/default/users/${userID}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attributes: {
              ...existingAttributes,
              SongOfTheWeek: url, // full YouTube URL or video ID depending on how you want to embed it
            },
          }),
        }
      );
  
      if (!patchResponse.ok) {
        throw new Error("Failed to update Song of the Week.");
      }
  
      // setURLAdded(true);
      setSuccessMessage("YouTube link added successfully!");
    } catch (err) {
      console.error("Error saving YouTube link:", err);
      setSuccessMessage("Failed to save YouTube link.");
    }
  };
  


  const handleCheckboxChange = (instrument) => {
    setSelectedInstruments((prev) =>
        prev.includes(instrument)
            ? prev.filter((item) => item !== instrument) // Remove if already selected
            : [...prev, instrument] // Add if not selected
    );
  };

  const handleAddCustomInstrument = () => {
    if (!customInstrument.trim()) return;

    setInstrumentsList((prev) => [...new Set([...prev, customInstrument.trim()])]); // Add to options
    setSelectedInstruments((prev) => [...new Set([...prev, customInstrument.trim()])]); // Select it
    setCustomInstrument(""); // Clear input
  };

  useEffect(() => {
    const fetchUserInstruments = async () => {
      const token = sessionStorage.getItem("token");
      const userID = sessionStorage.getItem("user");

      if (!token || !userID) {
        console.error("Authentication token or user ID missing.");
        return;
      }

      try {
        const response = await fetch(
            `https://www.stringsattached.online/api/api/default/users/${userID}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data.");
        }

        const userData = await response.json();
        const savedInstruments = userData.attributes?.instruments || [];

        setSelectedInstruments(savedInstruments);

        // Merge saved custom instruments into instrumentsList if they aren't already there
        setInstrumentsList((prev) => [
          ...new Set([...prev, ...savedInstruments]),
        ]);

      } catch (error) {
        console.error("Error fetching user instruments:", error);
      }
    };

    fetchUserInstruments();
  }, []);

  const fetchSelectedInstruments = useCallback(async () => {
    const storedInstruments = sessionStorage.getItem('selectedInstruments');

    if (storedInstruments) {
      // Parse and set the selected instruments if stored in sessionStorage
      setSelectedInstruments(JSON.parse(storedInstruments));
    }
  }, []);

  useEffect(() => {
    fetchSelectedInstruments();
  }, [fetchSelectedInstruments]);

  const handleSaveInstruments = async () => {
    if (selectedInstruments.length === 0) {
      alert("Please select at least one instrument.");
      return;
    }

    const token = sessionStorage.getItem("token");
    const userID = sessionStorage.getItem("user");

    if (!token || !userID) {
      console.error("Authentication token or user ID missing.");
      return;
    }

    try {
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

      if (!userResponse.ok) {
        throw new Error("Failed to fetch current user attributes.");
      }

      const userData = await userResponse.json();
      const existingAttributes = userData.attributes || {};

      const updatedAttributes = {
        ...existingAttributes,
        instruments: selectedInstruments, // Save selected instruments
      };
      console.log(selectedInstruments)
      for (let i = 0; i < selectedInstruments.length; i++) {
        let inst = selectedInstruments[i]
        const response0 = await fetch(
          `https://www.stringsattached.online/api/api/default/groups?name=${inst}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
      );

      if (!response0.ok) {
        throw new Error("There's an error finding groups.");
      }

      const userData = await response0.json();
      const groupexists = userData[1];
      if (groupexists === 0) {
        const response2 = await fetch(
          `https://www.stringsattached.online/api/api/default/groups`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: inst,
              attributes: {}
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
    if (!response3.ok) {
      throw new Error("There's an error adding people to the group.");
    }
    console.log(response3.json());
    }

    else {
      console.log(userData)
      const GID = userData[0][0].id;
      console.log("GID",GID)
      const response5 = await fetch(
        `https://www.stringsattached.online/api/api/default/group-members?userID=${userID}&groupID=${GID}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
    );

    if (!response5.ok) {
      throw new Error("There's an error finding groups related to this person.");
    }

    const dat = await response5.json();
    const areTheyintoG = dat[1];

    if (areTheyintoG === 0) {
      const response4 = await fetch(
        `https://www.stringsattached.online/api/api/default/group-members`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID: sessionStorage.getItem("user"),
            groupID: GID,
            attributes: {}
          })
        }
    );
    if (!response4.ok) {
      throw new Error("There's an error adding people to the group.");
    }
    console.log(response4.json());
  }
    }
      }

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

      if (!response.ok) {
        throw new Error("Failed to update instruments.");
      }

      console.log("Instruments updated successfully!");
      alert("Instruments updated successfully.");

    } catch (error) {
      console.error("Error updating instruments:", error);
    }
  };
  return (
    <div className="account-activity-wrapper" >
        <DecorBackground />

    

     
      {/* Main content container */}
      <div 
        className="account-activity-container"
        style={{
          backgroundColor: '#800080',
          borderRadius: '20px',
          height: 'auto',
          padding: '40px',
          maxWidth: '800px',
          margin: '70px auto',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          overflowY: 'auto',
    maxHeight: 'calc(100vh - 100px)',// Accounts for header/margins
        }}
      >
        <h1 style={{ 
          color: 'white',
          textAlign: 'center',
          marginBottom: '50px',
          marginTop: '0',
        }}>
          Preferences
        </h1>

        {/* Song Section */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick = {handleAddSongClick}
            style={{
              backgroundColor: '#FF7F50',
              color: 'black',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              width: '250px',
              maxWidth: '100%',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            {showUrlInput ? 'Cancel' : 'Add Youtube Link'}
          </button>

          {showUrlInput && (
            <div style={{ 
              marginTop: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '20px',
              borderRadius: '15px',
            }}>
              <input
                type="text"
                placeholder="Enter YouTube URL"
                value={url}
                onChange={handleUrlChange}
                style={{
                  padding: '12px 15px',
                  borderRadius: '25px',
                  border: '1px solid #ddd',
                  width: '100%',
                  marginBottom: '15px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleSubmitUrl}
                  style={{
                    backgroundColor: '#FF7F50',
                    color: 'black',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    flex: 1
                  }}
                >
                  Submit
                </button>
                <button 
                  onClick={handleDelete}
                  style={{
                    backgroundColor: '#FF7F50',
                    color: 'black',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    flex: 1
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {successMessage && (
            <div style={{
              color: 'white',
              backgroundColor: 'rgba(255, 127, 80, 0.2)',
              padding: '10px 15px',
              borderRadius: '25px',
              margin: '15px 0',
              textAlign: 'center',
              border: '1px solid #FF7F50'
            }}>
              {successMessage}
            </div>
          )}
        </div>

        {/* Instruments Section */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => setShowCheckboxes(!showCheckboxes)}
            style={{
              backgroundColor: '#FF7F50',
              color: 'black',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              width: '250px',
              maxWidth: '100%',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              marginBottom: '20px'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            {showCheckboxes ? 'Hide Instruments' : 'Manage Instruments'}
          </button>

          {showCheckboxes && (
            <div style={{ 
              marginTop: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '20px',
              borderRadius: '15px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '10px',
                marginBottom: '20px'
              }}>
                {instrumentsList.map((instrument) => (
                  <label key={instrument} style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: selectedInstruments.includes(instrument) 
                      ? 'rgba(255, 127, 80, 0.2)' 
                      : 'transparent',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    transition: 'all 0.2s'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedInstruments.includes(instrument)}
                      onChange={() => handleCheckboxChange(instrument)}
                      style={{ 
                        marginRight: '8px',
                        accentColor: '#FF7F50'
                      }}
                    />
                    {instrument}
                  </label>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <input
                  type="text"
                  placeholder="Add custom instrument"
                  value={customInstrument}
                  onChange={(e) => setCustomInstrument(e.target.value)}
                  style={{
                    padding: '12px 15px',
                    borderRadius: '25px',
                    border: '1px solid #ddd',
                    flex: 1
                  }}
                />
                <button 
                  onClick={handleAddCustomInstrument}
                  style={{
                    backgroundColor: '#FF7F50',
                    color: 'black',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Add
                </button>
              </div>
              
              <button 
                onClick={handleSaveInstruments}
                style={{
                  backgroundColor: '#FF7F50',
                  color: 'black',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginTop: '20px',
                  width: '100%',
                  fontSize: '16px'
                }}
              >
                Save Instrument Selections
              </button>
            </div>
          )}
          <div>
          <button 
            onClick={() => setShowGenderPreferences(!showGenderPreferences)}
            style={{
              backgroundColor: '#FF7F50',
              color: 'black',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              width: '250px',
              maxWidth: '100%',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              marginBottom: '20px'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            {showGenderPreferences ? 'Hide Gender Preferences' : 'Edit Gender Preferences'}
          </button>

          {showGenderPreferences && (
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                color: '#800080',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                Show me profiles of:
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: genderPreferences.male ? 'rgba(255, 127, 80, 0.2)' : 'transparent',
                  padding: '10px 15px',
                  borderRadius: '20px',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="checkbox"
                    checked={genderPreferences.male}
                    onChange={() => handleGenderPreferenceChange('male')}
                    style={{ 
                      marginRight: '10px',
                      width: '18px',
                      height: '18px',
                      accentColor: '#FF7F50'
                    }}
                  />
                  Male
                </label>
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: genderPreferences.female ? 'rgba(255, 127, 80, 0.2)' : 'transparent',
                  padding: '10px 15px',
                  borderRadius: '20px',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="checkbox"
                    checked={genderPreferences.female}
                    onChange={() => handleGenderPreferenceChange('female')}
                    style={{ 
                      marginRight: '10px',
                      width: '18px',
                      height: '18px',
                      accentColor: '#FF7F50'
                    }}
                  />
                  Female
                </label>
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: genderPreferences.nonbinary ? 'rgba(255, 127, 80, 0.2)' : 'transparent',
                  padding: '10px 15px',
                  borderRadius: '20px',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="checkbox"
                    checked={genderPreferences.nonbinary}
                    onChange={() => handleGenderPreferenceChange('nonbinary')}
                    style={{ 
                      marginRight: '10px',
                      width: '18px',
                      height: '18px',
                      accentColor: '#FF7F50'
                    }}
                  />
                  Non-binary
                </label>
              </div>
              
              <button 
                onClick={handleSaveGenderPreferences}
                style={{
                  backgroundColor: '#FF7F50',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '100%',
                  fontSize: '16px',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default AccountActivity;