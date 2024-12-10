import validator from "validator"
import { Kloset } from "../models/Klosets"
import jwt, { JwtPayload, Secret } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { Response, Request } from "express"
import {KlosetStatus, MulterRequest } from "../types"

dotenv.config()

export const createKloset = async (req:Request ,res:Response) => {

    try {
        const {name,slogan,type,category,address,delivery,delivery_time,user_id} = req.body

    if (!name||!slogan||!type||!category||!address||!delivery||!delivery_time||!user_id) {
        res.status(400).json({message: "All fields are required"})
    }
    
    if (!name || !slogan || !type || !category || !address || !delivery || !delivery_time || !user_id) {
        res.status(400).json({ message: "All fields are required" });
    }

    if (type !== 'custom' && type !== 'retail' && type !== 'digital' && type !== 'books') {
        res.status(400).json({ message: 'Invalid type' });
    }
    
    if (category !== 'apparel' && category !== 'jewellery' && category !== 'decor' && category !== 'books' && category !== 'select' && category === undefined) {
        res.status(400).json({ message: 'Invalid category' })
    }
    const deliveryBoolean = delivery === 'true'
    const sanitizedName = validator.escape(name)
    const sanitizedSlogan = validator.escape(slogan)
    const sanitizedAddres = validator.escape(address)
    const displayPicture = req.file? `uploads/kloset-dps/${req.file.filename}`: null

    const klosetData = {
        name: sanitizedName,
        slogan: sanitizedSlogan,
        address: sanitizedAddres,
        type: type,
        category: category === 'select'? null: category,
        delivery: category === 'select'? false : deliveryBoolean,
        user_id: user_id,
        dp: displayPicture,
        delivery_time: category === 'select'? 1 : delivery_time,
        active: false,
        status: 'pending' as KlosetStatus
    }

    Kloset.create(klosetData, (err,kloset) => {
        if (err) {
            res.status(500).json({message: 'Error creating kloset'})
        }
        res.status(201).json({message: "Kloset successfully created", kloset})
    }) 
    } catch (error) {
        res.status(500).json({message: `unknown error occured creating kloset`})

    }
}

export const klosetsByUserId = async (req: Request, res: Response) => {
    const token: string = req.cookies?.accessToken
    const accessSecret = process.env.ACCESS_SECRET as Secret

    if (!token) {
        res.status(401).json({ message: "Unauthorized access" })
    }

    try {

        const decoded = jwt.verify(token, accessSecret) as JwtPayload
        const userId = decoded.id

        Kloset.findKlosetsByUserId(userId, (err, klosets) => {
            if (err) {
                res.status(500).json({ message: "Error fetching klosets" })
            }

            if (klosets) {
                res.status(200).json({ klosets })
            } else {
                res.status(404).json({ message: "No klosets found" })
            }
        })
    } catch (error) {
        res.status(400).json({ message: "Invalid token" })
    }
}

export const fetchSingleKloset = async (req:Request, res:Response) => {
    const {id} = req.params
    
    try {
        Kloset.findKlosetById(parseInt(id), (err, kloset) => {
            if (err) {
                res.status(500).json({message: 'database error fetching kloset'})
            }

            if (!kloset) {
                res.status(494).json({message: 'kloset not found'})
            }

            res.status(200).json({kloset: kloset})
        })
    } catch (error) {
        res.status(500).json({message: `unknown error occured fetching kloset`})
    }
}