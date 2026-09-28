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

local lake = PartFactory.make({
	Name = "Lake",
	Size = Vector3.new(120, 1, 120),
	Position = Vector3.new(0, 0, 0),
	Color = Color3.fromRGB(40, 50, 70),
	Material = Enum.Material.Glass,
	Transparency = 0.35,
	Parent = world,
})
lake:SetAttribute("IsLake", true)

-- Soft mist banks
for i, offset in {
	Vector3.new(-30, 8, -10),
	Vector3.new(28, 10, 8),
	Vector3.new(0, 12, -28),
} do
	local mist = PartFactory.make({
		Name = "Mist" .. i,
		Size = Vector3.new(24, 12, 24),
		Position = offset,
		Color = Color3.fromRGB(120, 130, 160),
		Material = Enum.Material.ForceField,
		CanCollide = false,
		Transparency = 0.7,
		Parent = world,
	})
	mist.CastShadow = false
end

-- Dock + rails
PartFactory.make({
	Name = "Dock",
	Size = Vector3.new(18, 1.5, 12),
	Position = Vector3.new(0, 1.5, 24),
	Color = Color3.fromRGB(80, 60, 45),
	Material = Enum.Material.Wood,
	Parent = world,
})
for _, x in { -8, 8 } do
	PartFactory.make({
		Name = "DockRail" .. x,
		Size = Vector3.new(0.5, 2.5, 12),
		Position = Vector3.new(x, 3.2, 24),
		Color = Color3.fromRGB(70, 55, 40),
		Material = Enum.Material.Wood,
		Parent = world,
	})
end
-- Walkway to water
PartFactory.make({
	Name = "Gangway",
	Size = Vector3.new(6, 0.8, 8),
	Position = Vector3.new(0, 1.2, 14),
	Color = Color3.fromRGB(75, 58, 42),
	Material = Enum.Material.Wood,
	Parent = world,
})

-- Shore lamps (decorative — not collectible)
for i, pos in {
	Vector3.new(-10, 4, 28),
	Vector3.new(10, 4, 28),
	Vector3.new(-14, 3.5, 18),
	Vector3.new(14, 3.5, 18),
} do
	local pole = PartFactory.make({
		Name = "ShorePole" .. i,
		Size = Vector3.new(0.5, 5, 0.5),
		Position = pos,
		Color = Color3.fromRGB(55, 45, 40),
		Parent = world,
	})
	local lamp = PartFactory.make({
		Name = "ShoreLamp" .. i,
		Size = Vector3.new(1.4, 1.4, 1.4),
		Position = pos + Vector3.new(0, 3.2, 0),
		Color = Config.Shore.LampColor,
		Material = Enum.Material.Neon,
		Shape = Enum.PartType.Ball,
		CanCollide = false,
		Parent = world,
	})
	local light = Instance.new("PointLight")
	light.Brightness = 2
	light.Range = 18
	light.Color = Config.Shore.LampColor
	light.Parent = lamp
	pole.Parent = world
end

local spawn = Instance.new("SpawnLocation")
spawn.Size = Vector3.new(6, 1, 6)
spawn.Position = Config.Spawn
spawn.Anchored = true
spawn.Neutral = true
spawn.Duration = 0
spawn.Transparency = 0.4
spawn.Color = Color3.fromRGB(90, 70, 50)
spawn.Parent = world

-- Dock bench for waiting
PartFactory.make({
	Name = "DockBench",
	Size = Vector3.new(6, 1, 2),
	Position = Vector3.new(-4, 2.8, 26),
	Color = Color3.fromRGB(85, 65, 48),
	Material = Enum.Material.Wood,
	Parent = world,
})
local dockSeat = Instance.new("Seat")
dockSeat.Name = "DockSeat"
dockSeat.Size = Vector3.new(4, 0.4, 1.5)
dockSeat.Position = Vector3.new(-4, 3.5, 26)
dockSeat.Anchored = true
dockSeat.Color = Color3.fromRGB(110, 85, 60)
dockSeat.Parent = world

-- Soft crate stack + mooring post
PartFactory.make({
	Name = "DockCrate",
	Size = Vector3.new(2.5, 2.5, 2.5),
	Position = Vector3.new(6, 3.5, 26),
	Color = Color3.fromRGB(95, 75, 50),
	Material = Enum.Material.Wood,
	Parent = world,
})
PartFactory.make({
	Name = "MooringPost",
	Size = Vector3.new(0.6, 3, 0.6),
	Position = Vector3.new(8, 3.5, 20),
	Color = Color3.fromRGB(70, 55, 40),
	Material = Enum.Material.Wood,
	Parent = world,
})
local ropeCoil = PartFactory.make({
	Name = "RopeCoil",
	Size = Vector3.new(1.4, 0.6, 1.4),
	Position = Vector3.new(8, 2.2, 20),
	Color = Color3.fromRGB(120, 100, 70),
	Material = Enum.Material.Fabric,
	Shape = Enum.PartType.Cylinder,
	Parent = world,
})
ropeCoil.CFrame = CFrame.new(8, 2.2, 20) * CFrame.Angles(0, 0, math.rad(90))
local dockLantern = PartFactory.make({
	Name = "DockLantern",
	Size = Vector3.new(1.2, 1.2, 1.2),
	Position = Vector3.new(8, 5.4, 20),
	Color = Config.Lantern.Color,
	Material = Enum.Material.Neon,
	Shape = Enum.PartType.Ball,
	CanCollide = false,
	Parent = world,
})
local dockLanternLight = Instance.new("PointLight")
dockLanternLight.Brightness = 2.2
dockLanternLight.Range = 14
dockLanternLight.Color = Config.Lantern.Color
dockLanternLight.Parent = dockLantern

-- Soft lily pads (decorative)
for i, pos in {
	Vector3.new(-16, 0.8, 6),
	Vector3.new(18, 0.8, -8),
	Vector3.new(-8, 0.8, -18),
	Vector3.new(12, 0.8, 14),
} do
	PartFactory.make({
		Name = "Lily" .. i,
		Size = Vector3.new(4.5, 0.25, 4.5),
		Position = pos,
		Color = Color3.fromRGB(50, 90, 60),
		Material = Enum.Material.Grass,
		CanCollide = false,
		Parent = world,
	})
end

-- Soft raft + dual seats
local raft = PartFactory.make({
	Name = "Raft",
	Size = Vector3.new(14, 1.2, 10),
	Position = Config.RaftStart,
	Color = Color3.fromRGB(95, 70, 50),
	Material = Enum.Material.Wood,
	Parent = world,
})
-- Soft raft side rails
local raftRailL = PartFactory.make({
	Name = "RaftRailL",
	Size = Vector3.new(0.4, 1.2, 9),
	Position = Config.RaftStart + Vector3.new(-6.5, 1.2, 0),
	Color = Color3.fromRGB(80, 60, 45),
	Material = Enum.Material.Wood,
	Parent = world,
})
local raftRailR = PartFactory.make({
	Name = "RaftRailR",
	Size = Vector3.new(0.4, 1.2, 9),
	Position = Config.RaftStart + Vector3.new(6.5, 1.2, 0),
	Color = Color3.fromRGB(80, 60, 45),
	Material = Enum.Material.Wood,
	Parent = world,
})
local seatA = Instance.new("Seat")
seatA.Name = "RaftSeatA"
seatA.Size = Vector3.new(2.8, 0.4, 2)
seatA.Position = Config.RaftStart + Vector3.new(-2.5, 1.2, 0)
seatA.Anchored = true
seatA.Color = Color3.fromRGB(120, 90, 60)
seatA.Parent = world
local seatB = Instance.new("Seat")
seatB.Name = "RaftSeatB"
seatB.Size = Vector3.new(2.8, 0.4, 2)
seatB.Position = Config.RaftStart + Vector3.new(2.5, 1.2, 0)
seatB.Anchored = true
seatB.Color = Color3.fromRGB(120, 90, 60)
seatB.Parent = world

local SoftWireSeats = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftWireSeats"))
SoftWireSeats.wire(seatA, Remotes.RaftSitChanged)
SoftWireSeats.wire(seatB, Remotes.RaftSitChanged)
SoftWireSeats.wire(dockSeat, Remotes.RaftSitChanged)

-- Small mast light on raft
local mast = PartFactory.make({
	Name = "RaftMast",
	Size = Vector3.new(0.4, 4, 0.4),
	Position = Config.RaftStart + Vector3.new(0, 3, -3),
	Color = Color3.fromRGB(70, 55, 40),
	Material = Enum.Material.Wood,
	Parent = world,
})
local mastLamp = PartFactory.make({
	Name = "RaftMastLamp",
	Size = Vector3.new(1.2, 1.2, 1.2),
	Position = Config.RaftStart + Vector3.new(0, 5.2, -3),
	Color = Config.Lantern.Color,
	Material = Enum.Material.Neon,
	Shape = Enum.PartType.Ball,
	CanCollide = false,
	Parent = world,
})
local mastLight = Instance.new("PointLight")
mastLight.Brightness = 2.5
mastLight.Range = 20
mastLight.Color = Config.Lantern.Color
mastLight.Parent = mastLamp

task.spawn(function()
	local t = 0
	local base = Config.RaftStart
	while raft.Parent do
		t += task.wait(0.03)
		local x = math.sin(t * Config.Raft.DriftSpeed) * Config.Raft.DriftAmplitude
		local z = math.cos(t * Config.Raft.DriftSpeed * 0.7) * (Config.Raft.DriftAmplitude * 0.6)
		local pos = base + Vector3.new(x, 0, z)
		raft.Position = pos
		seatA.Position = pos + Vector3.new(-2.5, 1.2, 0)
		seatB.Position = pos + Vector3.new(2.5, 1.2, 0)
		raftRailL.Position = pos + Vector3.new(-6.5, 1.2, 0)
		raftRailR.Position = pos + Vector3.new(6.5, 1.2, 0)
		mast.Position = pos + Vector3.new(0, 3, -3)
		mastLamp.Position = pos + Vector3.new(0, 5.2, -3)
	end
end)

for i = 1, Config.Lantern.Count do
	local angle = (i / Config.Lantern.Count) * math.pi * 2
	local radius = 18 + (i % 3) * 4
	local pos = Vector3.new(math.cos(angle) * radius, 5 + (i % 3), math.sin(angle) * radius)
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
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 2.7 + math.sin(t * 1.4 + child.Position.X) * 0.4
				end
			elseif child.Name == "RaftMastLamp" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 2.4 + math.sin(t * 1.1) * 0.35
				end
			elseif child.Name == "DockLantern" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 2.0 + math.sin(t * 1.6) * 0.4
				end
			elseif child:IsA("BasePart") and child:GetAttribute("IsLake") then
				child.Transparency = 0.32 + math.sin(t * 0.55) * 0.06
			elseif child:IsA("BasePart") and string.find(child.Name, "Lily", 1, true) then
				local baseY = 0.8
				child.Position = Vector3.new(child.Position.X, baseY + math.sin(t * 0.9 + child.Position.X) * 0.08, child.Position.Z)
			elseif child:IsA("BasePart") and string.find(child.Name, "Mist", 1, true) then
				child.Transparency = 0.65 + math.sin(t * 0.4 + child.Position.X) * 0.08
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

print(("[LanternDrift] server ready v%s — %s"):format(Config.Version, Config.Tagline))
