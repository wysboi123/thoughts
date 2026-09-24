--!strict
-- Tunables for Haze Haven. Keep magic numbers here so overnight edits stay one-file.

local Config = {
	GameName = "Haze Haven",
	Tagline = "float soft. collect vibes. stay awhile.",

	Spawn = Vector3.new(0, 8, 0),

	Lounge = {
		Size = Vector3.new(48, 2, 48),
		Color = Color3.fromRGB(62, 52, 78),
		Material = Enum.Material.SmoothPlastic,
	},

	FloatPad = {
		Boost = 62,
		Cooldown = 0.85,
		Color = Color3.fromRGB(120, 210, 220),
	},

	Orb = {
		Value = 1,
		Color = Color3.fromRGB(220, 120, 200),
		RespawnSeconds = 12,
		HoverHeight = 1.4,
		HoverSpeed = 1.6,
	},

	Atmosphere = {
		AmbientPulseSeconds = 6,
	},
}

return Config
