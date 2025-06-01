import React from "react";
import lanaImage from "../assets/LanaHeadshot.jpg"; // Headshot
import linkedinLogo from "../assets/linkedin.png"; // LinkedIn logo

const LanaPage = () => {
  return (
    <div className = "Text">
      <div className="settings-container">
    <div className="page-container">
      <div className="min-h-screen bg-[#6B2472] flex flex-col items-center px-6 py-10 overflow-auto">
      
        <div className="flex flex-col items-center mb-6">
          <img
            src={lanaImage}
            alt="Lana Kim"
            className="w-32 h-32 rounded-sm object-cover shadow-md"
            style={{ maxWidth: "150px", height: "auto" }} 
          />

          <div className="mt-3 flex flex-col items-center">
              <img 
                src={linkedinLogo} 
                alt="LinkedIn" 
                className="rounded-md"
                style={{ width: "25px", height: "25px" }}
              />
            <a href="https://www.linkedin.com/in/lana-uhjin-kim/" 
               className="text-blue-300 font-medium underline text-xs">
              Connect with me here
            </a>
          </div>
        </div>

        {/* Text Content with Smaller Font Sizes */}
        <div className="text-container text-center">
          <h1 className="text-xs md:text-sm font-bold text-white">
            Hello, my name is Lana Kim
          </h1>

          <p className="mt-3 text-xs md:text-sm text-white leading-tight">
            I am a Senior at the University at Buffalo majoring in Computer Science.<br />
            Originally from Queens, NY, I currently work part-time as a <br />
            Student Assistant for CSE 115 and Trader Joe’s.
          </p>

          <div className="mt-5">
            <h2 className="text-xs md:text-sm font-semibold text-white">
              Some fun facts about me:
            </h2>
            <p className="mt-2 text-xs md:text-sm text-white leading-tight">
              - I was a college brand ambassador for Samsung, Innisfree, and Amazon Prime Student.<br />
              - I have three adorable cats that keep me company at my home in NYC.<br />
              - I was a Software Engineering intern at Duck Creek Technologies.
            </p>
            <br>
            </br>
            <br>
            </br><br>
            </br><br>
            </br><br>
            </br><br>
            </br><br>
            </br><br>
            </br><br>
            </br><br>
            </br><br>
            </br>
          </div>
        </div>

      </div>
    </div>
    </div>
    
    </div>
  );
};

export default LanaPage;
