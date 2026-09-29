--!strict
-- Thought Defense tunables. Theme: enemies = negative thoughts, towers = positive thoughts.
-- Soft / metaphorical — never medical advice, never ToS-risk framing.

local Config = {
	GameName = "Thought Defense",
	Tagline = "plant kindness. clear the noise.",
	Version = "0.1",

	Spawn = Vector3.new(0, 6, 36),

	-- Calm = lives. Clarity = build currency.
	StartingCalm = 20,
	StartingClarity = 120,

	WaveCount = 8,
	SecondsBetweenWaves = 8,
	SecondsBeforeFirstWave = 6,

	LeakPenalty = 1, -- Calm lost when a thought reaches the Peace Core

	Path = {
		-- Waypoints the negative thoughts follow (mind entrance → Peace Core)
		Points = {
			Vector3.new(-40, 1.5, 28),
			Vector3.new(-40, 1.5, 0),
			Vector3.new(-12, 1.5, 0),
			Vector3.new(-12, 1.5, -20),
			Vector3.new(12, 1.5, -20),
			Vector3.new(12, 1.5, 8),
			Vector3.new(36, 1.5, 8),
			Vector3.new(36, 1.5, -28),
			Vector3.new(0, 1.5, -28), -- Peace Core
		},
		Width = 6,
		Color = Color3.fromRGB(170, 180, 210),
	},

	-- Build pads beside the path (player picks a tower type, then a pad)
	Pads = {
		Vector3.new(-34, 1.2, 14),
		Vector3.new(-46, 1.2, -8),
		Vector3.new(-20, 1.2, 6),
		Vector3.new(-6, 1.2, -12),
		Vector3.new(-18, 1.2, -26),
		Vector3.new(4, 1.2, -14),
		Vector3.new(18, 1.2, 2),
		Vector3.new(6, 1.2, 14),
		Vector3.new(28, 1.2, 14),
		Vector3.new(42, 1.2, 0),
		Vector3.new(30, 1.2, -20),
		Vector3.new(12, 1.2, -34),
	},

	EnemyKinds = {
		Doubt = {
			DisplayName = "Doubt",
			Color = Color3.fromRGB(90, 70, 110),
			Size = Vector3.new(2.4, 2.4, 2.4),
			Health = 40,
			Speed = 8,
			ClarityReward = 8,
		},
		Worry = {
			DisplayName = "Worry",
			Color = Color3.fromRGB(70, 100, 140),
			Size = Vector3.new(1.8, 1.8, 1.8),
			Health = 24,
			Speed = 13,
			ClarityReward = 10,
		},
		SelfCritic = {
			DisplayName = "Self-Critic",
			Color = Color3.fromRGB(120, 55, 70),
			Size = Vector3.new(3.2, 3.2, 3.2),
			Health = 110,
			Speed = 5.5,
			ClarityReward = 18,
		},
	},

	-- Positive-thought towers
	TowerKinds = {
		Affirmation = {
			DisplayName = "Affirmation",
			Blurb = "Steady kind words. Single-target.",
			Color = Color3.fromRGB(120, 200, 170),
			Cost = 50,
			Range = 16,
			Damage = 12,
			FireRate = 1.1, -- shots per second
			SlowFactor = 1,
			SplashRadius = 0,
		},
		Gratitude = {
			DisplayName = "Gratitude",
			Blurb = "Soft aura that slows rumination.",
			Color = Color3.fromRGB(240, 200, 120),
			Cost = 65,
			Range = 14,
			Damage = 4,
			FireRate = 0.7,
			SlowFactor = 0.55,
			SplashRadius = 0,
		},
		Humor = {
			DisplayName = "Humor",
			Blurb = "Light splash — pops clusters of noise.",
			Color = Color3.fromRGB(255, 160, 120),
			Cost = 85,
			Range = 12,
			Damage = 10,
			FireRate = 0.65,
			SlowFactor = 1,
			SplashRadius = 7,
		},
	},

	-- Wave recipes: { kind, count, spacingSeconds }
	Waves = {
		{ { "Doubt", 5, 1.2 } },
		{ { "Doubt", 6, 1.0 }, { "Worry", 3, 0.9 } },
		{ { "Worry", 8, 0.85 } },
		{ { "Doubt", 6, 1.0 }, { "SelfCritic", 2, 1.6 } },
		{ { "Worry", 10, 0.7 }, { "Doubt", 4, 1.0 } },
		{ { "SelfCritic", 4, 1.4 }, { "Worry", 6, 0.8 } },
		{ { "Doubt", 8, 0.9 }, { "Worry", 8, 0.75 }, { "SelfCritic", 2, 1.5 } },
		{ { "SelfCritic", 6, 1.2 }, { "Worry", 12, 0.65 }, { "Doubt", 8, 0.85 } },
	},
}

return Config
