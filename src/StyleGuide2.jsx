import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function StyleGuide2() {

    const navigate = useNavigate();
    const [showText, setShowText] = useState(false);

    const handleButtonClick = (id) => {
      if (showText === true) {
          setShowText(false);
      }else {
          setShowText(true);
      }
      
    };

    const handleClick = () => {
        navigate('/StyleGuide3'); // Navigate to the specified path
      };

    const styles = {
        container: {
          fontFamily: '"JetBrains Mono",monospace',
          backgroundColor: '#000000', // Light background for contrast
          padding: '20px',
          width: '50%',
          margin: '20px auto',
          border: '1px solid #ddd',
          borderRadius: '5px',
        },
        colorItem: {
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
        },
        colorBox: {
          width: '30px',
          height: '30px',
          marginRight: '10px',
          border: '1px solid #ccc',
        },
        text: {
          margin: 0,
        },
      };
    
      const colors = [
        { hex: '#000000', description: 'For text' },
        { hex: '#FF0000', description: 'For Delete My Account Button and Errors' },
        { hex: '#42C640', description: 'For Check Mark and Successful conditions' },
        { hex: '#C64042', description: 'For Wrong Mark' },
        { hex: '#d1d1d1', description: 'For text input boxes' },
        { hex: '#ffcc33', description: 'For Buttons' },
      ];

      const promptbox = 'HTML:                                            <div style="width: 377px; height: 178px; position: relative; background: rgb(255, 165, 0); border-radius: 45px; overflow: hidden;"><div style="width: 346px; height: 84px; left: 21px; top: 7px; position: absolute; color: black; font-size: 20px; font-family: JetBrains Mono; font-weight: 800; letter-spacing: 2.4px; overflow-wrap: break-word;">Box: 377x178, Middle, #FFA500, 20, Jetbrains Mono ExtraBold, Left, #000000<br></div><div style="width: 65px; height: 65px; left: 54px; top: 105px; position: absolute; background: rgb(66, 198, 64); box-shadow: rgba(0, 0, 0, 0.25) 0px 4px 4px; border-radius: 9999px;"></div><div style="width: 65px; height: 65px; left: 246px; top: 105px; position: absolute; background: rgb(198, 64, 66); box-shadow: rgba(0, 0, 0, 0.25) 0px 4px 4px; border-radius: 9999px;"></div><div style="width: 51px; height: 0px; left: 110px; top: 115px; position: absolute; transform: rotate(118deg); transform-origin: left top 0px; box-shadow: rgba(0, 0, 0, 0.25) 0px 4px 4px; border: 5px solid white;"></div><div data-svg-wrapper="true" style="left: 60px; top: 139px; position: absolute;"><svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2.5L20 23.5" stroke="white" stroke-width="5"></path></svg></div><div style="width: 55px; height: 0px; left: 258px; top: 115px; position: absolute; transform: rotate(45deg); transform-origin: left top 0px; box-shadow: rgba(0, 0, 0, 0.25) 0px 4px 4px; border: 3px solid black;"></div><div style="width: 55px; height: 0px; left: 298.89px; top: 119px; position: absolute; transform: rotate(135deg); transform-origin: left top 0px; box-shadow: rgba(0, 0, 0, 0.25) 0px 4px 4px; border: 3px solid black;"></div></div>';

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
    paddingBottom: "4rem" // optional bottom padding
  }}
>

        <br/>
        

        <div style={{ 
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
}}>      <div style={{paddingTop: 30}}>
        <button type="submit" className="login-button" onClick={handleButtonClick}>Style</button>
        </div>


        
    <div style={{overflowY: "scroll", height: 500, overflowX: "scroll", width: 1100, alignItems: 'center'}}>
    <div style={{
  marginTop: 20,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%"
}}>

    <div style={{width: 270, height: 56, color: 'black', fontSize: 25, fontFamily: 'JetBrains Mono', fontWeight: '800', letterSpacing: 3, wordWrap: 'break-word'}}>Color Palette</div>
    <br/>
    <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
    <div style={styles.container}>
      {colors.map((color, index) => (
        <div key={index} style={styles.colorItem}>
          <div style={{ ...styles.colorBox, backgroundColor: color.hex }}></div>
          <p style={styles.text}>
            {color.hex}: {color.description}
          </p>
        </div>
      ))}
    </div>
    </div>
    <div style={{width: 377, height: 178, position: 'relative', background: '#FFA500', borderRadius: 45, overflow: 'auto'}}>
    
    <div style={{width: 346, height: 84, left: 21, top: 7, position: 'absolute', color: 'black', fontSize: 20, fontFamily: 'JetBrains Mono', fontWeight: '800', letterSpacing: 2.40, wordWrap: 'break-word'}}>Box: 377x178, Middle, #FFA500, 20, Jetbrains Mono ExtraBold, Left, #000000<br/></div>
    <div style={{width: 65, height: 65, left: 54, top: 105, position: 'absolute', background: '#42C640', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 9999}} />
    <div style={{width: 65, height: 65, left: 246, top: 105, position: 'absolute', background: '#C64042', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 9999}} />
    <div style={{width: 51, height: 0, left: 110, top: 115, position: 'absolute', transform: 'rotate(118deg)', transformOrigin: 'top left', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', border: '5px white solid'}}></div>
    <div data-svg-wrapper style={{left: 60, top: 139, position: 'absolute'}}>
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2.5L20 23.5" stroke="white" stroke-width="5"/>
    </svg>
    </div>
    <div style={{width: 55, height: 0, left: 258, top: 115, position: 'absolute', transform: 'rotate(45deg)', transformOrigin: 'top left', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', border: '3px black solid'}}></div>
    <div style={{width: 55, height: 0, left: 298.89, top: 119, position: 'absolute', transform: 'rotate(135deg)', transformOrigin: 'top left', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', border: '3px black solid'}}></div>
</div>
<div className="form-group">
      {showText && <label style={{color:"black", backgroundColor:"white"}}>{promptbox}
</label>}
    </div>
    </div>


    
    <button type="submit" class="login-button" onClick={handleClick}>Next</button>
<br></br>
<br></br>
<br></br>

    </div>

    </div>
    </div>

    )

}
export default StyleGuide2;