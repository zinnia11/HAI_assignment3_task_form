const startBtn = document.getElementById('startBtn');
const introDiv = document.getElementById('intro');
const questionDiv = document.getElementById('question');
const endingDiv = document.getElementById('ending');
const responsesDisplay = document.getElementById('responsesDisplay');

let students = [];
let currentIndex = 0;
let selectedStudents = [];
let responses = [];

async function loadCSV() {
    const response = await fetch("data.csv");
    const text = await response.text();

    // Split into rows
    const rows = text.trim().split("\n");

    // Split each row by comma into 2D array
    const data = rows.map(row => row.split(","));

    console.log(data);
    // var reader = new FileReader();
    // reader.onload = function(e) {
    //   var contents = e.target.result;
    //   displayContents(contents);
    // };
    // reader.readAsText(file);

    // var csv_file = File('task_trials_StressLevelDataset.csv');
    // csv_file.open('r');
    // csv_file.encoding = 'utf-8';
    // var data = csv_file.read().split('/\r\n|\n/'); // split by lines
    // csv_file.close();
    // for (var row in data) data[row].split(','); // split all lines by comas

    // return (data); // here is your 2d array
    // const response = await fetch('task_trials_StressLevelDataset.csv');
    // const text = await response.text();
    // const rows = text.trim().split('\n');
    // const headers = rows[0].split(',');
    // const data = rows.slice(1).map(row => {
    // const values = row.split(',');
    // return headers.reduce((obj, key, i) => {
    //     obj[key.trim()] = values[i] ? values[i].trim() : '';
    //     return obj;
    // }, {});
    // });
    // return data;
}

function randomSample(array, size) {
    const shuffled = array.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
}

function showQuestion(student, number) {
    document.getElementById('studentHeader').textContent =
    `Student #${student.id} – Question ${number}/20`;

    document.getElementById('psych').innerHTML = `
    <h3>Psychological Factors</h3>
    <p>Anxiety level: ${student.anxiety_level}</p>
    <p>Self esteem: ${student.self_esteem}</p>
    <p>Mental health history: ${student.mental_health_history}</p>
    <p>Depression: ${student.depression}</p>`;

    document.getElementById('phys').innerHTML = `
    <h3>Physiological Factors</h3>
    <p>Headache: ${student.headache}</p>
    <p>Blood pressure: ${student.blood_pressure}</p>
    <p>Sleep quality: ${student.sleep_quality}</p>
    <p>Breathing problem: ${student.breathing_problem}</p>`;

    document.getElementById('env').innerHTML = `
    <h3>Environmental Factors</h3>
    <p>Noise level: ${student.noise_level}</p>
    <p>Living conditions: ${student.living_conditions}</p>
    <p>Safety: ${student.safety}</p>
    <p>Basic needs: ${student.basic_needs}</p>`;

    document.getElementById('acad').innerHTML = `
    <h3>Academic Factors</h3>
    <p>Academic performance: ${student.academic_performance}</p>
    <p>Study load: ${student.study_load}</p>
    <p>Teacher student relationship: ${student.teacher_student_relationship}</p>
    <p>Future career concerns: ${student.future_career_concerns}</p>`;

    document.getElementById('social').innerHTML = `
    <h3>Social Factors</h3>
    <p>Social support: ${student.social_support}</p>
    <p>Peer pressure: ${student.peer_pressure}</p>
    <p>Extracurricular activities: ${student.extracurricular_activities}</p>
    <p>Bullying: ${student.bullying}</p>`;
}

startBtn.addEventListener('click', async () => {
    students = await loadCSV();
    selectedStudents = randomSample(students, 20);
    introDiv.classList.add('hidden');
    questionDiv.classList.remove('hidden');
    showQuestion(selectedStudents[0], 1);
});

document.querySelectorAll('.labelBtn').forEach(btn => {
    btn.addEventListener('click', () => {
    const label = btn.dataset.label;
    const student = selectedStudents[currentIndex];
    responses.push({ id: student.id, label });

    currentIndex++;
    if (currentIndex < 20) {
        showQuestion(selectedStudents[currentIndex], currentIndex + 1);
    } else {
        questionDiv.classList.add('hidden');
        thankyouDiv.classList.remove('hidden');
        responsesDisplay.textContent = JSON.stringify(responses, null, 2);
    }
    });
});