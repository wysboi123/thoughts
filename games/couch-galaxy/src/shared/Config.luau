--!strict
local Config = {
	GameName = "Couch Galaxy",
	Tagline = "two worlds, one couch. roof first.",
	Version = "1.7",

	ApartmentSpawn = Vector3.new(0, 5, 8),
	GalaxySpawn = Vector3.new(0, 120, 0),

	Proximity = {
		Radius = 14,
		GlowColor = Color3.fromRGB(180, 160, 255),
	},

	Portal = {
		Cooldown = 1.5,
	},

	Star = {
		Count = 10,
		Color = Color3.fromRGB(255, 230, 160),
		RespawnSeconds = 10,
		ConstellationLinks = {
			{ 1, 2 },
			{ 2, 3 },
			{ 3, 4 },
			{ 4, 5 },
			{ 5, 1 },
			{ 6, 7 },
			{ 7, 8 },
			{ 8, 9 },
		},
	},

	CloudPad = {
		Boost = 48,
		Color = Color3.fromRGB(180, 190, 255),
	},
}

return Config
