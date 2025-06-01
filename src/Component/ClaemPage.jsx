import React from "react";
import { Link } from "react-router-dom";

const ClaemPage = () => {
  return (
    <div className="name">

        <Link to="/lana">
        <h1 className="text-5xl font-bold">Lana</h1>
        </Link>
        
        <Link to= "/cadence">
        <h1 className="text-5xl font-bold">Cadence</h1>
        </Link>

        <Link to= "/amadeo">
        <h1 className="text-5xl font-bold">Amadeo</h1>
        </Link>

        <Link to= "/ethan">
        <h1 className="text-5xl font-bold">Ethan</h1>
        </Link>

        <Link to= "/milind">
        <h1 className="text-5xl font-bold">Milind</h1>
        </Link>

    </div>
  );
};

export default ClaemPage;
