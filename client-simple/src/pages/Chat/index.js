import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { message } from "antd";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatMessages from "../../components/Chat/ChatMessages";
import ChatUsers from "../../components/Chat/ChatUsers";
import Button from "../../components/Button/Button";
import withSocket from "../../components/withSocket";
import "./Chat.style.scss";
import _ from "lodash";
import withUserContext from "../../components/withUserContext";

const userTagWindowStyles = {
  zIndex: 999, 
  position: "fixed",
  width: 100, 
  left: "350px",
  bottom: "15%",
  backgroundColor: "white",
  padding: "10px",
  border: "2px solid #3c7e29",
  color: "#3c7e29"
}

class Chat extends Component {
  state = {
    inputMessageText: "",
    msgBuffer: "",
    guestId: localStorage.getItem("guest_ID") || null,
    guestName: localStorage.getItem("guest_Username") || null,
    checked: false,
    renderTagWindow: false,
    currentTagHints: null,
    setFound: false,
    firstRender: true
  };

  loggedUserId = () => _.get(this.props, ["context", "userState", "user", "id"], null);
  loggedUserName = () => _.get(this.props, ["context", "userState", "user", "profile", "firstName"], null);

  componentDidMount = async () => {
    const { socket, chatroom } = this.props;
    const { chatId } = this.props.match.params;
    socket.on("connection", this.emitJoinSocketRoomRequest(chatId));
    this.setState({setFound: !this.props.loading && chatroom.isFound})
  };

  isValidUserOrGuest = () => {
    const { guestName, guestId } = this.state;
    if (!(guestName && guestId) && !(this.loggedUserName() && this.loggedUserId())) {
      message.error(`Please either login or use guest account`);
      return false;
    }
    return true;
  };

  vulgarFilter = () => {
    return fetch("https://www.purgomalum.com/service/json?text="+ this.state.inputMessageText)
      .then((response) => response.json())
  }

  emitJoinSocketRoomRequest = chatId => {
    const { socket } = this.props;
    socket.emit("join", chatId);
  };

  prepareDataForMutation = () => {
    const { inputMessageText: msg, guestId, guestName } = this.state;
    const { chatId: chatroom } = this.props.match.params;
    const loggedUserId = this.loggedUserId();
    
    return {
      ...((loggedUserId) ? {from: loggedUserId} : {guestId, guestName}),
      msg,
      chatroom,
      nickname: this.loggedUserName() || guestName || "Unknown User"
    };
  };

  handleMessageChange = (e) => {
    this.setState({
      msgBuffer: e.target.value, 
      inputMessageText: e.target.value
    });

    if(e.target.value.includes("@")) {
      let chatroomUsersBuff = this.props.chatroom.users;
      let chatroomUsers = chatroomUsersBuff.filter(user => {
        return user.profile.firstName.includes(e.target.value.substr(e.target.value.indexOf("@")+1, e.target.value.length-1))});
      console.log(e.target.value.substr(e.target.value.indexOf("@")+1, e.target.value.length-1))
      this.setState({
        currentTagHints: chatroomUsers,
        renderTagWindow: true
      })  
    }
    else {this.setState({renderTagWindow: false})}
  }

  handleFormSubmit = e => {
    e.preventDefault();
    this.vulgarFilter().then(response => {this.setState({inputMessageText: response.result},
      () => {
        if (this.isValidUserOrGuest()) {
          const { inputMessageText } = this.state;
          const { mutate } = this.props;
          if (inputMessageText.length > 0) {
            this.setState({
              inputMessageText: "",
            });
            return this.props.addMessage({variables: this.prepareDataForMutation()});
          } else {
            message.error("Message is empty");
          }
        }
      }      
    )});
  }

  handleSetFound = async () => {
    const { mutate } = this.props;
    await this.setState({setFound: !this.state.setFound})
    alert(this.state.setFound)
    return this.props.setChatroomFound({variables: {chatroom: this.props.match.params.chatId, isFound: this.state.setFound}});
  }

  onEnterPress = e => {
    if (e.which === 13 && e.shiftKey === false) {this.handleFormSubmit(e)}
  };

  renderToggle = () => {
    return (
      <label className="toggler__wrapper" style={{marginBottom: 20, marginRight: 30, color: "white"}}>
        Set as found:
        <span className="toggler">
          <input type="checkbox" checked={this.state.setFound ? "checked" : ""} onChange={this.handleSetFound} className="toggler__checkbox" />
          <span className="toggler__lever"></span>
        </span>
      </label>);
  }

  render() {
    const { inputMessageText, renderTagWindow, currentTagHints, firstRender } = this.state;
    const { match, chatroom } = this.props;
    console.log(this.props.chatroom)
    !chatroom.loading && firstRender ? this.setState({setFound: chatroom.isFound, firstRender: false}) : null
    // alert(this.state.setFound)
    return (
      <div className="page">
        <Sidebar>
          {chatroom.owner && !chatroom.loading ?
            (this.loggedUserId() === chatroom.owner._id ?
              this.renderToggle() : null)
            : null
          }
          <ChatUsers 
            isOwner={chatroom.owner && !chatroom.loading  ? 
              (this.loggedUserId() === chatroom.owner._id ?
                this.renderToggle() : null) : null} 
            loggedUserId={this.loggedUserId()} 
            match={match} 
            chatroom={chatroom}/>
        </Sidebar>

        <section className="page__content">
          <div className="chat__wrapper">
            <header className="page__header">
              <h2 className="page__heading">Chat: {chatroom && chatroom.name}</h2>
              <Button href="/" additionalClass="chat__back" isLink>To Channel List</Button>
            </header>

            <div className="chat__content">
              <ChatMessages match={match} />
            </div>

            <div className="chat__footer">
              {renderTagWindow ? <div style={userTagWindowStyles}>{currentTagHints.map(user =>{return <div key={user.profile.firstName}>{user.profile.firstName}</div>})}</div>: null}
              <form className="form chat__form" onSubmit={this.handleFormSubmit}>
                <textarea
                  value={inputMessageText}
                  name="message"
                  id="message"
                  className="chat__textarea"
                  placeholder="Enter your message here..."
                  onKeyPress={this.onEnterPress}
                  onChange={e => this.handleMessageChange(e)}
                />
                <Button variant="primary" additionalClass="chat__btn">Send</Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

const GET_CURRENT_CHATROOM = gql`
    query($_id: String!) {
        chatroom(_id: $_id) {
            name
            users {
                _id
                profile {
                    firstName
                    lastName
                    profilePicture
                }
            }
            owner {
              _id
            }
            isFound
        }
    }
`;

const SET_CHATROOM_FOUND= gql`
  mutation($chatroom: String!, $isFound: Boolean!) {
    setChatroomFound(chatroom: $chatroom, isFound: $isFound)  {
      isFound
    } 
}
`;

const ADD_MESSAGE = gql`
  mutation ($guestId: String, $guestName: String, $msg: String!, $chatroom: ID!, $nickname: String!) {
    addMessage(message: {guestId: $guestId, guestName: $guestName, msg: $msg, chatroom: $chatroom, nickname: $nickname})
}
`;

const withCurrentChatroom = graphql(GET_CURRENT_CHATROOM, {
  options: (props) => ({ variables: { _id: props.match.params.chatId }}),
  props: ({data: {chatroom, ...others}}) => ({chatroom: {...others, ...chatroom}})
});

const withAddMessage = graphql(ADD_MESSAGE, {
  name: "addMessage"
});

const withSetChatroomFound = graphql(SET_CHATROOM_FOUND, {
  name: "setChatroomFound"
});
export default compose(withCurrentChatroom, withAddMessage, withSetChatroomFound)(withSocket(withUserContext(Chat)));