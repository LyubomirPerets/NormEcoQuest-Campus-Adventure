const quests = [
    {
        id: "leftovers",
        category: "Food Systems",
        title: "Cook with leftovers",
        description: "Turn yesterday's extras into tonight's dinner and stop food waste before it starts.",
        impactText: "Impact: saves 1 meal and avoids 1.1 lbs CO2",
        coins: 10,
        xp: 12,
        impact: { food: 1, energy: 0.1, water: 0, carbon: 1.1, boss: 8 }
    },
    {
        id: "lights",
        category: "Energy Efficiency",
        title: "Turn off lights and appliances",
        description: "Power down your room before heading out and chip away at the Energy Goblin.",
        impactText: "Impact: saves 0.8 kWh and avoids 0.7 lbs CO2",
        coins: 5,
        xp: 8,
        impact: { food: 0, energy: 0.8, water: 0, carbon: 0.7, boss: 12 }
    },
    {
        id: "share-food",
        category: "Circular Economy",
        title: "Share unused food",
        description: "Post extra groceries for a roommate or friend before they expire.",
        impactText: "Impact: saves 1 meal and supports campus sharing",
        coins: 10,
        xp: 11,
        impact: { food: 1, energy: 0, water: 0, carbon: 1.3, boss: 10 }
    },
    {
        id: "shower",
        category: "Water + Energy",
        title: "Take a shorter shower",
        description: "Keep it quick today to conserve hot water in your dorm or apartment.",
        impactText: "Impact: saves 8 gallons and 0.3 kWh",
        coins: 5,
        xp: 9,
        impact: { food: 0, energy: 0.3, water: 8, carbon: 0.4, boss: 6 }
    }
];

const tiers = [
    {
        name: "The Owl",
        minXp: 0,
        description: "Starter tier for students beginning their eco streak.",
        reward: "Starter badge and daily eco tips"
    },
    {
        name: "Pickaxe Pro",
        minXp: 40,
        description: "Bronze tier for students turning quick wins into habits.",
        reward: "10% rental gear discount"
    },
    {
        name: "Prospector",
        minXp: 90,
        description: "Silver tier for strong challenge completion and team play.",
        reward: "Dining bonus on select challenge days"
    },
    {
        name: "Norm's Inner Circle",
        minXp: 150,
        description: "Green tier for standout campus sustainability leaders.",
        reward: "Priority event access and profile flair"
    },
    {
        name: "The Golden Niner",
        minXp: 230,
        description: "Top tier for players driving visible campus impact.",
        reward: "Top leaderboard spotlight and premium rewards"
    }
];

let state = {
    coins: 0,
    xp: 0,
    streak: 1,
    food: 0,
    energy: 0,
    water: 0,
    carbon: 0,
    bossProgress: 18,
    completedQuestIds: []
};

const leaderboardBase = [
    { name: "Maya - Oak Hall", score: 76, note: "Compost combo active" },
    { name: "Jordan - Laurel", score: 68, note: "3-day streak" },
    { name: "Avery - Pine", score: 59, note: "Food saver badge" },
    { name: "You - Maple", score: 42, note: "Dorm quest runner" },
    { name: "Chris - Cedar", score: 38, note: "Water wizard" }
];

const questList = document.querySelector("#quest-list");
const questTemplate = document.querySelector("#quest-template");
const tierList = document.querySelector("#tier-list");
const rewardList = document.querySelector("#reward-list");
const leaderboardList = document.querySelector("#leaderboard-list");

const coinTotal = document.querySelector("#coin-total");
const xpTotal = document.querySelector("#xp-total");
const streakTotal = document.querySelector("#streak-total");
const tierName = document.querySelector("#tier-name");
const tierDescription = document.querySelector("#tier-description");
const tierProgressText = document.querySelector("#tier-progress-text");
const tierProgressFill = document.querySelector("#tier-progress-fill");
const completionCount = document.querySelector("#completion-count");
const bossScore = document.querySelector("#boss-score");
const bossProgressText = document.querySelector("#boss-progress-text");
const bossProgressFill = document.querySelector("#boss-progress-fill");
const playerRankPill = document.querySelector("#player-rank-pill");
const foodSaved = document.querySelector("#food-saved");
const energySaved = document.querySelector("#energy-saved");
const waterSaved = document.querySelector("#water-saved");
const carbonSaved = document.querySelector("#carbon-saved");

function renderTabs() {
    const tabs = document.querySelectorAll(".tab");
    const panels = document.querySelectorAll(".tab-panel");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.tab;

            tabs.forEach((item) => item.classList.toggle("active", item === tab));
            panels.forEach((panel) => {
                panel.classList.toggle("active", panel.dataset.panel === target);
            });
        });
    });
}

function renderQuests() {
    questList.innerHTML = "";

    quests.forEach((quest) => {
        const fragment = questTemplate.content.cloneNode(true);
        const card = fragment.querySelector(".quest-card");
        const tag = fragment.querySelector(".quest-tag");
        const value = fragment.querySelector(".quest-value");
        const title = fragment.querySelector(".quest-title");
        const description = fragment.querySelector(".quest-description");
        const impact = fragment.querySelector(".quest-impact");
        const button = fragment.querySelector(".quest-action");
        const isCompleted = state.completedQuestIds.includes(quest.id);

        tag.textContent = quest.category;
        value.textContent = `+${quest.coins} coins / +${quest.xp} XP`;
        title.textContent = quest.title;
        description.textContent = quest.description;
        impact.textContent = quest.impactText;
        button.textContent = isCompleted ? "Undo quest" : "Complete quest";
        button.classList.toggle("is-complete", isCompleted);
        card.classList.toggle("completed", isCompleted);

        button.addEventListener("click", () => toggleQuest(quest.id));

        questList.appendChild(fragment);
    });
}

function getCurrentTier() {
    return tiers.reduce((current, tier) => {
        return state.xp >= tier.minXp ? tier : current;
    }, tiers[0]);
}

function getNextTier() {
    return tiers.find((tier) => tier.minXp > state.xp) ?? null;
}

function renderTierPanel() {
    const currentTier = getCurrentTier();
    const nextTier = getNextTier();
    const progressBase = currentTier.minXp;
    const progressTarget = nextTier ? nextTier.minXp : currentTier.minXp + 1;
    const progressValue = nextTier
        ? ((state.xp - progressBase) / (progressTarget - progressBase)) * 100
        : 100;

    tierName.textContent = currentTier.name;
    tierDescription.textContent = currentTier.description;
    completionCount.textContent = `${state.completedQuestIds.length} of ${quests.length} quests completed`;
    tierProgressFill.style.width = `${Math.max(0, Math.min(progressValue, 100))}%`;
    tierProgressText.textContent = nextTier
        ? `${state.xp} / ${nextTier.minXp} XP to ${nextTier.name}`
        : `${state.xp} XP earned - max tier reached`;
}

function renderImpact() {
    foodSaved.textContent = `${state.food} meals`;
    energySaved.textContent = `${state.energy.toFixed(1)} kWh`;
    waterSaved.textContent = `${state.water} gal`;
    carbonSaved.textContent = `${state.carbon.toFixed(1)} lbs CO2`;
}

function getLeaderboard() {
    const playerScore = 42 + state.coins + state.completedQuestIds.length * 4;
    const board = leaderboardBase.map((player) =>
        player.name.startsWith("You")
            ? { ...player, score: playerScore, note: `${state.completedQuestIds.length} quests done today` }
            : player
    );

    return board.sort((a, b) => b.score - a.score);
}

function renderLeaderboard() {
    const board = getLeaderboard();
    leaderboardList.innerHTML = "";

    board.forEach((player, index) => {
        const row = document.createElement("article");
        row.className = "leaderboard-row";
        if (player.name.startsWith("You")) {
            row.classList.add("current-player");
            playerRankPill.textContent = `Rank #${index + 1}`;
        }

        row.innerHTML = `
            <div class="rank-number">${index + 1}</div>
            <div>
                <div class="player-name">${player.name}</div>
                <div class="player-meta">${player.note}</div>
            </div>
            <div class="score-pill">${player.score} pts</div>
        `;

        leaderboardList.appendChild(row);
    });
}

function renderRewards() {
    const currentTier = getCurrentTier();
    tierList.innerHTML = "";
    rewardList.innerHTML = "";

    tiers.forEach((tier) => {
        const unlocked = state.xp >= tier.minXp;
        const tierRow = document.createElement("article");
        tierRow.className = "tier-row";
        if (tier.name === currentTier.name) {
            tierRow.classList.add("active-tier");
        }

        tierRow.innerHTML = `
            <div>
                <div class="player-name">${tier.name}</div>
                <div class="tier-caption">${tier.description}</div>
            </div>
            <div class="${unlocked ? "unlock-pill" : "lock-pill"}">
                ${unlocked ? "Unlocked" : `${tier.minXp} XP`}
            </div>
        `;
        tierList.appendChild(tierRow);

        const rewardRow = document.createElement("article");
        rewardRow.className = `reward-row${unlocked ? "" : " locked"}`;
        rewardRow.innerHTML = `
            <div class="reward-title">${tier.reward}</div>
            <div class="reward-caption">${tier.name}</div>
        `;
        rewardList.appendChild(rewardRow);
    });
}

function renderStats() {
    coinTotal.textContent = state.coins;
    xpTotal.textContent = state.xp;
    streakTotal.textContent = `${state.streak} days`;
    bossScore.textContent = `${state.bossProgress}%`;
    bossProgressText.textContent = `${state.bossProgress} / 100 goblin HP cleared`;
    bossProgressFill.style.width = `${state.bossProgress}%`;
}

function toggleQuest(questId) {
    const quest = quests.find((item) => item.id === questId);
    if (!quest) {
        return;
    }

    const isCompleted = state.completedQuestIds.includes(questId);

    state = {
        ...state,
        coins: Math.max(0, state.coins + (isCompleted ? -quest.coins : quest.coins)),
        xp: Math.max(0, state.xp + (isCompleted ? -quest.xp : quest.xp)),
        food: Math.max(0, state.food + (isCompleted ? -quest.impact.food : quest.impact.food)),
        energy: Math.max(0, state.energy + (isCompleted ? -quest.impact.energy : quest.impact.energy)),
        water: Math.max(0, state.water + (isCompleted ? -quest.impact.water : quest.impact.water)),
        carbon: Math.max(0, state.carbon + (isCompleted ? -quest.impact.carbon : quest.impact.carbon)),
        bossProgress: Math.max(
            0,
            Math.min(100, state.bossProgress + (isCompleted ? -quest.impact.boss : quest.impact.boss))
        ),
        streak: Math.max(1, state.streak + (isCompleted ? -1 : 1)),
        completedQuestIds: isCompleted
            ? state.completedQuestIds.filter((id) => id !== questId)
            : [...state.completedQuestIds, questId]
    };

    renderAll();
}

function renderAll() {
    renderStats();
    renderQuests();
    renderTierPanel();
    renderImpact();
    renderLeaderboard();
    renderRewards();
}

renderTabs();
renderAll();
