import { NextFunction, Request, Response } from "express";
import { tutorProfileService } from "./tutorProfile.service";

const createTutorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "Unauthorized!",
            })
        }
        const result = await tutorProfileService.createTutorProfile(req.body, user.id as string)
        res.status(201).json(result)
    } catch (e) {
        next(e)
    }
}

export const tutorProfileController = {
    createTutorProfile,
}