import React, { Component } from "react";
import "./MailForm.style.scss";
import { Form, FormInput } from "../Form/Form";
import {Motion, spring} from "react-motion";
import Button from "../Button/Button";
import axios from "axios"

class MailForm extends Component {
  
  constructor() {
    super();

    this.state = {
      name: "",
      message: ""
    }

    this.handleEmailSending = this.handleEmailSending.bind(this);
  }

  async handleEmailSending(e) {
    e.preventDefault();
    const {name, email, message} = this.state
    const address = "admin@geocachechat.com"
    const form = await axios.post("/api/form", {
      name,
      message,
      address
    });
  }

  render (){
    const { name, message } = this.state;
    const config = { stiffness: 180, damping: 14 };
    const toCSS = (scale) => ({ transform: `scale3d(${scale}, ${scale}, ${scale})` })
    return (
      <Motion 
        defaultStyle={{ scale: 0 }} 
        style={{ scale: spring(1, config) }}
      >
        { (value) => 
          <div style={toCSS(value.scale)}>
            <div style = {{backgroundColor: "white", 
              paddingLeft: "20px", 
              paddingRight: "20px",
              paddingTop: "1px",
              paddingBottom: "1px", 
              borderRadius: "15px"}}>
              <Button variant="primary" onClick={this.props.hide} style={{marginLeft: "85%", marginTop: 15}}>X</Button>
              <Form
                onSubmit={this.handleEmailSending}>
                <FormInput
                  label="Name"
                  placeholder="Type your subject here.."
                  value={name}
                  onChange={e => this.setState({name: e.target.value})} />
                <FormInput
                  label="Message"
                  placeholder="Type your message here.."
                  value={message}
                  onChange={e => this.setState({message: e.target.value})} />
                <Button variant="primary" type="submit" additionalClass="form__btn">Send</Button>
              </Form>
            </div>
          </div>
        }
      </Motion>
    );
  }
}

export default MailForm;