const translations = {
    "en": {
        "upload": "Upload an Image",
        "predict": "Upload & Predict",
        "prediction": "Prediction:",
        "safe": "Safe to Drink",
        "unsafe": "Not Safe to Drink",
        "download": "Download Report",
        "dark_mode": "Dark Mode",
        "water_safety": "Water Safety Tips",
        "sanitation": "Sanitation Suggestions",
        "water_safety_tips": [
            "Boil water before drinking if unsure about safety.",
            "Use water purification tablets or filters if boiling isn't possible.",
            "Store drinking water in clean, covered containers to prevent contamination.",
            "Avoid drinking water from unknown or untreated sources like ponds or rivers.",
            "Check for any changes in water color, smell, or taste before consuming.",
            "Regularly clean and maintain wells and water storage tanks."
        ],
        "sanitation_tips": [
            "Wash hands with soap before handling food or drinking water.",
            "Always use clean utensils and cups for drinking water.",
            "Dispose of waste properly to prevent contamination of water sources.",
            "Build and use toilets instead of open defecation to keep water sources clean.",
            "Keep livestock away from water sources to avoid contamination.",
            "Educate community members about the importance of hygiene and clean drinking water."
        ]
    },
    "te": {
        "upload": "చిత్రాన్ని అప్‌లోడ్ చేయండి",
        "predict": "అప్‌లోడ్ & అంచనా",
        "prediction": "అంచనా:",
        "safe": "తాగడానికి అనుకూలం",
        "unsafe": "తాగడానికి అనుకూలం కాదు",
        "download": "రిపోర్ట్ డౌన్‌లోడ్",
        "dark_mode": "డార్క్ మోడ్",
        "water_safety": "నీటి భద్రతా సూచనలు",
        "sanitation": "శానిటేషన్ సూచనలు",
        "water_safety_tips": [
            "నీటి భద్రత తెలియకపోతే, దానిని మరిగించాలి.",
            "నీటిని మరిగించడం సాధ్యమయ్యేలా లేకపోతే, నీటి శుద్ధి మాత్రలు లేదా ఫిల్టర్లు ఉపయోగించండి.",
            "నీటిని శుభ్రంగా మరియు మూసివేసిన పాత్రల్లో నిల్వ చేయండి.",
            "ఆరులు, చెరువులు వంటి తెలియని లేదా శుద్ధి చేయని నీటి వనరులను తాగడానికి ఉపయోగించకండి.",
            "నీటి రంగు, వాసన లేదా రుచిలో మార్పులు ఉన్నాయా అని పరీక్షించండి.",
            "బావులు మరియు నీటి నిల్వ ట్యాంకులను క్రమం తప్పకుండా శుభ్రం చేసి నిర్వహించండి."
        ],
        "sanitation_tips": [
            "ఆహారం లేదా నీటిని తాగేముందు చేతులు సబ్బుతో కడుక్కోవాలి.",
            "తాగునీటికి ఎల్లప్పుడూ శుభ్రమైన పాత్రలు మరియు గ్లాసులను ఉపయోగించండి.",
            "నీటి వనరులు కలుషితం కాకుండా చెత్తను సరిగ్గా పరిగొట్టండి.",
            "నీటి వనరులను శుభ్రంగా ఉంచడానికి బహిరంగ మలసంస్కరణకు బదులుగా మరుగుదొడ్లను నిర్మించండి మరియు ఉపయోగించండి.",
            "పశువులను నీటి వనరుల నుండి దూరంగా ఉంచండి.",
            "హైజీన్ మరియు శుభ్రమైన తాగునీటి ప్రాముఖ్యత గురించి సముదాయ సభ్యులను అవగాహన కల్పించండి."
        ]
    }
};

// Wait for DOM to load before executing scripts
document.addEventListener("DOMContentLoaded", function () {
    setupEventListeners();
    applySavedDarkMode();
});

// Setup event listeners for UI elements
function setupEventListeners() {
    document.getElementById("language").addEventListener("change", changeLanguage);
    document.getElementById("dark-mode-btn").addEventListener("click", toggleDarkMode);
    document.getElementById("download-report").addEventListener("click", downloadReport);
    document.getElementById("predict-btn").addEventListener("click", uploadAndPredict);
}

// Language Change Function
function changeLanguage() {
    let lang = document.getElementById("language").value;

    document.getElementById("upload-text").innerText = translations[lang]["upload"];
    document.getElementById("predict-btn").innerText = translations[lang]["predict"];
    document.getElementById("prediction-text").innerText = translations[lang]["prediction"];
    document.getElementById("download-report").innerText = translations[lang]["download"];
    document.getElementById("dark-mode-btn").innerText = translations[lang]["dark_mode"];
    document.getElementById("water-safety").innerText = translations[lang]["water_safety"];
    document.getElementById("sanitation").innerText = translations[lang]["sanitation"];

    updateSuggestions(lang);
}

// Dark Mode Toggle Function
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
}

// Apply saved dark mode setting on page load
function applySavedDarkMode() {
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }
}

// Function to handle report download
function downloadReport() {
    fetch("/download-report?result=Safe to Drink")
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Water_Analysis_Report.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            alert("Error downloading report. Please try again!");
        });
}

async function uploadAndPredict() {
    const fileInput = document.getElementById("image-upload");
    if (!fileInput.files.length) {
        alert("Please select an image first!");
        return;
    }

    let formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        let response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            body: formData
        });

        let data = await response.json();
        console.log("API Response:", data); // Debugging

        let predictionResult = document.getElementById("prediction-result");
        let safetyList = document.getElementById("water-safety-list");
        let sanitationList = document.getElementById("sanitation-list");

        predictionResult.innerText = `Result: ${data.prediction}`;

        let lang = document.getElementById("language").value; // Get current language

        // Update UI with language-specific suggestions
        updateSuggestions(lang);  

        // Ensure suggestions exist before processing API results
        if (data.suggestions && data.suggestions.water_safety) {
            safetyList.innerHTML = "";
            Object.values(data.suggestions.water_safety).forEach(tip => {
                let li = document.createElement("li");
                li.textContent = tip;
                safetyList.appendChild(li);
            });
        } else {
            safetyList.innerHTML = "<li>No water safety suggestions available.</li>";
        }

        if (data.suggestions && data.suggestions.sanitation) {
            sanitationList.innerHTML = "";
            Object.values(data.suggestions.sanitation).forEach(suggestion => {
                let li = document.createElement("li");
                li.textContent = suggestion;
                sanitationList.appendChild(li);
            });
        } else {
            sanitationList.innerHTML = "<li>No sanitation suggestions available.</li>";
        }

    } catch (error) {
        console.error("Prediction error:", error);
        alert("Error predicting image. Please try again!");
    }
}


// Attach event listener to the button
document.getElementById("predict-btn").addEventListener("click", uploadAndPredict);



// Update Water Safety & Sanitation Suggestions
function updateSuggestions(lang) {
    document.getElementById("water-safety-list").innerHTML = translations[lang]["water_safety_tips"].map(tip => `<li>${tip}</li>`).join("");
    document.getElementById("sanitation-list").innerHTML = translations[lang]["sanitation_tips"].map(tip => `<li>${tip}</li>`).join("");
    document.addEventListener("DOMContentLoaded", function () {
        setupEventListeners();
        applySavedDarkMode();
        updateSuggestions("en"); // Ensure English suggestions load initially
    });
    
}
