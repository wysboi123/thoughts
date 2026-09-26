--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))
local SoftGoals = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftGoals"))
local ChillProximity = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("Proximity"))

local player = Players.LocalPlayer
local gui = Instance.new("ScreenGui")
gui.Name = "LanternHud"
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
title.TextColor3 = Color3.fromRGB(255, 220, 180)
title.Text = Config.GameName
title.Parent = gui

local tag = Instance.new("TextLabel")
tag.BackgroundTransparency = 1
tag.Position = UDim2.new(0, 24, 0, 60)
tag.Size = UDim2.new(0, 420, 0, 22)
tag.Font = Enum.Font.Gotham
tag.TextSize = 14
tag.TextXAlignment = Enum.TextXAlignment.Left
tag.TextColor3 = Color3.fromRGB(190, 170, 150)
tag.Text = Config.Tagline
tag.Parent = gui

local counter = Instance.new("TextLabel")
counter.BackgroundColor3 = Color3.fromRGB(30, 24, 20)
counter.BackgroundTransparency = 0.25
counter.Position = UDim2.new(0, 24, 1, -72)
counter.Size = UDim2.new(0, 200, 0, 44)
counter.Font = Enum.Font.GothamMedium
counter.TextSize = 18
counter.TextColor3 = Color3.fromRGB(255, 210, 150)
counter.Text = "Lanterns  0"
counter.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 10)
corner.Parent = counter

Remotes.LanternCollected.OnClientEvent:Connect(function(count: number)
	counter.Text = ("Lanterns  %d"):format(count)
end)

local _, complete = SoftGoals.mount(player:WaitForChild("PlayerGui"), "tonight's soft goals", {
	{ Id = "raft", Label = "step onto the raft" },
	{ Id = "sit", Label = "sit and drift" },
	{ Id = "lanterns", Label = "collect 3 lanterns" },
})

Remotes.LanternCollected.OnClientEvent:Connect(function(count: number)
	if count >= 3 then
		complete("lanterns")
	end
end)

task.spawn(function()
	local world = workspace:WaitForChild("LanternWorld", 10)
	while true do
		task.wait(0.4)
		local character = player.Character
		local root = character and character:FindFirstChild("HumanoidRootPart")
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		if root and root:IsA("BasePart") and world then
			local raft = world:FindFirstChild("Raft")
			if raft and raft:IsA("BasePart") and (root.Position - raft.Position).Magnitude < 10 then
				complete("raft")
			end
		end
		if humanoid and humanoid.SeatPart then
			complete("sit")
		end
	end
end)

ChillProximity.start(player, {
	Radius = 12,
	GlowColor = Color3.fromRGB(255, 200, 140),
	Brightness = 1.3,
	Range = 10,
})

print("[LanternDrift] client ready")
