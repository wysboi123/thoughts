--!strict
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local player = Players.LocalPlayer
local gui = Instance.new("ScreenGui")
gui.Name = "BusHud"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = player:WaitForChild("PlayerGui")

local title = Instance.new("TextLabel")
title.BackgroundTransparency = 1
title.Position = UDim2.new(0, 24, 0, 28)
title.Size = UDim2.new(0, 420, 0, 32)
title.Font = Enum.Font.GothamMedium
title.TextSize = 26
title.TextXAlignment = Enum.TextXAlignment.Left
title.TextColor3 = Color3.fromRGB(220, 230, 210)
title.Text = Config.GameName
title.Parent = gui

local tag = Instance.new("TextLabel")
tag.BackgroundTransparency = 1
tag.Position = UDim2.new(0, 24, 0, 60)
tag.Size = UDim2.new(0, 420, 0, 22)
tag.Font = Enum.Font.Gotham
tag.TextSize = 14
tag.TextXAlignment = Enum.TextXAlignment.Left
tag.TextColor3 = Color3.fromRGB(170, 180, 160)
tag.Text = Config.Tagline
tag.Parent = gui

local busStatus = Instance.new("TextLabel")
busStatus.BackgroundTransparency = 1
busStatus.Position = UDim2.new(0, 24, 0, 86)
busStatus.Size = UDim2.new(0, 360, 0, 18)
busStatus.Font = Enum.Font.Gotham
busStatus.TextSize = 13
busStatus.TextXAlignment = Enum.TextXAlignment.Left
busStatus.TextColor3 = Color3.fromRGB(150, 160, 140)
busStatus.Text = "waiting · no rush"
busStatus.Parent = gui

local counter = Instance.new("TextLabel")
counter.BackgroundColor3 = Color3.fromRGB(30, 32, 28)
counter.BackgroundTransparency = 0.25
counter.Position = UDim2.new(0, 24, 1, -72)
counter.Size = UDim2.new(0, 200, 0, 44)
counter.Font = Enum.Font.GothamMedium
counter.TextSize = 18
counter.TextColor3 = Color3.fromRGB(240, 210, 140)
counter.Text = "Tickets  0"
counter.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 10)
corner.Parent = counter

Remotes.TicketCollected.OnClientEvent:Connect(function(count: number)
	counter.Text = ("Tickets  %d"):format(count)
end)

Remotes.BusArrived.OnClientEvent:Connect(function()
	busStatus.Text = "bus is here · stay if you want"
	busStatus.TextColor3 = Color3.fromRGB(200, 220, 170)
end)

Remotes.BusDeparted.OnClientEvent:Connect(function()
	busStatus.Text = "departed · another will come"
	busStatus.TextColor3 = Color3.fromRGB(150, 160, 140)
	task.delay(3, function()
		if busStatus.Parent then
			busStatus.Text = "waiting · no rush"
		end
	end)
end)

-- Soft proximity glow near other players
local glowParts: { [Model]: PointLight } = {}
RunService.Heartbeat:Connect(function()
	local myChar = player.Character
	local myRoot = myChar and myChar:FindFirstChild("HumanoidRootPart")
	if not myRoot or not myRoot:IsA("BasePart") then
		return
	end
	for _, other in Players:GetPlayers() do
		if other ~= player and other.Character then
			local root = other.Character:FindFirstChild("HumanoidRootPart")
			if root and root:IsA("BasePart") then
				local near = (root.Position - myRoot.Position).Magnitude <= Config.Proximity.Radius
				local existing = glowParts[other.Character]
				if near and not existing then
					local light = Instance.new("PointLight")
					light.Name = "BusProximity"
					light.Brightness = 1.4
					light.Range = 10
					light.Color = Config.Proximity.GlowColor
					light.Parent = root
					glowParts[other.Character] = light
				elseif not near and existing then
					existing:Destroy()
					glowParts[other.Character] = nil
				end
			end
		end
	end
end)

print("[BusStopForever] client ready")
