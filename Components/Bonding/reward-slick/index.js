import React, { useEffect, useState } from "react";
import styled from "styled-components";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Slider from "react-slick";

const Container = styled.div`
  width: 100%;
  @media (max-width: 1024px){
    width:100%;
    margin: auto;
  }
  .slick-slide{
    margin: 0px 5px !important;
  }
  .slick-track{
    display: flex !important;
    justify-content: center;
  }
  .slick-dots li button:before{
    color: white;
  }
  @media (max-width: 480px){
    .slick-slide{
      margin: 0px !important;
    }
  }
`

const settings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  initialSlide: 0,
  arrows: false,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        dots: true
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
};

const RewardSlick = ({ children }) => {

  return (
    <Container>
      <Slider {...settings}>
        {children}
      </Slider>
    </Container>
  );
}

export default RewardSlick;