const User = require("../models/user");
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tryCatch = require("../utils/tryCatch");
const { uploadToCloudinary } = require("../utils/cloudinary");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please fill all the fields",
    });
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      message: "User already exists",
    });
  }
  let profilePic = "";
  if (req.file) {
    const result = await uploadToCloudinary(req.file);
    profilePic = result.secure_url;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    profilePic,
  });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SEC, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return res.status(201).json({
    message: "User registered successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
    },
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Please fill all the fields",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "Invalid Credentials",
    });
  }
  if (!user.password) {
    return res.status(400).json({
      message: "This account uses Google login",
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      message: "Invalid Credentials",
    });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SEC, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return res.status(200).json({
    message: "User logged in successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
    },
  });
}

async function myProfile(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  return res.status(200).json({
    user: req.user,
  });
}

async function googleAuth(req, res) {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Google token is required' });
    }

    // verify google token
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub } = ticket.getPayload();

    // check if user exists
    let user = await User.findOne({ email });

    if (user) {
        // existing user — update googleId if not set
        if (!user.googleId) {
            user.googleId = sub;
            user.profilePic = user.profilePic || picture;
            await user.save();
        }
    } else {
        // new user — create account
        user = await User.create({
            name,
            email,
            googleId: sub,
            profilePic: picture,
        });
    }

    // generate JWT
    const jwtToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SEC,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
        message: 'Google login successful',
        token: jwtToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
        },
    });
}

async function updateProfile(req, res) {
  const { name } = req.body;
  const updateData = { name };

  if (req.file) {
    const result = await uploadToCloudinary(req.file);
    updateData.profilePic = result.secure_url;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    message: "Profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
    },
  });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({
      message: "Current password is incorrect",
    });
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  return res.status(200).json({
    message: "Password changed successfully",
  });
}

async function logout(req, res) {
  return res.status(200).json({
    message: "User logged out successfully",
  });
}

module.exports = {
  register: tryCatch(register),
  login: tryCatch(login),
  googleAuth: tryCatch(googleAuth),
  myProfile: tryCatch(myProfile),
  updateProfile: tryCatch(updateProfile),
  changePassword: tryCatch(changePassword),
  logout: tryCatch(logout),
};
