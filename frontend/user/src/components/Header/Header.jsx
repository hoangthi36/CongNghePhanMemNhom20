import React from 'react'
import "./Header.css";
import { Images } from '../../assets/assets';

const Header = () => {
  return (
    <header className="app-header">
      <img src={Images.ring} alt="notifications" className="header-ring" />
      <div className="header-spacer" />
    </header>
  )
}

export default Header
