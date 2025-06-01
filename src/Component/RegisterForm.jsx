import React, { useEffect, useState } from "react";
import "../styles/Login.css";
import "../styles/Style.css";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import bubbles from "../assets/bubblesv2.png";
import logo from "../assets/cleam-logo-transparent.png";

const RegisterForm = () => {
    const [tfirstName, setFirstName] = useState("");
    const [tlastName, setLastName] = useState("");
    const [tAge, setAge] = useState("");
    const [tSongOfTheWeek, setSongOfTheWeek] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(""); // For general form errors
    const [gotToken, setgotToken] = useState(false);
    const navigate = useNavigate();
    const [gender, setGender] = useState({
        male: false,
        female: false,
        nonBinary: false
    });
    const [genderPreferences, setGenderPreferences] = useState({
        male: false,
        female: false,
        nonBinary: false
    });
    const [formErrors, setFormErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        song: '',
        gender: '',
        genderPreferences: ''
    });

    useEffect(() => {
        if (sessionStorage.getItem("token")) {
            navigate("/settings");
        }
    }, [navigate]);

    // Validate email format
    const validateEmail = (email) => {
        if (!email) return "Email is required";
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address (e.g., user@example.com)";
        }
        
        const domain = email.split('@')[1].toLowerCase();
        const domainParts = domain.split('.');
        
        if (domainParts.length < 2 || 
            domainParts.some(part => part.length < 2) ||
            domain.length < 5) {
            return "Email domain appears invalid";
        }

        return "";
    };

    const validateName = (name, fieldName) => {
        if (!name) return `${fieldName} is required`;
        if (name.length < 2) return `${fieldName} must be at least 2 letters`;
        if (!/^[a-zA-Z]+$/.test(name)) return `${fieldName} should contain only letters`;
        if (name.length > 30) return `${fieldName} must be less than 30 characters`;
        return '';
    };

    const handleFirstNameBlur = (e) => {
        setFormErrors(prev => ({
            ...prev,
            firstName: validateName(e.target.value, 'First name')
        }));
    };
    
    const handleLastNameBlur = (e) => {
        setFormErrors(prev => ({
            ...prev,
            lastName: validateName(e.target.value, 'Last name')
        }));
    };

    const handleEmailBlur = async () => {
        const validationMsg = validateEmail(email);
        if (validationMsg) {
            setFormErrors(prev => ({ ...prev, email: validationMsg }));
            return;
        }

        const exists = await checkEmailExists(email);
        if (exists) {
            setFormErrors(prev => ({
                ...prev,
                email: "An account with this email already exists"
            }));
        } else {
            setFormErrors(prev => ({ ...prev, email: "" }));
        }
    };

    const validatePassword = (password) => {
        if (!password) return "Password is required";
        if (password.length < 8) return "Password must be at least 8 characters";
        if (!/[0-9]/.test(password)) return "Password must contain at least one number";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character";
        return "";
    };

    const validatePasswordMatch = (password, confirmPassword) => {
        if (!confirmPassword) return "Please confirm your password";
        if (password !== confirmPassword) return "Passwords do not match";
        return "";
    };

    const handlePasswordBlur = () => {
        setFormErrors(prev => ({
            ...prev,
            password: validatePassword(password),
            confirmPassword: validatePasswordMatch(password, confirmPassword)
        }));
    };

    const validateAge = (age) => {
        if (!age) return 'Age is required';
        const numAge = parseInt(age);
        if (isNaN(numAge)) return 'Must be a valid number';
        if (numAge < 18) return 'Must be 18 or older';
        if (numAge > 120) return 'Please enter a valid age';
        return '';
    };

    const validateSong = (url) => {
        if (!url) return 'Song is required';
        try {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
            if (!youtubeRegex.test(url.trim())) {
                return "Must be a valid YouTube URL (e.g., https://youtube.com/watch?v=...)";
            }
            return "";
        } catch {
            return 'Invalid URL format';
        }
    };

    const validateGender = () => {
        return Object.values(gender).some(v => v) ? '' : 'Please select at least one gender';
    };

    const validateGenderPreferences = () => {
        return Object.values(genderPreferences).some(v => v) 
            ? '' : 'Please select at least one preference';
    };

    const handleAgeBlur = (e) => {
        setFormErrors(prev => ({...prev, age: validateAge(e.target.value)}));
    };
    
    const handleSongBlur = (e) => {
        setFormErrors(prev => ({...prev, song: validateSong(e.target.value)}));
    };
    
    const handleGenderBlur = () => {
        setFormErrors(prev => ({...prev, gender: validateGender()}));
    };
    
    const handlePreferencesBlur = () => {
        setFormErrors(prev => ({...prev, genderPreferences: validateGenderPreferences()}));
    };

    const validateFirstStep = () => {
        const newErrors = {
            firstName: validateName(tfirstName, 'First name'),
            lastName: validateName(tlastName, 'Last name'),
            email: validateEmail(email),
            password: validatePassword(password),
            confirmPassword: validatePasswordMatch(password, confirmPassword)
        };
        
        setFormErrors(prev => ({...prev, ...newErrors}));
        
        // Set general error message if there are any errors
        const hasErrors = Object.values(newErrors).some(error => error);
        if (hasErrors) {
            setErrorMessage("Please fix the errors in the form before proceeding.");
        } else {
            setErrorMessage("");
        }
        
        return !hasErrors;
    };

    const validateSecondStep = () => {
        const newErrors = {
            age: validateAge(tAge),
            song: validateSong(tSongOfTheWeek),
            gender: validateGender(),
            genderPreferences: validateGenderPreferences()
        };
        
        setFormErrors(prev => ({...prev, ...newErrors}));
        
        // Set general error message if there are any errors
        const hasErrors = Object.values(newErrors).some(error => error);
        if (hasErrors) {
            setErrorMessage("Please complete all required fields correctly.");
        } else {
            setErrorMessage("");
        }
        
        return !hasErrors;
    };

    const checkEmailExists = async (email) => {
        try {
            const response = await fetch(process.env.REACT_APP_API_PATH + "/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (Array.isArray(data) && Array.isArray(data[0])) {
                const match = data[0].find(
                    (user) => user.email.toLowerCase() === email.toLowerCase()
                );
                return Boolean(match);
            }

            console.error("Unexpected response format:", data);
            return false;
        } catch (error) {
            console.error("Error checking email existence:", error);
            throw error;
        }
    };

    const submitHandler = async (event) => {
        event.preventDefault();

        if (!validateFirstStep()) {
            return;
        }

        try {
            const emailAlreadyExists = await checkEmailExists(email);

            if (emailAlreadyExists) {
                setErrorMessage("An account with this email already exists.");
                return;
            }

            // Move to next step if email is unique
            setgotToken(true);
            setErrorMessage(""); // Clear any previous errors

        } catch (err) {
            setErrorMessage("Could not verify email. Please try again.");
        }
    };


    const submitHandlertwo = async (event) => {
        event.preventDefault();
        
        if (!validateSecondStep()) {
            return;
        }
        
        const emparr = [];

        try {
            const fin_pay = {
                email: email,
                password: password,
                attributes: {
                    visible: "public",
                    firstName: tfirstName,
                    lastName: tlastName,
                    blockedPosts: emparr,
                    age: parseInt(tAge),
                    SongOfTheWeek: tSongOfTheWeek,
                    gender,
                    genderPreferences
                },
            };
    
            const response = await fetch(process.env.REACT_APP_API_PATH + "/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(fin_pay),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }
    
            const result = await response.json();
            sessionStorage.setItem("token", result.token);
            sessionStorage.setItem("user", result.userID);
            navigate("/settings");
            window.location.reload();
    
        } catch (error) {
            console.error("Registration error:", error);
            setErrorMessage(error.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div style={{
            position: 'relative',
            minHeight: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <img 
                src={bubbles} 
                alt="Bubbles-BR"
                style={{
                    position: 'absolute',
                    width: 'calc(100% + 40px)',
                    height: 'calc(100% + 40px)',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />
            <div className="register-container">
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <div className="Text">
                    <h1 className="h1" style={{ color: '#d3d3d3' }}>Registration</h1>
                    <p style={{
                        fontSize: '25px',
                        color: '#FF7F50',
                        fontFamily: 'JetBrains Mono',
                        fontWeight: '500',
                        marginTop: '0'
                    }}>
                        Your perfect match is just a click away!
                    </p>
                    <div className="registration-header">
                        <img 
                            src={logo} 
                            alt="App Logo" 
                            className="registration-logo"
                        />
                    </div>
                </div>
                {!gotToken ? (
                    <form className="register-form">
                        <div className="form-group">
                            <label style={{ color: 'white' }}>First Name</label>
                            <input
                                id="firstName"
                                type="text"
                                name="firstName"
                                value={tfirstName}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^[A-Za-z]*$/.test(val)) {
                                        setFirstName(val);
                                    }
                                }}
                                onBlur={handleFirstNameBlur}
                                minLength={2}
                                maxLength={30}
                                required
                            />
                            {formErrors.firstName && <p className="error-message">{formErrors.firstName}</p>}
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'white' }}>Last Name</label>
                            <input
                                id="lastName"
                                type="text"
                                name="lastName"
                                value={tlastName}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^[A-Za-z]*$/.test(val)) {
                                        setLastName(val);
                                    }
                                }}
                                onBlur={handleLastNameBlur}
                                minLength={2}
                                maxLength={30}
                                required
                            />
                            {formErrors.lastName && <p className="error-message">{formErrors.lastName}</p>}
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'white' }}>Email</label>
                            <input
                                id="email" 
                                type="email" 
                                name="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value.trim())}
                                onBlur={handleEmailBlur}
                                required
                            />
                            {formErrors.email && <p className="error-message">{formErrors.email}</p>}
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'white' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={handlePasswordBlur}
                                minLength={8}
                                required
                            />
                            {formErrors.password && <p className="error-message">{formErrors.password}</p>}
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'white' }}>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onBlur={handlePasswordBlur}
                                minLength={8}
                                required
                            />
                            {formErrors.confirmPassword && <p className="error-message">{formErrors.confirmPassword}</p>}
                        </div>
                        <br />
                        <button type="submit" className="next-button" onClick={submitHandler}>
                            Next
                        </button>
                    </form>
                ) : (
                    <form className="register-container" style={{ overflow: "auto" }}>
                        <div className="form-group">
                            <label style={{ color: 'white' }}>Age</label>
                            <input
                                type="number"
                                value={tAge}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^\d*$/.test(val)) {
                                        setAge(val);
                                    }
                                }}
                                onBlur={handleAgeBlur}
                                min="18"
                                max="120"
                                required
                            />
                            {formErrors.age && <p className="error-message">{formErrors.age}</p>}
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'white' }}>Song of the Week</label>
                            <input
                                type="url"
                                value={tSongOfTheWeek}
                                onChange={(e) => setSongOfTheWeek(e.target.value.trim())}
                                onBlur={handleSongBlur}
                                placeholder="https://www.youtube.com/watch?v=..."
                                required
                            />
                            {formErrors.song && <p className="error-message">{formErrors.song}</p>}
                        </div>
                        <div className="register-group">
                            <div className="form-group">
                                <h3 style={{ color: 'white' }}> Gender </h3>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '5px',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center'
                                }}>
                                    {['male', 'female', 'nonBinary'].map((genderType) => (
                                        <div key={genderType} style={{ 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ textTransform: 'capitalize', color: 'white' }}>
                                                {genderType === 'nonBinary' ? 'Non-Binary' : genderType}
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={gender[genderType]}
                                                onChange={() => {
                                                    setGender(prev => ({...prev, [genderType]: !prev[genderType]}));
                                                    handleGenderBlur();
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {formErrors.gender && <p className="error-message">{formErrors.gender}</p>}
                            </div>
                        </div>
                        <div className="register-group">
                            <h3 style={{ color: 'white' }}> Gender Preferences </h3>
                            <div style={{ 
                                display: 'flex', 
                                gap: '0px',
                                flexWrap: 'wrap',
                                justifyContent: 'center'
                            }}>
                                {['male', 'female', 'nonBinary'].map((prefType) => (
                                    <div key={prefType} style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ textTransform: 'capitalize', color: 'white' }}>
                                            {prefType === 'nonBinary' ? 'Non-Binary' : prefType}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={genderPreferences[prefType]}
                                            onChange={() => {
                                                setGenderPreferences(prev => ({...prev, [prefType]: !prev[prefType]}));
                                                handlePreferencesBlur();
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {formErrors.genderPreferences && <p className="error-message">{formErrors.genderPreferences}</p>}
                        </div>
                        <button 
                            type="submit" 
                            className="next-button" 
                            onClick={submitHandlertwo}
                            style={{ marginTop: '20px' }}
                        >
                            Sign Up
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default RegisterForm;