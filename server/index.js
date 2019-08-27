const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post("/api/form", (req, res) => {
  nodemailer.createTestAccount((err, account) => {

    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ashley.green74@ethereal.email",
        pass: "MUTh7uG93sNTk235U1"
      }
    })

    let mailOptions = {
      from: "test@testaccount.com",
      to: "miszekb@gmail.com",
      replyTo: "test@testaccount.com",
      subject: "GeoCache Chat Alert",
      text: req.body.message,
    }

    transporter.sendMail(mailOptions, (err, info) => {
      if(err){
        return console.log(err)
      }
      
      console.log("Message sent! " + info.message)
      console.log("Message URL: "+nodemailer.getTestMessageUrl(info))
    })

  })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log('server listening on port ' + PORT)
})