import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import _ from "lodash";
import { Message, MessageText } from "../Message/Message";
import withSocket from "../withSocket";
import withUserContext from "../withUserContext";

class ChatMessages extends Component {
  state = {
    messages: [],
    guestId: localStorage.getItem("guest_ID") || null,
    guestName: localStorage.getItem("guest_Username") || null
  };

  loggedUserId = () => _.get(this.props, ["context", "userState", "user", "id"], null);

  componentDidMount = async () => {
    const { socket } = this.props;
    
    socket.on("message", msg => this.handleIncomingMessage(msg));
  };

  componentDidUpdate() {
    this.scrollToBottomElement.scrollIntoView({behavior: "smooth"});
  }

  handleIncomingMessage = msg => this.setState({messages: [...this.state.messages, msg]});

  renderMessage = (message) => {
    const {guestId } = this.state;

    const getMsgAuthorNickname = () => {
      const _socketIoNickname = message.from && message.from.nickname;
      const _graphQlNickname = _.get(message, ["from", "profile", "firstName"], null);
      const {guestName} = message;

      return _socketIoNickname || _graphQlNickname || guestName || "Unknown User";
    };

    const getMsgAuthorPic = () => {
      const _socketIoProfilePic = message.from && message.from.profile && message.from.profile.profilePicture;
      const _graphQlProfilePic = _.get(message, ["from", "profile", "profilePicture"], null);
      const guestPic = "https://vignette.wikia.nocookie.net/the-hanged-three/images/9/9e/Default-profile-picture-question-mark-4.jpg/revision/latest?cb=20190112155537";

      return _socketIoProfilePic || _graphQlProfilePic || guestPic || "Unknown User";
    };

    const isMsgOfMine = (message.from && message.from._id || message.guestId) === (this.loggedUserId() || guestId);
    let containsImage = false;
    let containsVideo = false;
    let imageBuffer =  new Image();
    let dimensions = []

    if(message.msg.includes("https://i.imgur.com/")) {
      imageBuffer.src = message.msg;
      containsImage = true;
      if(imageBuffer.width > 500) {
        const scale = imageBuffer.width/500;
        imageBuffer.width = 500;
        dimensions[0,1] = [500, imageBuffer.height * scale];
      }
    }

    if(message.msg.includes("https://www.youtube.com/watch?v=")) {containsVideo = true;}
    
    return (
      <Message key={message._id} author={getMsgAuthorNickname()} toRight={isMsgOfMine} timestamp={message.createdAt} profilePicture={getMsgAuthorPic()}>
        { containsImage ? 
          <MessageText variant={(isMsgOfMine) ? "primary" : ""}>
            <a rel="noopener noreferrer" href={message.msg} target="_blank">
              <img src={message.msg} height={dimensions[0]} width={dimensions[1]} alt="Error loading image!"/>
            </a>
          </MessageText>
          :
          (containsVideo ? 
            <MessageText variant={(isMsgOfMine) ? "primary" : ""}>
              <iframe width="500" height="250" src={"http://www.youtube.com/embed/" + message.msg.substr(32, 11)}></iframe>
            </MessageText>
            :<MessageText variant={(isMsgOfMine) ? "primary" : ""}>{message.msg}</MessageText>)
        }  
      </Message>
    );
  };
  
  render() {
    const { messages } = this.state;
    const {previousMessages = []} = this.props;
    const newPreviousAndNewMessages = [...previousMessages, ...messages];

    return (
      <>
        {newPreviousAndNewMessages.map((message) => this.renderMessage(message))}
        <div ref={el => {this.scrollToBottomElement = el; }} />
      </>
    );
  }
}

const GET_PREVIOUS_MESSAGES = gql`
  query($chatroom: String!) {
    messages(chatroom: $chatroom) {
      _id
      from {
        _id
        profile {
          firstName
          lastName
          profilePicture
        }
      }
      msg
      guestId
      guestName
      createdAt
    }
  }
`;

const withPreviousMessages = graphql(GET_PREVIOUS_MESSAGES, {
  options: (props) => ({ variables: { chatroom: props.match.params.chatId }}),
  props: ({ data }) => ({previousMessages: data.messages})
});

export default compose(withPreviousMessages)(withSocket(withUserContext(ChatMessages)));