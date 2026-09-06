// =====================================================
// SMART GREEN CAMPUS - FRONTEND JAVASCRIPT
// =====================================================

const API_URL = "https://smart-green-campus-backend.onrender.com/api/complaints";
let ADMIN_PASSWORD = sessionStorage.getItem("adminPassword");

// =====================================================
// LOCAL DATA
// =====================================================

let complaints = [];


// =====================================================
// SMART PRIORITY
// =====================================================

function calculatePriority() {

    const severityElement =
        document.getElementById("severity");

    const categoryElement =
        document.getElementById("category");

    const locationElement =
        document.getElementById("location");

    const priorityElement =
        document.getElementById("priority");

    if (
        !severityElement ||
        !categoryElement ||
        !locationElement ||
        !priorityElement
    ) {
        return "Medium";
    }

    const severity =
        severityElement.value;

    const category =
        categoryElement.value;

    const location =
        locationElement.value;


    let score = 0;


    // Severity points

    if (severity === "High") {
        score += 5;
    }

    else if (severity === "Medium") {
        score += 3;
    }

    else if (severity === "Low") {
        score += 1;
    }


    // Category points

    if (
        category === "Water" ||
        category === "Energy"
    ) {
        score += 2;
    }


    // Important locations

    if (
        location === "Hostel" ||
        location === "Library"
    ) {
        score += 1;
    }


    let priority = "Low";


    if (score >= 6) {
        priority = "High";
    }

    else if (score >= 3) {
        priority = "Medium";
    }


    priorityElement.value = priority;

    return priority;
}


function updateLivePriority() {

    calculatePriority();

}


// =====================================================
// SUBMIT COMPLAINT
// =====================================================

async function submitComplaint(event) {

    event.preventDefault();


    const name =
        document.getElementById("name").value.trim();

    const location =
        document.getElementById("location").value;

    const category =
        document.getElementById("category").value;

    const description =
        document.getElementById("description").value.trim();

    const severity =
        document.getElementById("severity").value;


    const priority =
        calculatePriority();


    const complaint = {

        id:
            "SGC-" +
            Math.floor(
                100000 +
                Math.random() * 900000
            ),

        name: name,

        location: location,

        category: category,

        description: description,

        severity: severity,

        priority: priority,

        status: "Reported",

        date:
            new Date().toLocaleString()

    };


    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(complaint)

            });


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to save complaint"
            );

        }


        // Add returned complaint to frontend

        complaints.push(
            data.complaint
        );


        alert(
            "Complaint submitted successfully!\n\n" +
            "Complaint ID: " +
            data.complaint.id
        );


        // Reset form

        document
            .getElementById("complaintForm")
            .reset();


        document
            .getElementById("priority")
            .value =
            "Automatically calculated";


        // Update dashboard

        updateDashboard();


    }

    catch (error) {

        console.error(
            "Backend Error:",
            error
        );


        alert(
            "❌ Complaint could not be saved.\n\n" +
            "Please make sure backend server is running."
        );

    }

}


// =====================================================
// GET ALL COMPLAINTS FROM MONGODB
// =====================================================

async function loadComplaints() {

    try {

        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "Failed to load complaints"
            );

        }


        complaints =
            await response.json();


        console.log(
            "✅ Complaints loaded from MongoDB:",
            complaints
        );


        updateDashboard();

    }

    catch (error) {

        console.error(
            "❌ Could not load complaints:",
            error
        );

    }

}


// =====================================================
// TRACK COMPLAINT
// =====================================================

function trackComplaint() {

    const trackInput =
        document.getElementById("trackId");


    const result =
        document.getElementById("trackResult");


    if (!trackInput || !result) {
        return;
    }


    const id =
        trackInput.value.trim().toUpperCase();


    if (!id) {

        result.innerHTML =
            "Please enter Complaint ID.";

        return;

    }


    const complaint =
        complaints.find(

            c =>
                c.id.toUpperCase() === id

        );


    if (complaint) {

        result.innerHTML =

            "🆔 Complaint ID: <b>" +
            complaint.id +
            "</b><br><br>" +

            "📊 Status: <b>" +
            complaint.status +
            "</b><br>" +

            "📂 Category: " +
            complaint.category +
            "<br>" +

            "📍 Location: " +
            complaint.location +
            "<br>" +

            "⚡ Priority: " +
            complaint.priority +
            "<br>" +

            "📅 Date: " +
            complaint.date;

    }

    else {

        result.innerHTML =
            "❌ Complaint not found!";

    }

}


// =====================================================
// SUSTAINABILITY SCORE
// =====================================================

function calculateSustainabilityScore() {

    let score = 100;


    complaints.forEach(c => {


        // Unresolved problems

        if (c.status === "Reported") {

            score -= 3;

        }


        if (c.status === "In Progress") {

            score -= 1;

        }


        // Water/Energy have higher impact

        if (
            c.category === "Water" ||
            c.category === "Energy"
        ) {

            score -= 2;

        }


        // Resolved problems improve score

        if (c.status === "Resolved") {

            score += 1;

        }

    });


    // Keep score between 0-100

    if (score < 0) {
        score = 0;
    }

    if (score > 100) {
        score = 100;
    }


    return score;

}


// =====================================================
// UPDATE DASHBOARD
// =====================================================

function updateDashboard() {


    // Total

    const total =
        document.getElementById(
            "totalComplaints"
        );


    if (total) {

        total.innerText =
            complaints.length;

    }


    // High Priority

    const high =
        document.getElementById("high");


    if (high) {

        high.innerText =

            complaints.filter(

                c =>
                    c.priority === "High"

            ).length;

    }


    // Resolved

    const resolved =
        document.getElementById("resolved");


    if (resolved) {

        resolved.innerText =

            complaints.filter(

                c =>
                    c.status === "Resolved"

            ).length;

    }


    // Sustainability Score

    const score =
        document.getElementById("score");


    if (score) {

        score.innerText =
            calculateSustainabilityScore();

    }


    // Complaint Table

    const table =
        document.getElementById(
            "complaintTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    complaints.forEach(c => {


        table.innerHTML += `

            <tr>

                <td>
                    ${c.id}
                </td>

                <td>
                    ${c.name}
                </td>

                <td>
                    ${c.category}
                </td>

                <td>
                    ${c.location}
                </td>

                <td>
                    ${c.priority}
                </td>

                <td>
                    ${c.status}
                </td>

                <td>

                    <button
                        onclick="changeStatus('${c.id}')"
                    >
                        Change Status
                    </button>

                </td>

            </tr>

        `;

    });

}


// =====================================================
// CHANGE COMPLAINT STATUS
// =====================================================

async function changeStatus(id) {

    if (!ADMIN_PASSWORD) {
        ADMIN_PASSWORD = prompt("🔐 Enter Admin Password:");

        if (!ADMIN_PASSWORD) {
            alert("Admin password is required.");
            return;
        }

        sessionStorage.setItem("adminPassword", ADMIN_PASSWORD);
    }

    const complaint =
        complaints.find(
            c => c.id === id
        );

    if (!complaint) {
        return;
    }


    let newStatus;


    if (
        complaint.status ===
        "Reported"
    ) {

        newStatus =
            "In Progress";

    }

    else if (
        complaint.status ===
        "In Progress"
    ) {

        newStatus =
            "Resolved";

    }

    else {

        newStatus =
            "Reported";

    }


    try {


        const response =
            await fetch(

                `${API_URL}/${id}`,

                {

                    method: "PUT",

                    headers: {
                             "Content-Type": "application/json",
                            "x-admin-password": ADMIN_PASSWORD
                         },

                    body:
                        JSON.stringify({

                            status:
                                newStatus

                        })

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Status update failed"
            );

        }


        // Replace complaint with updated data

        const index =
            complaints.findIndex(
                c => c.id === id
            );


        complaints[index] =
            data.complaint;


        updateDashboard();


        // Refresh tracking if same ID

        const trackId =
            document.getElementById(
                "trackId"
            );


        if (
            trackId &&
            trackId.value
                .trim()
                .toUpperCase() ===
            id.toUpperCase()
        ) {

            trackComplaint();

        }


    }

    catch (error) {

        console.error(
            "❌ Status update error:",
            error
        );


        alert(
            "❌ Could not update complaint status."
        );

    }

}


// =====================================================
// EVENT LISTENERS
// =====================================================


// Complaint form

const complaintForm =
    document.getElementById(
        "complaintForm"
    );


if (complaintForm) {

    complaintForm.addEventListener(
        "submit",
        submitComplaint
    );

}


// Severity

const severity =
    document.getElementById(
        "severity"
    );


if (severity) {

    severity.addEventListener(
        "change",
        updateLivePriority
    );

}


// Category

const category =
    document.getElementById(
        "category"
    );


if (category) {

    category.addEventListener(
        "change",
        updateLivePriority
    );

}


// Location

const locationSelect =
    document.getElementById(
        "location"
    );


if (locationSelect) {

    locationSelect.addEventListener(
        "change",
        updateLivePriority
    );

}


// =====================================================
// INITIAL LOAD
// =====================================================

loadComplaints();