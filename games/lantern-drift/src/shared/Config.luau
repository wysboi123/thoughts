--!strict
local Config = {
	GameName = "Lantern Drift",
	Tagline = "fog lake. soft raft. stay afloat.",
	Version = "0.2",

	Spawn = Vector3.new(0, 6, 20),
	RaftStart = Vector3.new(0, 2, 0),

	Lantern = {
		Count = 10,
		Color = Color3.fromRGB(255, 190, 120),
		RespawnSeconds = 14,
	},

	Raft = {
		DriftAmplitude = 8,
		DriftSpeed = 0.22,
	},

	Shore = {
		LampColor = Color3.fromRGB(255, 210, 150),
	},
}

return Config
