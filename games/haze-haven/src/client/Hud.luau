--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))
local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))

local Hud = {}

function Hud.mount(playerGui: PlayerGui): TextLabel
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

	local version = Instance.new("TextLabel")
	version.BackgroundTransparency = 1
	version.Position = UDim2.new(0, 24, 0, 86)
	version.Size = UDim2.new(0, 120, 0, 18)
	version.Font = Enum.Font.Gotham
	version.TextSize = 12
	version.TextXAlignment = Enum.TextXAlignment.Left
	version.TextColor3 = Color3.fromRGB(150, 140, 170)
	version.Text = "v" .. Config.Version
	version.Parent = gui

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

	Remotes.OrbCollected.OnClientEvent:Connect(function(count: number)
		counter.Text = ("Vibes  %d"):format(count)
		counter.TextColor3 = Color3.fromRGB(255, 230, 250)
		task.delay(0.35, function()
			if counter.Parent then
				counter.TextColor3 = Color3.fromRGB(240, 200, 230)
			end
		end)
	end)

	return counter
end

return Hud
