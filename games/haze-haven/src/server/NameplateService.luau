--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))

local NameplateService = {}

local function ensureNameplate(character: Model, player: Player)
	local head = character:WaitForChild("Head", 5)
	if not head or not head:IsA("BasePart") then
		return
	end
	local existing = head:FindFirstChild("HazeNameplate")
	if existing then
		existing:Destroy()
	end

	local billboard = Instance.new("BillboardGui")
	billboard.Name = "HazeNameplate"
	billboard.Size = UDim2.fromOffset(160, 48)
	billboard.StudsOffset = Config.Nameplate.Offset
	billboard.AlwaysOnTop = false
	billboard.MaxDistance = 80
	billboard.Parent = head

	local nameLabel = Instance.new("TextLabel")
	nameLabel.Name = "PlayerName"
	nameLabel.BackgroundTransparency = 1
	nameLabel.Size = UDim2.new(1, 0, 0.55, 0)
	nameLabel.Font = Enum.Font.GothamMedium
	nameLabel.TextSize = 16
	nameLabel.TextColor3 = Color3.fromRGB(235, 220, 255)
	nameLabel.Text = player.DisplayName
	nameLabel.Parent = billboard

	local vibeLabel = Instance.new("TextLabel")
	vibeLabel.Name = "VibeLabel"
	vibeLabel.BackgroundTransparency = 1
	vibeLabel.Position = UDim2.new(0, 0, 0.5, 0)
	vibeLabel.Size = UDim2.new(1, 0, 0.45, 0)
	vibeLabel.Font = Enum.Font.Gotham
	vibeLabel.TextSize = 13
	vibeLabel.TextColor3 = Color3.fromRGB(210, 170, 230)
	vibeLabel.Text = "vibes 0"
	vibeLabel.Parent = billboard

	local function refresh()
		local count = player:GetAttribute("VibeCount")
		if typeof(count) ~= "number" then
			count = 0
		end
		vibeLabel.Text = ("vibes %d"):format(count)
	end

	refresh()
	player:GetAttributeChangedSignal("VibeCount"):Connect(refresh)
end

function NameplateService.start()
	local function onCharacter(player: Player, character: Model)
		task.defer(function()
			ensureNameplate(character, player)
		end)
	end

	local function onPlayer(player: Player)
		player.CharacterAdded:Connect(function(character)
			onCharacter(player, character)
		end)
		if player.Character then
			onCharacter(player, player.Character)
		end
	end

	Players.PlayerAdded:Connect(onPlayer)
	for _, player in Players:GetPlayers() do
		onPlayer(player)
	end
end

return NameplateService
