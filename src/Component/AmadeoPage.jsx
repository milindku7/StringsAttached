import React from "react";
import amadeoImage from "../assets/AmadeoHeadshot.JPG";

const amadeoPage = () => {
    return (
        <div className = "Text">
      <div className="settings-container">
    <div className="page-container">
      <div className="min-h-screen bg-[#6B2472] flex flex-col items-center px-6 py-10 overflow-auto">
      
        <div className="flex flex-col items-center mb-6">
                <img
                    src={amadeoImage}
                    alt="Amadeo Vilbrun"
                    className="w-40 h-40 rounded-lg object-cover shadow-md"
                    style={{ maxWidth: "200px", height: "auto" }}
                />
            </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Hello, my name is Amadeo Vilbrun</h1>

                <div className="mt-5">
                <p className="mt-2 text-xs md:text-sm text-white leading-tight">
                I am a junior at the University at Buffalo majoring in Computer Science.<br />
                    I love listening to music and learning about music production. <br />
                    I am from Staten Island, NY and currently have part time job as a residential fitness monitor.
                </p>
                </div>
            </div>
<br></br>
<br></br>
<br></br>
<br></br>
<br></br>


<br></br>

        </div></div></div>
    );
};

export default amadeoPage;