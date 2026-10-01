--!strict
local Players = game:GetService("Players")
local Lighting = game:GetService("Lighting")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local gui = Instance.new("ScreenGui")
gui.Name = "GalaxyHud"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = playerGui

local title = Instance.new("TextLabel")
title.BackgroundTransparency = 1
title.Position = UDim2.new(0, 24, 0, 28)
title.Size = UDim2.new(0, 400, 0, 32)
title.Font = Enum.Font.GothamMedium
title.TextSize = 26
title.TextXAlignment = Enum.TextXAlignment.Left
title.TextColor3 = Color3.fromRGB(230, 220, 255)
title.Text = Config.GameName
title.Parent = gui

local tag = Instance.new("TextLabel")
tag.BackgroundTransparency = 1
tag.Position = UDim2.new(0, 24, 0, 60)
tag.Size = UDim2.new(0, 420, 0, 22)
tag.Font = Enum.Font.Gotham
tag.TextSize = 14
tag.TextXAlignment = Enum.TextXAlignment.Left
tag.TextColor3 = Color3.fromRGB(170, 160, 200)
tag.Text = Config.Tagline
tag.Parent = gui

local place = Instance.new("TextLabel")
place.BackgroundTransparency = 1
place.Position = UDim2.new(0, 24, 0, 86)
place.Size = UDim2.new(0, 320, 0, 18)
place.Font = Enum.Font.Gotham
place.TextSize = 13
place.TextXAlignment = Enum.TextXAlignment.Left
place.TextColor3 = Color3.fromRGB(140, 130, 170)
place.Text = "two worlds · one couch · climb to the skylight"
place.Parent = gui

local counter = Instance.new("TextLabel")
counter.BackgroundColor3 = Color3.fromRGB(24, 20, 40)
counter.BackgroundTransparency = 0.25
counter.Position = UDim2.new(0, 24, 1, -72)
counter.Size = UDim2.new(0, 200, 0, 44)
counter.Font = Enum.Font.GothamMedium
counter.TextSize = 18
counter.TextColor3 = Color3.fromRGB(255, 230, 170)
counter.Text = "Stars  0"
counter.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 10)
corner.Parent = counter

local inGalaxy = false

local SoftCompany = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftCompany"))
local SoftSit = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftSit"))
local SoftGoals = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftGoals"))
local SoftWelcome = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftWelcome"))
local ChillProximity = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("Proximity"))

local function applyHomeLighting()
	Lighting.ClockTime = 20.5
	Lighting.Brightness = 1.4
	Lighting.Ambient = Color3.fromRGB(70, 55, 90)
	Lighting.OutdoorAmbient = Color3.fromRGB(50, 40, 70)
	Lighting.FogColor = Color3.fromRGB(40, 30, 55)
	Lighting.FogEnd = 220
end

local function applyGalaxyLighting()
	Lighting.ClockTime = 0.5
	Lighting.Brightness = 0.6
	Lighting.Ambient = Color3.fromRGB(30, 35, 70)
	Lighting.OutdoorAmbient = Color3.fromRGB(20, 25, 55)
	Lighting.FogColor = Color3.fromRGB(10, 15, 40)
	Lighting.FogEnd = 400
end

applyHomeLighting()

local function refreshPlace(companyNear: boolean)
	if inGalaxy then
		place.Text = if companyNear
			then "galaxy loft · soft company · two worlds"
			else "galaxy loft · two worlds · beacon home when ready"
		place.TextColor3 = Color3.fromRGB(200, 190, 255)
	else
		place.Text = if companyNear
			then "couch side · soft company · climb when ready"
			else "two worlds · one couch · climb to the skylight"
		place.TextColor3 = Color3.fromRGB(140, 130, 170)
	end
end

Remotes.StarCollected.OnClientEvent:Connect(function(count: number)
	counter.Text = ("Stars  %d"):format(count)
end)

local galaxyWelcomed = false
local homeWelcomed = false
local visitedGalaxy = false
local visitedHomeAfterGalaxy = false
local couchStyle = {
	AccentColor = Color3.fromRGB(140, 120, 200),
	FrameColor = Color3.fromRGB(26, 20, 40),
}

Remotes.EnteredGalaxy.OnClientEvent:Connect(function()
	inGalaxy = true
	visitedGalaxy = true
	applyGalaxyLighting()
	refreshPlace(false)
	if not galaxyWelcomed then
		galaxyWelcomed = true
		SoftWelcome.show(playerGui, "galaxy loft", "second world · beacon home when ready", couchStyle)
	end
end)

Remotes.ReturnedHome.OnClientEvent:Connect(function()
	inGalaxy = false
	if visitedGalaxy then
		visitedHomeAfterGalaxy = true
	end
	applyHomeLighting()
	refreshPlace(false)
	if visitedGalaxy and not homeWelcomed then
		homeWelcomed = true
		SoftWelcome.show(playerGui, "couch side", "two worlds · one couch · you made it home", couchStyle)
	end
end)

local couchSit = SoftSit.mount(playerGui, {
	OneText = function(name)
		return if inGalaxy then (name .. " is in the hammock loft") else (name .. " is on the couch")
	end,
	ManyText = function(names)
		local joined = table.concat(names, " & ")
		return if inGalaxy then (joined .. " are in the hammock loft") else (joined .. " are on the couch")
	end,
	Color = Color3.fromRGB(190, 170, 220),
})
Remotes.CouchSitChanged.OnClientEvent:Connect(function(seatName: string, displayName: string?)
	couchSit.set(seatName, displayName)
end)

print("[CouchGalaxy] client ready v" .. Config.Version)

local _, complete = SoftGoals.mount(playerGui, "tonight's soft goals", {
	{ Id = "couch", Label = "sit on the couch" },
	{ Id = "galaxy", Label = "visit the galaxy loft" },
	{ Id = "stars", Label = "collect 3 stars" },
	{ Id = "both", Label = "visit both worlds tonight" },
})

local function tryBothWorlds()
	if visitedGalaxy and visitedHomeAfterGalaxy then
		complete("both")
	end
end

Remotes.EnteredGalaxy.OnClientEvent:Connect(function()
	complete("galaxy")
	tryBothWorlds()
end)

Remotes.ReturnedHome.OnClientEvent:Connect(function()
	tryBothWorlds()
end)

Remotes.StarCollected.OnClientEvent:Connect(function(count: number)
	if count >= 3 then
		complete("stars")
	end
end)

Remotes.CouchSitChanged.OnClientEvent:Connect(function(_seatName: string, displayName: string?)
	if displayName == player.DisplayName then
		complete("couch")
	end
end)

task.spawn(function()
	while true do
		task.wait(0.5)
		local character = player.Character
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		if humanoid and humanoid.SeatPart then
			complete("couch")
		end
	end
end)

ChillProximity.start(player, {
	Radius = Config.Proximity.Radius,
	GlowColor = Config.Proximity.GlowColor,
	Brightness = 1.4,
	Range = 11,
})

SoftCompany.mount(playerGui, player, {
	Radius = Config.Proximity.Radius,
	Color = Color3.fromRGB(190, 170, 220),
	AloneTextFn = function()
		return if inGalaxy then "soft company · loft is enough" else "soft company · couch is enough"
	end,
	OneTextFn = function()
		return if inGalaxy then "soft company · loft side · two worlds" else "soft company · couch side"
	end,
	ManyText = function(n)
		return if inGalaxy
			then ("soft company · %d nearby · loft side"):format(n)
			else ("soft company · %d nearby · couch side"):format(n)
	end,
	OnCountChanged = function(n)
		refreshPlace(n >= 1)
	end,
})

SoftWelcome.show(playerGui, Config.GameName, "two worlds, one couch. roof first.", couchStyle)
