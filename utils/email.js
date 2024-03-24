const nodemailer = require("nodemailer");

module.exports = class Email {
  constructor(user, code) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.from = `Get Truck <${process.env.EMAIL_FROM}>`;
    this.code = code;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Sendgrid
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: `
        <h1 class="header">Hello ${this.firstName}</h1>
        <h3>Your code is ${this.code}</h3>
      `,
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  //   async sendWelcome() {
  //     await this.send("welcome", "Welcome to the Get Truck Family!");
  //   }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }

  async sendDeleteAccount() {
    await this.send(
      "deleteAccount",
      "Your delete account token (valid for only 10 minutes)"
    );
  }
};
