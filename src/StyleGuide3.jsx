import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function StyleGuide3() {

    const navigate = useNavigate();
    const [showText, setShowText] = useState(false);
    
        const handleClick = () => {
            navigate("/"); // Navigate to the specified path
          };

          const handleButtonClick = (id) => {
            if (showText === true) {
                setShowText(false);
            }else {
                setShowText(true);
            }
            
          };
    const purple = '<div style={{width: "100%", height: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center", display: "inline-flex"}}><div style={{width: 195, height: 270, position: "relative"}}><div style={{width: 195, height: 270, left: 0, top: 0, position: "absolute", background: "#DD94EA", borderRadius: 33}} /><div style={{width: 140, height: 140, left: 28, top: 65, position: "absolute"}}><div style={{width: 140, height: 140, left: 0, top: 0, position: "absolute", background: "#C64042", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", borderRadius: 9999}} /><div style={{width: 118.46, height: 0, left: 113.92, top: 30.15, position: "absolute", transform: "rotate(135deg)", transformOrigin: "top left", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", border: "3px #1E1E1E solid"}}></div><div style={{width: 118.46, height: 0, left: 30.15, top: 30.15, position: "absolute", transform: "rotate(45deg)", transformOrigin: "top left", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", border: "3px #1E1E1E solid"}}></div></div></div></div>'
    return (

<div
  className="register-container"
  style={{
    minHeight: "100vh",
    maxHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
    paddingBottom: "4rem"
  }}
>
        <br/>
        

        <div style={{alignItems: "center"}}>
      <div>
        <button type="submit" className="login-button" onClick={handleButtonClick}>Style</button>
        </div>
        <br/>
        <br/>

        <div style={{overflowY: "scroll", overflowX: "scroll", alignItems: 'center', width: 1200, height: 500 }}>
        <div
  className="input-error"
  style={{
    color: "#42C640", // or #42C640 for success
    textAlign: "center",
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "break-word", // helps break long words
    width: "100%",
    maxWidth: "90vw", // limits it to the viewport
    margin: "0 auto",
  }}
>Success condition message: Jetbrains Mono ExtraBold, 14, Center, #42C640</div>

<div className="form-group">
      {showText && <label style={{color:"black", backgroundColor:"white"}}>CSS:
        color: #42c640;
    font-size: 14px;
    margin-top: 5px;</label>}
      </div>



      <div
  className="input-error"
  style={{
    color: "#FF0000", // or #42C640 for success
    textAlign: "center",
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "break-word", // helps break long words
    width: "100%",
    maxWidth: "90vw", // limits it to the viewport
    margin: "0 auto",
  }}
>Error condition message: Jetbrains Mono ExtraBold, 14, Center, #FF0000</div>

<div className="form-group">
      {showText && <label style={{color:"black", backgroundColor:"white"}}>CSS:
        color: #ff0000;
    font-size: 14px;
    margin-top: 5px;</label>}
      </div>



<br/>
<div style={{width: 195, height: 270, flexDirection: "column", justifyContent: "center", alignItems: "center", display: "inline-flex"}}>
    <div style={{width: 195, height: 270, position: "relative"}}>
        <div style={{width: 195, height: 270, left: 0, top: 0, position: "absolute", background: "#DD94EA", borderRadius: 33}} />
        <div style={{width: 140, height: 140, left: 28, top: 65, position: "absolute"}}>
            <div style={{width: 140, height: 140, left: 0, top: 0, position: "absolute", background: "#C64042", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", borderRadius: 9999}} />
            <div style={{width: 118.46, height: 0, left: 113.92, top: 30.15, position: "absolute", transform: "rotate(135deg)", transformOrigin: "top left", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", border: "3px #1E1E1E solid"}}></div>
            <div style={{width: 118.46, height: 0, left: 30.15, top: 30.15, position: "absolute", transform: "rotate(45deg)", transformOrigin: "top left", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", border: "3px #1E1E1E solid"}}></div>
        </div>
    </div>
</div>

      {showText && <label style={{color:"black", backgroundColor:"white"}}>{purple}
        
</label>}
    <br/>
    <button type="submit" class="login-button" onClick={handleClick}>Next</button>

    </div>
    </div>
    </div>





    )

}
export default StyleGuide3;
