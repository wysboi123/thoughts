--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))
local SoftGoals = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftGoals"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local Hud = require(script:WaitForChild("Hud"))
local EmoteWheel = require(script:WaitForChild("EmoteWheel"))
local ProximityGlow = require(script:WaitForChild("ProximityGlow"))
local FloatFx = require(script:WaitForChild("FloatFx"))
local AmbientAudio = require(script:WaitForChild("AmbientAudio"))
local VibeBoard = require(script:WaitForChild("VibeBoard"))

Hud.mount(playerGui)
EmoteWheel.mount(playerGui)
ProximityGlow.start(player)
FloatFx.start(player)
AmbientAudio.start()
VibeBoard.start()

local _, complete = SoftGoals.mount(playerGui, "tonight's soft goals", {
	{ Id = "vibes", Label = "collect 3 vibes" },
	{ Id = "sit", Label = "sit somewhere" },
	{ Id = "float", Label = "take a float" },
})

Remotes.OrbCollected.OnClientEvent:Connect(function(count: number)
	if count >= 3 then
		complete("vibes")
	end
end)

Remotes.FloatBoost.OnClientEvent:Connect(function()
	complete("float")
end)

Remotes.EmotePlayed.OnClientEvent:Connect(function(userId: number, emoteId: string)
	if userId == player.UserId and (emoteId == "sit" or emoteId == "float") then
		if emoteId == "sit" then
			complete("sit")
		else
			complete("float")
		end
	end
end)

-- Detect Seat occupant for sit goal
task.spawn(function()
	while true do
		task.wait(0.5)
		local character = player.Character
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		if humanoid and humanoid.SeatPart then
			complete("sit")
		end
	end
end)

print("[HazeHaven] client ready")
