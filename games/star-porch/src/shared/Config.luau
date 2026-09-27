--!strict
local Config = {
	GameName = "Star Porch",
	Tagline = "sit outside. watch the quiet.",
	Version = "0.3",

	Spawn = Vector3.new(0, 4, 10),

	Firefly = {
		Count = 12,
		Color = Color3.fromRGB(200, 255, 160),
		RespawnSeconds = 11,
	},

	Proximity = {
		Radius = 12,
		GlowColor = Color3.fromRGB(180, 220, 160),
	},
}

return Config
