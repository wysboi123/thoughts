--!strict
local Config = {
	GameName = "Puddle Mirror",
	Tagline = "step soft. let the floor answer.",
	Version = "0.0",

	Spawn = Vector3.new(0, 6, 16),

	Puddle = {
		UnlockRadius = 18,
		RippleCooldown = 0.8,
		Color = Color3.fromRGB(100, 180, 200),
	},

	Dew = {
		Count = 8,
		Color = Color3.fromRGB(180, 230, 255),
		RespawnSeconds = 12,
	},
}

return Config
