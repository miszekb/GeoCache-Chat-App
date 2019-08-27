import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { message } from "antd";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./GlobalRanking.style.scss";
import "../../components/Legend/Legend.style.scss"
import _ from "lodash";
import withUserContext from "../../components/withUserContext";

const userItemStyles = {
  marginLeft: 40, 
  marginRight: 40, 
  marginTop: 20, 
  padding: 10, 
  paddingRight:30,
  backgroundColor: "#d6dfd7", 
  flexDirection: "row", 
  display: "flex",
  borderRadius: 10,
  fontSize: 30
}

class GlobalRanking extends Component {
  state = {
    userList: []
  }

  componentDidMount = async () => {
    this.rankAllPlayers().then(async response => 
      await this.setState({userList: response.data.users.sort(this.compareUsersStats)}));
  };

  rankAllPlayers = () => {
    return this.props.context.getAllUsers().then(response => response);
  }

  renderUserItem = (user, index) => {
    return (
      <>
        <div style={userItemStyles}>
          <h1 style={{fontSize: 25, marginTop: 5, marginRight: 10}}>{index + 1}</h1>
          <span><img style={{width: 60, height: 60, borderRadius: 30, marginLeft: 10}} src={user.profile.profilePicture} alt="Error loading image"/></span>
          <span style={{marginTop: 15, marginLeft: 20, display: "flex", textAlign:"right"}}>
            <h3 style={{fontSize: 18}}>{user.profile.firstName}</h3>
            <h3 style={{marginLeft: 10, fontSize: 18}}>{user.profile.lastName}</h3>
          </span>
          <span style={{flex: 1}}>
          </span>
          {user.cachesFound}
        </div>
      </>
    )
  }

  renderLegend = () => {
    return (
      <div className="legend" style={{alignSelf: "right"}}>
        <span style={{marginLeft: 50}} className="legend__name legend__title">Player</span>
        <div className="legend__wrapper">
          <span style={{marginRight: 10}} className="legend__name">Points</span>
        </div>
      </div>
    )
  }

  compareUsersStats = (user1, user2) => {
    return user2.cachesFound - user1.cachesFound;
  }

  render () {
    const {userList} = this.state;    
    return (
      <div>
        <Sidebar></Sidebar>
        <div className="page">
          <section className="page__content">
            <div style={{backgroundColor: "white"}}>
              <header className="page__header">
                <h2 className="page__heading">Players Global Ranking</h2>
              </header>
              {this.renderLegend()}
              <div className="ranking">
                {userList.map(user => 
                  this.renderUserItem(user, userList.indexOf(user))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }
}

const GET_USERS = gql`
  query {
    users {
      _id
      profile {
        firstName
        lastName
        profilePicture
      }
      cachesFound
      isCompany
    }
  }
`;

const withGetUsers = graphql(GET_USERS, {
  name: "getUsers"
});

export default compose(withGetUsers)(withUserContext(GlobalRanking));





