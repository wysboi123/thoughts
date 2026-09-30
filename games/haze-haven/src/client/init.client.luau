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

local orbCounter = Hud.mount(playerGui)
EmoteWheel.mount(playerGui)
ProximityGlow.start(player)
FloatFx.start(player)
AmbientAudio.start()
VibeBoard.start()

local _, complete = SoftGoals.mount(playerGui, "tonight's soft goals", {
	{ Id = "vibes", Label = "collect 3 vibes" },
	{ Id = "sit", Label = "sit somewhere" },
	{ Id = "float", Label = "take a float" },
	{ Id = "sync", Label = "vibe sync near a friend" },
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

local SoftSit = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftSit"))
local hazeSit = SoftSit.mount(playerGui, {
	OneText = function(name)
		return name .. " is chilling"
	end,
	ManyText = function(names)
		return table.concat(names, " & ") .. " are chilling"
	end,
	Color = Color3.fromRGB(200, 180, 230),
})
Remotes.SitChanged.OnClientEvent:Connect(function(seatName: string, displayName: string?)
	hazeSit.set(seatName, displayName)
	if displayName == player.DisplayName then
		complete("sit")
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

local SoftWelcome = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftWelcome"))
local SoftCompany = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftCompany"))
local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))
local hazeStyle = {
	AccentColor = Color3.fromRGB(160, 120, 210),
	FrameColor = Color3.fromRGB(28, 22, 42),
}
SoftWelcome.show(playerGui, Config.GameName, "float soft. vibes sync when friends are near.", hazeStyle)

local vibeSynced = false
local syncedColor = Color3.fromRGB(255, 220, 255)
local normalColor = Color3.fromRGB(240, 200, 230)

SoftCompany.mount(playerGui, player, {
	Radius = Config.Proximity.Radius,
	Color = Color3.fromRGB(200, 180, 230),
	AloneText = "alone is fine · vibes still soft",
	OneText = "soft company · vibes syncing",
	ManyText = function(n)
		return ("soft company · %d nearby · vibes sync"):format(n)
	end,
	OnCountChanged = function(n)
		if n >= 1 then
			complete("sync")
			if orbCounter and orbCounter.Parent then
				orbCounter.TextColor3 = syncedColor
			end
			if not vibeSynced then
				vibeSynced = true
				SoftWelcome.show(playerGui, "vibe sync", "someone nearby — tonight's vibes feel softer", hazeStyle)
			end
		else
			if orbCounter and orbCounter.Parent then
				orbCounter.TextColor3 = normalColor
			end
		end
	end,
})
