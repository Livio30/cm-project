import User from "../models/usersModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import express from "express";
import dotenv from "dotenv";
import mailgun from "mailgun-js";
dotenv.config();
const router = express.Router();
const teacherKey = "welcometeacher";
const adminKey = "manager";
router.post("/signup", async (req, res) => {
  try {
    const { email, password, confirmPwd, fullName, role} = req.body;
    // signup validation
    if (!email)
      return res.status(400).json({ errorMessage: "Please Enter your Email." });
    if (!role)
      return res.status(400).json({ errorMessage: "Please select a role." });
    if (!fullName)
      return res.status(400).json({ errorMessage: "Please enter your name." });
    if (password.length < 8)
      return res.status(400).json({
        errorMessage: "Please Enter Password of atleast 8 characters.",
      });
    const existingUser = await User.findOne({ email });
    if (password !== confirmPwd)
      return res
        .status(400)
        .json({ errorMessage: "Please enter the same password twice" });
    if (existingUser)
      return res.status(400).json({ errorMessage: "User already exists." });
    // Hash Password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    // Send Email
    const DOMAIN = "sandboxdd904711ffff4a1e874ae7f4bee1fd03.mailgun.org";
    const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN });

    // Creating token
    const token = jwt.sign(
      { email, passwordHash, fullName, role },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const data = {
      from: email,
      to: "liviofranm@gmail.com",
      subject: "Account Activation Link",
      html: `
                <h2>Click on below link to activate the account</h2>
                <p>${process.env.CLIENT_URL}/activate/acc${token}</p>
                <a href='${process.env.CLIENT_URL}/activate/acc${token}'><button>Click Here</button></a>
            `,
    };
    mg.messages().send(data, function (error, body) {
      if (error) {
        res.json({ errorMessage: "Error sending Messsage" });
        console.log("Error");
      }
      res.json({ errorMessage: "Please wait until account activated" });
      console.log("Mail sent");
      console.log(body);
    });

    // // Send the token in a HTTP-only cookie
    // res
    //     .cookie("token", token, {
    //         httpOnly: true,
    //     })
    //     .send("userCreated");
  } catch (err) {
    console.error(err);
    res.status(500).send("erroroccured");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // login validate
    if (!email || !password)
      return res.status(400).json({ errorMessage: "Please Enter All fields." });
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(401).json({ errorMessage: "Wrong email or password" });

    const correctPwd = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );
    if (!correctPwd)
      return res.status(401).json({ errorMessage: "Wrong email or password" });
    // log user
    const token = jwt.sign(
      {
        user: existingUser._id,
      },
      process.env.JWT_SECRET
    );
    // Send the token in a HTTP-only cookie
    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .send("logged");
  } catch (err) {
    console.log("catch scope");
    console.log(err);
    res.status(500).send();
  }
});
// logout
router.use("/logout", (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .send("Logged Out");
});

// checked if user is logged in //
router.get("/loggedIn", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json(false);
    //   req.user = verified.user;
    res.send(true);
  } catch (err) {
    console.log("not logged");
    res.json(false);
  }
});
export default router;
