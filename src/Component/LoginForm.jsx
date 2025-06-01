import React, { useState} from "react";
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/cleam-logo-transparent.png";
import "../styles/Password.css"
import ResetPassword from "./ResetPassword";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showResetModal, setShowResetModal] = useState(false);


    const navigate = useNavigate();
    // Function to validate email format
    const validateEmail = (email) => {
        if (!email) return "Please enter your email.";
  
        // More comprehensive email regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          return "Please enter a valid email address (e.g., user@example.com)";
        }
        return "";
      };

    // Function to validate password
    const validatePassword = (password) => {
        if (!password) return "Please enter your password.";
        if (password.length < 6) return "Password must be at least 6 characters.";
        
        // Additional security checks
        if (/[<>'"\\]/.test(password)) {
          return "Password contains invalid characters";
        }
        return "";
      };
    // Handle email validation
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setEmailError(validateEmail(value)); // Real-time validation
    };

    // Handle password validation
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordError(validatePassword(value)); // Real-time validation
    };

    const submitHandler = async (event) => {
        event.preventDefault();

        // Reset previous errors
        setErrorMessage("");
        setEmailError("");
        setPasswordError("");

        // Check if email or password are empty
        if (!email.trim()) {
            setEmailError("Please enter your email.");
        }
        if (!password.trim()) {
            setPasswordError("Please enter your password.");
        }

        // Validate email format
        const emailValidationError = validateEmail(email);
        if (email.trim() && emailValidationError) {
            setEmailError(emailValidationError);
        }

        // Validate password
        const passwordValidationError = validatePassword(password);
        if (password.trim() && passwordValidationError) {
            setPasswordError(passwordValidationError);
        }

        // Stop submission if any errors exist
        if (!email.trim() || !password.trim() || emailValidationError || passwordValidationError) {
            return;
        }

        try {
            const response = await fetch(process.env.REACT_APP_API_PATH + "/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (result.error) {
                if (result.error === "Wrong password") {
                    setPasswordError("Incorrect password. Try again.");
                } else {
                    setErrorMessage("Incorrect email or password. If you don't have an account, please create one.");
                }
            } else {
                sessionStorage.setItem("token", result.token);
                sessionStorage.setItem("user", result.userID);
                // setLoggedIn(true);
                navigate("/home-page");
                console.log("Auth Token after logging in:", sessionStorage.getItem("token"));
                setTimeout(() => window.location.reload(), 500); // Give time to save
            }
        } catch (err) {
            console.error(err);
            setErrorMessage("Incorrect email or password. If you don't have an account, please create one.");
        }
    };

    return (

        <div className="split-container">
            {/* Left section (purple) with website name */}
            <div className="left-section">
                <div className="title-container">
                <h1 className="website-name">
                    <span className="title-line-1">Strings </span>
                    <span className="title-line-2">Attached</span>
                    </h1>
                <h2 className="website-subtitle" >
                    Swipe with a purpose, date with a passion</h2>
                    <div className="logo-container">
                <img
                src = {logo}
                alt = "Strings Attached Logo"
                className = "website-logo"
                />
                </div>
                {/* You can add additional content here if needed */}
            </div>
            </div>

            {/* Right section (off-white) with login form */}
            <div className="right-section">
        
                <div className="login-container">
                    <h1 className="title">Login</h1>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <form onSubmit={submitHandler} className="login-form">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        name="email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange} // Real-time validation
                        onBlur={() => setEmailError(validateEmail(email))} // Ensure errors persist on blur
                    />
                    {emailError && <p className="input-error">{emailError}</p>}
                </div>

                <div className="form-group">
                <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={handlePasswordChange} // Real-time validation
                        onBlur={() => setPasswordError(validatePassword(password))} // Ensure errors persist on blur
                    />
                    {passwordError && <p className="input-error">{passwordError}</p>}
                </div>

                <button type="submit" className="login-button">Log In</button>
                <br/>

                <div className="new-user-section">
                    <p className="new-user-header"> New to us?</p>
                </div>
                <Link to="/register">
                    <button type="button" className="create-account-button">
                        Create an Account
                    </button>
                </Link>
            </form>

            <p className="forgot-password">
            <button 
              onClick={() => setShowResetModal(true)}
              style={{
                background: '#D9D9D9',
                border: 'none',
                color: '#800080',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
            >
              Forgot your password?
            </button>
          </p>
        </div>
        </div>
        <ResetPassword
        show={showResetModal}
        onClose={() => setShowResetModal(false)}
        />
        </div>
    );
};

export default LoginForm;