--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))
local PartFactory = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("PartFactory"))

local counts: { [number]: number } = {}

PartFactory.clearDefaults(Workspace)
local world = Instance.new("Folder")
world.Name = "LanternWorld"
world.Parent = Workspace

-- Fog lake (visual plane)
PartFactory.make({
	Name = "Lake",
	Size = Vector3.new(120, 1, 120),
	Position = Vector3.new(0, 0, 0),
	Color = Color3.fromRGB(40, 50, 70),
	Material = Enum.Material.Glass,
	Transparency = 0.35,
	Parent = world,
})

-- Dock
PartFactory.make({
	Name = "Dock",
	Size = Vector3.new(16, 1.5, 10),
	Position = Vector3.new(0, 1.5, 22),
	Color = Color3.fromRGB(80, 60, 45),
	Material = Enum.Material.Wood,
	Parent = world,
})

local spawn = Instance.new("SpawnLocation")
spawn.Size = Vector3.new(6, 1, 6)
spawn.Position = Config.Spawn
spawn.Anchored = true
spawn.Neutral = true
spawn.Duration = 0
spawn.Transparency = 0.4
spawn.Color = Color3.fromRGB(90, 70, 50)
spawn.Parent = world

-- Soft raft
local raft = PartFactory.make({
	Name = "Raft",
	Size = Vector3.new(14, 1.2, 10),
	Position = Config.RaftStart,
	Color = Color3.fromRGB(95, 70, 50),
	Material = Enum.Material.Wood,
	Parent = world,
})
local seat = Instance.new("Seat")
seat.Name = "RaftSeat"
seat.Size = Vector3.new(3, 0.4, 2)
seat.Position = Config.RaftStart + Vector3.new(0, 1.2, 0)
seat.Anchored = true
seat.Color = Color3.fromRGB(120, 90, 60)
seat.Parent = world

task.spawn(function()
	local t = 0
	local base = Config.RaftStart
	while raft.Parent do
		t += task.wait(0.03)
		local x = math.sin(t * Config.Raft.DriftSpeed) * Config.Raft.DriftAmplitude
		local z = math.cos(t * Config.Raft.DriftSpeed * 0.7) * (Config.Raft.DriftAmplitude * 0.6)
		raft.Position = base + Vector3.new(x, 0, z)
		seat.Position = raft.Position + Vector3.new(0, 1.2, 0)
	end
end)

-- Lanterns
for i = 1, Config.Lantern.Count do
	local angle = (i / Config.Lantern.Count) * math.pi * 2
	local pos = Vector3.new(math.cos(angle) * 22, 5 + (i % 3), math.sin(angle) * 22)
	local lantern = PartFactory.make({
		Name = "Lantern" .. i,
		Size = Vector3.new(1.6, 2.2, 1.6),
		Position = pos,
		Color = Config.Lantern.Color,
		Material = Enum.Material.Neon,
		CanCollide = false,
		Parent = world,
	})
	lantern:SetAttribute("IsLantern", true)
	lantern:SetAttribute("HomePosition", pos)
	local light = Instance.new("PointLight")
	light.Brightness = 3
	light.Range = 16
	light.Color = Config.Lantern.Color
	light.Parent = lantern
end

task.spawn(function()
	local t = 0
	while true do
		t += task.wait(0.03)
		for _, child in world:GetChildren() do
			if child:IsA("BasePart") and child:GetAttribute("IsLantern") and not child:GetAttribute("Collected") then
				local home = child:GetAttribute("HomePosition")
				if typeof(home) == "Vector3" then
					child.Position = home + Vector3.new(0, math.sin(t * 1.4 + child.Position.X) * 1.2, 0)
				end
			end
		end
	end
end)

for _, child in world:GetChildren() do
	if child:IsA("BasePart") and child:GetAttribute("IsLantern") then
		child.Touched:Connect(function(hit)
			if child:GetAttribute("Collected") then
				return
			end
			local character = hit:FindFirstAncestorOfClass("Model")
			local player = character and Players:GetPlayerFromCharacter(character)
			if not player then
				return
			end
			child:SetAttribute("Collected", true)
			child.Transparency = 1
			child.CanTouch = false
			local light = child:FindFirstChildOfClass("PointLight")
			if light then
				light.Enabled = false
			end
			counts[player.UserId] = (counts[player.UserId] or 0) + 1
			Remotes.LanternCollected:FireClient(player, counts[player.UserId])
			task.delay(Config.Lantern.RespawnSeconds, function()
				if not child.Parent then
					return
				end
				child:SetAttribute("Collected", false)
				child.Transparency = 0
				child.CanTouch = true
				if light then
					light.Enabled = true
				end
				local home = child:GetAttribute("HomePosition")
				if typeof(home) == "Vector3" then
					child.Position = home
				end
			end)
		end)
	end
end

Players.PlayerAdded:Connect(function(player)
	counts[player.UserId] = 0
	player.CharacterAdded:Connect(function(character)
		local root = character:WaitForChild("HumanoidRootPart", 5)
		if root and root:IsA("BasePart") then
			root.CFrame = CFrame.new(Config.Spawn + Vector3.new(0, 3, 0))
		end
	end)
end)

Players.PlayerRemoving:Connect(function(player)
	counts[player.UserId] = nil
end)

print("[LanternDrift] server ready —", Config.Tagline)
