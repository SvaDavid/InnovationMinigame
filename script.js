import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBKne4smnUSv027rRGeMqTHrM1YqGlpQxk",
    authDomain: "innovationminigame.firebaseapp.com",
    databaseURL: "https://innovationminigame-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "innovationminigame",
    storageBucket: "innovationminigame.appspot.com",
    messagingSenderId: "532912595822",
    appId: "1:532912595822:web:0c20659f98c7b03750177f",
    measurementId: "G-2K8YQMLJ44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

let totalTime = 0;
let totalBudget = 0;
let bonusKeywords = ["AI", "Innovation"];
let maxAllowedTime = 50;
let maxAllowedBudget = 100000;

// Function to calculate expected revenue based on ratings
function calculateExpectedRevenue() {
    let scalabilityElement = document.getElementById('scalability');
    let acquisitionElement = document.getElementById('acquisition');
    let originalityElement = document.getElementById('originality');
    let marketRelevanceElement = document.getElementById('marketRelevance');

    let quantitativeChecked = document.getElementById('quantitative').checked;
    let qualitativeChecked = document.getElementById('qualitative').checked;
    let mixedChecked = document.getElementById('mixed').checked;
    let researchTime = parseInt(document.getElementById('researchTime').value);
    let researchBudget = parseInt(document.getElementById('researchBudget').value);

    let designTime = parseInt(document.getElementById('designTime').value);
    let designBudget = parseInt(document.getElementById('designBudget').value);

    let developmentTime = parseInt(document.getElementById('developmentTime').value);
    let developmentBudget = parseInt(document.getElementById('developmentBudget').value);

    if (!scalabilityElement || !acquisitionElement || !originalityElement || !marketRelevanceElement) {
        console.error('One or more rating elements not found');
        return 0;
    }

    let scalability = parseInt(scalabilityElement.value);
    let acquisition = parseInt(acquisitionElement.value);
    let originality = parseInt(originalityElement.value);
    let marketRelevance = parseInt(marketRelevanceElement.value);

    // Adding randomization factor
    let randomFactor = 0.9 + Math.random() * 0.2; // between 0.9 and 1.1

    // Example calculation of expected revenue
    let baseScore = (scalability + acquisition + originality + marketRelevance) * 10000 * randomFactor;

    // Adjust score based on research phase decisions
    let researchScore = 0;
    if (quantitativeChecked) researchScore += researchTime * 500;
    if (qualitativeChecked) researchScore += researchTime * 700;
    if (mixedChecked) researchScore += researchTime * 1000;

    let researchInvestmentScore = researchBudget * 0.2;

    // Adjust score based on design sprint decisions
    let designScore = designTime * 1000 + designBudget * 0.1;

    // Adjust score based on development phase decisions
    let developmentScore = developmentTime * 1500 + developmentBudget * 0.3;

    let totalScore = baseScore + researchScore + researchInvestmentScore + designScore + developmentScore;

    // Penalize for excessive use of resources
    if (totalTime > maxAllowedTime) {
        totalScore -= (totalTime - maxAllowedTime) * 500; // penalty for excess time
    }
    if (totalBudget > maxAllowedBudget) {
        totalScore -= (totalBudget - maxAllowedBudget) * 0.5; // penalty for excess budget
    }

    // Bonus for certain keywords in the idea name
    let ideaName = document.getElementById('ideaName').value.toLowerCase();
    bonusKeywords.forEach(keyword => {
        if (ideaName.includes(keyword.toLowerCase())) {
            totalScore += 5000; // add bonus score for each keyword found
            console.log(`Bonus added for keyword: ${keyword}`);
        }
    });

    console.log(`Current score: ${totalScore}`);  // Log the partial score
    return totalScore;
}

// Function to load leaderboard data from Firebase
function loadLeaderboardData() {
    const dbRef = ref(db);
    get(child(dbRef, 'response')).then((snapshot) => {
        if (snapshot.exists()) {
            const leaderboardTable = document.getElementById('leaderboardTable').getElementsByTagName('tbody')[0];
            leaderboardTable.innerHTML = ''; // Clear old data

            let data = [];
            snapshot.forEach((childSnapshot) => {
                data.push(childSnapshot.val());
            });

            // Sort the data by score in descending order
            data.sort((a, b) => b.Skore - a.Skore);

            // Get top 15 results
            data = data.slice(0, 15);

            // Add the sorted data to the leaderboard table
            data.forEach((item) => {
                const row = leaderboardTable.insertRow();
                const playerNameCell = row.insertCell(0);
                const ideaNameCell = row.insertCell(1);
                const expectedRevenueCell = row.insertCell(2);

                playerNameCell.textContent = item.Meno_hráča;
                ideaNameCell.textContent = item.Názov_nápadu;
                expectedRevenueCell.textContent = item.Skore;
            });
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error("Error loading data: ", error);
    });
}

// Function to update time counter
function updateTimeCounter(time) {
    totalTime += parseInt(time);
    let timeCounterElement = document.getElementById('timeCounter');
    if (timeCounterElement) {
        timeCounterElement.textContent = totalTime + ' MD';
    }
    console.log(`Total time updated to: ${totalTime} MD`);
}

// Function to update budget counter
function updateBudgetCounter(budget) {
    totalBudget += parseInt(budget);
    let budgetCounterElement = document.getElementById('budgetCounter');
    if (budgetCounterElement) {
        budgetCounterElement.textContent = totalBudget + '€';
    }
    console.log(`Total budget updated to: ${totalBudget}€`);
}

// Research scenária a dilemy
const researchScenarios = [
    {
        text: "Váš tím zistil, že existuje potenciálna technologická hrozba, ktorá by mohla ovplyvniť váš produkt. Ako na to zareagujete?",
        options: [
            { text: "Investujte viac času do výskumu hrozby", effect: { time: 2, budget: 1000 } },
            { text: "Pokračujte podľa plánu", effect: { time: 0, budget: 0 } }
        ]
    },
    {
        text: "Máte možnosť získať exkluzívne dáta od externého poskytovateľa, ale bude to stáť značnú časť vášho rozpočtu. Urobíte to?",
        options: [
            { text: "Zakúpte exkluzívne dáta", effect: { time: 1, budget: 5000 } },
            { text: "Nepokračujte v akvizícii dát", effect: { time: 0, budget: 0 } }
        ]
    },
    {
        text: "Získali ste spätnú väzbu od používateľov, že niektoré funkcie nie sú intuitívne. Ako budete postupovať?",
        options: [
            { text: "Prepracovať problematické funkcie", effect: { time: 2, budget: 2000 } },
            { text: "Ignorovať spätnú väzbu", effect: { time: 0, budget: 0 } }
        ]
    },
    {
        text: "Dostali ste možnosť získať výskumný grant, ktorý pokryje náklady na výskum, ale vyžaduje ďalší čas na administratívu. Prijmete grant?",
        options: [
            { text: "Prijať grant a vyčleniť čas", effect: { time: 3, budget: -5000 } }, // Negative budget means gaining money
            { text: "Odmietnuť grant", effect: { time: 0, budget: 0 } }
        ]
    }
];

let currentScenarioIndex = 0;

// Shuffle scenarios initially
function shuffleScenarios() {
    researchScenarios.sort(() => Math.random() - 0.5);
}

// Shuffle the scenarios initially
shuffleScenarios();

// Function to show a single research scenario and handle option selection
function showResearchScenario() {
    if (currentScenarioIndex >= researchScenarios.length) {
        document.getElementById('researchScenarios').style.display = 'none';
        document.getElementById('designSprintForm').style.display = 'block'; // Move to next phase
        return;
    }

    const scenario = researchScenarios[currentScenarioIndex];
    const scenarioText = document.getElementById('scenarioText');
    const option1 = document.getElementById('option1');
    const option2 = document.getElementById('option2');

    if (scenarioText && option1 && option2) {
        scenarioText.textContent = scenario.text;
        option1.textContent = scenario.options[0].text;
        option2.textContent = scenario.options[1].text;

        option1.onclick = function() {
            let additionalTime = scenario.options[0].effect.time;
            let additionalBudget = scenario.options[0].effect.budget;

            updateTimeCounter(additionalTime);
            updateBudgetCounter(additionalBudget);
            console.log(`Selected option 1: Time +${additionalTime} MD, Budget +${additionalBudget}€`);

            currentScenarioIndex++;
            document.getElementById('researchScenarios').style.display = 'none';
            document.getElementById('designSprintForm').style.display = 'block'; // Move to next phase
        };

        option2.onclick = function() {
            let additionalTime = scenario.options[1].effect.time;
            let additionalBudget = scenario.options[1].effect.budget;

            updateTimeCounter(additionalTime);
            updateBudgetCounter(additionalBudget);
            console.log(`Selected option 2: Time +${additionalTime} MD, Budget +${additionalBudget}€`);

            currentScenarioIndex++;
            document.getElementById('researchScenarios').style.display = 'none';
            document.getElementById('designSprintForm').style.display = 'block'; // Move to next phase
        };

        document.getElementById('researchForm').style.display = 'none';
        document.getElementById('researchScenarios').style.display = 'block';
        console.log('Displaying research scenario:', scenario.text);
    } else {
        console.error("One or more elements for displaying the scenario are missing.");
    }
}

// Event listener for research form submission
document.getElementById('submitResearch').addEventListener('click', function() {
    let timeValue = parseInt(document.getElementById('researchTime').value);
    let budgetValue = parseInt(document.getElementById('researchBudget').value);

    updateTimeCounter(timeValue);
    updateBudgetCounter(budgetValue);

    console.log(`Initial research time: ${timeValue} MD`);
    console.log(`Initial research budget: ${budgetValue}€`);
    console.log(`Partial score after research: ${calculateExpectedRevenue()}`);

    showResearchScenario(); // Show single research scenario
});

// Event listener for start form submission
document.getElementById('submitStart').addEventListener('click', function() {
    handleFormSubmission('startForm', 'ratingForm');
});

// Event listener for rating form submission
document.getElementById('submitRating').addEventListener('click', function() {
    console.log(`Partial score after rating: ${calculateExpectedRevenue()}`);
    handleFormSubmission('ratingForm', 'researchForm');
});

// Event listener for design sprint form submission
document.getElementById('submitDesignSprint').addEventListener('click', function() {
    let designTimeValue = document.getElementById('designTime').value;
    let designBudgetValue = document.getElementById('designBudget').value;
    updateTimeCounter(designTimeValue);
    updateBudgetCounter(designBudgetValue);

    console.log(`Partial score after design sprint: ${calculateExpectedRevenue()}`);
    handleFormSubmission('designSprintForm', 'developmentForm');
});

// Function to reset the game
function resetGame() {
    totalTime = 0;
    totalBudget = 0;

    // Reset all form inputs
    document.getElementById('startForm').reset();
    document.getElementById('ratingForm').reset();
    document.getElementById('researchForm').reset();
    document.getElementById('designSprintForm').reset();
    document.getElementById('developmentForm').reset();

    // Reset labels
    document.getElementById('researchTimeLabel').textContent = '0 MD';
    document.getElementById('researchBudgetLabel').textContent = '0€';
    document.getElementById('designTimeLabel').textContent = '0 MD';
    document.getElementById('designBudgetLabel').textContent = '0€';
    document.getElementById('developmentTimeLabel').textContent = '0 MD';
    document.getElementById('developmentBudgetLabel').textContent = '0€';

    // Hide all sections except the start form
    document.getElementById('businessCaseSummary').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'none';
    document.getElementById('ratingForm').style.display = 'none';
    document.getElementById('researchForm').style.display = 'none';
    document.getElementById('researchScenarios').style.display = 'none';
    document.getElementById('designSprintForm').style.display = 'none';
    document.getElementById('developmentForm').style.display = 'none';

    // Show the start form
    document.getElementById('startForm').style.display = 'block';
}

// Add event listener to the "Start Again" buttons
document.querySelectorAll('#startAgain').forEach(button => {
    button.addEventListener('click', resetGame);
});

// Event listener for development form submission
document.getElementById('submitDevelopment').addEventListener('click', function(e) {
    let developmentTimeValue = document.getElementById('developmentTime').value;
    let developmentBudgetValue = document.getElementById('developmentBudget').value;
    updateTimeCounter(developmentTimeValue);
    updateBudgetCounter(developmentBudgetValue);

    let expectedRevenue = calculateExpectedRevenue();
    console.log(`Final score: ${expectedRevenue}`);

    let ideaName = document.getElementById('ideaName').value;
    let playerName = document.getElementById('playerName').value;

    document.getElementById('developmentForm').style.display = 'none';
    document.getElementById('businessCaseSummary').style.display = 'block';
    document.getElementById('totalTime').textContent = totalTime + ' MD';
    document.getElementById('totalBudget').textContent = totalBudget + '€';
    document.getElementById('expectedRevenue').textContent = expectedRevenue + '€';

    e.preventDefault();
    set(ref(db, 'response/' + ideaName), {
        Názov_nápadu: ideaName,
        Meno_hráča: playerName,
        Skore: expectedRevenue
    }).then(() => {
        alert("Dáta odoslané");

        loadLeaderboardData();

        document.getElementById('leaderboard').style.display = 'block';
    }).catch((error) => {
        console.error("Chyba pri ukladaní dát: ", error);
    });

    console.log('Business Case Summary zobrazený');
});

// Admin view event listeners
document.getElementById('adminButton').addEventListener('click', function() {
    document.getElementById('main-window').style.display = 'none';
    document.getElementById('adminView').style.display = 'block';
});

document.getElementById('backToGame').addEventListener('click', function() {
    document.getElementById('adminView').style.display = 'none';
    document.getElementById('main-window').style.display = 'block';
});

document.getElementById('saveAdminSettings').addEventListener('click', function() {
    let newKeywords = document.getElementById('bonusKeywords').value.split(',').map(kw => kw.trim());
    let newMaxAllowedTime = parseInt(document.getElementById('maxAllowedTime').value);
    let newMaxAllowedBudget = parseInt(document.getElementById('maxAllowedBudget').value);

    bonusKeywords = newKeywords;
    maxAllowedTime = newMaxAllowedTime;
    maxAllowedBudget = newMaxAllowedBudget;

    alert('Settings saved successfully!');
});

// Function to handle form submission and progress to the next form
function handleFormSubmission(currentFormId, nextFormId) {
    document.getElementById(currentFormId).style.display = 'none';
    document.getElementById(nextFormId).style.display = 'block';
}

// Event listeners for range input changes
document.getElementById('researchTime').addEventListener('input', function() {
    document.getElementById('researchTimeLabel').textContent = this.value + ' MD';
});

document.getElementById('researchBudget').addEventListener('input', function() {
    document.getElementById('researchBudgetLabel').textContent = this.value + '€';
});

document.getElementById('designTime').addEventListener('input', function() {
    document.getElementById('designTimeLabel').textContent = this.value + ' MD';
});

document.getElementById('designBudget').addEventListener('input', function() {
    document.getElementById('designBudgetLabel').textContent = this.value + '€';
});

document.getElementById('developmentTime').addEventListener('input', function() {
    document.getElementById('developmentTimeLabel').textContent = this.value + ' MD';
});

document.getElementById('developmentBudget').addEventListener('input', function() {
    document.getElementById('developmentBudgetLabel').textContent = this.value + '€';
});
