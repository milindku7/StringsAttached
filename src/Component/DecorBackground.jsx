import React from "react";
import piano from "../assets/piano.png";
import piccolo from "../assets/piccolo.png";
import sax from "../assets/sax.png";
import xylophone from "../assets/xylophone.png";
import drum from "../assets/drum.png";
import guitar from "../assets/guitar.png";
import trumpet from "../assets/trumpet.png";
import "../styles/DecorBackground.css";

const instrumentImages = [piano, piccolo, sax, xylophone, drum, guitar, trumpet];

const DecorBackground = () => {
  const totalIcons = 33;

  return (
    <div className="decor-container">
      {Array.from({ length: totalIcons }).map((_, index) => {
        const src = instrumentImages[index % instrumentImages.length];
        return (
          <img
            key={index}
            src={src}
            alt={`bg-instrument-${index}`}
            className={`decor-image decor-${index}`}
          />
        );
      })}
    </div>
  );
};

export default DecorBackground;
