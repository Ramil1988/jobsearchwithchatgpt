import React from 'react';
import styled, { keyframes } from 'styled-components';

const animate = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
    border-radius: 0%;
  }
  100% {
    transform: translateY(-1000px) rotate(720deg);
    opacity: 0;
    border-radius: 50%;
  }
`;

const Circles = styled.ul`
  margin: 0;
  padding: 0;
  overflow: hidden;

  width: 100%;
  justify-content: center;
  align-items: center;
  font-family: "Exo", sans-serif;

  li {
    position: absolute;
    list-style: none;
    background-color: rgba(255, 255, 255, 0.2);
    animation: ${animate} 25s linear infinite;
  }

  li:nth-of-type(1) {
    left: 25%;
    width: 80px;
    height: 80px;
  }

  li:nth-of-type(2) {
    left: 10%;
  width: 20px;
  height: 20px;
  animation-delay: 2s;
  animation-duration: 12s;
  }

  li:nth-of-type(3) {
    left: 70%;
  width: 20px;
  height: 20px;
  animation-delay: 4s;
  }

  li:nth-of-type(4) {
    left: 40%;
  width: 60px;
  height: 60px;
  animation-delay: 0s;
  animation-duration: 18s;
  }

  li:nth-of-type(5) {
    left: 65%;
  width: 20px;
  height: 20px;
  }

  li:nth-of-type(6) {
    left: 75%;
  width: 110px;
  height: 110px;
  animation-delay: 3s;
  }

  li:nth-of-type(7) {
    left: 35%;
  width: 150px;
  height: 150px;
  animation-delay: 7s;
  }

  li:nth-of-type(8) {
    left: 50%;
  width: 25px;
  height: 25px;
  animation-delay: 15s;
  animation-duration: 45s;
  }

  li:nth-of-type(9) {
    left: 20%;
  width: 15px;
  height: 15px;
  animation-delay: 2s;
  animation-duration: 35s;
  }

  li:nth-of-type(10) {
    left: 85%;
  width: 150px;
  height: 150px;
  animation-delay: 0s;
  animation-duration: 11s;
  }
`;

const AnimatedBackground = () => (
    <Circles>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </Circles>
);

export default AnimatedBackground;