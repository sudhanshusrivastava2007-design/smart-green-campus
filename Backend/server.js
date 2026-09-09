const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

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
// MONGODB CONNECTION
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
// HOME / TEST
// =====================================================

app.get("/", (req, res) => {

    res.json({
        message:
            "🌱 Smart Green Campus Backend is Running!"
    });

});

// =====================================================
// GET ALL COMPLAINTS
// =====================================================

app.get("/api/complaints", async (req, res) => {

    try {

        const complaints =
            await Complaint.find();

        res.json(complaints);

    } catch (error) {

        res.status(500).json({

            message:
                "Failed to fetch complaints",

            error:
                error.message

        });

    }

});

// =====================================================
// ADD COMPLAINT
// =====================================================

app.post("/api/complaints", async (req, res) => {

    try {

        const complaint =
            new Complaint(req.body);

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

});

// =====================================================
// UPDATE COMPLAINT STATUS - ADMIN ONLY
// =====================================================

app.put("/api/complaints/:id", async (req, res) => {

    try {

        const adminPassword =
            (req.headers["x-admin-password"] || "")
                .trim();

        console.log(
            "🔐 Admin password received:",
            adminPassword ? "YES" : "NO"
        );

        if (
            !adminPassword ||
            adminPassword !== ADMIN_PASSWORD
        ) {

            console.log(
                "❌ Wrong admin password"
            );

            return res.status(401).json({

                message:
                    "Unauthorized: Wrong admin password"

            });

        }

        const complaint =
            await Complaint.findOneAndUpdate(

                {
                    id: req.params.id
                },

                {
                    status: req.body.status
                },

                {
                    new: true
                }

            );

        if (!complaint) {

            return res.status(404).json({

                message:
                    "Complaint not found"

            });

        }

        console.log(
            "✅ Status updated:",
            complaint.id,
            "→",
            complaint.status
        );

        res.json({

            message:
                "Status updated successfully",

            complaint:
                complaint

        });

    } catch (error) {

        console.log(
            "❌ Status update error:"
        );

        console.log(
            error.message
        );

        res.status(500).json({

            message:
                "Failed to update status",

            error:
                error.message

        });

    }

});

// =====================================================
// SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `🌱 Server running on port ${PORT}`
    );

});