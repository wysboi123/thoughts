--!strict
local Config = {
	GameName = "Bus Stop Forever",
	Tagline = "the bus will come. you don't have to.",
	Version = "0.1",

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

	Notepad = {
		Messages = {
			"no destination required",
			"missed buses still count as rest",
			"bring a friend or don't",
			"rain is free here",
			"the schedule is a suggestion",
		},
		RotateSeconds = 12,
	},

	Rain = {
		Enabled = true,
		DropCount = 40,
	},
}

return Config
