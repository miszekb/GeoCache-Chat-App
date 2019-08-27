import React from "react";
import format from "date-fns/format";
import "./Message.style.scss";
import profilePic from "../../assets/images/profile.jpg"

const profilePicStyles = {
  width: "40px",
  height: "40px",
  borderRadius: "20px",
  marginBottom: "3px"
}

const rightProfilePicStyles = {
  width: "40px",
  height: "40px",
  borderRadius: "20px",
  marginBottom: "3px",
  marginLeft: "10px"
}

const renderMessageText = (text, variant) => {

  const boldRegex = /\*(.*?)\*/;
  const underlineRegex = /~(.*?)~/;
  const cursiveRegex = /_(.*?)_/;
  const friendTagRegex = /(?:^|\W)@(\w+)(?!\w)/;

  const findBoldWord = (text, variant) => {
    if(typeof text === "string") {
      let matchesBold, matchesEmphasized, matchCursive, matchFriend;
      
      if(text.match(boldRegex)) {
        matchesBold = text.match(boldRegex);
      }
      else if(text.match(underlineRegex)) {
        matchesEmphasized = text.match(underlineRegex)
      }
      else if(text.match(cursiveRegex)) {
        matchCursive = text.match(cursiveRegex)
      }
      else if (text.match(friendTagRegex)) {
        matchFriend = text.match(friendTagRegex);
      }
      if(!matchesBold && !matchCursive && !matchesEmphasized && !matchFriend) {
        return text;
      }
      else {
        return (
          <span>
            {matchesBold ?
              <span>
                {text.substring(0, text.indexOf(matchesBold[0]) - 1) + " "}
                <b>{matchesBold[0].substr(1,matchesBold[0].length - 2)}</b>
                {findBoldWord(text.substring(text.indexOf(matchesBold[0]) + matchesBold[0].length, text.length))}
              </span>
              : 
              (matchesEmphasized ?
                <span>
                  {text.substring(0, text.indexOf(matchesEmphasized[0]) - 1) + " "} 
                  <u>{matchesEmphasized[0].substr(1,matchesEmphasized[0].length - 2)}</u>
                  {findBoldWord(text.substring(text.indexOf(matchesEmphasized[0]) + matchesEmphasized[0].length, text.length))}
                </span>
                : (matchCursive ?
                  <span>
                    {text.substring(0, text.indexOf(matchCursive[0]) - 1) + " "} 
                    <i>{matchCursive[0].substr(1,matchCursive[0].length - 2)}</i>
                    {findBoldWord(text.substring(text.indexOf(matchCursive[0]) + matchCursive[0].length, text.length))}
                  </span>
                  : (matchFriend ?
                    <span>
                      {text.substring(0, text.indexOf(matchFriend[0]) - 1) + " "} 
                      <span style={{borderRadius: "15px",backgroundColor: "#8ec182", color: "white", padding: "5px"}}>{matchFriend[0].substr(0,matchFriend[0].length)}</span>
                      {findBoldWord(text.substring(text.indexOf(matchFriend[0]) + matchFriend[0].length, text.length))}
                    </span>
                    : null)))
            }
          </span>
        );
      } 
    }
    else return text
  }

  return <div>{findBoldWord(text, variant)}</div>
}

const MessageText = ({ children, variant = "" }) => {
  return (
    <span className={"message__text " + (variant && `message__text--${variant}`)}>{renderMessageText(children, variant)}</span>
  );
};

const Message = ({ author, timestamp, toRight = "", children, profilePicture }) => {
  return (
    <div className={"message " + (toRight && "message--right")}>
      <div className="message__user" style={{alignContent: "right"}}>
        {!toRight ? <img src={profilePicture} style={profilePicStyles}/> : null}
        <span style={{marginTop: "10px", marginLeft: "5px"}} className={"message__username " + (toRight && "message__username--right")}>{author}</span>
        <span style={{marginTop: "10px", marginLeft: "5px"}} className="message__date">{format(timestamp, "hh:mm:ss")}</span>
        {toRight ? <img src={profilePicture} style={rightProfilePicStyles}/> : null}
      </div>
      {children}
    </div>
  );
};

export { Message, MessageText};