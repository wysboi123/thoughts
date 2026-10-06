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

local orbCounter, setHudSynced, setHudSoftComplete = Hud.mount(playerGui)
EmoteWheel.mount(playerGui)
local proximity = ProximityGlow.start(player)
FloatFx.start(player)
AmbientAudio.start()
VibeBoard.start()

local SoftWelcome = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftWelcome"))
local softCompleteDone = false
local softCompleteOptionalOpen = false
local softLingered = false
local _, complete = SoftGoals.mount(playerGui, "tonight's soft goals", {
	{ Id = "vibes", Label = "collect 3 vibes" },
	{ Id = "sit", Label = "sit somewhere" },
	{ Id = "float", Label = "take a float" },
	{ Id = "sync", Label = "vibe sync near a friend", Optional = true },
}, {
	AccentColor = Color3.fromRGB(160, 120, 210),
	FrameColor = Color3.fromRGB(28, 22, 42),
	TitleColor = Color3.fromRGB(220, 200, 255),
	OnAllComplete = function(optionalLeft: number)
		softCompleteDone = true
		softCompleteOptionalOpen = optionalLeft > 0
		setHudSoftComplete(true, optionalLeft > 0)
		local body = if optionalLeft > 0
			then "stay · vibe sync still open if friends join"
			else "stay as long as you like"
		SoftWelcome.show(playerGui, "soft complete", body, {
			AccentColor = Color3.fromRGB(160, 120, 210),
			FrameColor = Color3.fromRGB(28, 22, 42),
			HoldSeconds = 4.0,
		})
	end,
	OnSessionSealed = function()
		softCompleteOptionalOpen = false
		setHudSoftComplete(true, false)
		SoftWelcome.show(playerGui, "vibe sync sealed", "stay as long as you like", {
			AccentColor = Color3.fromRGB(160, 120, 210),
			FrameColor = Color3.fromRGB(28, 22, 42),
			HoldSeconds = 3.2,
		})
	end,
	LingerSeconds = 48,
	OnLinger = function(optionalLeft: number)
		softLingered = true
		softCompleteOptionalOpen = optionalLeft > 0
		setHudSoftComplete(true, optionalLeft > 0, true)
		hazeSit.refresh()
		if not hazeCompanyNear then
			proximity.setBoost(1.12)
		end
		local body = if optionalLeft > 0
			then "vibes keep drifting · vibe sync still open"
			else "vibes keep drifting · stay soft"
		SoftWelcome.show(playerGui, "still here", body, {
			AccentColor = Color3.fromRGB(160, 120, 210),
			FrameColor = Color3.fromRGB(28, 22, 42),
			HoldSeconds = 3.4,
		})
	end,
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
local hazeCompanyNear = false
local hazeSit = SoftSit.mount(playerGui, {
	EmptyText = "",
	OneText = function(name)
		return if hazeCompanyNear then (name .. " is chilling · sync") else (name .. " is chilling")
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

local SoftCompany = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftCompany"))
local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))
local hazeStyle = {
	AccentColor = Color3.fromRGB(160, 120, 210),
	FrameColor = Color3.fromRGB(28, 22, 42),
}
SoftWelcome.show(playerGui, Config.GameName, "float soft. vibes sync when friends are near.", {
	AccentColor = hazeStyle.AccentColor,
	FrameColor = hazeStyle.FrameColor,
	HoldSeconds = 6.2,
})

local vibeSynced = false
local syncedColor = Color3.fromRGB(255, 220, 255)
local normalColor = Color3.fromRGB(240, 200, 230)

local function tintLocalNameplate(synced: boolean)
	local character = player.Character
	local head = character and character:FindFirstChild("Head")
	local plate = head and head:FindFirstChild("HazeNameplate")
	if not (plate and plate:IsA("BillboardGui")) then
		return
	end
	local nameLabel = plate:FindFirstChild("PlayerName")
	local vibeLabel = plate:FindFirstChild("VibeLabel")
	if nameLabel and nameLabel:IsA("TextLabel") then
		nameLabel.TextColor3 = if synced then Color3.fromRGB(255, 235, 255) else Color3.fromRGB(235, 220, 255)
	end
	if vibeLabel and vibeLabel:IsA("TextLabel") then
		vibeLabel.TextColor3 = if synced then Color3.fromRGB(240, 200, 255) else Color3.fromRGB(210, 170, 230)
	end
end

SoftCompany.mount(playerGui, player, {
	Radius = Config.Proximity.Radius,
	Color = Color3.fromRGB(200, 180, 230),
	AloneTextFn = function()
		if softLingered and softCompleteOptionalOpen then
			return "still here · vibe sync still open"
		elseif softLingered then
			return "still here · alone is fine"
		elseif softCompleteDone and softCompleteOptionalOpen then
			return "soft-complete · vibe sync still open"
		elseif softCompleteDone then
			return "soft-complete · alone is fine"
		end
		return "alone is fine · vibes still soft"
	end,
	OneText = "soft company · vibes syncing",
	ManyText = function(n)
		return ("soft company · %d nearby · vibes sync"):format(n)
	end,
	OnCountChanged = function(n)
		hazeCompanyNear = n >= 1
		hazeSit.refresh()
		if n >= 1 then
			complete("sync")
			softCompleteOptionalOpen = false
			if softCompleteDone then
				setHudSoftComplete(true, false)
			end
			proximity.setBoost(1.35 + math.min(n - 1, 2) * 0.1)
			VibeBoard.setSynced(true)
			setHudSynced(true)
			tintLocalNameplate(true)
			if orbCounter and orbCounter.Parent then
				orbCounter.TextColor3 = syncedColor
			end
			if not vibeSynced then
				vibeSynced = true
				SoftWelcome.show(playerGui, "vibe sync", "someone nearby — tonight's vibes feel softer", {
					AccentColor = hazeStyle.AccentColor,
					FrameColor = hazeStyle.FrameColor,
					HoldSeconds = 3.6,
				})
			end
		else
			proximity.setBoost(if softLingered then 1.12 else 1)
			VibeBoard.setSynced(false)
			setHudSynced(false)
			tintLocalNameplate(false)
			if orbCounter and orbCounter.Parent then
				orbCounter.TextColor3 = normalColor
			end
		end
	end,
})
