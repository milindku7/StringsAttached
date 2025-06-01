import React from "react";
import ethanImage from "../assets/EthanHeadshot.jpg";

const ethanPage = () => {
  return (
    <div className="min-h-screen bg-[#6B2472] flex flex-col items-center justify-center px-6 py-10 overflow-hidden">

        <div className="flex flex-cl items-center mb-6">
            <img
                src = {ethanImage}
                alt = "Ethan Hedges"
                className="w-40 h-40 rounded-lg object-cover shadow-md"
                style = {{madWidth: "200px", height: "300px"}}
            />
            </div>

      <div className="Text">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Hello, my name is Ethan Hedges</h1>

        <p className="mt-4 text-base md:text-lg text-white leading-relaxed">
          I am a Senior at the University at Buffalo majoring in Computer Science.<br />
          I am originally from Rochester, NY, and am a huge animal lover.
        </p>
      </div>

    </div>
  );
};

export default ethanPage;