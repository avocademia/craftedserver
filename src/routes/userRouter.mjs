import express from 'express'
import {verifyVerificationToken} from '../services/jwt.mjs'
import {User} from '../models/User.mjs'
import {signin, signout, signup} from '../controllers/user.mjs'


export const userRouter = express.Router()

userRouter.get('/verify/:token', verifyVerificationToken, (req,res) => {

    try {

        const id = req.user.id

        User.updateAuthenticatedStatus({id: id, authenticated: true})
        res.status(200).json({message: `Email verified successfully`})

    } catch (error) {
        res.status(500).json({message: 'Error updating authenticated status'})
    } 
})

userRouter.post(`/signup`,signup)

userRouter.post(`/signin`, signin)

userRouter.post(`/signout`, signout)

export default userRouter