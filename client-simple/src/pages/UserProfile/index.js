import React, { Component } from "react";
import Button from "../../components/Button/Button";
import { Form, FormInput } from "../../components/Form/Form";
import "./UserProfile.style.scss";
import {Motion, spring} from "react-motion"
import { UserContext } from "../../services/userContext";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import withUserContext from "../../components/withUserContext";
import withSocket from "../../components/withSocket";

//EXAMPLE
import profilePic from "../../assets/images/profile.jpg"
import aImg1 from "../../assets/images/achievementsIcons/achievement1.png"
import aImg2 from "../../assets/images/achievementsIcons/achievement3.jpg"
import aImg3 from "../../assets/images/achievementsIcons/achievement3.png"

const picStyle = {
  borderRadius: "50px",
  marginLeft: "30%",
  marginTop: "15px"
}

const profileContainerStyle = {
  width: "300",
  height: "100%",
  backgroundColor: "white",
  borderRadius: "20px",
  marginTop: "10px"
}

const exitButtonStyle = {
  position: "absolute", 
  marginLeft: "80%", 
  marginTop: "3%"
}

const achievementsImgStyle = {
  marginLeft: "10px",
  marginBottom: "30px"
}

class UserProfile extends React.Component {

  state = {
    profileEditActive: false,
    newFirstName: this.props.user.profile.firstName,
    newLastName: this.props.user.profile.lastName,
    newProfilePicture: this.props.user.profile.profilePicture
  }

  handleEditButtonClick = () => {
    this.setState({profileEditActive: !this.state.profileEditActive})
  }

  handleNewProfileData = () => {
    return this.props.mutate(
      {variables: 
      {
        user: this.props.user._id,
        first: this.state.newFirstName,
        last: this.state.newLastName,
        pic: this.state.newProfilePicture
      }});
  }

  renderEditForm = () => {
    const {newFirstName, newLastName, newProfilePicture} = this.state;
    return (
      <>
        <Form
          onSubmit={this.handleNewProfileData}>
          <a style={{color: "white"}}>First Name</a>
          <FormInput
            placeholder={newProfilePicture}
            value={newFirstName}
            onChange={e => this.setState({newFirstName: e.target.value})} />
          <a style={{color: "white"}}>Last Name</a>
          <FormInput
            placeholder={newProfilePicture}
            value={newLastName}
            onChange={e => this.setState({newLastName: e.target.value})} />
          <a style={{color: "white"}}>Profile Picture URL</a>
          <FormInput
            placeholder={newProfilePicture}
            value={newProfilePicture}
            onChange={e => this.setState({newProfilePicture: e.target.value})} />
          <Button variant="primary" type="submit" additionalClass="form__btn">Save changes</Button>
        </Form>
      </>
    )
  }

  renderPersonalProfile = () => {
    const {profileEditActive} = this.state;
    return (
      <>
        <Button variant="primary" onClick={this.handleEditButtonClick}>{profileEditActive ? "Exit" : "Edit Profile"}</Button>

        {
          profileEditActive ? this.renderEditForm() : this.renderStrangerProfile()
        }
      </> 
    )
  }

  renderStrangerProfile = () => {
    return (
      <>
        <div style={profileContainerStyle}>
          <Button variant="primary" style={exitButtonStyle} onClick={this.props.exit}>X</Button>
          <img src={this.props.user.profile.profilePicture} alt="" height="100" width="100" style={picStyle}/>
          <h1 align="center">{this.props.user.profile.firstName}</h1>
          <h1 align="center">{this.props.user.profile.lastName}</h1>
          <h4 align="center">joined: 11-08-2019{this.props.user.createdAt}</h4>
          <h4 align="center">account Type: {this.props.user.isCompany === true ? "Company" : "Personal"}</h4>
          <h2 align="center" style={{marginTop: "30px"}}>Points gained: {this.props.user.cachesFound}</h2>
          <div style={{marginTop: "15px"}}>
            <img src={aImg1} alt="" height="50" width="50" style={achievementsImgStyle}/>
            <img src={aImg2} alt="" height="50" width="50" style={achievementsImgStyle}/>
            <img src={aImg3} alt="" height="50" width="50" style={achievementsImgStyle}/>
          </div>
        </div>  
      </> 
    )
  }

  render() {
    const config = { stiffness: 180, damping: 14 };
    const toCSS = (scale) => ({ transform: `scale3d(${scale}, ${scale}, ${scale})` })
    return (
      <Motion 
        defaultStyle={{ scale: 0 }} 
        style={{ scale: spring(1, config) }}>
        {
          (value) => 
            <div style={toCSS(value.scale)}>
              {this.props.user._id === this.props.loggedUserId ? this.renderPersonalProfile() : this.renderStrangerProfile()}
            </div>
        }
      </Motion>
    );
  }
}

const EDIT_PROFILE = gql`
  mutation($user: String!, $first: String!, $last: String!, $pic: String!) {
    setNewProfileData(user: $user, firstName: $first, lastName: $last, profilePic: $pic)  {
      profile {
        firstName
        lastName
        profilePicture
      }
    } 
}
`;

const withEditProfile = graphql(EDIT_PROFILE);
export default compose(withEditProfile)(withSocket(withUserContext(UserProfile)));