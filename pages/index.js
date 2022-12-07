import React, { useEffect } from "react";
import Header from "../Layouts/headerLand";
import HeroLanding from "../Modules/HeroLanding";
import Footer from "./../Layouts/footer"

export default function Index() {
  return (
    <div>
      <Header elem={"#useProtocolpozzle"} />
      <HeroLanding />
      <Footer />
    </div>
  );
}