--!strict
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))

local ProximityGlow = {}

local glowParts: { [Model]: PointLight } = {}

local function getRoot(character: Model): BasePart?
	local root = character:FindFirstChild("HumanoidRootPart")
	if root and root:IsA("BasePart") then
		return root
	end
	return nil
end

local function setGlow(character: Model, enabled: boolean)
	local root = getRoot(character)
	if not root then
		return
	end
	local existing = glowParts[character]
	if enabled then
		if not existing then
			local light = Instance.new("PointLight")
			light.Name = "HazeProximityGlow"
			light.Brightness = Config.Proximity.Brightness
			light.Range = Config.Proximity.Range
			light.Color = Config.Proximity.GlowColor
			light.Parent = root
			glowParts[character] = light

			local highlight = root.Parent and root.Parent:FindFirstChild("HazeHighlight")
			if not highlight and character then
				local h = Instance.new("Highlight")
				h.Name = "HazeHighlight"
				h.FillColor = Config.Proximity.GlowColor
				h.OutlineColor = Color3.fromRGB(220, 200, 255)
				h.FillTransparency = 0.75
				h.OutlineTransparency = 0.35
				h.DepthMode = Enum.HighlightDepthMode.Occluded
				h.Parent = character
			end
		end
	else
		if existing then
			existing:Destroy()
			glowParts[character] = nil
		end
		local h = character:FindFirstChild("HazeHighlight")
		if h then
			h:Destroy()
		end
	end
end

function ProximityGlow.start(localPlayer: Player)
	RunService.Heartbeat:Connect(function()
		local myChar = localPlayer.Character
		local myRoot = myChar and getRoot(myChar)
		if not myRoot then
			return
		end

		for _, other in Players:GetPlayers() do
			if other ~= localPlayer then
				local char = other.Character
				if char then
					local root = getRoot(char)
					if root then
						local near = (root.Position - myRoot.Position).Magnitude <= Config.Proximity.Radius
						setGlow(char, near)
					end
				end
			end
		end
	end)

	Players.PlayerRemoving:Connect(function(player)
		if player.Character then
			setGlow(player.Character, false)
		end
	end)
end

return ProximityGlow
