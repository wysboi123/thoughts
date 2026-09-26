--!strict
local Config = {
	GameName = "Puddle Mirror",
	Tagline = "step soft. let the floor answer.",
	Version = "0.2",

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
		TrailLifetime = 1.2,
	},

	DeepRoom = {
		-- Extra room behind north nook, unlocked after all three main nooks
		Id = "DeepMirror",
		DoorPos = Vector3.new(0, 4, -48),
		RoomPos = Vector3.new(0, 2, -58),
	},
}

return Config
