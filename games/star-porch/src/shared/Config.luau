--!strict
local Config = {
	GameName = "Star Porch",
	Tagline = "fireflies drift back. the jar remembers.",
	Version = "3.3",

	Spawn = Vector3.new(0, 4, 10),

	Firefly = {
		Count = 14,
		Color = Color3.fromRGB(200, 255, 160),
		RespawnSeconds = 11,
	},

	JarFillCap = 16,

	Proximity = {
		Radius = 12,
		GlowColor = Color3.fromRGB(180, 220, 160),
	},
}

return Config
