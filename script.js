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

// Funkce pro přidání záznamu do leaderboardu a uložení do localStorage
function addToLeaderboard(playerName, ideaName, expectedRevenue) {
    const leaderboardTable = document.getElementById('leaderboardTable').getElementsByTagName('tbody')[0];
    const newRow = leaderboardTable.insertRow();

    const playerNameCell = newRow.insertCell(0);
    const ideaNameCell = newRow.insertCell(1);
    const expectedRevenueCell = newRow.insertCell(2);

    playerNameCell.textContent = playerName;
    ideaNameCell.textContent = ideaName;
    expectedRevenueCell.textContent = expectedRevenue + '€';

    // Uložení do localStorage
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ playerName, ideaName, expectedRevenue });
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// Funkce pro načtení leaderboardu z localStorage
function loadLeaderboard() {
    const leaderboardTable = document.getElementById('leaderboardTable').getElementsByTagName('tbody')[0];
    leaderboardTable.innerHTML = ''; // Vyčistí existující řádky

    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    
    // Seřadíme leaderboard podle očekávaného výnosu sestupně
    leaderboard.sort((a, b) => b.expectedRevenue - a.expectedRevenue);

    leaderboard.forEach(entry => {
        const newRow = leaderboardTable.insertRow();

        const playerNameCell = newRow.insertCell(0);
        const ideaNameCell = newRow.insertCell(1);
        const expectedRevenueCell = newRow.insertCell(2);

        playerNameCell.textContent = entry.playerName;
        ideaNameCell.textContent = entry.ideaName;
        expectedRevenueCell.textContent = entry.expectedRevenue + '€';
    });
}

// Funkce pro resetování leaderboardu
function resetLeaderboard() {
    localStorage.removeItem('leaderboard');
    loadLeaderboard(); // Načte (prázdný) leaderboard
}

// Načtení leaderboardu při načítání stránky
window.onload = function() {
    loadLeaderboard();
    document.getElementById('leaderboard').style.display = 'block';
    document.getElementById('resetLeaderboard').addEventListener('click', resetLeaderboard);
}

// Po odeslání formuláře pro zadání názvu nápadu a jména hráče
document.getElementById('inputForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // Skryje formulář pro zadání názvu nápadu a jména hráče
    this.style.display = 'none';
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
document.getElementById('submitDevelopment').addEventListener('click', function() {
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

    // Přidání výsledků do leaderboardu
    addToLeaderboard(playerName, ideaName, expectedRevenue);

    // Skryje formulář pro development
    document.getElementById('developmentForm').style.display = 'none';
    // Zobrazí business case summary
    document.getElementById('businessCaseSummary').style.display = 'block';
    document.getElementById('totalTime').textContent = totalTime + ' MD';
    document.getElementById('totalBudget').textContent = totalBudget + '€';
    document.getElementById('expectedRevenue').textContent = expectedRevenue + '€';

    console.log('Business Case Summary displayed'); // Debugovací výpis

    // Zobrazí leaderboard
    document.getElementById('leaderboard').style.display = 'block';
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
