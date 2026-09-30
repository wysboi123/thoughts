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

	-- Second couch cushion for friends
	local seat2 = Instance.new("Seat")
	seat2.Name = "CouchSeat2"
	seat2.Size = Vector3.new(3, 0.5, 2)
	seat2.Position = Vector3.new(-4, 2.7, -8)
	seat2.Anchored = true
	seat2.Color = Color3.fromRGB(130, 100, 160)
	seat2.Parent = world

	-- Soft rug under the couch
	part({
		Name = "CouchRug",
		Size = Vector3.new(14, 0.15, 8),
		Position = Vector3.new(-6, 0.6, -6),
		Color = Color3.fromRGB(95, 55, 90),
		Material = Enum.Material.Fabric,
		Parent = world,
	})

	-- Two-worlds plaque (USP beat — roof first)
	local plaque = part({
		Name = "TwoWorldsPlaque",
		Size = Vector3.new(4, 2.2, 0.25),
		Position = Vector3.new(-12, 4.2, -10.5),
		Color = Color3.fromRGB(42, 34, 58),
		Material = Enum.Material.SmoothPlastic,
		Parent = world,
	})
	local plaqueGui = Instance.new("SurfaceGui")
	plaqueGui.Face = Enum.NormalId.Front
	plaqueGui.Parent = plaque
	local plaqueTitle = Instance.new("TextLabel")
	plaqueTitle.Size = UDim2.new(1, 0, 0.4, 0)
	plaqueTitle.BackgroundTransparency = 1
	plaqueTitle.Font = Enum.Font.GothamMedium
	plaqueTitle.TextSize = 22
	plaqueTitle.TextColor3 = Color3.fromRGB(220, 200, 255)
	plaqueTitle.Text = "two worlds"
	plaqueTitle.Parent = plaqueGui
	local plaqueBody = Instance.new("TextLabel")
	plaqueBody.Position = UDim2.new(0, 0, 0.4, 0)
	plaqueBody.Size = UDim2.new(1, -8, 0.55, 0)
	plaqueBody.BackgroundTransparency = 1
	plaqueBody.Font = Enum.Font.Gotham
	plaqueBody.TextSize = 16
	plaqueBody.TextWrapped = true
	plaqueBody.TextColor3 = Color3.fromRGB(170, 155, 200)
	plaqueBody.Text = "one couch\nroof first"
	plaqueBody.Parent = plaqueGui

	-- Coffee table + warm lamp
	part({
		Name = "CoffeeTable",
		Size = Vector3.new(5, 0.4, 2.5),
		Position = Vector3.new(-6, 1.2, -4),
		Color = Color3.fromRGB(70, 55, 45),
		Material = Enum.Material.Wood,
		Parent = world,
	})
	local tableLamp = part({
		Name = "TableLamp",
		Size = Vector3.new(0.7, 1.2, 0.7),
		Position = Vector3.new(-4.5, 2.1, -4),
		Color = Color3.fromRGB(255, 210, 150),
		Material = Enum.Material.Neon,
		Shape = Enum.PartType.Ball,
		CanCollide = false,
		Parent = world,
	})
	local tableLight = Instance.new("PointLight")
	tableLight.Brightness = 1.4
	tableLight.Range = 14
	tableLight.Color = Color3.fromRGB(255, 200, 150)
	tableLight.Parent = tableLamp

	-- Bookshelf against the side wall
	part({
		Name = "Bookshelf",
		Size = Vector3.new(0.6, 7, 5),
		Position = Vector3.new(-17.2, 4, 2),
		Color = Color3.fromRGB(65, 50, 40),
		Material = Enum.Material.Wood,
		Parent = world,
	})
	for i = 1, 4 do
		local row = part({
			Name = "BookRow" .. i,
			Size = Vector3.new(0.4, 0.9, 4.2),
			Position = Vector3.new(-16.8, 1.5 + i * 1.4, 2),
			Color = Color3.fromHSV(0.7 + i * 0.04, 0.35, 0.55),
			Material = Enum.Material.SmoothPlastic,
			Parent = world,
		})
		row:SetAttribute("BookHue", 0.7 + i * 0.04)
	end

	-- Window glow (night city wash)
	local window = part({
		Name = "NightWindow",
		Size = Vector3.new(8, 5, 0.3),
		Position = Vector3.new(0, 6, -13.8),
		Color = Color3.fromRGB(90, 120, 200),
		Material = Enum.Material.Glass,
		Transparency = 0.35,
		CanCollide = false,
		Parent = world,
	})
	local windowLight = Instance.new("PointLight")
	windowLight.Brightness = 1.1
	windowLight.Range = 16
	windowLight.Color = Color3.fromRGB(120, 150, 220)
	windowLight.Parent = window

	-- Floor lamp near stairs
	part({
		Name = "FloorLampPole",
		Size = Vector3.new(0.3, 5, 0.3),
		Position = Vector3.new(8, 3, -6),
		Color = Color3.fromRGB(50, 48, 55),
		Parent = world,
	})
	local floorGlow = part({
		Name = "FloorLampGlow",
		Size = Vector3.new(1.4, 1.4, 1.4),
		Position = Vector3.new(8, 5.8, -6),
		Color = Color3.fromRGB(255, 220, 170),
		Material = Enum.Material.Neon,
		Shape = Enum.PartType.Ball,
		CanCollide = false,
		Parent = world,
	})
	local floorLight = Instance.new("PointLight")
	floorLight.Brightness = 1.6
	floorLight.Range = 18
	floorLight.Color = Color3.fromRGB(255, 215, 160)
	floorLight.Parent = floorGlow

	-- Soft “paused movie” glow (decorative — no audio)
	local tv = part({
		Name = "SoftScreen",
		Size = Vector3.new(6, 3.5, 0.3),
		Position = Vector3.new(0, 5, 13.6),
		Color = Color3.fromRGB(80, 100, 160),
		Material = Enum.Material.Neon,
		CanCollide = false,
		Transparency = 0.25,
		Parent = world,
	})
	local tvLight = Instance.new("PointLight")
	tvLight.Brightness = 1.2
	tvLight.Range = 14
	tvLight.Color = Color3.fromRGB(100, 130, 200)
	tvLight.Parent = tv

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

	-- Roof as sides only (skylight gap)
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

	-- Roof props: railings, planters, string lights
	for _, x in { -17, 17 } do
		part({
			Name = "RailZ" .. x,
			Size = Vector3.new(1, 3, 28),
			Position = Vector3.new(x, 14.5, 0),
			Color = Color3.fromRGB(55, 58, 75),
			Transparency = 0.25,
			Parent = world,
		})
	end
	for _, z in { -13, 13 } do
		part({
			Name = "RailX" .. z,
			Size = Vector3.new(34, 3, 1),
			Position = Vector3.new(0, 14.5, z),
			Color = Color3.fromRGB(55, 58, 75),
			Transparency = 0.25,
			Parent = world,
		})
	end

	local planterPositions = {
		Vector3.new(-14, 14, -10),
		Vector3.new(14, 14, -10),
		Vector3.new(-14, 14, 10),
		Vector3.new(14, 14, 10),
	}
	for i, pos in planterPositions do
		part({
			Name = "Planter" .. i,
			Size = Vector3.new(3, 1.5, 3),
			Position = pos,
			Color = Color3.fromRGB(70, 55, 45),
			Material = Enum.Material.Concrete,
			Parent = world,
		})
		local plant = part({
			Name = "Plant" .. i,
			Size = Vector3.new(2, 2.5, 2),
			Position = pos + Vector3.new(0, 2, 0),
			Color = Color3.fromRGB(60, 120, 80),
			Material = Enum.Material.Grass,
			Parent = world,
		})
		plant:SetAttribute("HomePosition", plant.Position)
	end

	for i = 1, 10 do
		local t = (i - 1) / 9
		local lightPart = part({
			Name = "StringLight" .. i,
			Size = Vector3.new(0.6, 0.6, 0.6),
			Position = Vector3.new(-12 + t * 24, 16.5, -12),
			Color = Color3.fromRGB(255, 210, 140),
			Material = Enum.Material.Neon,
			Shape = Enum.PartType.Ball,
			CanCollide = false,
			Parent = world,
		})
		local bulb = Instance.new("PointLight")
		bulb.Brightness = 1.2
		bulb.Range = 10
		bulb.Color = Color3.fromRGB(255, 210, 140)
		bulb.Parent = lightPart
	end

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

	-- Galaxy hammock
	local gOrigin = Config.GalaxySpawn
	part({
		Name = "GalaxyHammockPostL",
		Size = Vector3.new(0.5, 4, 0.5),
		Position = gOrigin + Vector3.new(-7, 0, -8),
		Color = Color3.fromRGB(80, 70, 50),
		Material = Enum.Material.Wood,
		Parent = world,
	})
	part({
		Name = "GalaxyHammockPostR",
		Size = Vector3.new(0.5, 4, 0.5),
		Position = gOrigin + Vector3.new(7, 0, -8),
		Color = Color3.fromRGB(80, 70, 50),
		Material = Enum.Material.Wood,
		Parent = world,
	})
	local hammockCloth = part({
		Name = "GalaxyHammockCloth",
		Size = Vector3.new(12, 0.3, 3.5),
		Position = gOrigin + Vector3.new(0, -1.5, -8),
		Color = Color3.fromRGB(120, 100, 180),
		Material = Enum.Material.Fabric,
		Parent = world,
	})
	hammockCloth:SetAttribute("HomePosition", hammockCloth.Position)
	local gSeat = Instance.new("Seat")
	gSeat.Name = "GalaxyHammockSeat"
	gSeat.Size = Vector3.new(3.5, 0.4, 1.8)
	gSeat.Position = gOrigin + Vector3.new(0, -1, -8)
	gSeat.Anchored = true
	gSeat.Color = Color3.fromRGB(150, 130, 200)
	gSeat.Parent = world

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

	local stars: { BasePart } = {}
	for i = 1, Config.Star.Count do
		local angle = (i / Config.Star.Count) * math.pi * 2
		local radius = if i <= 5 then 18 else 26
		local pos = Config.GalaxySpawn
			+ Vector3.new(math.cos(angle) * radius, 4 + (i % 4), math.sin(angle) * radius)
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
		table.insert(stars, star)
	end

	-- Constellation beams between linked stars
	for _, link in Config.Star.ConstellationLinks do
		local a = stars[link[1]]
		local b = stars[link[2]]
		if a and b then
			local att0 = Instance.new("Attachment")
			att0.Name = "ConstA"
			att0.Parent = a
			local att1 = Instance.new("Attachment")
			att1.Name = "ConstB"
			att1.Parent = b
			local beam = Instance.new("Beam")
			beam.Attachment0 = att0
			beam.Attachment1 = att1
			beam.Name = "ConstBeam"
			beam.Width0 = 0.15
			beam.Width1 = 0.15
			beam.FaceCamera = true
			beam.Color = ColorSequence.new(Color3.fromRGB(255, 240, 180))
			beam.Transparency = NumberSequence.new(0.35)
			beam.LightEmission = 0.8
			beam.Parent = a
		end
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

-- Couch sit sync — broadcast when someone sits / leaves
local SoftWireSeats = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftWireSeats"))
SoftWireSeats.wireAll(world, Remotes.CouchSitChanged)

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

-- Star hover + soft portal / string-light / cloud pulse
task.spawn(function()
	local t = 0
	local cloudHomes: { [BasePart]: Vector3 } = {}
	for _, child in world:GetChildren() do
		if child:IsA("BasePart") and child:GetAttribute("IsCloudPad") then
			cloudHomes[child] = child.Position
		end
	end
	while true do
		t += task.wait(0.03)
		for _, child in world:GetChildren() do
			if child:IsA("BasePart") and child:GetAttribute("IsStar") and not child:GetAttribute("Collected") then
				local home = child:GetAttribute("HomePosition")
				if typeof(home) == "Vector3" then
					child.Position = home + Vector3.new(0, math.sin(t * 2 + child.Position.X) * 1.2, 0)
				end
			elseif child.Name == "SkylightPortal" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 2.4 + math.sin(t * 1.5) * 0.8
				end
				child.Transparency = 0.3 + math.sin(t * 1.2) * 0.08
			elseif string.find(child.Name, "StringLight", 1, true) and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 1.0 + math.sin(t * 2 + child.Position.X) * 0.35
				end
			elseif child:IsA("BasePart") and child:GetAttribute("IsCloudPad") then
				local home = cloudHomes[child]
				if home then
					child.Position = home + Vector3.new(0, math.sin(t * 0.8 + home.X) * 0.55, 0)
					local light = child:FindFirstChildOfClass("PointLight")
					if light then
						light.Brightness = 1.3 + math.sin(t * 1.1 + home.Z) * 0.35
					end
				end
			elseif child.Name == "CouchRug" and child:IsA("BasePart") then
				local warm = (math.sin(t * 0.55) + 1) / 2
				child.Color = Color3.fromRGB(95, 55, 90):Lerp(Color3.fromRGB(120, 70, 115), warm * 0.55)
			elseif child.Name == "CoffeeTable" and child:IsA("BasePart") then
				local warm = (math.sin(t * 0.55) + 1) / 2
				child.Color = Color3.fromRGB(70, 55, 45):Lerp(Color3.fromRGB(95, 70, 55), warm * 0.5)
			elseif child.Name == "CouchBase" and child:IsA("BasePart") then
				local warm = (math.sin(t * 0.45) + 1) / 2
				child.Color = Color3.fromRGB(90, 70, 110):Lerp(Color3.fromRGB(115, 85, 135), warm * 0.45)
			elseif child.Name == "CouchBack" and child:IsA("BasePart") then
				local warm = (math.sin(t * 0.45 + 0.4) + 1) / 2
				child.Color = Color3.fromRGB(80, 60, 100):Lerp(Color3.fromRGB(105, 75, 125), warm * 0.45)
			elseif child.Name == "Bookshelf" and child:IsA("BasePart") then
				local warm = (math.sin(t * 0.5) + 1) / 2
				child.Color = Color3.fromRGB(65, 50, 40):Lerp(Color3.fromRGB(90, 70, 55), warm * 0.4)
			elseif child.Name == "ReturnBeacon" and child:IsA("BasePart") then
				child.Transparency = 0.05 + math.sin(t * 1.3) * 0.08
			elseif child.Name == "GalaxyHammockCloth" and child:IsA("BasePart") then
				local home = child:GetAttribute("HomePosition")
				if typeof(home) == "Vector3" then
					child.Position = home + Vector3.new(0, math.sin(t * 0.9) * 0.12, 0)
				end
			elseif child.Name == "SoftScreen" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 1.0 + math.sin(t * 0.7) * 0.3
				end
				local warm = (math.sin(t * 0.55) + 1) / 2
				child.Transparency = 0.2 + math.sin(t * 0.55) * 0.08
				child.Color = Color3.fromRGB(90, 110, 160):Lerp(Color3.fromRGB(140, 120, 180), warm)
			elseif child.Name == "NightWindow" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 1.0 + math.sin(t * 0.6) * 0.25
				end
				child.Transparency = 0.3 + math.sin(t * 0.5) * 0.08
			elseif child.Name == "FloorLampGlow" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 1.4 + math.sin(t * 1.5) * 0.35
				end
			elseif child.Name == "TableLamp" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 1.2 + math.sin(t * 1.8) * 0.3
				end
			elseif string.find(child.Name, "BookRow", 1, true) and child:IsA("BasePart") then
				local hue = child:GetAttribute("BookHue")
				if typeof(hue) == "number" then
					local v = 0.5 + math.sin(t * 0.6 + hue * 10) * 0.08
					child.Color = Color3.fromHSV(hue, 0.35, v)
				end
			elseif string.find(child.Name, "Plant", 1, true)
				and child:IsA("BasePart")
				and not string.find(child.Name, "Planter", 1, true)
			then
				local home = child:GetAttribute("HomePosition")
				if typeof(home) == "Vector3" then
					child.Position = home + Vector3.new(0, math.sin(t * 0.85 + home.X) * 0.12, 0)
				end
			elseif child:IsA("BasePart") then
				for _, beam in child:GetChildren() do
					if beam:IsA("Beam") and beam.Name == "ConstBeam" then
						local w = 0.12 + math.sin(t * 1.2 + child.Position.X) * 0.05
						beam.Width0 = w
						beam.Width1 = w
					end
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
