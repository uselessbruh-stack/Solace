import { Router, type Request, type Response } from "express";

export const uploadRouter = Router();

/**
 * POST /api/upload/sign
 * Generate Cloudinary signed upload params
 * (Placeholder for when Cloudinary image uploads are implemented)
 */
uploadRouter.post("/sign", async (_req: Request, res: Response) => {
  try {
    // TODO: Implement Cloudinary upload signing
    // const { folder } = req.body;
    // const timestamp = Math.round(Date.now() / 1000);
    // const signature = cloudinary.utils.api_sign_request(
    //   { timestamp, folder },
    //   CLOUDINARY_API_SECRET
    // );
    // res.json({ timestamp, signature, cloudName, apiKey });

    res.status(501).json({ error: "Image upload not yet implemented" });
  } catch (error) {
    console.error("Upload sign error:", error);
    res.status(500).json({ error: "Failed to generate upload signature" });
  }
});
