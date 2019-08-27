import React, { Component } from "react";
import gql from "graphql-tag";
import MenuIconSvg from "../../assets/svg/menu.svg";
import { compose, graphql } from "react-apollo";
import _ from "lodash";
import LeaveSvg from "../../assets/svg/leave.svg";
import logo from "../../assets/images/logo.png";
import Button from "../Button/Button";
import "./Sidebar.style.scss";
import { UserContext } from "../../services/userContext";
import withUserContext from "../../components/withUserContext";
import MailForm from "../MailForm/index"
import { Link } from "react-router-dom";

const sidebarImageStyle = {
  borderRadius: 15,
  width: 30,
  height: 30
}

const SidebarMessage = ({ children }) => {
  return (
    <div className="sidebar__message">
      <span className="sidebar__text">{children}</span>
    </div>
  );
};

const SidebarItem = ({ title, url, exitUrl, image }) => {
  return (
    <div className="sidebar__item">
      {image ? <img style={sidebarImageStyle} src={image}/> : null}
      <a style={{marginLeft: 10}} href={url}  className="sidebar__title">{title}</a>
      {exitUrl && (
        <a href={exitUrl}>
          <img src={LeaveSvg} className="sidebar__icon" alt="Leave Channel" />
        </a>
      )}
    </div>
  );
};

const SidebarArea = ({ heading, children }) => {
  return (
    <div className="sidebar__area">
      <h2 className="sidebar__heading sidebar__heading--small">{heading}</h2> 
      {children}
    </div>
  );
};

const profileButtonPicStyles = {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 10
}

class Sidebar extends Component {
  state = {
    sidebarOpen: false,
    showMailForm: false,
    displayProfile: false,
    displayCurrentProfile: false
  };

  getUserName(userState = {user: {}}) {
    const { user } = userState;
    if (!user) return "Guest";
    else return user.profile && user.profile.firstName;
  }

  getUserProfilePicture(userState = {user: {}}) {
    const { user } = userState;
    if (!user) return "Guest";
    else return user.profile && user.profile.profilePicture;
  }

  setRenderCurrentProfile = () => {
    this.setState({displayCurrentProfile: true})
  }

  hideCurrentProfile = () => {
    this.setState({displayCurrentProfile: false})
  }

  renderCurrentProfileEdit = (userState) => {
    return (
      <div style={{top: 0, left:0, width: "100%", height: "100%", zIndex: 99, opacity: 0.5, backgroundColor: "black"}}>
        <Button onClick={this.hideCurrentProfile}>X</Button>
        <div style={{margin: 30, backgroundColor: "white", zIndex: 999, opacity: 1, alignContent: "center"}}>
          <img src={this.getUserProfilePicture(userState)} style={{borderRadius: "50px", margin: "20px"}}/>
          <p style={{fontSize: 20}}>{this.getUserName(userState)}</p>
          <p style={{fontSize: 20}}>{this.getUserName(userState)}</p>
        </div>
      </div>
    );
  }

  renderAccountsActions(userState, {logOut = () => null}) {
    if (!userState.user)
      return <p className="sidebar__acc-actions"><a href="/login" className="sidebar__link">Login</a> or <a href="/register" className="sidebar__link">register</a> if you don't have an account yet!</p>;
    else {
      // DK: NOBODY GOT TIME FOR THAT（╯°□°）╯︵ ┻━┻
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      return (
        <p className="sidebar__acc-actions">
          <div style={{marginBottom: 15}}>
            <Button variant="primary">
              <img style={profileButtonPicStyles} src={this.getUserProfilePicture(userState)}/>{this.getUserName(userState)}
            </Button>
          </div>
          <Button style={{padding: 5, paddingLeft: 30, paddingRight: 30}} variant="primary" onClick={logOut}>Logout</Button>
        </p>);
    }
  }

  handleMailFormClick = () => {this.setState({showMailForm: true})}
  hideMailForm = () => {this.setState({showMailForm: false})}

  render() {
    const { sidebarOpen, showMailForm, displayProfile, displayCurrentProfile } = this.state;
    const isActive = sidebarOpen ? "is-active" : "";

    return (
      <>
        <UserContext.Consumer>
          {({ userState }) => <>
            {displayCurrentProfile ? this.renderCurrentProfile(userState): null}
          </>}
        </UserContext.Consumer>
        <button className="sidebar__toggler" onClick={() => this.setState({sidebarOpen: !this.state.sidebarOpen}) }>
          <img src={MenuIconSvg} alt="" />
        </button>
        <section className={"sidebar " + isActive}>
          <Button href="/rank" variant="primary" style={{marginTop: 10}} isLink>View global rank</Button>
          <header className="sidebar__header">
            <UserContext.Consumer>
              {({ logOut, userState }) => <>
                <Link to="/">
                  <img src={logo} className="sidebar__img" alt="" height="150" width="10"/>
                </Link>
                {this.renderAccountsActions(userState, {logOut})}
              </>}
            </UserContext.Consumer>
          </header>

          <div className="sidebar__content">
            {showMailForm ?
              <>
                <MailForm hide={this.hideMailForm}/>
              </> :  this.props.children}
          </div>

          <UserContext.Consumer>
            {({ userState }) => <>
              <footer className="sidebar__footer">
                {userState.user ? (
                  <Button href="/create" variant="primary" additionalClass="sidebar__btn" isLink>Create new cache chat</Button>
                ) : (
                  <Button href="/register" variant="primary" additionalClass="sidebar__btn" isLink>Create Account</Button>
                )}
              </footer>
            </>}
          </UserContext.Consumer>
          <Button variant="primary" additionalClass="sidebar__btn" onClick={this.handleMailFormClick}>Contact Us!</Button>
        </section>
      </>
    );
  }
}

export default Sidebar;
export { SidebarArea, SidebarItem, SidebarMessage };