--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local player = Players.LocalPlayer
local gui = Instance.new("ScreenGui")
gui.Name = "GalaxyHud"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = player:WaitForChild("PlayerGui")

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
place.Size = UDim2.new(0, 280, 0, 18)
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

Remotes.StarCollected.OnClientEvent:Connect(function(count: number)
	counter.Text = ("Stars  %d"):format(count)
end)

Remotes.EnteredGalaxy.OnClientEvent:Connect(function()
	place.Text = "galaxy loft · two worlds · beacon home when ready"
	place.TextColor3 = Color3.fromRGB(200, 190, 255)
end)

Remotes.ReturnedHome.OnClientEvent:Connect(function()
	place.Text = "two worlds · one couch · climb to the skylight"
	place.TextColor3 = Color3.fromRGB(140, 130, 170)
end)

local SoftSit = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftSit"))
local couchSit = SoftSit.mount(player:WaitForChild("PlayerGui"), {
	OneText = function(name)
		return name .. " is on the couch"
	end,
	ManyText = function(names)
		return table.concat(names, " & ") .. " are on the couch"
	end,
	Color = Color3.fromRGB(190, 170, 220),
})
Remotes.CouchSitChanged.OnClientEvent:Connect(function(seatName: string, displayName: string?)
	couchSit.set(seatName, displayName)
end)

print("[CouchGalaxy] client ready v" .. Config.Version)

local SoftGoals = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftGoals"))
local _, complete = SoftGoals.mount(player:WaitForChild("PlayerGui"), "tonight's soft goals", {
	{ Id = "couch", Label = "sit on the couch" },
	{ Id = "galaxy", Label = "visit the galaxy loft" },
	{ Id = "stars", Label = "collect 3 stars" },
})

Remotes.EnteredGalaxy.OnClientEvent:Connect(function()
	complete("galaxy")
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

local ChillProximity = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("Proximity"))
ChillProximity.start(player, {
	Radius = Config.Proximity.Radius,
	GlowColor = Config.Proximity.GlowColor,
	Brightness = 1.4,
	Range = 11,
})

local SoftCompany = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftCompany"))
SoftCompany.mount(player:WaitForChild("PlayerGui"), player, {
	Radius = Config.Proximity.Radius,
	Color = Color3.fromRGB(190, 170, 220),
	OneText = "soft company · constellations feel closer",
	ManyText = function(n)
		return ("soft company · %d nearby · two worlds"):format(n)
	end,
})

local SoftWelcome = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftWelcome"))
SoftWelcome.show(player:WaitForChild("PlayerGui"), Config.GameName, "two worlds, one couch. roof first.")
