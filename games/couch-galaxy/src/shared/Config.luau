--!strict
local Config = {
	GameName = "Couch Galaxy",
	Tagline = "roof first. sky second. stay soft.",
	Version = "0.0",

	ApartmentSpawn = Vector3.new(0, 5, 8),
	GalaxySpawn = Vector3.new(0, 120, 0),

	Portal = {
		Cooldown = 1.5,
	},

	Star = {
		Count = 8,
		Color = Color3.fromRGB(255, 230, 160),
		RespawnSeconds = 10,
	},

	CloudPad = {
		Boost = 48,
		Color = Color3.fromRGB(180, 190, 255),
	},
}

return Config
