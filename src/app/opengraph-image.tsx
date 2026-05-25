import { createElement } from "react";

import { ImageResponse } from "next/og";



export const alt = "MasseurMatch – LGBTQ+-Inclusive Massage Therapist Directory";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";



export default async function Image() {
  
  const image = createElement(
    
    "div",
    
    {
      
      style: {
        
        background: "#0B1F3A",
        
        width: "100%",
        
        height: "100%",
        
        display: "flex",
        
        flexDirection: "column",
        
        alignItems: "center",
        
        justifyContent: "center",
        
        padding: "64px",
        
        fontFamily: "Georgia, serif",
        
      },
      
    },
    
    createElement(
      
      "div",
      
      {
        
        style: {
          
          display: "flex",
          
          flexDirection: "row",
          
          fontSize: 52,
          
          fontWeight: 400,
          
          letterSpacing: "-0.01em",
          
          marginBottom: 24,
          
        },
        
      },
      
      createElement("span", { style: { color: "#FCFBF8" } }, "Masseur"),
      
      createElement("span", { style: { color: "#FF8A1F" } }, "Match"),
      
    ),
    
    createElement(
      
      "div",
      
      {
        
        style: {
          
          display: "flex",
          
          fontSize: 22,
          
          color: "rgba(252,251,248,0.6)",
          
          fontFamily: "system-ui, sans-serif",
          
          fontWeight: 300,
          
          letterSpacing: "0.04em",
          
        },
        
      },
      
      "LGBTQ+-Inclusive Massage Therapist Directory",
      
    ),
    
    createElement("div", {
      
      style: {
        
        display: "flex",
        
        width: 80,
        
        height: 3,
        
        background: "#FF8A1F",
        
        marginTop: 36,
        
      },
      
    }),
    
  );
  

  
  return new ImageResponse(image, { ...size });
  
}


























































