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
local softCompanyHandle: any = nil
local _, complete, nudgeOptional = SoftGoals.mount(playerGui, "tonight's soft goals", {
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
		if softCompanyHandle then
			softCompanyHandle.refresh()
		end
		VibeBoard.setLingered(true)
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
local sitDepartPulseUntil = 0.0
local sitReturnPulseUntil = 0.0
local hazeSit = SoftSit.mount(playerGui, {
	EmptyText = "",
	EmptyTextFn = function()
		if os.clock() < sitReturnPulseUntil then
			return if softLingered then "still here · seat open · company again" else "seat open · company again"
		elseif os.clock() < sitDepartPulseUntil then
			return if softLingered then "still here · seat open · they drifted" else "seat open · they drifted"
		elseif softLingered then
			return "still here · seat open"
		elseif softCompleteDone then
			return "soft-complete · seat open"
		end
		return ""
	end,
	OneText = function(name)
		if hazeCompanyNear then
			return if softLingered then (name .. " is chilling · still here · sync") else (name .. " is chilling · sync")
		end
		return if softLingered then (name .. " is chilling · still here") else (name .. " is chilling")
	end,
	ManyText = function(names)
		local joined = table.concat(names, " & ")
		return if softLingered then (joined .. " are chilling · still here") else (joined .. " are chilling")
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

local hazeDepartWelcomed = false
local hazeReturnWelcomed = false
softCompanyHandle = SoftCompany.mount(playerGui, player, {
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
	DepartTextFn = function()
		if softLingered then
			return "still here · they drifted · vibes stay soft"
		elseif softCompleteDone then
			return "soft-complete · they drifted · stay"
		end
		return "they drifted · vibes still soft"
	end,
	AfterDepartTextFn = function()
		if softLingered then
			return "still here · they were near · vibes soft"
		elseif softCompleteDone then
			return "soft-complete · they were near · stay"
		end
		return "they were near · vibes still soft"
	end,
	ReturnTextFn = function()
		if softLingered then
			return "still here · company again · vibes sync"
		elseif softCompleteDone then
			return "soft-complete · company again"
		end
		return "company again · vibes sync"
	end,
	AfterReturnTextFn = function()
		if softLingered then
			return "still here · vibes sync · stay soft"
		elseif softCompleteDone then
			return "soft-complete · vibes sync · stay"
		end
		return "vibes sync · stay soft"
	end,
	OneTextFn = function()
		return if softLingered then "still here · vibes syncing" else "soft company · vibes syncing"
	end,
	ManyText = function(n)
		return if softLingered
			then ("still here · %d nearby · vibes sync"):format(n)
			else ("soft company · %d nearby · vibes sync"):format(n)
	end,
	OnDeparted = function()
		if softLingered or softCompleteDone then
			nudgeOptional("depart")
		end
		sitDepartPulseUntil = os.clock() + 4
		sitReturnPulseUntil = 0
		hazeSit.refresh()
		VibeBoard.pulseCompany("depart")
		if hazeDepartWelcomed or not (softLingered or softCompleteDone) then
			return
		end
		hazeDepartWelcomed = true
		SoftWelcome.show(playerGui, "they drifted", "vibes stay soft · stay", {
			AccentColor = hazeStyle.AccentColor,
			FrameColor = hazeStyle.FrameColor,
			HoldSeconds = 2.8,
		})
	end,
	OnReturned = function()
		sitReturnPulseUntil = os.clock() + 4
		sitDepartPulseUntil = 0
		hazeSit.refresh()
		VibeBoard.pulseCompany("return")
		if hazeReturnWelcomed or not (softLingered or softCompleteDone) then
			return
		end
		hazeReturnWelcomed = true
		nudgeOptional()
		SoftWelcome.show(playerGui, "company again", "vibes sync · still here", {
			AccentColor = hazeStyle.AccentColor,
			FrameColor = hazeStyle.FrameColor,
			HoldSeconds = 2.8,
		})
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
