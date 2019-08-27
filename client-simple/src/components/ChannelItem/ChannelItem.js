import React from "react";
import UserSmallSvg from "../../assets/svg/user-small.svg";
import VerifiedSvg from "../../assets/svg/verified.svg";
import NotVerifiedSvg from "../../assets/svg/not-verified.svg";

//DIFFICULTY LEVELS
import easy  from "../../assets/svg/difficultyLevels/easy.svg";
import medium  from "../../assets/svg/difficultyLevels/medium.svg";
import hard  from "../../assets/svg/difficultyLevels/hard.svg";

import Button from "../Button/Button";
import "./ChannelItem.style.scss";
import { relative } from "path";

const determineDifficulty = (value) => {
  switch (value) {
  case 0:
    return "Easy"; 
  case 1:
    return "Medium"; 
  case 2:
    return "Hard"; 
  }
}

const sponsoredCacheStyle = {
  backgroundColor: "#ecd98b",
  border: "5px solid #eabc4f",
  marginBottom: "10px"
}

const notSponsoredCacheStyle = {
  backgroundColor: "white",
  border: "1px solid green",
  marginBottom: "10px"
}

const ChannelItem = ({ id, title, url, users, isFound, isLogged, toggleModal, desc, difficultyLevel, isSponsored }) => {
  console.log(isFound)
  return (
    <div className="cache"  style={isSponsored ? sponsoredCacheStyle : notSponsoredCacheStyle}>
      <div className="channel">
        <h3 className="channel__title">{title}</h3>
          
        <div className="actions" style={{alignSelf: "left"}}>
          <span className="actions__item">
            {isLogged ? (
              <Button variant="primary" href={url} isLink>Join</Button>
            ) : (
              <Button variant="primary" onClick={() => toggleModal(id)} isLink>Join</Button>
            )}
          </span>

          <span className="actions__separator"></span>
          <span className="actions__item">
            <span className="actions__value">{users}</span>
            <img src={UserSmallSvg} className="actions__img" alt="" />
          </span>

          <span className="actions__separator"></span>

          <span className="actions__item">
            <img src={isFound ? VerifiedSvg : NotVerifiedSvg} className="actions__img" alt=""/>
          </span>
          <span className="actions__separator"></span>
          <span className="actions__item">
            <img src={difficultyLevel === 0 ? easy : difficultyLevel === 1 ? medium : hard} className="actions__img" alt="" title={determineDifficulty(difficultyLevel)}/>
          </span>
        </div>
      </div>
      <div className="cache__description">
        <p style={{padding: 10, fontSize: 12}}>{desc}</p>
      </div>
    </div>
  );
};

export default ChannelItem;