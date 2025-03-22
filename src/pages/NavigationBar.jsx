import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import FooterBar from "./FooterBar";
import HeaderBar from "./HeaderBar";

import "./NavigationBar.css";

function NavigationBar() {
  return (
    <>
      <HeaderBar />
      <Outlet />
      <FooterBar />
    </>
  );
}

export default NavigationBar;
