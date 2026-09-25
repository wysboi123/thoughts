--!strict
-- Tunables for Haze Haven. Keep magic numbers here so overnight edits stay one-file.

local Config = {
	GameName = "Haze Haven",
	Tagline = "float soft. collect vibes. stay awhile.",
	Version = "0.4",

	Spawn = Vector3.new(0, 8, 0),

	Lounge = {
		Size = Vector3.new(48, 2, 48),
		Color = Color3.fromRGB(62, 52, 78),
		Material = Enum.Material.SmoothPlastic,
	},

	Loft = {
		Size = Vector3.new(28, 1.5, 28),
		Position = Vector3.new(0, 18, -36),
		Color = Color3.fromRGB(55, 48, 72),
		RampLength = 22,
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

	Sit = {
		SeatColor = Color3.fromRGB(90, 70, 120),
		CushionColor = Color3.fromRGB(140, 100, 160),
	},

	Emote = {
		FloatBoost = 28,
		FloatDuration = 2.8,
		WaveDuration = 2.2,
		Cooldown = 1.2,
	},

	Proximity = {
		Radius = 14,
		GlowColor = Color3.fromRGB(180, 140, 255),
		Brightness = 1.6,
		Range = 12,
	},

	Nameplate = {
		Offset = Vector3.new(0, 3.2, 0),
	},

	Atmosphere = {
		AmbientPulseSeconds = 6,
		DayNightCycleSeconds = 180,
		DayClock = 17.5,
		NightClock = 21.5,
		DayFog = Color3.fromRGB(140, 120, 160),
		NightFog = Color3.fromRGB(70, 55, 100),
	},

	Audio = {
		-- Drop Roblox audio asset ids here when Femmy uploads / finds free ones.
		-- 0 = silent placeholder (hooks still run so wiring is ready).
		AmbientId = 0,
		OrbCollectId = 0,
		FloatBoostId = 0,
		AmbientVolume = 0.25,
		SfxVolume = 0.4,
	},
}

return Config
