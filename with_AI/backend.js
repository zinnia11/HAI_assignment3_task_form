const start_button = document.getElementById('start_button');
const label_buttons = document.querySelectorAll('.label_button');
const next_button = document.getElementById('next_button');
const introDiv = document.getElementById('intro');
const questionDiv = document.getElementById('survey');
const endingDiv = document.getElementById('ending');
const responsesDisplay = document.getElementById('responsesDisplay');

let students = [];
let currentIndex = 0;
let selectedStudents = [];
let responses = [];

let timeStart = 0;
let timeEnd = 0;

// load the dataset csv
async function loadCSV() {
    const response = await fetch("task_trials_StressLevelDataset.csv");
    const text = await response.text();

    // split into rows
    const rows = text.trim().split("\n");

    // first row is headers
    const headers = rows[0].split(",").map(h => h.trim());
    // give name to the first index col
    if (!headers[0]) headers[0] = "index";

    // create objects where the headers are keys
    const data = rows.slice(1).map(row => {
        const values = row.split(",").map(v => v.trim());
        const entry = {};
        headers.forEach((header, i) => {
            entry[header] = values[i];
        });
        return entry;
    });

    return (data);
}

// Fisher-Yates shuffle and take the first n elements for a random sample
function randomSample(array, size) {
    const shuffled = array.slice(); // Create a copy
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; 
    }
    return shuffled.slice(0, size);
}

const postive_valence=["self_esteem", "sleep_quality", "safety", "basic_needs", "living_conditions", 
    "academic_performance", "teacher_student_relationship", "social_support"]
function numberLine(value, category) {
    let max = category == "anxiety_level" ? 21 :
            category == "self_esteem" ? 30 :
            category == "depression" ? 27 :
            category == "mental_health_history" ? 1 :
            category == "blood_pressure" ? 3 :
            5 ;
    const percentage = (parseFloat(value) / max) * 100;

    let color;
    if (percentage < 34) { // low = bad if positive valence
        color = postive_valence.includes(category) ? "#F44336" : "#4CAF50" ;
    } else if (percentage < 67) { // medium = yellow
        color = "#FFC107";
    } else { // high = good if positive valence
        color = postive_valence.includes(category) ? "#4CAF50" : "#F44336";
    }

    return `
        <div class="number-line">
        <div class="number-line-fill" style="width:${percentage}%; background:${color}"></div>
        </div>
    `;
}

// dynamically updates the question with the information from the sampled row of data
function showQuestion(student, number) {
    next_button.disabled = true;
    label_buttons.forEach(button => {button.disabled = true;})

    document.getElementById('studentHeader').textContent =
        `Question ${number}/20`;

    document.getElementById('psych').innerHTML = `
        <span class="tooltiptext">
            <strong>Anxiety level:</strong> Score from the GAD-7 scale with higher meaning more anxiety, 0-21 <br>
            <strong>Self esteem:</strong> Score from RSES with higher meaning more self esteem, 0-30 <br>
            <strong>Mental health history:</strong> If there was past history of mental health conditions <br>
            <strong>Depression:</strong> Score from PHQ-9 with higher meaning more symptoms of depression, 0-27
        </span>
        <h3>Psychological Factors</h3>
        <p>Anxiety level: ${student.anxiety_level} ${numberLine(student.anxiety_level, "anxiety_level")}</p>
        <p>Self esteem: ${student.self_esteem} ${numberLine(student.self_esteem, "self_esteem")}</p>
        <p>Mental health history: ${student.mental_health_history == "1" ? "History present" : "No history"} ${numberLine(student.mental_health_history, "mental_health_history")}</p>
        <p>Depression: ${student.depression} ${numberLine(student.depression, "depression")}</p>`;

    document.getElementById('phys').innerHTML = `
        <span class="tooltiptext">
            <strong>Headache:</strong> Frequency the student is experiencing headaches, higher is more often <br>
            <strong>Blood pressure:</strong> Subjective scale of low, average, and high <br>
            <strong>Sleep quality:</strong> Quality of sleep, higher is better quality <br>
            <strong>Breathing problem:</strong> Frequency the student is experiencing breathing problems, higher is more often
        </span>
        <h3>Physiological Factors</h3>
        <p>Headache: ${student.headache} ${numberLine(student.headache, "headache")}</p>
        <p>Blood pressure: ${
            student.blood_pressure == "1" ? "Low" :
            student.blood_pressure == "2" ? "Average" :
            student.blood_pressure == "3" ? "High" :
            "Unknown"} ${numberLine(student.blood_pressure, "blood_pressure")}
        </p>
        <p>Sleep quality: ${student.sleep_quality} ${numberLine(student.sleep_quality, "sleep_quality")}</p>
        <p>Breathing problem: ${student.breathing_problem} ${numberLine(student.breathing_problem, "breathing_problem")}</p>`;

    document.getElementById('env').innerHTML = `
        <span class="tooltiptext">
            <strong>Noise level:</strong> Amount of noise in the student's environment, higher is more noise<br>
            <strong>Living conditions:</strong> Quality of living environment, higher is better conditions<br>
            <strong>Safety:</strong> How safe the student feels in their environment, higher is safer <br>
            <strong>Basic needs:</strong> How much student's basic needs are being met, higher is better
        </span>
        <h3>Environmental Factors</h3>
        <p>Noise level: ${student.noise_level} ${numberLine(student.noise_level, "noise_level")}</p>
        <p>Living conditions: ${student.living_conditions} ${numberLine(student.living_conditions, "living_conditions")}</p>
        <p>Safety: ${student.safety} ${numberLine(student.safety, "safety")}</p>
        <p>Basic needs: ${student.basic_needs} ${numberLine(student.basic_needs, "basic_needs")}</p>`;

    document.getElementById('acad').innerHTML = `
        <span class="tooltiptext">
            <strong>Academic performance:</strong> How well the student is doing academically, higher is better academics<br>
            <strong>Study load:</strong> How much homework and studying the student has to do, higher is more study work<br>
            <strong>Teacher student relationship:</strong> Quality of teacher-student relationships from the perspective of the student, higher is stronger relationships <br>
            <strong>Future career concerns:</strong> How much the student worries about the future, higher is more concerns
        </span>
        <h3>Academic Factors</h3>
        <p>Academic performance: ${student.academic_performance} ${numberLine(student.academic_performance, "academic_performance")}</p>
        <p>Study load: ${student.study_load} ${numberLine(student.study_load, "study_load")}</p>
        <p>Teacher student relationship: ${student.teacher_student_relationship} ${numberLine(student.teacher_student_relationship, "teacher_student_relationship")}</p>
        <p>Future career concerns: ${student.future_career_concerns} ${numberLine(student.future_career_concerns, "future_career_concerns")}</p>`;

    document.getElementById('social').innerHTML = `
        <span class="tooltiptext">
            <strong>Social support:</strong> How much support the student recieves from their social relationships, higher is more support<br>
            <strong>Peer pressure:</strong> How much the student is feeling pressure from their peers, higher is more pressure <br>
            <strong>Extracurricular activities:</strong> How many extracurricular activities the student participates in <br>
            <strong>Bullying:</strong> How much bullying the student is recieving, higher is worse bullying
        </span>
        <h3>Social Factors</h3>
        <p>Social support: ${student.social_support} ${numberLine(student.social_support, "social_support")}</p>
        <p>Peer pressure: ${student.peer_pressure} ${numberLine(student.peer_pressure, "peer_pressure")}</p>
        <p>Extracurricular activities: ${student.extracurricular_activities} ${numberLine(student.extracurricular_activities, "extracurricular_activities")}</p>
        <p>Bullying: ${student.bullying} ${numberLine(student.bullying, "bullying")}</p>`;
}

function makeID(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const user = makeID(10);

async function submitResponses() {
    const url = "https://script.google.com/macros/s/AKfycbyrJ4lFWct_lzIGIH5Y4vWASzBgfBIzhEMd5cqkKYZTd1DoD4q6Ey18esOlYaK0jFJM5A/exec";
  
    try {
      const res = await fetch(url, {
        method: "POST",
        mode: "no-cors", // bypass CORS restrictions
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(responses)
      });
      console.log("Responses sent to Google Sheets");
    } catch (err) {
      console.error("Error sending data:", err);
    }
  }

// when pressed, hides the intro section and shows the first question
start_button.addEventListener('click', async () => {
    students = await loadCSV();
    timeStart = Math.floor(Date.now() / 1000);
    selectedStudents = randomSample(students, 20);
    introDiv.classList.add('hidden');
    questionDiv.classList.remove('hidden');
    showQuestion(selectedStudents[0], 1);
});

document.getElementById("suggestion").addEventListener("click", () => {
    showSuggestion();
});

function showSuggestion() {
    // document.getElementById('suggestion').classList.add('hidden');
    // Change the background color
    document.getElementById("AI").style.backgroundColor = "#e0d0ff";
    let student = selectedStudents[currentIndex];
    document.getElementById('AI').innerHTML = `
        <button class="hidden" id="suggestion" style="background-color: transparent;">
          <h3 style="font-size: 18px;">Need Help? Get an AI suggestion.</h3>
        </button>
        <h3>AI Suggestion</h3>
        <h2 style="text-align: center;">${student.stress_level_preds == "0" ? "Low Stress" :
            student.stress_level_preds == "1" ? "Medium Stress" :
            student.stress_level_preds == "2" ? "High Stress" :
            "Unknown"}
        </h2>`;
    label_buttons.forEach(button => {button.disabled = false;})
}

// record which label is clicked for which question, updates at each new click until the next question button is pressed
label_buttons.forEach(button => {
    button.addEventListener('click', () => {
        // keep correct button selected until another one is chosen
        document.querySelector('.special')?.classList.remove('special');
        button.classList.add('special');

        const label = button.getAttribute('data-label');
        const i = selectedStudents[currentIndex].index; 

        responses[currentIndex] = {userID: user, csvIndex: i, label: label};
        // enable next button when a button is selected here
        next_button.disabled = false;
    });
});

// moves to the next question by showing the next sampled data point
// if all 20 are done, hides the question interface and shows the ending screen
next_button.addEventListener('click', () => {
    // remove selected button after clicking next
    document.querySelector('.special')?.classList.remove('special');

    currentIndex++;
    if (currentIndex < 20) {
        showQuestion(selectedStudents[currentIndex], currentIndex + 1);
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto' // Use 'auto' for an instant jump
        });
        // return to asking for AI suggestion
        document.getElementById('AI').innerHTML = `
            <button id="suggestion" style="background-color: transparent;">
            <h3 style="font-size: 18px;">Need Help? Get an AI suggestion.</h3>
            </button>`
        document.getElementById("AI").style.backgroundColor = "transparent";
        document.getElementById("suggestion").addEventListener("click", () => {
            showSuggestion();
        });
        timeEnd = Math.floor(Date.now() / 1000);
        const time_elapsed = (timeEnd-timeStart);
        responses[currentIndex-1].time = time_elapsed;
        timeStart = Math.floor(Date.now() / 1000);
    } else {
        questionDiv.classList.add('hidden');
        endingDiv.classList.remove('hidden');
        document.getElementById('userID').innerHTML = `
            <p style="font-size: 20px"><strong>User ID:</strong> ${user}</p>`
        // responsesDisplay.textContent = JSON.stringify(responses, null, 2);
        submitResponses();
    }
});