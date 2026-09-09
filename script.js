// =====================================================
// SMART GREEN CAMPUS - FRONTEND JAVASCRIPT
// =====================================================

const API_URL =
    "https://smart-green-campus.onrender.com/api/complaints";


// =====================================================
// LOCAL DATA
// =====================================================

let complaints = [];


// =====================================================
// ADMIN STATE
// =====================================================

let isAdminLoggedIn = false;


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


    // Severity

    if (severity === "High") {

        score += 5;

    }

    else if (severity === "Medium") {

        score += 3;

    }

    else if (severity === "Low") {

        score += 1;

    }


    // Category

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
        document
            .getElementById("name")
            .value
            .trim();


    const location =
        document
            .getElementById("location")
            .value;


    const category =
        document
            .getElementById("category")
            .value;


    const description =
        document
            .getElementById("description")
            .value
            .trim();


    const severity =
        document
            .getElementById("severity")
            .value;


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


        complaints.push(
            data.complaint
        );


        alert(
            "Complaint submitted successfully!\n\n" +
            "Complaint ID: " +
            data.complaint.id
        );


        document
            .getElementById("complaintForm")
            .reset();


        document
            .getElementById("priority")
            .value =
            "Automatically calculated";


        updateDashboard();

    }


    catch (error) {

        console.error(
            "Backend Error:",
            error
        );


        alert(
            "❌ Complaint could not be saved.\n\n" +
            "Please try again."
        );

    }

}


// =====================================================
// GET ALL COMPLAINTS
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
        trackInput.value
            .trim()
            .toUpperCase();


    if (!id) {

        result.innerHTML =
            "⚠️ Please enter Complaint ID.";

        return;

    }


    const complaint =
        complaints.find(

            c =>
                c.id &&
                c.id.toUpperCase() === id

        );


    if (complaint) {

        let statusIcon = "🟡";


        if (complaint.status === "Reported") {

            statusIcon = "🔵";

        }

        else if (
            complaint.status === "In Progress"
        ) {

            statusIcon = "🟠";

        }

        else if (
            complaint.status === "Resolved"
        ) {

            statusIcon = "🟢";

        }


        result.innerHTML =

            "🆔 Complaint ID: <b>" +
            complaint.id +
            "</b><br><br>" +

            statusIcon +
            " Status: <b>" +
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

        if (c.status === "Reported") {

            score -= 3;

        }


        if (c.status === "In Progress") {

            score -= 1;

        }


        if (
            c.category === "Water" ||
            c.category === "Energy"
        ) {

            score -= 2;

        }


        if (c.status === "Resolved") {

            score += 1;

        }

    });


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


    // Active complaints only

    const activeComplaints =
        complaints.filter(

            c =>
                c.status !== "Resolved"

        );


    // Total active

    const total =
        document.getElementById(
            "totalComplaints"
        );


    if (total) {

        total.innerText =
            activeComplaints.length;

    }


    // High Priority

    const high =
        document.getElementById("high");


    if (high) {

        high.innerText =

            activeComplaints.filter(

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


    // Sustainability

    const score =
        document.getElementById("score");


    if (score) {

        score.innerText =
            calculateSustainabilityScore();

    }


    // Complaint table

    const table =
        document.getElementById(
            "complaintTable"
        );


    if (!table) {

        return;

    }


    table.innerHTML = "";


    // IMPORTANT:
    // Resolved complaints are not shown

    activeComplaints.forEach(c => {

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


    // Empty state

    if (activeComplaints.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center; padding:30px;"
                >
                    🎉 No active complaints!
                    <br>
                    All complaints have been resolved.
                </td>

            </tr>

        `;

    }

}


// =====================================================
// CHANGE COMPLAINT STATUS
// =====================================================

async function changeStatus(id) {


    if (!isAdminLoggedIn) {

        alert(
            "🔐 Admin access required."
        );

        return;

    }


    const complaint =
        complaints.find(
            c => c.id === id
        );


    if (!complaint) {

        return;

    }


    let newStatus;


    // ONLY THREE STATUS LEVELS

    if (
        complaint.status === "Reported"
    ) {

        newStatus =
            "In Progress";

    }

    else if (
        complaint.status === "In Progress"
    ) {

        newStatus =
            "Resolved";

    }

    else {

        // Resolved cannot be changed again

        return;

    }


    try {

        const response =
            await fetch(

                `${API_URL}/${id}`,

                {

                    method: "PUT",

                    headers: {
                  "Content-Type": "application/json",
                  "x-admin-password": "Anshu000"
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


        const index =
            complaints.findIndex(
                c => c.id === id
            );


        if (index !== -1) {

            complaints[index] =
                data.complaint;

        }


        updateDashboard();


        // Refresh tracking

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

    console.error("❌ Status update error:", error);

    alert(
        "❌ Status update failed:\n\n" +
        error.message
    );

}

}




// =====================================================
// ADMIN LOGIN
// =====================================================

function adminLogin() {

    const password = prompt(
        "🔐 Enter Admin Password:"
    );

    if (password === null) {
        return false;
    }

    const ADMIN_PASSWORD = "Anshu000";

    if (password === ADMIN_PASSWORD) {

        isAdminLoggedIn = true;

        // IMPORTANT: password save for API request
        sessionStorage.setItem(
            "adminPassword",
            password
        );

        alert(
            "✅ Admin access granted."
        );

        const dashboard =
            document.getElementById("dashboard");

        if (dashboard) {
            dashboard.scrollIntoView({
                behavior: "smooth"
            });
        }

        return true;
    }

    alert(
        "❌ Incorrect admin password."
    );

    return false;
}

// =====================================================
// ADMIN LOGOUT
// =====================================================

function adminLogout() {

    isAdminLoggedIn = false;

    sessionStorage.removeItem(
        "adminPassword"
    );

    window.location.hash = "home";

    alert(
        "Admin logged out."
    );
}
// =====================================================
// ADMIN NAVIGATION
// =====================================================

const adminNav =
    document.getElementById("adminNav");

if (adminNav) {

    adminNav.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            adminLogin();

        }
    );
}


// =====================================================
// ADMIN LOGOUT BUTTON
// =====================================================

const adminLogoutButton =
    document.getElementById("adminLogout");

if (adminLogoutButton) {

    adminLogoutButton.addEventListener(
        "click",
        adminLogout
    );

}


// =====================================================
// COMPLAINT FORM
// =====================================================

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


// =====================================================
// SEVERITY
// =====================================================

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


// =====================================================
// CATEGORY
// =====================================================

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


// =====================================================
// LOCATION
// =====================================================

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