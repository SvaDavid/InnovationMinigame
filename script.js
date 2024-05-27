console.log("Script loaded");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js";

// Firebase konfigurace
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

// Inicializace Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

let totalTime = 0;
let totalBudget = 0;

// Funkce pro kalkulaci očekávaných výnosů na základě hodnocení
function calculateExpectedRevenue() {
    let scalabilityElement = document.getElementById('scalability');
    let acquisitionElement = document.getElementById('acquisition');

    if (!scalabilityElement || !acquisitionElement) {
        console.error('Scalability or acquisition element not found');
        return 0; // Nebo jiná vhodná výchozí hodnota
    }

    let scalability = parseInt(scalabilityElement.value);
    let acquisition = parseInt(acquisitionElement.value);

    // Jednoduchý příklad kalkulace výnosů na základě hodnocení (lze upravit)
    let expectedRevenue = (scalability + acquisition) * 10000; // Příklad výpočtu
    return expectedRevenue;
}

// Funkce pro získanie dát z firebase
function loadLeaderboardData() {
    const dbRef = ref(db);
    get(child(dbRef, 'response')).then((snapshot) => {
        if (snapshot.exists()) {
            const leaderboardTable = document.getElementById('leaderboardTable').getElementsByTagName('tbody')[0];
            leaderboardTable.innerHTML = ''; // Vymazat staré údaje

            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                const row = leaderboardTable.insertRow();

                const playerNameCell = row.insertCell(0);
                const ideaNameCell = row.insertCell(1);
                const expectedRevenueCell = row.insertCell(2);

                playerNameCell.textContent = data.Meno_hráča;
                ideaNameCell.textContent = data.Názov_nápadu;
                expectedRevenueCell.textContent = data.Skore;
            });
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error("Error loading data: ", error);
    });
}

// Funkce pro aktualizaci času v sekundárním okně
function updateTimeCounter(time) {
    totalTime += parseInt(time);
    let timeCounterElement = document.getElementById('timeCounter');
    if (timeCounterElement) {
        timeCounterElement.textContent = totalTime + ' MD';
    }
}

// Funkce pro aktualizaci financí v sekundárním okně
function updateBudgetCounter(budget) {
    totalBudget += parseInt(budget);
    let budgetCounterElement = document.getElementById('budgetCounter');
    if (budgetCounterElement) {
        budgetCounterElement.textContent = totalBudget + '€';
    }
}

// Po odeslání formuláře pro zadání názvu nápadu a jména hráče
document.getElementById('submitStart').addEventListener('click', function() {
    // Skryje formulář pro zadání názvu nápadu a jména hráče
    document.getElementById('startForm').style.display = 'none';
    // Zobrazí formulář pro hodnocení nápadu
    document.getElementById('ratingForm').style.display = 'block';
});

// Po odeslání formuláře pro hodnocení nápadu
document.getElementById('submitRating').addEventListener('click', function() {
    // Skryje formulář pro hodnocení nápadu
    document.getElementById('ratingForm').style.display = 'none';
    // Zobrazí formulář pro výzkum
    document.getElementById('researchForm').style.display = 'block';
});

// Po odeslání formuláře pro výzkum
document.getElementById('submitResearch').addEventListener('click', function() {
    // Aktualizujeme hodnoty v sekundárním okně
    let timeValue = document.getElementById('researchTime').value;
    let budgetValue = document.getElementById('researchBudget').value;
    updateTimeCounter(timeValue);
    updateBudgetCounter(budgetValue);

    // Skryje formulář pro výzkum
    document.getElementById('researchForm').style.display = 'none';
    // Zobrazí formulář pro design sprint
    document.getElementById('designSprintForm').style.display = 'block';
});

// Po odeslání formuláře pro design sprint
document.getElementById('submitDesignSprint').addEventListener('click', function() {
    // Aktualizujeme hodnoty v sekundárním okně
    let designTimeValue = document.getElementById('designTime').value;
    let designBudgetValue = document.getElementById('designBudget').value;
    updateTimeCounter(designTimeValue);
    updateBudgetCounter(designBudgetValue);

    // Skryje formulář pro design sprint
    document.getElementById('designSprintForm').style.display = 'none';
    // Zobrazí formulář pro development
    document.getElementById('developmentForm').style.display = 'block';
});

// Po odeslání formuláře pro development
document.getElementById('submitDevelopment').addEventListener('click', function(e) {
    // Aktualizujeme hodnoty v sekundárním okně
    let developmentTimeValue = document.getElementById('developmentTime').value;
    let developmentBudgetValue = document.getElementById('developmentBudget').value;
    updateTimeCounter(developmentTimeValue);
    updateBudgetCounter(developmentBudgetValue);

    // Kalkulace očekávaných výnosů
    let expectedRevenue = calculateExpectedRevenue();

    // Získání názvu nápadu a jména hráče
    let ideaName = document.getElementById('ideaName').value;
    let playerName = document.getElementById('playerName').value;

    // Skryje formulář pro development
    document.getElementById('developmentForm').style.display = 'none';
    // Zobrazí business case summary
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
        alert("Data odoslane");

        // Načte data do leaderboardu
        loadLeaderboardData();

        // Zobrazí leaderboard
        document.getElementById('leaderboard').style.display = 'block';
    }).catch((error) => {
        console.error("Error saving data: ", error);
    });

    console.log('Business Case Summary displayed'); // Debugovací výpis
});

// Posluchač události pro změnu hodnoty posuvníku pro čas výzkumu
document.getElementById('researchTime').addEventListener('input', function() {
    document.getElementById('researchTimeLabel').textContent = this.value + ' MD';
});

// Posluchač události pro změnu hodnoty posuvníku pro rozpočet výzkumu
document.getElementById('researchBudget').addEventListener('input', function() {
    document.getElementById('researchBudgetLabel').textContent = this.value + '€';
});

// Posluchač události pro změnu hodnoty posuvníku pro čas design sprintu
document.getElementById('designTime').addEventListener('input', function() {
    document.getElementById('designTimeLabel').textContent = this.value + ' MD';
});

// Posluchač události pro změnu hodnoty posuvníku pro rozpočet design sprintu
document.getElementById('designBudget').addEventListener('input', function() {
    document.getElementById('designBudgetLabel').textContent = this.value + '€';
});

// Posluchač události pro změnu hodnoty posuvníku pro čas developmentu
document.getElementById('developmentTime').addEventListener('input', function() {
    document.getElementById('developmentTimeLabel').textContent = this.value + ' MD';
});

// Posluchač události pro změnu hodnoty posuvníku pro rozpočet developmentu
document.getElementById('developmentBudget').addEventListener('input', function() {
    document.getElementById('developmentBudgetLabel').textContent = this.value + '€';
});
