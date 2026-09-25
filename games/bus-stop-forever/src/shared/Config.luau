--!strict
local Config = {
	GameName = "Bus Stop Forever",
	Tagline = "the bus will come. you don't have to.",
	Version = "0.0",

	Spawn = Vector3.new(0, 5, 6),

	Bus = {
		ArriveSeconds = 18,
		DwellSeconds = 8,
		Color = Color3.fromRGB(70, 110, 90),
		Headlight = Color3.fromRGB(255, 240, 200),
	},

	Ticket = {
		Count = 6,
		Color = Color3.fromRGB(240, 200, 120),
		RespawnSeconds = 14,
	},

	Proximity = {
		Radius = 12,
		GlowColor = Color3.fromRGB(200, 180, 140),
	},
}

return Config
