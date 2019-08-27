import React, { Component } from "react";
import { Form, FormInput, FormFooterText} from "../../components/Form/Form";
import Button from "../../components/Button/Button";
import "./Register.style.scss";
import { UserContext } from "../../services/userContext";

const forbiddenChars = "#$!%&'()*+,-./:;<=>?@[]^_`{|}~";

const neutralValueStyle = {}
const correctValueStyle = {border: "2px solid green"}
const wrongValueStyle = {border: "2px solid red"}

const lowStrength = require("../../assets/images/1.png");
const mediumStrength =  require("../../assets/images/2.png");
const highStrength =  require("../../assets/images/3.png");

const picturePreviewStyle = {
  width: 100,
  height: 100,
  borderRadius: 50
}

class Register extends Component {
  state = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordRepeat: "",
    errorMsg: null,
    passwordOK: false,
    passwordRepeatOK: false,
    nicknameOK: false,
    lastNameOk: false,
    profilePicture: "https://www.pngfind.com/pngs/m/110-1102775_download-empty-profile-hd-png-download.png",
    isCompany: false,
    cachesFound: 0
  }

  resetState = () => this.setState({ firstName: "", lastName: "", email: "", password: "", profilePic: ""});

  //FORM CONTROL METHODS
  
  handleUsernameValidation = (event) => {
    let nicknameControl = true;
    this.setState({firstName: event.target.value})
    const nick = event.target.value;
    (nick.length >= 3) ? forbiddenChars.split("").forEach(char =>
    {
      nick.includes(char) ? nicknameControl = false : ""
    }) : nicknameControl = false;

    nicknameControl ? this.setState({nicknameOK: true}) 
      :  this.setState({nicknameOK: false})
  }

  handleLastNameValidation = (event) => {
    let lastNameControl = true;
    this.setState({lastName: event.target.value})
    const nick = event.target.value;
    (nick.length >= 3) ? forbiddenChars.split("").forEach(char =>
    {
      nick.includes(char) ? lastNameControl = false : ""
    }) : lastNameControl = false;

    lastNameControl ? this.setState({lastNameOK: true}) 
      :  this.setState({lastNameOK: false})
  }

  handlePasswordValidation = (event) => {
    this.setState({password: event.target.value})
    const password = event.target.value;
    let letterCounter = 0, specialCounter = 0;
    let isLetter = true;

    password.split("").forEach(char =>
    {
      forbiddenChars.split("").forEach(charSpec => {
        if(char !== charSpec) {isLetter = true} 
        else {specialCounter += 1; isLetter = false; return; }
      })
      isLetter ? letterCounter += 1 : ""
    })

    if(specialCounter > 0 && letterCounter >= 8)
    {
      this.setState({passwordOK: true})
    }
    else this.setState({passwordOK: false})
  }

  handlePasswordRepeatValidation = () => {
    this.setState({passwordRepeat: event.target.value});
    const rPassword = event.target.value;

    if(this.state.password.length > 0)
    {
      (this.state.passwordOK && rPassword === this.state.password) ?
        this.setState({passwordRepeatOK: true})
        :  this.setState({passwordRepeatOK: false})
    }
  }


  handleFormSubmit = signUp => async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, profilePicture, isCompany, cachesFound } = this.state;
    console.log("Submitting registration...", { firstName, lastName, email, password, profilePicture, isCompany, cachesFound });
    const registerRes = await signUp({ firstName, lastName, email, password, profilePicture, isCompany, cachesFound});
    const err = this.handleRegisterError(registerRes);
    console.log(`registerRes: `, JSON.stringify(registerRes));
    if (!err) this.props.history.push("/");
    this.resetState();
  };

  handleRegisterError = registerRes => {
    if (registerRes instanceof Error) { //eslint-disable-line valid-typeof
      const errorMsg = registerRes.message;
      console.log(`Register. errorMsg: `, errorMsg);
      this.setState({errorMsg});
      return errorMsg;
    } else {
      this.setState({errorMsg: null});
      return null;
    }
  }

  renderFormFooter() {
    return (<>
        <FormFooterText>Already have an account? <a href="/login" className="form__link">Go to Login</a></FormFooterText>
        <FormFooterText><a href="/" className="form__link">Go back</a> to the Homepage</FormFooterText>
      </>);
  }

  renderHints() {
    return(<>
        <p style={{border: "1px solid grey", padding: 15, borderRadius: 10}}>What's up? Before you can sign up, your username and password
        have to meet some requirements:
        <ul style={{marginTop: 5}}>
          <li>Your first and last name have to contain at least 3 letters and no numbers or special characters </li>
          <li>Your password has to contain at least 8 letters and 1 number or special character </li>
        </ul>
        </p>
    </>)
  }

  determinePasswordStrength = () => {
    const len = this.state.password.length;
    if(len <= 9) return lowStrength;
    else if(len > 9 && len < 12) return mediumStrength;
    else return highStrength;
  }

  setAccountType = (e) => {
    let value =  (e.target.value === "true");
    this.setState({isCompany: value})
  }

  renderPasswordStrengthBar() {
    return(<>
        <img 
          src={this.determinePasswordStrength()}
          width="400" 
          height="10" 
          style={{marginBottom: 30, marginTop: 1, borderRadius: 5}}
        />
    </>)
  }

  render() {
    const { name, username, email, password, errorMsg, passwordRepeat, passwordOK, profilePicture } = this.state;
    return <div className="page">
      <div className="page__wrapper page__wrapper--absolute register__wrapper">
        <UserContext.Consumer>
          {({ signUp }) =>
            (<Form
              heading="Register"
              onSubmit={this.handleFormSubmit(signUp)}
              formFooter={() => this.renderFormFooter()}>
              {this.renderHints()}
              <span>Type of account:</span>
              <select style={{marginLeft: "20px", marginBottom: "15px", fontSize: "17px"}} onChange={(e) => this.setAccountType(e)}>
                <option value="false">Private</option>
                <option value="true">Company</option>
              </select>
              <FormInput
                label="First name / Nickname"
                id="name"
                style = { this.state.nicknameOK ? correctValueStyle : neutralValueStyle}
                placeholder="John"
                value={name}
                onChange={e => this.handleUsernameValidation(e)} />

              <FormInput
                label="Last Name"
                id="username"
                style = { this.state.lastNameOK ? correctValueStyle : neutralValueStyle}
                placeholder="Doe"
                value={username}
                onChange={e => this.handleLastNameValidation(e)} />

              <FormInput
                label="E-mail Address"
                id="email"
                placeholder="example@example.com"
                value={email}
                onChange={e => this.setState({email: e.target.value})} />
                
              <FormInput
                label="Password"
                id="passwd"
                style = { this.state.passwordOK ? correctValueStyle : neutralValueStyle}
                placeholder="Password"
                value={password}
                type="password"
                onChange={e => this.handlePasswordValidation(e)} />            

              {this.state.passwordOK ? this.renderPasswordStrengthBar() : null}

              <FormInput
                label="Repeat Password"
                id="rpasswd"
                style = { this.state.passwordRepeatOK ? correctValueStyle : neutralValueStyle}
                placeholder="Password"
                value={passwordRepeat}
                type="password"
                onChange={e => this.handlePasswordRepeatValidation(e)} />
              <FormInput
                label="Profile Picture"
                id="rpasswd"
                style = {neutralValueStyle}
                placeholder="Picture URL"
                value={profilePicture}
                onChange={e => this.setState({profilePicture: e.target.value})} />
              <span><img style={picturePreviewStyle} src={profilePicture} alt="preview"/></span>
              <Button variant="primary" additionalClass="form__btn">Register</Button>
              {errorMsg ? <p className="form__error">{errorMsg}</p> : ""}
            </Form>
            )}
        </UserContext.Consumer>
      </div>
    </div>;
  }
}

export default Register;
