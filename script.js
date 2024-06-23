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

// Define the function showResearchScenario above its first call
function showResearchScenario() {
    if (currentScenarioIndex >= researchScenarios.length) {
        document.getElementById('researchScenarios').style.display = 'none';
        document.getElementById('designSprintForm').style.display = 'block'; // Move to next phase
        toggleStatusWindow('designSprintForm');
        return;
    }

    const scenario = researchScenarios[currentScenarioIndex];
    const scenarioText = document.getElementById('scenarioText');
    const option1 = document.getElementById('option1');
    const option2 = document.getElementById('option2');
    const option1Effects = document.getElementById('option1Effects');
    const option2Effects = document.getElementById('option2Effects');

    if (scenarioText && option1 && option2 && option1Effects && option2Effects) {
        scenarioText.textContent = scenario.text;
        option1.textContent = scenario.options[0].text;
        option2.textContent = scenario.options[1].text;
        option1Effects.textContent = `Time: +${scenario.options[0].effect.time} MD, Budget: +${scenario.options[0].effect.budget}€`;
        option2Effects.textContent = `Time: +${scenario.options[1].effect.time} MD, Budget: +${scenario.options[1].effect.budget}€`;

        option1.onclick = function() {
            let additionalTime = scenario.options[0].effect.time;
            let additionalBudget = scenario.options[0].effect.budget;

            updateTimeCounter(additionalTime);
            updateBudgetCounter(additionalBudget);
            console.log(`Selected option 1: Time +${additionalTime} MD, Budget +${additionalBudget}€`);

            currentScenarioIndex++;
            document.getElementById('researchScenarios').classList.add('fade-out');
            setTimeout(() => {
                document.getElementById('researchScenarios').style.display = 'none';
                document.getElementById('designSprintForm').style.display = 'block';
                document.getElementById('designSprintForm').classList.add('fade-in');
                toggleStatusWindow('designSprintForm');
            }, 500); // Match the duration of the slide-out animation
        };

        option2.onclick = function() {
            let additionalTime = scenario.options[1].effect.time;
            let additionalBudget = scenario.options[1].effect.budget;

            updateTimeCounter(additionalTime);
            updateBudgetCounter(additionalBudget);
            console.log(`Selected option 2: Time +${additionalTime} MD, Budget +${additionalBudget}€`);

            currentScenarioIndex++;
            document.getElementById('researchScenarios').classList.add('fade-out');
            setTimeout(() => {
                document.getElementById('researchScenarios').style.display = 'none';
                document.getElementById('designSprintForm').style.display = 'block';
                document.getElementById('designSprintForm').classList.add('fade-in');
                toggleStatusWindow('designSprintForm');
            }, 500); // Match the duration of the slide-out animation
        };

        document.getElementById('researchForm').style.display = 'none';
        document.getElementById('researchScenarios').style.display = 'block';
        document.getElementById('researchScenarios').classList.add('fade-in');
        console.log('Displaying research scenario:', scenario.text);
    } else {
        console.error("One or more elements for displaying the scenario are missing.");
    }
}

// Function to calculate expected revenue based on ratings
function calculateExpectedRevenue() {
    let marketRating = document.getElementById('marketRating');
    let feasibilityRating = document.getElementById('feasibilityRating');
    let impactRating = document.getElementById('impactRating');
    let productRating = document.getElementById('productRating');

    // Update to check the class 'selected' for qualitative and quantitative buttons
    let qualitativeChecked = document.getElementById('qualitativeButton').classList.contains('selected');
    let quantitativeChecked = document.getElementById('quantitativeButton').classList.contains('selected');
    
    let researchTime = parseInt(document.getElementById('researchTime').value);
    let researchBudget = parseInt(document.getElementById('researchBudget').value);

    let designTime = parseInt(document.getElementById('designTime').value);
    let designBudget = parseInt(document.getElementById('designBudget').value);

    let developmentTime = parseInt(document.getElementById('developmentTime').value);
    let developmentBudget = parseInt(document.getElementById('developmentBudget').value);

    if (!marketRating || !feasibilityRating || !impactRating || !productRating) {
        console.error('One or more rating elements not found');
        return 0;
    }

    let market = parseInt(marketRating.value);
    let feasibility = parseInt(feasibilityRating.value);
    let impact = parseInt(impactRating.value);
    let product = parseInt(productRating.value);

    // Adding randomization factor
    let randomFactor = 0.9 + Math.random() * 0.2; // between 0.9 and 1.1

    // Example calculation of expected revenue
    let baseScore = (market + feasibility + impact + product) * 10000 * randomFactor;

    // Adjust score based on research phase decisions
    let researchScore = 0;
    if (quantitativeChecked) researchScore += researchTime * 500;
    if (qualitativeChecked) researchScore += researchTime * 700;

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

    totalScore = Math.round(totalScore);  // Round the total score to nearest integer

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
    let totalMDElement = document.getElementById('totalMD');
    if (timeCounterElement) {
        timeCounterElement.textContent = totalTime + ' MD';
    }
    if (totalMDElement) {
        totalMDElement.textContent = totalTime;
    }
    console.log(`Total time updated to: ${totalTime} MD`);
}

// Function to update budget counter
function updateBudgetCounter(budget) {
    totalBudget += parseInt(budget);
    let totalBudgetElement = document.getElementById('totalBudgetStatus');
    if (totalBudgetElement) {
        totalBudgetElement.textContent = totalBudget + '€';
    }
    console.log(`Total budget updated to: ${totalBudget}€`);
}

// Popisy pre Market
const marketDescriptions = [
    "Nízky trhový potenciál - Nápad nemá žiadny významný trhový potenciál ani akvizičný potenciál, nie je originálny a nemá žiadny významný trhový dopad.",
    "Malý trhový potenciál - Nápad má obmedzený trhový potenciál a akvizičný potenciál, je čiastočne originálny a má malý trhový dopad.",
    "Stredný trhový potenciál - Nápad má slušný trhový potenciál a akvizičný potenciál, je relatívne originálny a má stredný trhový dopad.",
    "Veľký trhový potenciál - Nápad má veľký trhový potenciál a akvizičný potenciál, je veľmi originálny a má významný trhový dopad.",
    "Obrovský trhový potenciál - Nápad má obrovský trhový potenciál a akvizičný potenciál, je veľmi originálny a má obrovský trhový dopad."
];

// Popisy pre Feasibility
const feasibilityDescriptions = [
    "Nízka realizovateľnosť - Nápad je veľmi ťažko realizovateľný a nákladný na vývoj, vyžaduje veľkú kapacitu a je náročný na integráciu.",
    "Malá realizovateľnosť - Nápad je nákladný na vývoj, vyžaduje veľkú kapacitu tímu a integrácia je náročná.",
    "Stredná realizovateľnosť - Nápad je stredne náročný na vývoj a kapacitu tímu, integrácia je možná s existujúcimi systémami.",
    "Veľká realizovateľnosť - Nápad je pomerne ľahko realizovateľný s nízkymi nákladmi na vývoj, vyžaduje malú kapacitu tímu a integrácia je jednoduchá.",
    "Vysoká realizovateľnosť - Nápad je veľmi ľahko realizovateľný s minimálnymi nákladmi na vývoj, vyžaduje veľmi malú kapacitu tímu a integrácia je bezproblémová."
];

// Popisy pre Impact
const impactDescriptions = [
    "Žiadny dopad - Nápad neprináša žiadnu pridanú hodnotu ani úspory pre banku.",
    "Malý dopad - Nápad prináša určité úspory alebo pridanú hodnotu, ale nie je v súlade so stratégiou banky.",
    "Stredný dopad - Nápad prináša významné úspory alebo pridanú hodnotu a môže byť zaujímavý pre budúce úvahy.",
    "Veľký dopad - Nápad prináša výrazné úspory alebo pridanú hodnotu, je v súlade so stratégiou banky a má potenciál pre významné implementácie.",
    "Obrovský dopad - Nápad prináša obrovské úspory a pridanú hodnotu, je plne v súlade so stratégiou banky a je nevyhnutný pre jej budúci rozvoj."
];

// Popisy pre Product
const productDescriptions = [
    "Žiadny prínos ani obchodný dopad - Nápad neprináša žiadnu pridanú hodnotu ani nový obchodný potenciál.",
    "Malý prínos a obchodný dopad - Nápad prináša určitú pridanú hodnotu a malý potenciál pre nové obchodné príležitosti.",
    "Stredný prínos a obchodný dopad - Nápad prináša relevantnú pridanú hodnotu a stredný potenciál pre nové obchodné príležitosti.",
    "Veľký prínos a obchodný dopad - Nápad prináša významnú pridanú hodnotu a veľký potenciál pre nové obchodné príležitosti.",
    "Obrovský prínos a obchodný dopad - Nápad prináša obrovskú pridanú hodnotu a obrovský potenciál pre nové obchodné príležitosti a partnerstvá."
];

// Funkcia na aktualizáciu popisov
function updateDescription(sliderId, descriptionId, descriptions) {
    const slider = document.getElementById(sliderId);
    const description = document.getElementById(descriptionId);
    if (slider && description) {
        slider.addEventListener('input', function () {
            description.textContent = descriptions[slider.value - 1];
        });
        description.textContent = descriptions[slider.value - 1];  // Initialize description
    }
}

// Inicializácia popisov
updateDescription('marketRating', 'marketDescription', marketDescriptions);
updateDescription('feasibilityRating', 'feasibilityDescription', feasibilityDescriptions);
updateDescription('impactRating', 'impactDescription', impactDescriptions);
updateDescription('productRating', 'productDescription', productDescriptions);



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

// Ensure the function is called when the research form is submitted
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

// Event listener for back button in rating form
document.getElementById('backRating').addEventListener('click', function() {
    handleFormSubmission('ratingForm', 'startForm');
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

// Event listener for back button in design sprint form
document.getElementById('backDesignSprint').addEventListener('click', function() {
    handleFormSubmission('designSprintForm', 'researchForm');
});

// Function to show the leaderboard after business case summary
function showLeaderboard() {
    document.getElementById('businessCaseSummary').style.display = 'block';

    const leaderboardContainer = document.getElementsByClassName('container-leaderboard')[0];
    if (leaderboardContainer) {
        leaderboardContainer.style.display = 'block';
        console.log('Leaderboard displayed');
    } else {
        console.error('Leaderboard container not found');
    }
}

// Event listener for development form submission
document.getElementById('submitDevelopment').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default form submission

    let developmentTimeValue = parseInt(document.getElementById('developmentTime').value);
    let developmentBudgetValue = parseInt(document.getElementById('developmentBudget').value);
    updateTimeCounter(developmentTimeValue);
    updateBudgetCounter(developmentBudgetValue);

    let expectedRevenue = calculateExpectedRevenue();
    console.log(`Final score: ${expectedRevenue}`);

    let ideaName = document.getElementById('ideaName').value;
    let playerName = document.getElementById('playerName').value;

    handleFormSubmission('developmentForm', 'businessCaseSummary');
    document.getElementById('totalTime').textContent = totalTime + ' MD';
    document.getElementById('totalBudget').textContent = totalBudget + '€';
    document.getElementById('expectedRevenue').textContent = expectedRevenue;

    set(ref(db, 'response/' + ideaName), {
        Názov_nápadu: ideaName,
        Meno_hráča: playerName,
        Skore: expectedRevenue
    }).then(() => {
        console.log("Data saved to Firebase");

        loadLeaderboardData();
        showLeaderboard();

        document.getElementById('leaderboard').style.display = 'block';
        const leaderboardContainer = document.getElementsByClassName('container-leaderboard')[0];
        if (leaderboardContainer) {
            leaderboardContainer.style.display = 'block';
            console.log('Leaderboard displayed');
        } else {
            console.error('Leaderboard container not found');
        }

    }).catch((error) => {
        console.error("Error saving data: ", error);
    });

    console.log('Business Case Summary displayed');
});

// Event listener for back button in development form
document.getElementById('backDevelopment').addEventListener('click', function() {
    handleFormSubmission('developmentForm', 'designSprintForm');
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

    // Remove animation classes from all forms
    document.getElementById('startForm').classList.remove('fade-out', 'fade-in');
    document.getElementById('ratingForm').classList.remove('fade-out', 'fade-in');
    document.getElementById('researchForm').classList.remove('fade-out', 'fade-in');
    document.getElementById('researchScenarios').classList.remove('fade-out', 'fade-in');
    document.getElementById('designSprintForm').classList.remove('fade-out', 'fade-in');
    document.getElementById('developmentForm').classList.remove('fade-out', 'fade-in');
    document.getElementById('businessCaseSummary').classList.remove('fade-out', 'fade-in');
    document.getElementById('leaderboard').classList.remove('fade-out', 'fade-in');
    
    // Hide the status window
    toggleStatusWindow('startForm');
}

// Add event listener to the "Start Again" buttons
document.querySelectorAll('#startAgain').forEach(button => {
    button.addEventListener('click', resetGame);
});

// Admin view event listeners

document.getElementById('innovationTitle').addEventListener('click', function() {
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

// Function to handle form submission with animations and project status window toggle
function handleFormSubmission(currentFormId, nextFormId) {
    const currentForm = document.getElementById(currentFormId);
    const nextForm = document.getElementById(nextFormId);

    currentForm.classList.add('fade-out');
    setTimeout(() => {
        currentForm.style.display = 'none';
        nextForm.style.display = 'block';
        nextForm.classList.add('fade-in');

        // Toggle project status window based on current form
        toggleStatusWindow(nextFormId);
    }, 500); // Match the duration of the slide-out animation
}

// Function to toggle project status window
function toggleStatusWindow(formId) {
    const statusWindow = document.getElementById('status-window');
    const showStatusWindow = ['researchForm', 'researchScenarios', 'designSprintForm', 'developmentForm'];

    if (showStatusWindow.includes(formId)) {
        statusWindow.style.display = 'block';
    } else {
        statusWindow.style.display = 'none';
    }
}

// Call toggleStatusWindow initially to hide the status window on page load
toggleStatusWindow('startForm');

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

// Event listeners for qualitative and quantitative research buttons
document.getElementById('qualitativeButton').addEventListener('click', function() {
    this.classList.toggle('selected');
});
document.getElementById('quantitativeButton').addEventListener('click', function() {
    this.classList.toggle('selected');
});
