const quests = [
    {
        id: "leftovers",
        type: "daily",
        category: "Food Systems",
        title: "Cook with leftovers",
        description: "Use leftovers before they spoil.",
        impactText: "Log servings saved.",
        coins: 10,
        xp: 12,
        verificationFields: [
            {
                key: "servings",
                label: "Servings saved",
                type: "number",
                placeholder: "e.g. 2"
            },
            {
                key: "proof",
                label: "Confirmed by",
                type: "select",
                options: ["Ate leftovers", "Shared with roommate", "Stored for later"]
            }
        ],
        impact: { food: 1, energy: 0.1, water: 0, carbon: 1.1, boss: 8 }
    },
    {
        id: "lights",
        type: "daily",
        category: "Energy Efficiency",
        title: "Turn off lights and appliances",
        description: "Power down before heading out.",
        impactText: "Enter hours off.",
        coins: 5,
        xp: 8,
        customInput: {
            label: "Hours off",
            placeholder: "e.g. 3",
            unit: "hours"
        },
        impact: { food: 0, energy: 0.8, water: 0, carbon: 0.7, boss: 12 }
    },
    {
        id: "share-food",
        type: "daily",
        category: "Circular Economy",
        title: "Share unused food",
        description: "Pass along extra food before it expires.",
        impactText: "Log servings shared.",
        coins: 10,
        xp: 11,
        verificationFields: [
            {
                key: "servings",
                label: "Servings shared",
                type: "number",
                placeholder: "e.g. 3"
            },
            {
                key: "proof",
                label: "Confirmed by",
                type: "select",
                options: ["Claimed by roommate", "Donated to pantry", "Shared with friend"]
            }
        ],
        impact: { food: 1, energy: 0, water: 0, carbon: 1.3, boss: 10 }
    },
    {
        id: "shower",
        type: "daily",
        category: "Water + Energy",
        title: "Take a shorter shower",
        description: "Keep it quick today.",
        impactText: "Saves 8 gal and 0.3 kWh.",
        coins: 5,
        xp: 9,
        impact: { food: 0, energy: 0.3, water: 8, carbon: 0.4, boss: 6 }
    },
    {
        id: "fridge-check",
        type: "weekly",
        category: "Food Systems",
        title: "Weekly fridge clean-out",
        description: "Rescue ingredients and plan a meal.",
        impactText: "Log servings rescued.",
        coins: 18,
        xp: 24,
        verificationFields: [
            {
                key: "servings",
                label: "Servings rescued",
                type: "number",
                placeholder: "e.g. 4"
            },
            {
                key: "proof",
                label: "Confirmed by",
                type: "select",
                options: ["Meal planned", "Ingredients used", "Food shared before spoilage"]
            }
        ],
        impact: { food: 2, energy: 0, water: 0, carbon: 2.4, boss: 12 }
    },
    {
        id: "dorm-team",
        type: "weekly",
        category: "Community Quest",
        title: "Complete a dorm sustainability challenge",
        description: "Log one shared dorm action.",
        impactText: "Boosts dorm progress.",
        coins: 20,
        xp: 28,
        impact: { food: 0, energy: 1.2, water: 6, carbon: 1.8, boss: 16 }
    }
];

const tiers = [
    {
        name: "The Owl",
        minXp: 0,
        description: "Starter tier.",
        reward: "Starter badge and daily eco tips"
    },
    {
        name: "Pickaxe Pro",
        minXp: 40,
        description: "Bronze habit builder.",
        reward: "10% rental gear discount"
    },
    {
        name: "Prospector",
        minXp: 90,
        description: "Silver team player.",
        reward: "Dining bonus on select challenge days"
    },
    {
        name: "Norm's Inner Circle",
        minXp: 150,
        description: "Campus sustainability leader.",
        reward: "Priority event access and profile flair"
    },
    {
        name: "The Golden Niner",
        minXp: 230,
        description: "Top campus impact tier.",
        reward: "Top leaderboard spotlight and premium rewards"
    }
];

const rewardsCatalog = [
    {
        id: "library-late-pass",
        title: "Library Late-Night Pass",
        description: "Extended study-space reservation.",
        cost: 20
    },
    {
        id: "eco-sticker-pack",
        title: "49er Eco Sticker Pack",
        description: "Campus eco sticker swag.",
        cost: 15
    },
    {
        id: "campus-discount",
        title: "Campus Cafe Discount",
        description: "One-time partner cafe discount.",
        cost: 25
    },
    {
        id: "green-badge",
        title: "Green Hero Profile Frame",
        description: "Special EcoQuest profile frame.",
        cost: 10
    }
];

const STORAGE_KEY = "ecoquest-campus-adventure-state";

const defaultState = {
    coins: 0,
    xp: 0,
    streak: 1,
    food: 0,
    energy: 0,
    water: 0,
    carbon: 0,
    bossProgress: 18,
    completedQuestIds: [],
    redeemedRewardIds: [],
    customQuestInputs: {}
};

const leaderboardBase = [
    { name: "Maya - Oak Hall", score: 76, note: "Compost combo active" },
    { name: "Jordan - Laurel", score: 68, note: "3-day streak" },
    { name: "Avery - Pine", score: 59, note: "Food saver badge" },
    { name: "You - Maple", score: 62, note: "Dorm quest runner" },
    { name: "Chris - Cedar", score: 38, note: "Water wizard" }
];

const questList = document.querySelector("#quest-list");
const weeklyQuestList = document.querySelector("#weekly-quest-list");
const questTemplate = document.querySelector("#quest-template");
const tierList = document.querySelector("#tier-list");
const rewardList = document.querySelector("#reward-list");
const redeemedList = document.querySelector("#redeemed-list");
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
const topDormLabel = document.querySelector("#top-dorm-label");
const foodSaved = document.querySelector("#food-saved");
const energySaved = document.querySelector("#energy-saved");
const waterSaved = document.querySelector("#water-saved");
const carbonSaved = document.querySelector("#carbon-saved");
const shopCoinBalance = document.querySelector("#shop-coin-balance");
const levelupOverlay = document.querySelector("#levelup-overlay");
const levelupTitle = document.querySelector("#levelup-title");
const levelupMessage = document.querySelector("#levelup-message");
const levelupClose = document.querySelector("#levelup-close");
const confettiLayer = document.querySelector("#confetti-layer");
const resetProgressButton = document.querySelector("#reset-progress");

function loadState() {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            return { ...defaultState };
        }

        const parsed = JSON.parse(saved);
        return {
            ...defaultState,
            ...parsed,
            completedQuestIds: Array.isArray(parsed.completedQuestIds) ? parsed.completedQuestIds : [],
            redeemedRewardIds: Array.isArray(parsed.redeemedRewardIds) ? parsed.redeemedRewardIds : [],
            customQuestInputs: parsed.customQuestInputs && typeof parsed.customQuestInputs === "object"
                ? parsed.customQuestInputs
                : {}
        };
    } catch {
        return { ...defaultState };
    }
}

function saveState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetState() {
    state = { ...defaultState, completedQuestIds: [] };
    window.localStorage.removeItem(STORAGE_KEY);
    hideLevelUp();
    renderAll();
}

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
    weeklyQuestList.innerHTML = "";

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
        button.textContent = isCompleted ? "Undo" : "Complete";
        button.classList.toggle("is-complete", isCompleted);
        card.classList.toggle("completed", isCompleted);

        if (quest.customInput || quest.verificationFields) {
            const controls = document.createElement("div");
            controls.className = "quest-controls";

            if (quest.customInput) {
                const input = document.createElement("input");
                input.className = "quest-input";
                input.type = "number";
                input.min = "1";
                input.step = "1";
                input.placeholder = quest.customInput.placeholder;
                input.dataset.questId = quest.id;
                input.value = state.customQuestInputs?.[quest.id]?.hours ?? "";

                input.addEventListener("input", (event) => {
                    state = {
                        ...state,
                        customQuestInputs: {
                            ...(state.customQuestInputs ?? {}),
                            [quest.id]: {
                                ...(state.customQuestInputs?.[quest.id] ?? {}),
                                hours: event.target.value
                            }
                        }
                    };
                    saveState();
                });

                controls.appendChild(input);
            }

            if (quest.verificationFields) {
                quest.verificationFields.forEach((field) => {
                    let control;

                    if (field.type === "select") {
                        control = document.createElement("select");
                        control.className = "quest-input quest-select";

                        const placeholderOption = document.createElement("option");
                        placeholderOption.value = "";
                        placeholderOption.textContent = field.label;
                        control.appendChild(placeholderOption);

                        field.options.forEach((option) => {
                            const optionElement = document.createElement("option");
                            optionElement.value = option;
                            optionElement.textContent = option;
                            control.appendChild(optionElement);
                        });
                    } else {
                        control = document.createElement("input");
                        control.className = "quest-input";
                        control.type = "number";
                        control.min = "1";
                        control.step = "1";
                        control.placeholder = field.placeholder;
                    }

                    control.value = state.customQuestInputs?.[quest.id]?.[field.key] ?? "";
                    control.addEventListener("input", (event) => {
                        state = {
                            ...state,
                            customQuestInputs: {
                                ...(state.customQuestInputs ?? {}),
                                [quest.id]: {
                                    ...(state.customQuestInputs?.[quest.id] ?? {}),
                                    [field.key]: event.target.value
                                }
                            }
                        };
                        saveState();
                    });

                    controls.appendChild(control);
                });
            }

            const helper = document.createElement("p");
            helper.className = "quest-helper";
            helper.textContent = quest.verificationFields
                ? "Log servings + proof."
                : "Log hours off.";

            controls.appendChild(button);
            fragment.querySelector(".quest-copy").appendChild(helper);
            card.appendChild(controls);
        } else {
            button.addEventListener("click", () => toggleQuest(quest.id));
        }

        if (quest.customInput || quest.verificationFields) {
            button.addEventListener("click", () => toggleQuest(quest.id));
        }

        if (quest.type === "weekly") {
            weeklyQuestList.appendChild(fragment);
        } else {
            questList.appendChild(fragment);
        }
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
    completionCount.textContent = `${state.completedQuestIds.length} / ${quests.length} done`;
    tierProgressFill.style.width = `${Math.max(0, Math.min(progressValue, 100))}%`;
    tierProgressText.textContent = nextTier
        ? `${state.xp} / ${nextTier.minXp} XP to ${nextTier.name}`
        : `${state.xp} XP earned - max tier reached`;
}
function getImpactMessage(state) {
    const messages = [];

    if (state.food >= 3) {
        messages.push(" You defeated the Food Waste Monster today!");
    } else if (state.food > 0) {
        messages.push(" You're chipping away at the Food Waste Monster.");
    }

    if (state.energy >= 2) {
        messages.push("⚡ Big hit on the Energy Goblin!");
    } else if (state.energy > 0) {
        messages.push(" The Energy Goblin is losing power.");
    }

    if (state.water >= 10) {
        messages.push(" The Water Wisp is shrinking fast!");
    } else if (state.water > 0) {
        messages.push(" Small splash against the Water Wisp.");
    }

    if (state.carbon >= 3) {
        messages.push(" Huge CO₂ reduction — Norm would be proud.");
    }

    if (state.xp >= 100) {
        messages.push(" Norm Boost Activated: You're becoming a campus legend.");
    }

    if (messages.length === 0) {
        return " Start completing quests to see your impact grow!";
    }

    return messages.join(" ");
}

function renderImpact() {
    // Update numeric values
    foodSaved.textContent = `${state.food} meals`;
    energySaved.textContent = `${state.energy.toFixed(1)} kWh`;
    waterSaved.textContent = `${state.water} gal`;
    carbonSaved.textContent = `${state.carbon.toFixed(1)} lbs CO₂`;

    // Personalized Mario-style message
    const impactMessage = getImpactMessage(state);

    // Create or update message element
    let messageBox = document.querySelector("#impact-message");
    if (!messageBox) {
        messageBox = document.createElement("div");
        messageBox.id = "impact-message";
        messageBox.className = "impact-message";
        document.querySelector("#impact-panel").appendChild(messageBox);
    }
    messageBox.textContent = impactMessage;

    // Dynamic color feedback
    const panel = document.querySelector("#impact-panel");

    if (state.carbon > 3 || state.energy > 2) {
        panel.style.borderColor = "#ffcc00"; // Mario yellow
        panel.style.boxShadow = "0 0 12px #ffcc00";
    } else if (state.food > 0 || state.water > 0) {
        panel.style.borderColor = "#00ff66"; // bright green
        panel.style.boxShadow = "0 0 12px #00ff66";
    } else {
        panel.style.borderColor = "#013201"; // default UNC Charlotte green
        panel.style.boxShadow = "none";
    }
}

function getLeaderboard() {
    const playerBoost = state.completedQuestIds.length * 2 + state.redeemedRewardIds.length;
    const board = dormCompetitionBase.map((dorm) =>
        dorm.name === "Maple Hall"
            ? {
                ...dorm,
                score: dorm.score + playerBoost,
                note: playerBoost > 0 ? "Your dorm is climbing" : dorm.note
            }
            : dorm
    );

    return board.sort((a, b) => b.score - a.score);
}

function renderLeaderboard() {
    const board = getLeaderboard();
    leaderboardList.innerHTML = "";
    topDormLabel.textContent = board[0]?.name ?? "Maple Hall";

    board.forEach((dorm, index) => {
        const row = document.createElement("article");
        row.className = "leaderboard-row";
        if (dorm.name === "Maple Hall") {
            row.classList.add("current-player");
            playerRankPill.textContent = `Rank #${index + 1}`;
        }

        const detailsId = `dorm-details-${index}`;
        row.innerHTML = `
            <div class="rank-number">${index + 1}</div>
            <div>
                <div class="player-name">${dorm.name}</div>
                <div class="player-meta">${dorm.note}</div>
            </div>
            <div class="score-pill">${dorm.score} pts</div>
            <button class="dorm-toggle" type="button" aria-expanded="false" aria-controls="${detailsId}">
                View details
            </button>
        `;

        const details = document.createElement("div");
        details.className = "dorm-details";
        details.id = detailsId;
        details.hidden = true;
        details.innerHTML = `
            <div class="dorm-detail-grid">
                <div class="dorm-note good">
                    <strong>Excelling</strong><br>
                    ${dorm.excels.join("<br>")}
                </div>
                <div class="dorm-note risk">
                    <strong>Needs work</strong><br>
                    ${dorm.needsWork.join("<br>")}
                </div>
            </div>
        `;
        row.appendChild(details);

        const toggle = row.querySelector(".dorm-toggle");
        toggle.addEventListener("click", () => {
            const isHidden = details.hidden;
            details.hidden = !isHidden;
            toggle.textContent = isHidden ? "Hide details" : "View details";
            toggle.setAttribute("aria-expanded", String(isHidden));
        });

        leaderboardList.appendChild(row);
    });
}

function renderRewards() {
    const currentTier = getCurrentTier();
    tierList.innerHTML = "";
    rewardList.innerHTML = "";
    redeemedList.innerHTML = "";
    shopCoinBalance.textContent = `${state.coins} coins`;

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
    });

    rewardsCatalog.forEach((reward) => {
        const alreadyRedeemed = state.redeemedRewardIds.includes(reward.id);
        const canAfford = state.coins >= reward.cost;
        const rewardRow = document.createElement("article");
        rewardRow.className = "shop-row";
        rewardRow.innerHTML = `
            <div>
                <div class="reward-title">${reward.title}</div>
                <div class="reward-caption">${reward.description}</div>
                <span class="cost-pill">${reward.cost} coins</span>
            </div>
        `;

        const button = document.createElement("button");
        button.className = "redeem-button";
        button.textContent = alreadyRedeemed ? "Claimed" : "Redeem";
        button.disabled = alreadyRedeemed || !canAfford;
        button.addEventListener("click", () => redeemReward(reward.id));
        rewardRow.appendChild(button);
        rewardList.appendChild(rewardRow);
    });

    const redeemedRewards = rewardsCatalog.filter((reward) => state.redeemedRewardIds.includes(reward.id));
    if (redeemedRewards.length === 0) {
        const emptyState = document.createElement("article");
        emptyState.className = "redeemed-item";
        emptyState.innerHTML = `
            <div class="reward-title">No rewards claimed yet</div>
            <div class="reward-caption">Redeemed rewards will appear here.</div>
        `;
        redeemedList.appendChild(emptyState);
        return;
    }

    redeemedRewards.forEach((reward) => {
        const claimedRow = document.createElement("article");
        claimedRow.className = "redeemed-item";
        claimedRow.innerHTML = `
            <div class="reward-title">${reward.title}</div>
            <div class="reward-caption">${reward.description}</div>
        `;
        redeemedList.appendChild(claimedRow);
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

function showLevelUp(tier) {
    levelupTitle.textContent = tier.name;
    levelupMessage.textContent = `${tier.description} Reward unlocked: ${tier.reward}.`;
    levelupOverlay.hidden = false;
    confettiLayer.innerHTML = "";

    const colors = ["#ffcb47", "#6fcb62", "#82d6ff", "#f26b5e", "#fbf6e8"];

    for (let index = 0; index < 28; index += 1) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[index % colors.length];
        piece.style.animationDelay = `${Math.random() * 250}ms`;
        piece.style.setProperty("--drift", `${Math.round((Math.random() - 0.5) * 180)}px`);
        piece.style.transform = `rotate(${Math.round(Math.random() * 180)}deg)`;
        confettiLayer.appendChild(piece);
    }
}

function hideLevelUp() {
    levelupOverlay.hidden = true;
    confettiLayer.innerHTML = "";
}

function redeemReward(rewardId) {
    const reward = rewardsCatalog.find((item) => item.id === rewardId);
    if (!reward) {
        return;
    }

    if (state.redeemedRewardIds.includes(rewardId) || state.coins < reward.cost) {
        return;
    }

    state = {
        ...state,
        coins: state.coins - reward.cost,
        redeemedRewardIds: [...state.redeemedRewardIds, rewardId]
    };

    saveState();
    renderAll();
}

function toggleQuest(questId) {
    const quest = quests.find((item) => item.id === questId);
    if (!quest) {
        return;
    }

    const isCompleted = state.completedQuestIds.includes(questId);
    const previousTier = getCurrentTier();
    let questImpact = quest.impact;
    let questCoins = quest.coins;
    let questXp = quest.xp;

    if (quest.customInput) {
        const rawValue = state.customQuestInputs?.[quest.id]?.hours;
        const hoursOff = Number(rawValue);
        const normalizedHours = Number.isFinite(hoursOff) && hoursOff > 0 ? hoursOff : 1;
        questImpact = {
            ...quest.impact,
            energy: Number((normalizedHours * 0.2).toFixed(1)),
            carbon: Number((normalizedHours * 0.18).toFixed(1)),
            boss: Math.min(20, 4 + Math.round(normalizedHours * 2))
        };
        questCoins = 4 + Math.min(12, Math.round(normalizedHours * 2));
        questXp = 6 + Math.min(14, Math.round(normalizedHours * 2));
    }

    if (quest.verificationFields) {
        const servingsValue = Number(state.customQuestInputs?.[quest.id]?.servings);
        const normalizedServings = Number.isFinite(servingsValue) && servingsValue > 0 ? servingsValue : 1;
        questImpact = {
            ...questImpact,
            food: normalizedServings,
            carbon: Number((normalizedServings * 0.9).toFixed(1)),
            boss: Math.min(20, questImpact.boss + normalizedServings)
        };
        questCoins = Math.max(questCoins, 6 + Math.min(16, normalizedServings * 2));
        questXp = Math.max(questXp, 8 + Math.min(20, normalizedServings * 3));
    }

    state = {
        ...state,
        coins: Math.max(0, state.coins + (isCompleted ? -questCoins : questCoins)),
        xp: Math.max(0, state.xp + (isCompleted ? -questXp : questXp)),
        food: Math.max(0, state.food + (isCompleted ? -questImpact.food : questImpact.food)),
        energy: Math.max(0, state.energy + (isCompleted ? -questImpact.energy : questImpact.energy)),
        water: Math.max(0, state.water + (isCompleted ? -questImpact.water : questImpact.water)),
        carbon: Math.max(0, state.carbon + (isCompleted ? -questImpact.carbon : questImpact.carbon)),
        bossProgress: Math.max(
            0,
            Math.min(100, state.bossProgress + (isCompleted ? -questImpact.boss : questImpact.boss))
        ),
        completedQuestIds: isCompleted
            ? state.completedQuestIds.filter((id) => id !== questId)
            : [...state.completedQuestIds, questId]
    };

    saveState();
    renderAll();

    if (!isCompleted) {
        const currentTier = getCurrentTier();
        if (currentTier.name !== previousTier.name) {
            showLevelUp(currentTier);
        }
    }
}

function renderAll() {
    renderStats();
    renderQuests();
    renderTierPanel();
    renderImpact();
    renderLeaderboard();
    renderRewards();
}

levelupClose.addEventListener("click", hideLevelUp);
levelupOverlay.addEventListener("click", (event) => {
    if (event.target === levelupOverlay) {
        hideLevelUp();
    }
});
resetProgressButton.addEventListener("click", resetState);

renderTabs();
renderAll();
