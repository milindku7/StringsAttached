import React, { useState, useEffect } from "react";
import "../styles/Requests.css";

import piano from "../assets/piano.png";
import piccolo from "../assets/piccolo.png";
import sax from "../assets/sax.png";
import xylophone from "../assets/xylophone.png";
import drum from "../assets/drum.png";
import guitar from "../assets/guitar.png";
import trumpet from "../assets/trumpet.png";

const instruments = [piano, piccolo, sax, xylophone, drum, guitar, trumpet];

const Requests = () => {
  const [user, setUser] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("user");
    fetch(`https://stringsattached.online/hci/api/api/claem/connections?toUserID=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        const pendings = result[0]
          .filter((conn) => conn.attributes.requested)
          .map((conn) => ({
            id: conn.id,
            name: conn.fromUser.attributes.firstName + " " + conn.fromUser.attributes.lastName,
          }));
        setUser(pendings);
      });
  }, []);

  const acceptConnection = async (id) => {
    const token = sessionStorage.getItem("token");
    await fetch(`https://stringsattached.online/hci/api/api/claem/connections/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        attributes: { blocked: false, requested: false, follow: true },
      }),
    });
    setUser((prev) => prev.filter((u) => u.id !== id));
  };

  const rejectConnection = async (id) => {
    const token = sessionStorage.getItem("token");
    await fetch(`https://stringsattached.online/hci/api/api/claem/connections/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        attributes: { blocked: false, requested: false, follow: false },
      }),
    });
    setUser((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="requests-page">
      <div className="decor-container">
        {[...Array(isMobile ? 24 : 39)].map((_, i) => (
          <img
            key={i}
            src={instruments[i % instruments.length]}
            className={`decor-image decor-${i}`}
            alt=""
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="requests-box">
        <h1 className="requests-heading">Pending Friend Requests</h1>
        <div className="requests-list">
          {user.length > 0 ? (
            user.map((u) => (
              <div key={u.id} className="request-card">
                <span className="request-name">{u.name}</span>
                <div className="request-buttons">
                  <button className="btn accept" onClick={() => acceptConnection(u.id)}>
                    Accept
                  </button>
                  <button className="btn reject" onClick={() => rejectConnection(u.id)}>
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-requests">You don’t have any requests yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
