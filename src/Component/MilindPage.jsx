import React from "react";
import MilindImage from "../assets/milind_jpg.jpg";
import linkedinLogo from "../assets/linkedin.png"; // LinkedIn logo
import UBlogo from "../assets/Bull.png";

const LanaPage = () => {
  return (
      <div className="Text">
        <div className="settings-container">
          <div className="page-container">
            <div className="min-h-screen bg-[#6B2472] flex flex-col items-center px-6 py-10 overflow-auto">
              <div className="flex flex-col items-center mb-6">
                <img
                    src={UBlogo}
                    alt="University at Buffalo logo"
                    style={{ maxWidth: "80px", height: "auto" }}
                />
                <img
                    src={MilindImage}
                    alt="Milind Kumar"
                    className="w-32 h-32 rounded-sm object-cover shadow-md"
                    style={{ maxWidth: "150px", height: "auto" }}
                />
                <img
                    src={UBlogo}
                    alt="University at Buffalo logo"
                    style={{ maxWidth: "80px", height: "auto" }}
                />

                <div className="mt-3 flex flex-col items-center">
                  <img
                      src={linkedinLogo}
                      alt="LinkedIn logo"
                      className="rounded-md"
                      style={{ width: "25px", height: "25px" }}
                  />
                  <a
                      href="https://www.linkedin.com/in/milind-kumar-321a9224a/"
                      className="text-blue-300 font-medium underline text-xs"
                  >
                    Connect with me here
                  </a>
                </div>
              </div>

              <div className="text-container text-center">
                <h1 className="text-xs md:text-sm font-bold text-white">
                  Hello, my name is Milind Kumar
                </h1>
                <p className="mt-3 text-xs md:text-sm text-white leading-tight">
                  I am a current Junior at the University at Buffalo<br />majoring in Computer Science. I love reading about
                  <br />history and Political Science. <br /><br />
                  I have been an International Ambassador for UB for
                  <br />over 2 years and absolutely love it!
                </p>
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default LanaPage;
