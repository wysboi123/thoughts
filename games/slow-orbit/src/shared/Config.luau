--!strict
local Config = {
	GameName = "Slow Orbit",
	Tagline = "walk the curve. gather beads. don't rush.",
	Version = "0.0",

	Planet = {
		Radius = 40,
		Center = Vector3.new(0, 0, 0),
		Color = Color3.fromRGB(48, 56, 78),
		GravityStrength = 90,
	},

	Bead = {
		Count = 10,
		Color = Color3.fromRGB(120, 200, 255),
		Value = 1,
		RespawnSeconds = 14,
		OrbitHeight = 3.5,
	},

	TargetBeads = 8,
}

return Config
