import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../App";
import "../styles/Messaging.css";

const Messaging = () => {
    // State for user data, messages, etc.
    const [userData, setUserData] = useState({});
    const [otherUserData, setOtherUserData] = useState({});
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    // State for conversation starters
    const [allStarters, setAllStarters] = useState([]);      // full list loaded from text file
    const [starterOptions, setStarterOptions] = useState([]); // three random ones to display
    const [showStarter, setShowStarter] = useState(false);    // hidden by default

    const navigate = useNavigate();
    const userToken = sessionStorage.getItem("token");
    const loggedInUserId = sessionStorage.getItem("user");
    const { roomID } = useParams();
    const finalRoomID = roomID || sessionStorage.getItem("roomID");
    const messagesEndRef = useRef(null);

    // Fetch the full list of conversation starters from public/StarterPrompts.txt
    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/StarterPrompts.txt`)
            .then((res) => res.text())
            .then((text) => {
                const starters = text
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line !== "");
                setAllStarters(starters);
            })
            .catch((err) => console.log("Error loading conversation starters:", err));
    }, []);

    // Whenever showStarter flips to true, pick 3 random starters
    useEffect(() => {
        if (showStarter && allStarters.length > 0) {
            const shuffled = [...allStarters].sort(() => Math.random() - 0.5);
            setStarterOptions(shuffled.slice(0, 3));
        }
    }, [showStarter, allStarters]);

    // Redirect if not logged in
    useEffect(() => {
        if (!userToken) {
            navigate("/");
        }
    }, [userToken, navigate]);

    // Clear messages when room changes
    useEffect(() => {
        setMessages([]);
    }, [finalRoomID]);

    // Fetch user & other user data
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_PATH}/users/${loggedInUserId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setUserData(data))
            .catch((err) => console.log("Error fetching logged-in user data:", err));

        const toUserID = sessionStorage.getItem("toUserID");
        if (toUserID) {
            fetch(`${process.env.REACT_APP_API_PATH}/users/${toUserID}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`,
                },
            })
                .then((res) => res.json())
                .then((data) => setOtherUserData(data))
                .catch((err) => console.log("Error fetching other user data:", err));
        }
    }, [loggedInUserId, userToken]);

    // Listen for incoming socket messages & load chat history
    useEffect(() => {
        const handleMessageReceived = (msg) => {
            if (msg.roomID && Number(msg.roomID) !== Number(finalRoomID)) return;
            if (
                Number(msg.fromUserID) !== Number(otherUserData.id) &&
                Number(msg.toUserID) !== Number(otherUserData.id)
            ) {
                return;
            }
            setMessages((prev) => [...prev, { ...msg, id: msg.id || Date.now() }]);
        };

        socket.on("/send-message", handleMessageReceived);

        const fetchChatHistory = () => {
            if (!finalRoomID) return;
            fetch(
                `${process.env.REACT_APP_API_PATH}/chat-history/history/${finalRoomID}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            )
                .then((res) => res.json())
                .then((result) => {
                    setMessages(
                        result.map((msg) => ({
                            id: msg.id,
                            fromUserID: msg.fromUserId,
                            message: msg.content,
                            roomID: msg.roomID,
                        }))
                    );
                })
                .catch((err) => console.log("Error fetching chat history:", err));
        };
        fetchChatHistory();

        return () => {
            socket.off("/send-message", handleMessageReceived);
        };
    }, [finalRoomID, userToken, otherUserData.id]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle send
    const handleMessageSend = (e) => {
        e.preventDefault();
        if (Number(userData.id) === Number(otherUserData.id)) {
            alert("You cannot send messages to yourself.");
            return;
        }
        const payload = {
            fromUserID: Number(userData.id),
            toUserID: Number(otherUserData.id),
            message,
            roomID: finalRoomID,
        };
        socket.emit("/chat/send", payload);
        setMessages((prev) => [...prev, { ...payload, id: Date.now() }]);
        setMessage("");
    };

    return (
        <div className="chat">
            <div className="chat__main">
                {/* Header */}
                <div className="chat__header">
                    <p>{otherUserData.email}</p>
                </div>

                {/* Toggle conversation starters */}
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                    <button
                        onClick={() => setShowStarter((prev) => !prev)}
                        className="toggle-starter-btn"
                    >
                        {showStarter ? (
                            <>
                <span role="img" aria-label="Hide">
                  🔒
                </span>{" "}
                                Hide Starters
                            </>
                        ) : (
                            <>
                <span role="img" aria-label="Show">
                  ✨
                </span>{" "}
                                Show Starters
                            </>
                        )}
                    </button>
                </div>

                {/* Conversation Starters */}
                {showStarter && (
                    <div className="conversation-starter">
                        <p className="starter-title">Conversation Starters</p>
                        <div className="starter-options">
                            {starterOptions.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className="starter-option"
                                    onClick={() => setMessage(opt)}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="message__container">
                    {messages.map((msg) => (
                        <div className="message__chats" key={msg.id}>
                            {Number(msg.fromUserID) === Number(userData.id) ? (
                                <>
                                    <p className="sender__name">{userData.email}</p>
                                    <p className="message__sender">{msg.message}</p>
                                </>
                            ) : (
                                <>
                                    <p className="recipient__name">{otherUserData.email}</p>
                                    <p className="message__recipient">{msg.message}</p>
                                </>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer Input */}
                <div className="chat__footer">
                    <form className="form" onSubmit={handleMessageSend}>
                        <input
                            type="text"
                            placeholder="Write message"
                            className="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button className="sendBtn" type="submit">
                            SEND
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Messaging;
