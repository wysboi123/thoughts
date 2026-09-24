--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local player = Players.LocalPlayer
local gui = Instance.new("ScreenGui")
gui.Name = "OrbitHud"
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
title.TextColor3 = Color3.fromRGB(200, 220, 255)
title.Text = Config.GameName
title.Parent = gui

local tag = Instance.new("TextLabel")
tag.BackgroundTransparency = 1
tag.Position = UDim2.new(0, 24, 0, 60)
tag.Size = UDim2.new(0, 420, 0, 22)
tag.Font = Enum.Font.Gotham
tag.TextSize = 14
tag.TextXAlignment = Enum.TextXAlignment.Left
tag.TextColor3 = Color3.fromRGB(150, 170, 210)
tag.Text = Config.Tagline
tag.Parent = gui

local counter = Instance.new("TextLabel")
counter.BackgroundColor3 = Color3.fromRGB(16, 20, 36)
counter.BackgroundTransparency = 0.25
counter.Position = UDim2.new(0, 24, 1, -72)
counter.Size = UDim2.new(0, 220, 0, 44)
counter.Font = Enum.Font.GothamMedium
counter.TextSize = 18
counter.TextColor3 = Color3.fromRGB(180, 220, 255)
counter.Text = "Beads  0 / " .. Config.TargetBeads
counter.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 10)
corner.Parent = counter

local status = Instance.new("TextLabel")
status.BackgroundTransparency = 1
status.AnchorPoint = Vector2.new(0.5, 0)
status.Position = UDim2.new(0.5, 0, 0.12, 0)
status.Size = UDim2.new(0, 360, 0, 28)
status.Font = Enum.Font.GothamMedium
status.TextSize = 20
status.TextColor3 = Color3.fromRGB(180, 230, 255)
status.TextTransparency = 1
status.Text = ""
status.Parent = gui

Remotes.BeadCollected.OnClientEvent:Connect(function(count: number, target: number)
	counter.Text = ("Beads  %d / %d"):format(count, target)
end)

Remotes.OrbitComplete.OnClientEvent:Connect(function()
	status.Text = "orbit complete — stay as long as you want"
	status.TextTransparency = 0
	task.delay(4, function()
		if status.Parent then
			status.TextTransparency = 0.3
		end
	end)
end)

print("[SlowOrbit] client ready")
