--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local starCounts: { [number]: number } = {}
local portalCooldown: { [number]: number } = {}

local function clearBase()
	for _, name in { "Baseplate", "SpawnLocation" } do
		local inst = Workspace:FindFirstChild(name)
		if inst then
			inst:Destroy()
		end
	end
end

local function part(props: {
	Name: string,
	Size: Vector3,
	Position: Vector3,
	Color: Color3,
	Material: Enum.Material?,
	Anchored: boolean?,
	CanCollide: boolean?,
	Transparency: number?,
	Shape: Enum.PartType?,
	Parent: Instance,
}): Part
	local p = Instance.new("Part")
	p.Name = props.Name
	p.Size = props.Size
	p.Position = props.Position
	p.Color = props.Color
	p.Material = props.Material or Enum.Material.SmoothPlastic
	p.Anchored = if props.Anchored == nil then true else props.Anchored
	p.CanCollide = if props.CanCollide == nil then true else props.CanCollide
	p.Transparency = props.Transparency or 0
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	if props.Shape then
		p.Shape = props.Shape
	end
	p.Parent = props.Parent
	return p
end

local function buildApartment(world: Folder)
	-- Floor
	part({
		Name = "Floor",
		Size = Vector3.new(36, 1, 28),
		Position = Vector3.new(0, 0, 0),
		Color = Color3.fromRGB(55, 48, 42),
		Material = Enum.Material.WoodPlanks,
		Parent = world,
	})
	-- Walls
	local walls = {
		{ Vector3.new(36, 12, 1), Vector3.new(0, 6, -14) },
		{ Vector3.new(36, 12, 1), Vector3.new(0, 6, 14) },
		{ Vector3.new(1, 12, 28), Vector3.new(18, 6, 0) },
		{ Vector3.new(1, 12, 28), Vector3.new(-18, 6, 0) },
	}
	for i, w in walls do
		part({
			Name = "Wall" .. i,
			Size = w[1],
			Position = w[2],
			Color = Color3.fromRGB(72, 64, 58),
			Parent = world,
		})
	end
	-- Ceiling with skylight hole (two slabs)
	part({
		Name = "CeilingL",
		Size = Vector3.new(14, 1, 28),
		Position = Vector3.new(-11, 12, 0),
		Color = Color3.fromRGB(45, 40, 38),
		Parent = world,
	})
	part({
		Name = "CeilingR",
		Size = Vector3.new(14, 1, 28),
		Position = Vector3.new(11, 12, 0),
		Color = Color3.fromRGB(45, 40, 38),
		Parent = world,
	})

	-- Couch
	part({
		Name = "CouchBase",
		Size = Vector3.new(10, 2, 4),
		Position = Vector3.new(-8, 1.5, -8),
		Color = Color3.fromRGB(90, 70, 110),
		Material = Enum.Material.Fabric,
		Parent = world,
	})
	part({
		Name = "CouchBack",
		Size = Vector3.new(10, 3, 1),
		Position = Vector3.new(-8, 3.5, -10),
		Color = Color3.fromRGB(80, 60, 100),
		Material = Enum.Material.Fabric,
		Parent = world,
	})
	local seat = Instance.new("Seat")
	seat.Name = "CouchSeat"
	seat.Size = Vector3.new(4, 0.5, 2)
	seat.Position = Vector3.new(-8, 2.7, -8)
	seat.Anchored = true
	seat.Color = Color3.fromRGB(120, 90, 150)
	seat.Parent = world

	-- Stairs to roof
	for i = 1, 8 do
		part({
			Name = "Step" .. i,
			Size = Vector3.new(4, 0.5, 2),
			Position = Vector3.new(12, i * 1.4, 8 - i * 1.5),
			Color = Color3.fromRGB(60, 55, 50),
			Parent = world,
		})
	end

	-- Roof deck
	part({
		Name = "RoofDeck",
		Size = Vector3.new(36, 1, 28),
		Position = Vector3.new(0, 13, 0),
		Color = Color3.fromRGB(40, 42, 55),
		Parent = world,
	})
	-- Skylight opening in roof (hole via no part at center — cut with two side pieces already ceiling; roof has center gap)
	-- Rebuild roof as sides only
	local roof = world:FindFirstChild("RoofDeck")
	if roof then
		roof:Destroy()
	end
	part({
		Name = "RoofL",
		Size = Vector3.new(14, 1, 28),
		Position = Vector3.new(-11, 13, 0),
		Color = Color3.fromRGB(40, 42, 55),
		Parent = world,
	})
	part({
		Name = "RoofR",
		Size = Vector3.new(14, 1, 28),
		Position = Vector3.new(11, 13, 0),
		Color = Color3.fromRGB(40, 42, 55),
		Parent = world,
	})

	local portal = part({
		Name = "SkylightPortal",
		Size = Vector3.new(8, 1, 8),
		Position = Vector3.new(0, 13.2, 0),
		Color = Color3.fromRGB(140, 120, 255),
		Material = Enum.Material.ForceField,
		CanCollide = false,
		Transparency = 0.35,
		Parent = world,
	})
	portal:SetAttribute("IsPortal", true)
	portal:SetAttribute("PortalTarget", "Galaxy")
	local pl = Instance.new("PointLight")
	pl.Brightness = 3
	pl.Range = 18
	pl.Color = Color3.fromRGB(160, 140, 255)
	pl.Parent = portal

	local spawn = Instance.new("SpawnLocation")
	spawn.Name = "AptSpawn"
	spawn.Size = Vector3.new(6, 1, 6)
	spawn.Position = Config.ApartmentSpawn
	spawn.Anchored = true
	spawn.Neutral = true
	spawn.Duration = 0
	spawn.Transparency = 0.5
	spawn.Color = Color3.fromRGB(80, 70, 100)
	spawn.Parent = world
end

local function buildGalaxy(world: Folder)
	local platform = part({
		Name = "GalaxyFloor",
		Size = Vector3.new(60, 2, 60),
		Position = Config.GalaxySpawn + Vector3.new(0, -4, 0),
		Color = Color3.fromRGB(30, 32, 55),
		Material = Enum.Material.SmoothPlastic,
		Parent = world,
	})
	platform.Transparency = 0.15

	local returnBeacon = part({
		Name = "ReturnBeacon",
		Size = Vector3.new(6, 1, 6),
		Position = Config.GalaxySpawn + Vector3.new(0, -2.5, 18),
		Color = Color3.fromRGB(255, 180, 120),
		Material = Enum.Material.Neon,
		CanCollide = false,
		Parent = world,
	})
	returnBeacon:SetAttribute("IsPortal", true)
	returnBeacon:SetAttribute("PortalTarget", "Home")

	local cloudPositions = {
		Vector3.new(12, 0, -10),
		Vector3.new(-14, 2, 8),
		Vector3.new(8, 4, 14),
		Vector3.new(-10, 1, -16),
		Vector3.new(0, 6, 0),
	}
	for i, offset in cloudPositions do
		local cloud = part({
			Name = "CloudPad" .. i,
			Size = Vector3.new(8, 1.5, 8),
			Position = Config.GalaxySpawn + offset,
			Color = Config.CloudPad.Color,
			Material = Enum.Material.Neon,
			Parent = world,
		})
		cloud:SetAttribute("IsCloudPad", true)
		local light = Instance.new("PointLight")
		light.Brightness = 1.5
		light.Range = 14
		light.Color = Config.CloudPad.Color
		light.Parent = cloud
	end

	for i = 1, Config.Star.Count do
		local angle = (i / Config.Star.Count) * math.pi * 2
		local pos = Config.GalaxySpawn
			+ Vector3.new(math.cos(angle) * 18, 3 + (i % 3), math.sin(angle) * 18)
		local star = part({
			Name = "StarMote" .. i,
			Size = Vector3.new(1.8, 1.8, 1.8),
			Position = pos,
			Color = Config.Star.Color,
			Material = Enum.Material.Neon,
			Shape = Enum.PartType.Ball,
			CanCollide = false,
			Parent = world,
		})
		star:SetAttribute("IsStar", true)
		star:SetAttribute("HomePosition", pos)
		local light = Instance.new("PointLight")
		light.Brightness = 3
		light.Range = 12
		light.Color = Config.Star.Color
		light.Parent = star
	end
end

local function teleport(player: Player, target: string)
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	if not root or not root:IsA("BasePart") then
		return
	end
	local now = os.clock()
	local last = portalCooldown[player.UserId] or 0
	if now - last < Config.Portal.Cooldown then
		return
	end
	portalCooldown[player.UserId] = now

	if target == "Galaxy" then
		root.CFrame = CFrame.new(Config.GalaxySpawn + Vector3.new(0, 4, 0))
		Remotes.EnteredGalaxy:FireClient(player)
	else
		root.CFrame = CFrame.new(Config.ApartmentSpawn + Vector3.new(0, 3, 0))
		Remotes.ReturnedHome:FireClient(player)
	end
end

clearBase()
local world = Instance.new("Folder")
world.Name = "CouchGalaxyWorld"
world.Parent = Workspace
buildApartment(world)
buildGalaxy(world)

for _, child in world:GetChildren() do
	if child:IsA("BasePart") then
		if child:GetAttribute("IsPortal") then
			child.Touched:Connect(function(hit)
				local character = hit:FindFirstAncestorOfClass("Model")
				local player = character and Players:GetPlayerFromCharacter(character)
				if not player then
					return
				end
				local target = child:GetAttribute("PortalTarget")
				if typeof(target) == "string" then
					teleport(player, target)
				end
			end)
		elseif child:GetAttribute("IsCloudPad") then
			child.Touched:Connect(function(hit)
				local character = hit:FindFirstAncestorOfClass("Model")
				local root = character and character:FindFirstChild("HumanoidRootPart")
				if root and root:IsA("BasePart") then
					root.AssemblyLinearVelocity = Vector3.new(
						root.AssemblyLinearVelocity.X,
						Config.CloudPad.Boost,
						root.AssemblyLinearVelocity.Z
					)
				end
			end)
		elseif child:GetAttribute("IsStar") then
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
				starCounts[player.UserId] = (starCounts[player.UserId] or 0) + 1
				Remotes.StarCollected:FireClient(player, starCounts[player.UserId])
				task.delay(Config.Star.RespawnSeconds, function()
					if not child.Parent then
						return
					end
					child:SetAttribute("Collected", false)
					child.Transparency = 0
					child.CanTouch = true
					local home = child:GetAttribute("HomePosition")
					if typeof(home) == "Vector3" then
						child.Position = home
					end
				end)
			end)
		end
	end
end

-- Star hover
task.spawn(function()
	local t = 0
	while true do
		t += task.wait(0.03)
		for _, child in world:GetChildren() do
			if child:IsA("BasePart") and child:GetAttribute("IsStar") and not child:GetAttribute("Collected") then
				local home = child:GetAttribute("HomePosition")
				if typeof(home) == "Vector3" then
					child.Position = home + Vector3.new(0, math.sin(t * 2 + child.Position.X) * 1.2, 0)
				end
			end
		end
	end
end)

Players.PlayerAdded:Connect(function(player)
	starCounts[player.UserId] = 0
	player.CharacterAdded:Connect(function(character)
		local root = character:WaitForChild("HumanoidRootPart", 5)
		if root and root:IsA("BasePart") then
			root.CFrame = CFrame.new(Config.ApartmentSpawn + Vector3.new(0, 3, 0))
		end
	end)
end)

Players.PlayerRemoving:Connect(function(player)
	starCounts[player.UserId] = nil
	portalCooldown[player.UserId] = nil
end)

print("[CouchGalaxy] server ready —", Config.Tagline)
