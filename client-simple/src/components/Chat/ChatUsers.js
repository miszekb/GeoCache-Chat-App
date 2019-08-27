import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { SidebarArea, SidebarItem } from "../Sidebar/Sidebar";
import {Motion, spring} from "react-motion";
import Loader from "../Loader/Loader";
import Toggler from "../Toggler/Toggler"
import Button from "../Button/Button"
import withSocket from "../../components/withSocket";
import _ from "lodash";
import withUserContext from "../withUserContext";
import UserProfile from "../../pages/UserProfile/index"

class ChatUsers extends Component {
  state = {
    chatroomUsers: null,
    displayProfile: false,
    chosenProfile: null
  };

  componentDidUpdate = async () => await this.handleJoiningToChannelMutation();

  handleJoiningToChannelMutation = () => {
    const {chatroomUsers} = this.state;
    const {mutate, loggedUserId} = this.props;
    const isCurrentUserPresentInChannelUsersArray = !!_.find(chatroomUsers, (user) => user._id === loggedUserId);

    if (!isCurrentUserPresentInChannelUsersArray && loggedUserId) {
      return mutate()
        .then(({ data }) => {
          const {joinToChatroom: mutationResponse} = data;
          this.setState({chatroomUsers: mutationResponse && mutationResponse.users || []});
        })
        .catch((e) => console.log(`e: `, e));
    }
    return null;
  };

  getUserProfile = (user) => {
    this.setState({
      displayProfile: true,
      chosenUser: user
    });
  }

  exitButtonHandler = () => {
    this.setState({displayProfile: false})
  }

  markUserFound = (id, caches) => {
    this.props.addPoints({variables: {user: id, caches: caches+1}});
    alert("Point has been added!");
  }

  filterUsers = (user) => {
    return this.props.loggedUserId !== user._id
  }
  usersList() {
    const {chatroomUsers: chatRoomUsersFromState} = this.state;
    const {users: chatRoomUsersFromProps} = this.props.chatroom;
    const _properChatroomUsersArr = chatRoomUsersFromState || chatRoomUsersFromProps;
    if (!_properChatroomUsersArr) return <Loader>Loading seekers...</Loader>;
    if (_properChatroomUsersArr && _properChatroomUsersArr.length) {
      return _properChatroomUsersArr.map((user) => 
      {  
        return (
          <div style={{backgroundColor: "#0e510f", paddingLeft: 10, marginBottom: 10, flexDirection: "row", display: "flex" }} key={user._id}>
            <div onClick={() => this.getUserProfile(user)}>
              <SidebarItem 
                key={user._id} 
                title={user.profile.firstName} 
                image={user.profile.profilePicture} 
                caches={user.cachesFound}
              />
            </div>
            <span style={{flex: 1}}>
            </span>
            {this.props.isOwner && this.props.loggedUserId !== user._id ? 
              <Button 
                style={{margin: 5, fontSize: 15}} 
                variant="primary" 
                onClick={() => this.markUserFound(user._id, user.cachesFound)}>+</Button> : null
            }
          </div>
        )
      });
    } else {
      return <SidebarItem title="Seems like chat is empty?" />;
    }
  }
  
  render() {
    const {displayProfile, chosenUser} = this.state;
    return (
      <>     
        {displayProfile ?  <UserProfile isCompany={chosenUser.isCompany} user={chosenUser} exit={this.exitButtonHandler} loggedUserId={this.props.loggedUserId}/>
          :<SidebarArea heading="Users In This Channel">
            {this.usersList()}
          </SidebarArea>
        }           
      </>
    );
  }
}

const JOIN_TO_CHANNEL = gql`
  mutation ($chatroom: String!) {
    joinToChatroom(chatroom: $chatroom){
      _id
      name
      users {
        _id
        profile {
          firstName
          lastName
          profilePicture
        }
        cachesFound
      }
    }
  }
`;

const ADD_POINT = gql`
  mutation ($user: String!, $caches: Float!) {
    addCacheFound(user: $user, caches: $caches){
      _id
      cachesFound
    }
  }
`;

const withJoinToChannel = graphql(JOIN_TO_CHANNEL, {options: (props) => ({ variables: { chatroom: props.match.params.chatId }})});
const withAddPoint = graphql(ADD_POINT, {name: "addPoints"});
export default compose(withJoinToChannel, withAddPoint)(withUserContext(withSocket(ChatUsers)));