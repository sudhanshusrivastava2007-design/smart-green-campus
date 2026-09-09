const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const app = express();

// =====================================================
// CLOUDINARY CONFIG
// =====================================================

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// =====================================================
// MULTER
// =====================================================

const upload = multer({
    storage: multer.memoryStorage()
});

// =====================================================
// ADMIN PASSWORD
// =====================================================

const ADMIN_PASSWORD = "Anshu000";

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// MONGODB
// =====================================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully");
    })
    .catch((error) => {
        console.log("❌ MongoDB Connection Failed:");
        console.log(error.message);
    });

// =====================================================
// COMPLAINT SCHEMA
// =====================================================

const complaintSchema = new mongoose.Schema({

    id: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    severity: {
        type: String,
        required: true
    },

    priority: {
        type: String,
        required: true
    },

    status: {
        type: String,
        default: "Reported"
    },

    photo: {
        type: String,
        default: ""
    },

    date: {
        type: String,
        default: () => new Date().toLocaleString()
    }

});

const Complaint = mongoose.model(
    "Complaint",
    complaintSchema
);

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {

    res.json({
        message: "🌱 Smart Green Campus Backend is Running!"
    });

});

// =====================================================
// GET ALL COMPLAINTS
// =====================================================

app.get("/api/complaints", async (req, res) => {

    try {

        const complaints = await Complaint.find();

        res.json(complaints);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch complaints",
            error: error.message
        });

    }

});

// =====================================================
// UPLOAD PHOTO TO CLOUDINARY
// =====================================================

function uploadToCloudinary(buffer) {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "smart-green-campus"
            },
            (error, result) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }

            }
        );

        streamifier
            .createReadStream(buffer)
            .pipe(stream);

    });

}

// =====================================================
// ADD COMPLAINT + PHOTO
// =====================================================

app.post(
    "/api/complaints",
    upload.single("photo"),
    async (req, res) => {

        try {

            const complaintData = JSON.parse(
                req.body.complaint
            );

            let photoUrl = "";

            // Upload photo if selected
            if (req.file) {

                const result =
                    await uploadToCloudinary(
                        req.file.buffer
                    );

                photoUrl = result.secure_url;

                console.log(
                    "📸 Photo uploaded:",
                    photoUrl
                );

            }

            const complaint =
                new Complaint({

                    ...complaintData,

                    photo: photoUrl

                });

            await complaint.save();

            console.log(
                "✅ Complaint saved:",
                complaint.id
            );

            res.status(201).json({

                message:
                    "Complaint saved successfully",

                complaint:
                    complaint

            });

        } catch (error) {

            console.log(
                "❌ Error saving complaint:"
            );

            console.log(
                error.message
            );

            res.status(500).json({

                message:
                    "Failed to save complaint",

                error:
                    error.message

            });

        }

    }
);

// =====================================================
// UPDATE STATUS - ADMIN ONLY
// =====================================================

app.post(
    "/api/complaints",
    upload.single("photo"),
    async (req, res) => {

        try {

            console.log("📥 Complaint received");

            console.log("BODY:", req.body);

            console.log(
                "PHOTO:",
                req.file ? req.file.originalname : "No photo"
            );


            let photoUrl = "";


            // ===============================
            // UPLOAD PHOTO TO CLOUDINARY
            // ===============================

            if (req.file) {

                const result =
                    await new Promise((resolve, reject) => {

                        const stream =
                            cloudinary.uploader.upload_stream(
                                {
                                    folder:
                                        "smart-green-campus"
                                },

                                (error, result) => {

                                    if (error) {
                                        reject(error);
                                    }
                                    else {
                                        resolve(result);
                                    }

                                }
                            );


                        stream.end(
                            req.file.buffer
                        );

                    });


                photoUrl =
                    result.secure_url;


                console.log(
                    "✅ Photo uploaded:",
                    photoUrl
                );

            }


            // ===============================
            // CREATE COMPLAINT
            // ===============================

            const complaint =
                new Complaint({

                    id: req.body.id,

                    name: req.body.name,

                    location: req.body.location,

                    category: req.body.category,

                    description: req.body.description,

                    severity: req.body.severity,

                    priority: req.body.priority,

                    status:
                        req.body.status ||
                        "Reported",

                    date:
                        req.body.date ||
                        new Date().toLocaleString(),

                    photo: photoUrl

                });


            await complaint.save();


            console.log(
                "✅ Complaint saved to MongoDB:",
                complaint.id
            );


            res.status(201).json({

                message:
                    "Complaint saved successfully",

                complaint:
                    complaint

            });

        }


        catch (error) {

            console.log(
                "❌ Error saving complaint:"
            );

            console.log(
                error
            );


            res.status(500).json({

                message:
                    "Failed to save complaint",

                error:
                    error.message

            });

        }

    }
);