import React from "react";
import linkedinLogo from "../assets/linkedin.png"; //LinkedIn logo
import cadenceImage from "../assets/CadenceHeadshot.png"; //headshot photo

const CadencePage = () => {
    return (
        <div className = "Text">
      <div className="settings-container">
    <div className="page-container">
      <div className="min-h-screen bg-[#6B2472] flex flex-col items-center px-6 py-10 overflow-auto">
      <div className="flex flex-col items-center">
            <div className="flex flex-cl items-center mb-6">
                <img
                src = {cadenceImage}
                alt = "Cadence Lux"
                className="w-40 h-40 rounded-lg object-cover shadow-md"
                style = {{height: "300px"}}
            />

<div className="mt-3 flex flex-col items-center">
<img
                src={linkedinLogo}
                alt="LinkedIn"
                className="rounded-md"
                style= {{width: "30px", height: "30px"}}
            />
            <a href="https://www.linkedin.com/in/cadence-lux/"
        className="text-blue-300 font-medium underline text-sm">
            Connect with me here!!
        </a>
    </div>
    <div className="text-container text-center">
    <h1 className="text-xs md:text-sm font-bold text-white">
    Hello, my name is Cadence Lux :D</h1>
    <div className="mt-5">
    <p className="mt-2 text-xs md:text-sm text-white leading-tight">
    I am a current Senior at the University at Buffalo majoring in Computational Linguistics. <br />
            I love to see live music and color in my free time! <br />

            I am originally from Johnson City, NY and currently have a part-time job as a Print Technician for UBIT <br />
            and a undergraduate researcher through UB ELN. <br />

            </p>
            </div>
    </div>
    </div>


</div>
</div>
</div>
<br>
</br>
<br>
</br>
<br>
</br>
<br>
</br>
        </div>
        </div>

    );
};
export default CadencePage;