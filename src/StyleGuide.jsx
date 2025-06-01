import React, { useState, useEffect } from "react";
import "./StyleGuide.css";

function StyleGuide() {
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            // example: you could toggle showText or similar
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleShowText = () => setShowText((prev) => !prev);

    const colorPalette = [
        { hex: "#000000", description: "For text" },
        { hex: "#8B0000", description: "For delete my account button, errors, reject" },
        { hex: "#42C640", description: "For check mark and successful conditions" },
        { hex: "#C64042", description: "For wrong mark" },
        { hex: "#d1d1d1", description: "For text input boxes" },
        { hex: "#FF7F50", description: "For buttons" },
        { hex: "#2196F3", description: "For like button" },
        { hex: "#007BFF", description: "For edit button" },
        { hex: "#FF7F50", description: "For view reviews button and toggle icon" },
        { hex: "#CCC", description: "For cancle button (modal)" },
        { hex: "#4CAF50", description: "For save name, email, age button" },

    ];

    return (
        <div className="styleguide-container">
                <h1 className="page-heading">Style Guide</h1>

            <div className="styleguide-inner">
                <button className="login-button" onClick={toggleShowText}>
                    Style
                </button>

                <div className="title">
                    JetBrains Mono ExtraBold, 50, Center, #000000
                    <br />
                    For headings over blanks, feedback messages
                </div>

                {showText && (
                    <div className="code-snippet">
                        font-size: 50px;
                        <br />
                        font-weight: bold;
                        <br />
                        color: black;
                        <br />
                        margin-bottom: 20px;
                    </div>
                )}

                <div className="subtext">
                    JetBrains Mono Thin, 20, Left, #000000
                    <br />
                    For a descriptive instructive note
                </div>

                {/* Accessible label, visually hidden */}
                <label htmlFor="styleguide-input" className="sr-only">
                    Descriptive instructive input (JetBrains Mono Thin, 20, Left, #000000)
                </label>
                <input
                    id="styleguide-input"
                    type="text"
                    className="grey-input"
                    placeholder="Type something..."
                />
                {showText && (
                    <div className="code-snippet">
                        width: 250px;
                        <br />
                        height: 35px;
                        <br />
                        background-color: #d1d1d1;
                        <br />
                        border: none;
                        <br />
                        border-radius: 10px;
                        <br />
                        padding-left: 10px;
                        <br />
                        font-size: 18px;
                    </div>
                )}

                <div className="description">
                    Gray Box: #d1d1d1, Center
                    <br />
                    For use to fill out info
                </div>

                <button className="login-button">Style</button>
                {showText && (
                    <div className="code-snippet">
                        width: 260px;
                        <br />
                        height: 45px;
                        <br />
                        background-color: #FF7F50;
                        <br />
                        border: none;
                        <br />
                        border-radius: 10px;
                        <br />
                        font-size: 18px;
                        <br />
                        font-weight: bold;
                        <br />
                        color: black;
                        <br />
                        margin-top: 10px;
                        <br />
                        cursor: pointer;
                        <br />
                        font-family: "JetBrains Mono";
                    </div>
                )}

                <div className="description">
                    Button Box: #FF7F50, Center
                    <br />
                    Only to be used as buttons
                </div>

                <div className="section-title">Color Palette</div>
                <div className="color-list">
                    {colorPalette.map((color, idx) => (
                        <div key={idx} className="color-item">
                            <div
                                className="color-box"
                                style={{ backgroundColor: color.hex }}
                            ></div>
                            <p>
                                {color.hex}: {color.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="input-error success">
                    Success condition message: JetBrains Mono ExtraBold, 14, Center, #42C640
                </div>
                <div className="input-error error">
                    Error condition message: JetBrains Mono ExtraBold, 14, Center, #FF0000
                </div>

                {showText && (
                    <>
                        <div className="code-snippet">
                            color: #42C640;
                            <br />
                            font-size: 14px;
                            <br />
                            margin-top: 5px;
                        </div>
                        <div className="code-snippet">
                            color: #FF0000;
                            <br />
                            font-size: 14px;
                            <br />
                            margin-top: 5px;
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default StyleGuide;
