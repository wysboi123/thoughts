--!strict
local Config = {
	GameName = "Slow Orbit",
	Tagline = "walk the curve. gather beads. don't rush.",
	Version = "0.1",

	Planet = {
		Radius = 40,
		Center = Vector3.new(0, 0, 0),
		Color = Color3.fromRGB(48, 56, 78),
		GravityStrength = 90,
	},

	Moonlet = {
		Radius = 12,
		-- Fixed offset from planet center (visual companion + light gravity well)
		Offset = Vector3.new(70, 25, -40),
		Color = Color3.fromRGB(70, 78, 98),
		GravityStrength = 55,
		GravityRadius = 28,
	},

	Bead = {
		Count = 10,
		MoonletCount = 4,
		Color = Color3.fromRGB(120, 200, 255),
		MoonletColor = Color3.fromRGB(200, 170, 255),
		Value = 1,
		RespawnSeconds = 14,
		OrbitHeight = 3.5,
		TrailLifetime = 1.4,
	},

	Camera = {
		Distance = 18,
		Lerp = 0.12,
	},

	TargetBeads = 10,
}

return Config
