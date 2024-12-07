const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const fs = require ('fs')
const path = require('path')
const {v4: uuid}=require("uuid")

const User = require('../models/userModel')
const HttpError = require("../models/errorModel")
const { hash } = require('crypto')



// ==========================REGISTER A USER(NEW)======================================================================================
//POST: api/users/register
//UNPROCTED

const registerUser= async(req,res, next)=>{
    try{
            const{ name, email,password, password2}= req.body;
            if(!name || !email|| !password){
                return next(new HttpError("fill in all feilds.", 422))
            }

            const newEmail = email.toLowerCase()

            const emailExists= await User.findOne({email: newEmail})
            if(emailExists){
                return next(new HttpError("Email already exist." ,422))
            }
            if((password.trim()).length < 6){
                return next(new HttpError("Password should be 6 characters.", 422))
            }
            if(password !=password2){
                return next(new HttpError("Password do not match.", 422))
            }
           const salt = await bcrypt.genSalt(10)
           const hashedPass= await bcrypt.hash(password, salt);
           const newUser = await User.create({name, email:newEmail, password: hashedPass})
           res.status(201).json(`New user ${newUser.email} registered.`)
            
        
        }catch(error){
        return next(new HttpError("user registration failed.", 422))
    }
}







// ========================== LOGIN A REGISTERED A USER(NEW)=========================================================================
//POST: api/users/login
//UNPROCTED

const loginUser= async(req,res, next)=>{
    try{
        const{email,password} =req.body;
        if(!email || !password){
            return next(new HttpError("Fill in all feilds.", 422))
        }
        const newEmail =email.toLowerCase();

        const user = await User.findOne({email:newEmail})
        if(!user){
            return next(new HttpError("Invalid Credential.",422))
        }
        const comparePass = await bcrypt.compare(password, user.password)
        if(!comparePass){
            return next(new HttpError("Invalid credential.",422))
        }
        const {id: id, name} = user;
        const token = jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn: "1d"})

        res.status(200).json({token, id, name})
        }catch(error){
            return next(new HttpError("Login failed .please check your credential.",422))
        }
    
}


// ==========================USER(NEW) PROFILE============================================================================
//POST: api/users/:id
//UNPROTECTED

const getUser= async(req,res, next)=>{
    try{
        const {id} =req.params;
        const user= await User.findById(id).select('-password');
        if(!user){
            return next(new HttpError("User not found.", 404))
        }
        res.status(200).json(user);

    }catch(error){
        return next(new HttpError(error))
    }
}

// ==========================CHANGE USER(NEW) PROFILE================================================================================
//POST: api/users/change-avatar
//PROTECTED

const changeAvatar= async(req,res, next)=>{
    try{
        if(!req.files.avatar){
            return next(new HttpError("please choose an image", 422))
        }
        const user =await User.findById(req.user.id)
        if(user.avatar){
            fs.unlink(path.join(__dirname, '..', 'uploads', user.avatar), (err) => {

                if(err){
                    return next(new HttpError(err))
                }
            })
        }
        
        const  {avatar} = req.files;
        if(avatar.size> 500000){
            return next(new HttpError("Profile picture too big."), 422)
        }
        let fileName;
        fileName= avatar.name;
        let splittedFilename = fileName.split('.')
        let newFilename = splittedFilename[0] + uuid() + '.' + splittedFilename[splittedFilename.length -1]
        avatar.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err)=>{
            if(err){
                return next(new HttpError(err))
            }
            const updatedAvatar = await User.findByIdAndUpdate(req.user.id, {avatar: newFilename}, {new: true})
            if(!updatedAvatar){
                return next(new HttpError("Avatar not changed.", 422))
            }
            res.status(200).json(updatedAvatar)
        })
    }catch(error){
        return next(new HttpError(error))
    }
}

// ========================== EDIT USER(NEW) PROFILE====================================================================================
//POST: api/users/edit-user
//PROTECTED

const editUser = async (req, res, next) => {
    try {
        const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body;

        if (!name || !email || !currentPassword || !newPassword) {
            return next(new HttpError("Fill in all fields.", 403));
        }

        // Fetch the current user including the password
        const user = await User.findById(req.user.id).select("+password");
        if (!user) {
            return next(new HttpError("User not found.", 404));
        }

        const emailExists = await User.findOne({ email });
        if (emailExists && emailExists._id.toString() !== req.user.id.toString()) {
            return next(new HttpError("Email already exists.", 422));
        }

        const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validateUserPassword) {
            return next(new HttpError("Invalid current password.", 422));
        }

        if (newPassword !== confirmNewPassword) {
            return next(new HttpError("New passwords do not match.", 422));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, password: hashedPassword },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        return next(new HttpError(error.message || "Failed to edit user.", 500));
    }
};


// ==========================GET AUTHORS===============================================================================================
//POST: api/users/authors
//UNPROTECTED

const getAuthors= async(req,res, next)=>{
    try{
    const authors= await User.find().select('-password');
    res.json(authors);
    }catch(error){
        return next(new HttpError(error))
    }
}

module.exports= {registerUser, loginUser, editUser, getUser, changeAvatar, getAuthors}