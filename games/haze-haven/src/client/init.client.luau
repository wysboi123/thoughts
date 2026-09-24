--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer
local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local playerGui = player:WaitForChild("PlayerGui")

local function buildHud()
	local gui = Instance.new("ScreenGui")
	gui.Name = "HazeHud"
	gui.ResetOnSpawn = false
	gui.IgnoreGuiInset = true
	gui.Parent = playerGui

	local title = Instance.new("TextLabel")
	title.Name = "Title"
	title.BackgroundTransparency = 1
	title.Position = UDim2.new(0, 24, 0, 28)
	title.Size = UDim2.new(0, 420, 0, 36)
	title.Font = Enum.Font.GothamMedium
	title.TextSize = 28
	title.TextXAlignment = Enum.TextXAlignment.Left
	title.TextColor3 = Color3.fromRGB(235, 220, 255)
	title.Text = Config.GameName
	title.Parent = gui

	local tag = Instance.new("TextLabel")
	tag.Name = "Tagline"
	tag.BackgroundTransparency = 1
	tag.Position = UDim2.new(0, 24, 0, 62)
	tag.Size = UDim2.new(0, 480, 0, 24)
	tag.Font = Enum.Font.Gotham
	tag.TextSize = 16
	tag.TextXAlignment = Enum.TextXAlignment.Left
	tag.TextColor3 = Color3.fromRGB(190, 175, 210)
	tag.Text = Config.Tagline
	tag.Parent = gui

	local counter = Instance.new("TextLabel")
	counter.Name = "OrbCounter"
	counter.BackgroundColor3 = Color3.fromRGB(30, 24, 42)
	counter.BackgroundTransparency = 0.25
	counter.Position = UDim2.new(0, 24, 1, -72)
	counter.Size = UDim2.new(0, 200, 0, 44)
	counter.Font = Enum.Font.GothamMedium
	counter.TextSize = 20
	counter.TextColor3 = Color3.fromRGB(240, 200, 230)
	counter.Text = "Vibes  0"
	counter.Parent = gui

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 10)
	corner.Parent = counter

	local pad = Instance.new("UIPadding")
	pad.PaddingLeft = UDim.new(0, 14)
	pad.Parent = counter

	return counter
end

local orbCounter = buildHud()

Remotes.OrbCollected.OnClientEvent:Connect(function(count: number)
	orbCounter.Text = ("Vibes  %d"):format(count)
	orbCounter.TextColor3 = Color3.fromRGB(255, 230, 250)
	task.delay(0.35, function()
		if orbCounter.Parent then
			orbCounter.TextColor3 = Color3.fromRGB(240, 200, 230)
		end
	end)
end)

Remotes.FloatBoost.OnClientEvent:Connect(function()
	local character = player.Character
	if not character then
		return
	end
	local root = character:FindFirstChild("HumanoidRootPart")
	if not root or not root:IsA("BasePart") then
		return
	end

	local flash = Instance.new("Part")
	flash.Name = "FloatFlash"
	flash.Shape = Enum.PartType.Ball
	flash.Size = Vector3.new(2, 2, 2)
	flash.CFrame = root.CFrame
	flash.Anchored = true
	flash.CanCollide = false
	flash.Material = Enum.Material.Neon
	flash.Color = Config.FloatPad.Color
	flash.Transparency = 0.2
	flash.Parent = workspace

	local tween = TweenService:Create(
		flash,
		TweenInfo.new(0.55, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		{ Size = Vector3.new(10, 10, 10), Transparency = 1 }
	)
	tween:Play()
	tween.Completed:Connect(function()
		flash:Destroy()
	end)
end)

print("[HazeHaven] client ready")
