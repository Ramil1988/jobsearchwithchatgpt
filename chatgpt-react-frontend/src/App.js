import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { FaArrowUp } from "react-icons/fa";
import CoverLetter from "./CoverLetter";
import Resume from "./Resume";

const App = () => {
  const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const checkScrollTop = () => {
        if (!isVisible && window.pageYOffset > 400) {
          setIsVisible(true);
        } else if (isVisible && window.pageYOffset <= 400) {
          setIsVisible(false);
        }
      };

      window.addEventListener("scroll", checkScrollTop);
      return () => window.removeEventListener("scroll", checkScrollTop);
    }, [isVisible]);

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };
    return (
      <ScrollButton onClick={scrollToTop} show={isVisible}>
        <FaArrowUp />
      </ScrollButton>
    );
  };

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<CoverLetter />} />
      </Routes>
    </>
  );
};

const ScrollButton = styled.button`
  position: fixed;
  right: 1em;
  bottom: 1em;
  width: 3em;
  height: 3em;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background-color: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0.7;
  visibility: ${(props) => (props.show ? "visible" : "hidden")};
  transition: visibility 0.3s linear;
  &:hover {
    opacity: 1;
  }
`;

export default App;
