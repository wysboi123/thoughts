--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))
local SoftGoals = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftGoals"))
local ChillProximity = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("Proximity"))
local SoftWelcome = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftWelcome"))

local player = Players.LocalPlayer
local gui = Instance.new("ScreenGui")
gui.Name = "StarPorchHud"
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
title.TextColor3 = Color3.fromRGB(210, 230, 190)
title.Text = Config.GameName
title.Parent = gui

local tag = Instance.new("TextLabel")
tag.BackgroundTransparency = 1
tag.Position = UDim2.new(0, 24, 0, 60)
tag.Size = UDim2.new(0, 420, 0, 22)
tag.Font = Enum.Font.Gotham
tag.TextSize = 14
tag.TextXAlignment = Enum.TextXAlignment.Left
tag.TextColor3 = Color3.fromRGB(160, 180, 150)
tag.Text = Config.Tagline .. "  ·  v" .. Config.Version
tag.Parent = gui

local hint = Instance.new("TextLabel")
hint.BackgroundTransparency = 1
hint.Position = UDim2.new(0, 24, 0, 86)
hint.Size = UDim2.new(0, 420, 0, 18)
hint.Font = Enum.Font.Gotham
hint.TextSize = 12
hint.TextXAlignment = Enum.TextXAlignment.Left
hint.TextColor3 = Color3.fromRGB(130, 150, 120)
hint.Text = "rockers + swing · jar fills as fireflies return"
hint.Parent = gui

local counter = Instance.new("TextLabel")
counter.BackgroundColor3 = Color3.fromRGB(20, 28, 22)
counter.BackgroundTransparency = 0.25
counter.Position = UDim2.new(0, 24, 1, -72)
counter.Size = UDim2.new(0, 200, 0, 44)
counter.Font = Enum.Font.GothamMedium
counter.TextSize = 18
counter.TextColor3 = Color3.fromRGB(200, 255, 170)
counter.Text = "Fireflies  0"
counter.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 10)
corner.Parent = counter

local SoftSit = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftSit"))
local porchSit = SoftSit.mount(player:WaitForChild("PlayerGui"), {
	OneText = function(name)
		return name .. " is on the porch"
	end,
	ManyText = function(names)
		return table.concat(names, " & ") .. " are on the porch"
	end,
	Color = Color3.fromRGB(180, 200, 170),
})
Remotes.SitChanged.OnClientEvent:Connect(function(seatName: string, displayName: string?)
	porchSit.set(seatName, displayName)
end)

Remotes.FireflyCollected.OnClientEvent:Connect(function(count: number)
	counter.Text = ("Fireflies  %d"):format(count)
end)

local _, complete = SoftGoals.mount(player:WaitForChild("PlayerGui"), "tonight's soft goals", {
	{ Id = "sit", Label = "sit on the porch" },
	{ Id = "swing", Label = "try the porch swing" },
	{ Id = "flies", Label = "collect 4 fireflies" },
})

Remotes.FireflyCollected.OnClientEvent:Connect(function(count: number)
	if count >= 4 then
		complete("flies")
	end
end)

Remotes.SitChanged.OnClientEvent:Connect(function(seatName: string, displayName: string?)
	if displayName ~= player.DisplayName then
		return
	end
	complete("sit")
	if seatName == "PorchSwing" then
		complete("swing")
	end
end)

task.spawn(function()
	while true do
		task.wait(0.5)
		local character = player.Character
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		if humanoid and humanoid.SeatPart then
			complete("sit")
			if humanoid.SeatPart.Name == "PorchSwing" then
				complete("swing")
			end
		end
	end
end)

ChillProximity.start(player, {
	Radius = Config.Proximity.Radius,
	GlowColor = Config.Proximity.GlowColor,
	Brightness = 1.3,
	Range = 10,
})

local SoftCompany = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftCompany"))
SoftWelcome.show(player:WaitForChild("PlayerGui"), Config.GameName, "fireflies drift back. the jar remembers.")
SoftCompany.mount(player:WaitForChild("PlayerGui"), player, {
	Radius = Config.Proximity.Radius,
	Color = Color3.fromRGB(180, 200, 170),
	OneText = "soft company · porch feels warmer",
	ManyText = function(n)
		return ("soft company · %d nearby · jar glow"):format(n)
	end,
})

Remotes.FireflyCollected.OnClientEvent:Connect(function(count: number)
	hint.Text = if count <= 1 then "jar remembers · first glow" else ("jar remembers · %d fireflies"):format(count)
end)

print("[StarPorch] client ready v" .. Config.Version)
