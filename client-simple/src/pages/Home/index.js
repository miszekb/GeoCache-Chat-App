import React, { Component } from "react";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { message } from "antd";
import * as short from "short-uuid";
import _ from "lodash";
import axios from "axios";
import Sidebar, {SidebarArea, SidebarItem, SidebarMessage} from "../../components/Sidebar/Sidebar";
import ChannelItem from "../../components/ChannelItem/ChannelItem";
import Modal from "../../components/Modal/Modal";
import { FormInput } from "../../components/Form/Form";
import Button from "../../components/Button/Button";
import Loader from "../../components/Loader/Loader";
import Legend from "../../components/Legend/Legend";
import Toggler from "../../components/Toggler/Toggler";
import MapChatrooms from "../../components/GoogleMaps/MapChatrooms/MapChatrooms";
import withUserContext from "../../components/withUserContext";
import "./Home.style.scss";
import { NONAME } from "dns";

const sortButtonStyles = {
  marginLeft: "20px",
  marginRight: "20px"
}

const sortSelectStyles = {
  padding: "5px",
  fontsize: "15px",
  borderRadius: "10px"
}

const searchInputStyle = {
  padding: "5px",
  borderRadius: "10px",
  fontsize: "15px"
}

// SORTING OPTIONS LEGEND:
// - 0 - none 
// - 1 - difficulty increasing
// - 2 - difficulty decreasing
// - 3 - seekers increasing
// - 4 - seekers decreasing

class Home extends Component {
  state = {
    username: "",
    modalOpen: false,
    channelID: null,
    mapVisible: false,
    isUserLogged: false,
    sortingOption: 0,
    searchInput: "",
  }

  componentWillReceiveProps(nextProps, nextContext) {
    // DK: Maybe make it less deeper in withUserContext (props.userState) and then skip whole method
    if (!this.state.isUserLogged && _.get(nextProps, ["context", "userState", "user", "id"], false)) {
      this.setState({isUserLogged: true});
    }
  }

  async handleEmailSending(e) {
    e.preventDefault();
    const name = "Your weekly stats!";
    const message = "Those are your weekly stats.";
    const address = "..."
    const form = await axios.post("/api/form", {
      name,
      message,
      address
    });
  }

  componentWillMount() {

  }

  renderModal() {
    const { username, modalOpen } = this.state;
    const guestID = localStorage.getItem("guest_ID");
    const guestUsername = localStorage.getItem("guest_Username");
    const modalDesc = (guestID && guestUsername) ? "Welcome back. Your login is set to:" : "Please enter your username before joining the channel";

    return (
      <Modal
        id="join_channel"
        heading="Hi Guest!"
        desc={modalDesc}
        modalOpen={modalOpen}
        closeModal={() => this.toggleModal(null)}>
        <form className="form" onSubmit={this.setGuestData}>
          {(guestID && guestUsername) ? (
            <span className="modal__login">{guestUsername}</span>
          ) : (
            <FormInput
              label="Your username"
              id="username"
              placeholder="Username"
              value={username}
              onChange={e => this.setState({username: e.target.value})}
            />
          )}

          <Button variant="primary" type="submit" additionalClass="modal__btn">Join Channel</Button>
        </form>
      </Modal>
    );
  }

  setGuestData = e => {
    e.preventDefault();
    const { username, channelID } = this.state;
    const shortUUID = short.generate();
    const guestID = localStorage.getItem("guest_ID");
    const guestUsername = localStorage.getItem("guest_Username");

    if (!guestID || !guestUsername) {
      if (!username.length) {
        return message.error("You must enter username before joining the channel");
      }

      if (username.length < 4) {
        return message.error("Your username is too short");
      }

      localStorage.setItem("guest_ID", shortUUID);
      localStorage.setItem("guest_Username", username);
    }

    // Go to the channel
    this.props.history.push(`/chat/${channelID}`);
  }

  toggleMapView = () => { 
    this.setState({ mapVisible: !this.state.mapVisible });
  }

  toggleModal = channelID => {
    this.setState({
      username: "",
      modalOpen: !this.state.modalOpen,
      channelID: channelID
    });
  }

  renderLoggedUserChatrooms = () => {
    const { isUserLogged } = this.state;
    const { chatrooms, loading, error } = this.props.data;
    const { user } = this.props.context.userState;

    if (loading && isUserLogged) return <Loader>Loading caches...</Loader>;
    if (error || !isUserLogged) return null;

    const loggedUserChatrooms = chatrooms.filter(chatroom => chatroom.owner._id === user.id);

    if (loggedUserChatrooms.length > 0) {
      return loggedUserChatrooms.map(({ _id, name }) => <SidebarItem key={_id} title={name} url={`/chat/${_id}`} exitUrl="/"/>);
    } else return <SidebarMessage>You don't have any caches yet</SidebarMessage>;
  };

  renderAllChatrooms = () => {
    const { mapVisible, sortingOption } = this.state;
    const { userState } = this.props.context;
    const { chatrooms, loading, error } = this.props.data;

    if (loading) return <Loader isDark>Loading caches...</Loader>;
    if (error) return null;

    if (chatrooms && chatrooms.length) {
      if(mapVisible) {return <MapChatrooms chatrooms={chatrooms} />}
      else {
        switch(sortingOption) {
        case "0":
          chatrooms.sort(this.sortByPremium); break; 
        case "1":
          chatrooms.sort(this.sortByDifficultyIncrease); break;
        case "2":
          chatrooms.sort(this.sortByDifficultyDecrease); break;
        case "3":
          chatrooms.sort(this.sortBySeekersIncrease); break; 
        case "4":
          chatrooms.sort(this.sortBySeekersDecrease); break;  
        }
        return (
          <div className="chatrooms">
            <div className="sponsored">
              {
                chatrooms.filter(this.filterSponsored).map(({ _id, name, users, isFound, description, difficultyLevel, isSponsored }) => (
                  <ChannelItem 
                    key={_id} id={_id} 
                    title={name} 
                    url={`/chat/${_id}`} 
                    users={(users && users.length) || 0} 
                    isFound={isFound} 
                    toggleModal={this.toggleModal} 
                    isLogged={!!userState.user} 
                    desc={description}
                    difficultyLevel={difficultyLevel}
                    isSponsored={isSponsored}
                  />
                ))}
            </div>
            {
              chatrooms.filter(this.searchFilter).map(({ _id, name, users, isFound, description, difficultyLevel, isSponsored }) => (
                <ChannelItem 
                  key={_id} id={_id} 
                  title={name} 
                  url={`/chat/${_id}`} 
                  users={(users && users.length) || 0} 
                  isFound={isFound} 
                  toggleModal={this.toggleModal} 
                  isLogged={!!userState.user} 
                  desc={description}
                  difficultyLevel={difficultyLevel}
                  isSponsored={isSponsored}
                />
              ))}
          </div>);
      }    
    }
    return <div>There are no caches at the moment</div>;
  };

  filterSponsored = (a) => {
    if (a.isSponsored) return true;
    else return false;
  }

  sortBySeekersIncrease = (a, b) => {
    if (a.users < b.users) return -1;
    if (a.users > b.users) return 1;
    return 0;
  }

  sortByDifficultyIncrease = (a, b) => {
    if (a.difficultyLevel < b.difficultyLevel) return -1;
    if (a.difficultyLevel > b.difficultyLevel) return 1;
    return 0;
  }

  sortByDifficultyDecrease = (a, b) => {
    if (a.difficultyLevel > b.difficultyLevel) return -1;
    if (a.difficultyLevel < b.difficultyLevel) return 1;
    return 0;
  }

  sortBySeekersDecrease = (a, b) => {
    if (a.users > b.users) return -1;
    if (a.users < b.users) return 1;
    return 0;
  }

  searchFilter = (chatroom) => {
    return chatroom.name.includes(this.state.searchInput) && !chatroom.isSponsored;
  }

  handleSortingSelection = (e) => {
    this.setState({sortingOption: e.target.value})
  }

  handleSearchInput = (e) => {
    this.setState({searchInput: e.target.value})
  }

  render() {
    const { mapVisible } = this.state;
    const { userState } = this.props.context;

    return (
      <div className="page">
        <Sidebar userName={null}>
          {userState.user && (
            <SidebarArea heading="Your Channels">
              {this.renderLoggedUserChatrooms()}
            </SidebarArea>
          )}
        </Sidebar>

        <section className={mapVisible ? "page__content chatrooms-map__content" : "page__content"}>
          <header className="page__header">
            <h2 className="page__heading">Hidden Caches List</h2>
            <Toggler isChecked={mapVisible} toggleMap={this.toggleMapView} />
            {!mapVisible ?
              <form action="...">
                <label style={sortButtonStyles}><b>Sort by:</b></label>
                <select onChange={ e => this.handleSortingSelection(e)} name="sorting_select" style={sortSelectStyles}>
                  <option value="0" style={sortButtonStyles}>None</option>
                  <option value="1" style={sortButtonStyles}>Difficulty &#8679;</option>
                  <option value="2" style={sortButtonStyles}>Difficulty &#8681;</option>
                  <option value="3" style={sortButtonStyles}>Seekers &#8679;</option>
                  <option value="4" style={sortButtonStyles}>Seekers  &#8681;</option>
                </select>
                <label style={sortButtonStyles}><b>Search</b></label>
                <input type="text" style={searchInputStyle} value={this.state.searchInput} onChange={(e) => this.handleSearchInput(e)}></input>
              </form>
              : null
            }
          </header>  

          {!mapVisible && <Legend/>}

          <div className={mapVisible ? "page__wrapper chatrooms-map__wrapper" : "page__wrapper"}>
            {this.renderAllChatrooms()}
          </div>
        </section>

        {this.renderModal()}
      </div>
    );
  }
}

const GET_CHATROOMS = gql`
  query {
    chatrooms {
      _id
      name
      description
      users {
        _id
      }
      owner {
        _id
        isCompany
      }
      latitude
      longitude
      isFound
      difficultyLevel
      isSponsored
    }
  }
`;

const withAllChatrooms = graphql(GET_CHATROOMS);

export default compose(withAllChatrooms)(withUserContext(Home));