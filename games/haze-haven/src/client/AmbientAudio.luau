--!strict
local SoundService = game:GetService("SoundService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))
local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))

local AmbientAudio = {}

local function makeSound(name: string, soundId: number, volume: number, looped: boolean): Sound
	local sound = Instance.new("Sound")
	sound.Name = name
	sound.SoundId = if soundId > 0 then ("rbxassetid://%d"):format(soundId) else ""
	sound.Volume = if soundId > 0 then volume else 0
	sound.Looped = looped
	sound.Parent = SoundService
	return sound
end

function AmbientAudio.start()
	local ambient = makeSound("HazeAmbient", Config.Audio.AmbientId, Config.Audio.AmbientVolume, true)
	local orbSfx = makeSound("HazeOrb", Config.Audio.OrbCollectId, Config.Audio.SfxVolume, false)
	local floatSfx = makeSound("HazeFloat", Config.Audio.FloatBoostId, Config.Audio.SfxVolume, false)

	if Config.Audio.AmbientId > 0 then
		ambient:Play()
	end

	Remotes.OrbCollected.OnClientEvent:Connect(function()
		if Config.Audio.OrbCollectId > 0 then
			orbSfx:Play()
		end
	end)

	Remotes.FloatBoost.OnClientEvent:Connect(function()
		if Config.Audio.FloatBoostId > 0 then
			floatSfx:Play()
		end
	end)

	print("[HazeHaven] audio hooks ready (set Config.Audio.* asset ids to hear)")
end

return AmbientAudio
