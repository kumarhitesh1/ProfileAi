const express = require("express");
const router=express.Router();
const {isAuth} = require("../middlewares/isAuth");  
const{ register, login, googleAuth, myProfile, logout, updateProfile, changePassword }=require("../controllers/user");
const {upload} = require("../utils/cloudinary");

router.post("/user/register", upload.single("profilePic"), register);
router.post("/user/login", login);
router.post('/user/google-auth', googleAuth);
router.get("/user/myprofile", isAuth, myProfile);
router.put("/user/updateprofile", isAuth, upload.single("profilePic"), updateProfile);
router.put("/user/changepassword", isAuth, changePassword);
router.get("/user/logout", isAuth, logout);

module.exports=router;