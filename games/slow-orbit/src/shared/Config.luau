--!strict
local Config = {
	GameName = "Slow Orbit",
	Tagline = "walk the curve. purple dusk. don't rush.",
	Version = "0.3",

	Planet = {
		Radius = 40,
		Center = Vector3.new(0, 0, 0),
		Color = Color3.fromRGB(52, 42, 78),
		GravityStrength = 90,
	},

	Moonlet = {
		Radius = 12,
		Offset = Vector3.new(70, 25, -40),
		Color = Color3.fromRGB(78, 58, 98),
		GravityStrength = 55,
		GravityRadius = 28,
	},

	Bead = {
		Count = 10,
		MoonletCount = 4,
		Color = Color3.fromRGB(160, 140, 255),
		MoonletColor = Color3.fromRGB(220, 160, 255),
		TrailEnd = Color3.fromRGB(60, 40, 120),
		MoonletTrailEnd = Color3.fromRGB(100, 40, 140),
		Value = 1,
		RespawnSeconds = 14,
		OrbitHeight = 3.5,
		TrailLifetime = 1.4,
	},

	Camera = {
		Distance = 18,
		Height = 6,
		LookAhead = 2,
		Lerp = 0.14,
		UpLerp = 0.08,
		YawSensitivity = 0.012,
		TouchYawSensitivity = 0.018,
		MinDistance = 12,
		MaxDistance = 28,
	},

	TargetBeads = 10,
}

return Config
