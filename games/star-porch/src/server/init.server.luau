--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))
local PartFactory = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("PartFactory"))

local counts: { [number]: number } = {}
local sessionFlies = 0
local JAR_FILL_CAP = Config.JarFillCap

PartFactory.clearDefaults(Workspace)
local world = Instance.new("Folder")
world.Name = "StarPorchWorld"
world.Parent = Workspace

-- Yard / grass
PartFactory.make({
	Name = "Yard",
	Size = Vector3.new(80, 1, 60),
	Position = Vector3.new(0, 0, 0),
	Color = Color3.fromRGB(40, 55, 38),
	Material = Enum.Material.Grass,
	Parent = world,
})

-- Porch deck
PartFactory.make({
	Name = "Deck",
	Size = Vector3.new(28, 1.2, 16),
	Position = Vector3.new(0, 1.5, 4),
	Color = Color3.fromRGB(90, 70, 50),
	Material = Enum.Material.WoodPlanks,
	Parent = world,
})

-- House back wall + roof overhang
PartFactory.make({
	Name = "HouseWall",
	Size = Vector3.new(28, 12, 1.5),
	Position = Vector3.new(0, 7, -4),
	Color = Color3.fromRGB(70, 58, 48),
	Material = Enum.Material.Brick,
	Parent = world,
})
PartFactory.make({
	Name = "RoofOverhang",
	Size = Vector3.new(30, 1, 18),
	Position = Vector3.new(0, 13.5, 2),
	Color = Color3.fromRGB(45, 40, 50),
	Material = Enum.Material.Slate,
	Parent = world,
})

-- Porch posts + rails
for _, x in { -13, 13 } do
	PartFactory.make({
		Name = "Post" .. x,
		Size = Vector3.new(1, 10, 1),
		Position = Vector3.new(x, 6.5, 11),
		Color = Color3.fromRGB(80, 65, 48),
		Material = Enum.Material.Wood,
		Parent = world,
	})
end
-- Front rails with gap for steps
PartFactory.make({
	Name = "FrontRailL",
	Size = Vector3.new(9, 2, 0.4),
	Position = Vector3.new(-8.5, 3.5, 11.5),
	Color = Color3.fromRGB(75, 60, 45),
	Material = Enum.Material.Wood,
	Parent = world,
})
PartFactory.make({
	Name = "FrontRailR",
	Size = Vector3.new(9, 2, 0.4),
	Position = Vector3.new(8.5, 3.5, 11.5),
	Color = Color3.fromRGB(75, 60, 45),
	Material = Enum.Material.Wood,
	Parent = world,
})

-- Side porch rails
for _, x in { -13.5, 13.5 } do
	PartFactory.make({
		Name = "SideRail" .. x,
		Size = Vector3.new(0.4, 2, 14),
		Position = Vector3.new(x, 3.5, 4),
		Color = Color3.fromRGB(75, 60, 45),
		Material = Enum.Material.Wood,
		Parent = world,
	})
end

-- Soft side table between rockers
PartFactory.make({
	Name = "SideTable",
	Size = Vector3.new(2.2, 0.3, 2.2),
	Position = Vector3.new(-4, 2.4, 4.5),
	Color = Color3.fromRGB(85, 65, 48),
	Material = Enum.Material.Wood,
	Parent = world,
})
PartFactory.make({
	Name = "SideTableLeg",
	Size = Vector3.new(0.4, 1.6, 0.4),
	Position = Vector3.new(-4, 1.5, 4.5),
	Color = Color3.fromRGB(70, 55, 40),
	Material = Enum.Material.Wood,
	Parent = world,
})
local mug = PartFactory.make({
	Name = "WarmMug",
	Size = Vector3.new(0.5, 0.55, 0.5),
	Position = Vector3.new(-4, 2.85, 4.5),
	Color = Color3.fromRGB(200, 160, 120),
	Material = Enum.Material.SmoothPlastic,
	CanCollide = false,
	Parent = world,
})
local mugSteam = Instance.new("PointLight")
mugSteam.Brightness = 0.6
mugSteam.Range = 4
mugSteam.Color = Color3.fromRGB(255, 220, 180)
mugSteam.Parent = mug

-- Steps down to yard
for i = 1, 3 do
	PartFactory.make({
		Name = "Step" .. i,
		Size = Vector3.new(6, 0.5, 2),
		Position = Vector3.new(0, 0.5 + (3 - i) * 0.5, 13 + i * 1.5),
		Color = Color3.fromRGB(85, 68, 50),
		Material = Enum.Material.Wood,
		Parent = world,
	})
end

-- Soft yard path + side bushes
PartFactory.make({
	Name = "YardPath",
	Size = Vector3.new(5, 0.2, 18),
	Position = Vector3.new(0, 0.6, 22),
	Color = Color3.fromRGB(95, 85, 70),
	Material = Enum.Material.Cobblestone,
	Parent = world,
})
local pathGlow = PartFactory.make({
	Name = "YardPathGlow",
	Size = Vector3.new(3.2, 0.15, 16),
	Position = Vector3.new(0, 0.75, 22),
	Color = Color3.fromRGB(255, 180, 110),
	Material = Enum.Material.Neon,
	CanCollide = false,
	Transparency = 0.55,
	Parent = world,
})
local pathLight = Instance.new("PointLight")
pathLight.Brightness = 1.0
pathLight.Range = 12
pathLight.Color = Color3.fromRGB(255, 170, 100)
pathLight.Parent = pathGlow
for i, pos in {
	Vector3.new(-10, 1.5, 18),
	Vector3.new(10, 1.5, 18),
	Vector3.new(-14, 1.8, 8),
	Vector3.new(14, 1.8, 8),
	Vector3.new(-8, 1.4, 26),
	Vector3.new(8, 1.4, 26),
} do
	local bush = PartFactory.make({
		Name = "Bush" .. i,
		Size = Vector3.new(3.5, 2.8, 3.5),
		Position = pos,
		Color = Color3.fromRGB(45, 75, 50),
		Material = Enum.Material.Grass,
		Shape = Enum.PartType.Ball,
		Parent = world,
	})
	bush:SetAttribute("HomePosition", bush.Position)
end

-- Yard fire pit (visual warmth only — no audio ids)
PartFactory.make({
	Name = "FirePitRing",
	Size = Vector3.new(4.5, 0.6, 4.5),
	Position = Vector3.new(0, 0.85, 26),
	Color = Color3.fromRGB(70, 65, 60),
	Material = Enum.Material.Slate,
	Parent = world,
})
for i, offset in { Vector3.new(1.2, 0.35, 0), Vector3.new(-1.1, 0.35, 0.4), Vector3.new(0.2, 0.35, -1.2) } do
	PartFactory.make({
		Name = "FirePitLog" .. i,
		Size = Vector3.new(1.8, 0.5, 0.6),
		Position = Vector3.new(0, 0.85, 26) + offset,
		Color = Color3.fromRGB(85, 55, 40),
		Material = Enum.Material.Wood,
		Parent = world,
	})
end
local fireGlow = PartFactory.make({
	Name = "FirePitGlow",
	Size = Vector3.new(2.2, 1.2, 2.2),
	Position = Vector3.new(0, 1.35, 26),
	Color = Color3.fromRGB(255, 140, 60),
	Material = Enum.Material.Neon,
	Shape = Enum.PartType.Ball,
	CanCollide = false,
	Transparency = 0.25,
	Parent = world,
})
local fireLight = Instance.new("PointLight")
fireLight.Brightness = 1.6
fireLight.Range = 18
fireLight.Color = Color3.fromRGB(255, 150, 80)
fireLight.Parent = fireGlow

-- Visual wind chime (no audio — waiting on Perplexity)
local chimeAnchor = PartFactory.make({
	Name = "ChimeBar",
	Size = Vector3.new(2.5, 0.2, 0.2),
	Position = Vector3.new(12, 11, 2),
	Color = Color3.fromRGB(160, 150, 130),
	Material = Enum.Material.Metal,
	CanCollide = false,
	Parent = world,
})
for i = 1, 5 do
	local home = Vector3.new(11 + i * 0.4, 10.2 - i * 0.1, 2)
	local tube = PartFactory.make({
		Name = "ChimeTube" .. i,
		Size = Vector3.new(0.2, 1.2 + i * 0.25, 0.2),
		Position = home,
		Color = Color3.fromRGB(180, 190, 200),
		Material = Enum.Material.Metal,
		CanCollide = false,
		Parent = world,
	})
	tube:SetAttribute("IsChime", true)
	tube:SetAttribute("HomePosition", home)
end
chimeAnchor.Parent = world

-- String lights under overhang
for i = 1, 9 do
	local t = (i - 1) / 8
	local bulb = PartFactory.make({
		Name = "StringLight" .. i,
		Size = Vector3.new(0.5, 0.5, 0.5),
		Position = Vector3.new(-12 + t * 24, 12.2, 8),
		Color = Color3.fromRGB(255, 220, 150),
		Material = Enum.Material.Neon,
		Shape = Enum.PartType.Ball,
		CanCollide = false,
		Parent = world,
	})
	local light = Instance.new("PointLight")
	light.Brightness = 1.1
	light.Range = 12
	light.Color = Color3.fromRGB(255, 210, 140)
	light.Parent = bulb
end

-- Warm porch lamp
local porchLamp = PartFactory.make({
	Name = "PorchLamp",
	Size = Vector3.new(1.2, 1.2, 1.2),
	Position = Vector3.new(-10, 5, -2),
	Color = Color3.fromRGB(255, 200, 140),
	Material = Enum.Material.Neon,
	Shape = Enum.PartType.Ball,
	CanCollide = false,
	Parent = world,
})
local porchLight = Instance.new("PointLight")
porchLight.Brightness = 2
porchLight.Range = 22
porchLight.Color = Color3.fromRGB(255, 200, 140)
porchLight.Parent = porchLamp

-- Firefly jar on the railing (decorative collect vibe)
PartFactory.make({
	Name = "JarBase",
	Size = Vector3.new(1.2, 0.3, 1.2),
	Position = Vector3.new(10, 3.2, 11),
	Color = Color3.fromRGB(90, 75, 55),
	Material = Enum.Material.Wood,
	Parent = world,
})
local jar = PartFactory.make({
	Name = "FireflyJar",
	Size = Vector3.new(1.4, 2, 1.4),
	Position = Vector3.new(10, 4.4, 11),
	Color = Color3.fromRGB(180, 220, 160),
	Material = Enum.Material.Glass,
	Transparency = 0.45,
	CanCollide = false,
	Parent = world,
})
local jarGlow = PartFactory.make({
	Name = "JarGlow",
	Size = Vector3.new(0.7, 0.7, 0.7),
	Position = Vector3.new(10, 4.2, 11),
	Color = Config.Firefly.Color,
	Material = Enum.Material.Neon,
	Shape = Enum.PartType.Ball,
	CanCollide = false,
	Parent = world,
})
local jarLight = Instance.new("PointLight")
jarLight.Brightness = 1.6
jarLight.Range = 10
jarLight.Color = Config.Firefly.Color
jarLight.Parent = jarGlow
jarGlow:SetAttribute("BaseSize", 0.7)
jar.Parent = world

local jarGui = Instance.new("SurfaceGui")
jarGui.Name = "JarFillGui"
jarGui.Face = Enum.NormalId.Front
jarGui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud
jarGui.PixelsPerStud = 50
jarGui.Parent = jar
local jarLabel = Instance.new("TextLabel")
jarLabel.Name = "JarFillLabel"
jarLabel.Size = UDim2.fromScale(1, 1)
jarLabel.BackgroundTransparency = 1
jarLabel.Font = Enum.Font.GothamMedium
jarLabel.TextSize = 18
jarLabel.TextWrapped = true
jarLabel.TextColor3 = Color3.fromRGB(210, 255, 180)
jarLabel.Text = "jar\nempty"
jarLabel.Parent = jarGui

local function refreshJarFill()
	local fill = math.clamp(sessionFlies / JAR_FILL_CAP, 0, 1)
	local base = jarGlow:GetAttribute("BaseSize")
	local baseN = if typeof(base) == "number" then base else 0.7
	local size = baseN + fill * 1.1
	jarGlow.Size = Vector3.new(size, size, size)
	jarLight.Brightness = 1.4 + fill * 2.4
	jarLight.Range = 10 + fill * 14
	jar.Transparency = 0.5 - fill * 0.25
	if fill <= 0 then
		jarLabel.Text = "jar\nempty"
	elseif fill < 0.5 then
		jarLabel.Text = ("jar\n%d/%d"):format(sessionFlies, JAR_FILL_CAP)
	elseif fill < 1 then
		jarLabel.Text = "jar\nhalf"
	else
		jarLabel.Text = "jar\nfull"
	end
	local pathGlow = world:FindFirstChild("YardPathGlow")
	if pathGlow and pathGlow:IsA("BasePart") then
		local pathLight = pathGlow:FindFirstChildOfClass("PointLight")
		if pathLight then
			pathLight.Brightness = 0.85 + fill * 0.9
			pathLight.Range = 12 + fill * 8
		end
		pathGlow.Transparency = 0.55 - fill * 0.2
	end
end

-- Dual rocking chairs (Seats)
local function makeSeat(name: string, pos: Vector3, color: Color3): Seat
	PartFactory.make({
		Name = name .. "Base",
		Size = Vector3.new(3, 1.2, 3),
		Position = pos,
		Color = color,
		Material = Enum.Material.Wood,
		Parent = world,
	})
	PartFactory.make({
		Name = name .. "Back",
		Size = Vector3.new(3, 2.5, 0.5),
		Position = pos + Vector3.new(0, 1.5, -1.2),
		Color = Color3.fromRGB(95, 70, 48),
		Material = Enum.Material.Wood,
		Parent = world,
	})
	local seat = Instance.new("Seat")
	seat.Name = name
	seat.Size = Vector3.new(2.2, 0.4, 2)
	seat.Position = pos + Vector3.new(0, 0.9, 0.2)
	seat.Anchored = true
	seat.Color = Color3.fromRGB(120, 90, 70)
	seat.Parent = world
	return seat
end

local rockerL = makeSeat("RockerL", Vector3.new(-6, 2.5, 2), Color3.fromRGB(110, 80, 55))
local rockerR = makeSeat("RockerR", Vector3.new(-2, 2.5, 2), Color3.fromRGB(105, 78, 52))
rockerL:SetAttribute("IsRocker", true)
rockerL:SetAttribute("HomePosition", rockerL.Position)
rockerR:SetAttribute("IsRocker", true)
rockerR:SetAttribute("HomePosition", rockerR.Position)

-- Porch swing (hanging seat)
PartFactory.make({
	Name = "SwingBeam",
	Size = Vector3.new(8, 0.5, 0.5),
	Position = Vector3.new(8, 12, 6),
	Color = Color3.fromRGB(70, 55, 40),
	Material = Enum.Material.Wood,
	Parent = world,
})
for _, x in { 5, 11 } do
	local rope = PartFactory.make({
		Name = "SwingRope" .. x,
		Size = Vector3.new(0.15, 6, 0.15),
		Position = Vector3.new(x, 8.5, 6),
		Color = Color3.fromRGB(90, 80, 70),
		CanCollide = false,
		Parent = world,
	})
	rope:SetAttribute("IsSwing", true)
	rope:SetAttribute("HomePosition", rope.Position)
end
local swingBoard = PartFactory.make({
	Name = "SwingBoard",
	Size = Vector3.new(5, 0.4, 2),
	Position = Vector3.new(8, 5.5, 6),
	Color = Color3.fromRGB(120, 95, 65),
	Material = Enum.Material.Wood,
	Parent = world,
})
swingBoard:SetAttribute("IsSwing", true)
swingBoard:SetAttribute("HomePosition", swingBoard.Position)
local swing = Instance.new("Seat")
swing.Name = "PorchSwing"
swing.Size = Vector3.new(3.5, 0.4, 1.6)
swing.Position = Vector3.new(8, 5.9, 6.2)
swing.Anchored = true
swing.Color = Color3.fromRGB(140, 110, 80)
swing.Parent = world
swing:SetAttribute("IsSwing", true)
swing:SetAttribute("HomePosition", swing.Position)

-- Soft sit sync
local SoftWireSeats = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftWireSeats"))
SoftWireSeats.wire(rockerL, Remotes.SitChanged)
SoftWireSeats.wire(rockerR, Remotes.SitChanged)
SoftWireSeats.wire(swing, Remotes.SitChanged)

-- Soft moon
local moon = PartFactory.make({
	Name = "Moon",
	Size = Vector3.new(14, 14, 14),
	Position = Vector3.new(-40, 55, -60),
	Color = Color3.fromRGB(230, 235, 255),
	Material = Enum.Material.Neon,
	Shape = Enum.PartType.Ball,
	CanCollide = false,
	Transparency = 0.15,
	Parent = world,
})
local moonLight = Instance.new("PointLight")
moonLight.Brightness = 1.2
moonLight.Range = 80
moonLight.Color = Color3.fromRGB(200, 210, 255)
moonLight.Parent = moon

-- Distant soft stars (decorative)
for i = 1, 40 do
	local angle = math.random() * math.pi * 2
	local dist = 50 + math.random() * 40
	local y = 25 + math.random() * 30
	PartFactory.make({
		Name = "SkyStar" .. i,
		Size = Vector3.new(0.6, 0.6, 0.6),
		Position = Vector3.new(math.cos(angle) * dist, y, math.sin(angle) * dist - 10),
		Color = Color3.fromRGB(220, 230, 255),
		Material = Enum.Material.Neon,
		Shape = Enum.PartType.Ball,
		CanCollide = false,
		Transparency = 0.2,
		Parent = world,
	})
end

-- Collectible fireflies
local fireflies: { BasePart } = {}
for i = 1, Config.Firefly.Count do
	local angle = (i / Config.Firefly.Count) * math.pi * 2
	local radius = 10 + (i % 4) * 3
	local home = Vector3.new(math.cos(angle) * radius, 3 + (i % 3), 6 + math.sin(angle) * radius * 0.6)
	local fly = PartFactory.make({
		Name = "Firefly" .. i,
		Size = Vector3.new(0.7, 0.7, 0.7),
		Position = home,
		Color = Config.Firefly.Color,
		Material = Enum.Material.Neon,
		Shape = Enum.PartType.Ball,
		CanCollide = false,
		Parent = world,
	})
	fly:SetAttribute("IsFirefly", true)
	fly:SetAttribute("HomePosition", home)
	local light = Instance.new("PointLight")
	light.Brightness = 2.2
	light.Range = 8
	light.Color = Config.Firefly.Color
	light.Parent = fly
	table.insert(fireflies, fly)

	fly.Touched:Connect(function(hit)
		if fly:GetAttribute("Collected") then
			return
		end
		local character = hit:FindFirstAncestorOfClass("Model")
		local player = character and Players:GetPlayerFromCharacter(character)
		if not player then
			return
		end
		fly:SetAttribute("Collected", true)
		fly.Transparency = 1
		fly.CanTouch = false
		counts[player.UserId] = (counts[player.UserId] or 0) + 1
		sessionFlies += 1
		refreshJarFill()
		Remotes.FireflyCollected:FireClient(player, counts[player.UserId])
		Remotes.JarFillChanged:FireAllClients(sessionFlies, JAR_FILL_CAP)
		task.delay(Config.Firefly.RespawnSeconds, function()
			if not fly.Parent then
				return
			end
			fly:SetAttribute("Collected", false)
			fly.Transparency = 0
			fly.CanTouch = true
		end)
	end)
end

-- Firefly drift + soft chime sway
task.spawn(function()
	local t = 0
	while true do
		t += task.wait(0.04)
		for i, fly in fireflies do
			if fly:GetAttribute("Collected") then
				continue
			end
			local home = fly:GetAttribute("HomePosition")
			if typeof(home) == "Vector3" then
				fly.Position = home
					+ Vector3.new(
						math.sin(t * 1.3 + i) * 1.4,
						math.sin(t * 2.1 + i * 0.7) * 1.1,
						math.cos(t * 1.1 + i) * 1.2
					)
			end
		end
		for _, child in world:GetChildren() do
			if child:IsA("BasePart") and child:GetAttribute("IsChime") then
				local home = child:GetAttribute("HomePosition")
				if typeof(home) == "Vector3" then
					local sway = math.sin(t * 1.4 + home.X) * 0.15
					child.CFrame = CFrame.new(home + Vector3.new(sway, 0, sway * 0.4))
						* CFrame.Angles(0, 0, math.sin(t * 1.6 + home.X) * 0.08)
				end
			elseif child.Name == "JarGlow" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					local fill = math.clamp(sessionFlies / JAR_FILL_CAP, 0, 1)
					light.Brightness = (1.4 + fill * 2.4) + math.sin(t * 3) * (0.35 + fill * 0.25)
				end
			elseif child.Name == "FireflyJar" and child:IsA("BasePart") then
				local fill = math.clamp(sessionFlies / JAR_FILL_CAP, 0, 1)
				child.Transparency = (0.5 - fill * 0.25) + math.sin(t * 1.5) * 0.06
			elseif child.Name == "Moon" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 1.0 + math.sin(t * 0.4) * 0.25
				end
				child.Transparency = 0.12 + math.sin(t * 0.35) * 0.04
			elseif child.Name == "WarmMug" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 0.4 + math.sin(t * 2.2) * 0.25
				end
			elseif child.Name == "SideTable" and child:IsA("BasePart") then
				local warm = (math.sin(t * 0.9) + 1) / 2
				child.Color = Color3.fromRGB(85, 65, 48):Lerp(Color3.fromRGB(110, 85, 60), warm * 0.45)
			elseif child.Name == "Deck" and child:IsA("BasePart") then
				local warm = (math.sin(t * 0.5) + 1) / 2
				child.Color = Color3.fromRGB(90, 70, 50):Lerp(Color3.fromRGB(110, 85, 60), warm * 0.35)
			elseif child.Name == "RoofOverhang" and child:IsA("BasePart") then
				local cool = (math.sin(t * 0.4) + 1) / 2
				child.Color = Color3.fromRGB(45, 40, 50):Lerp(Color3.fromRGB(60, 52, 68), cool * 0.4)
			elseif child.Name == "HouseWall" and child:IsA("BasePart") then
				local warm = (math.sin(t * 0.35) + 1) / 2
				child.Color = Color3.fromRGB(70, 58, 48):Lerp(Color3.fromRGB(90, 72, 58), warm * 0.35)
			elseif child.Name == "FirePitGlow" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 1.4 + math.sin(t * 2.8) * 0.45
				end
				child.Transparency = 0.22 + math.sin(t * 3.1) * 0.06
			elseif child.Name == "FirePitRing" and child:IsA("BasePart") then
				local warm = (math.sin(t * 2.8) + 1) / 2
				child.Color = Color3.fromRGB(70, 65, 60):Lerp(Color3.fromRGB(95, 75, 55), warm * 0.5)
			elseif child.Name == "YardPathGlow" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 0.85 + math.sin(t * 1.25) * 0.3
				end
				child.Transparency = 0.5 + math.sin(t * 1.25) * 0.1
			elseif child.Name == "PorchLamp" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 1.8 + math.sin(t * 1.3) * 0.4
				end
			elseif string.find(child.Name, "StringLight", 1, true) and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 0.95 + math.sin(t * 2.1 + child.Position.X) * 0.35
				end
			elseif string.find(child.Name, "SkyStar", 1, true) and child:IsA("BasePart") then
				child.Transparency = 0.15 + math.sin(t * 1.8 + child.Position.X) * 0.2
			elseif string.find(child.Name, "Bush", 1, true) and child:IsA("BasePart") then
				local home = child:GetAttribute("HomePosition")
				if typeof(home) == "Vector3" then
					child.Position = home + Vector3.new(0, math.sin(t * 0.7 + home.X) * 0.08, 0)
				end
			elseif child:IsA("BasePart") and child:GetAttribute("IsRocker") then
				local home = child:GetAttribute("HomePosition")
				if typeof(home) == "Vector3" then
					local sway = math.sin(t * 0.7 + home.X) * 0.08
					child.Position = home + Vector3.new(0, 0, sway)
				end
			elseif child:IsA("BasePart") and child:GetAttribute("IsSwing") then
				local home = child:GetAttribute("HomePosition")
				if typeof(home) == "Vector3" then
					local sway = math.sin(t * 0.9) * 0.35
					child.Position = home + Vector3.new(sway, 0, 0)
				end
			end
		end
	end
end)

local spawn = Instance.new("SpawnLocation")
spawn.Name = "PorchSpawn"
spawn.Size = Vector3.new(6, 1, 6)
spawn.Position = Config.Spawn
spawn.Anchored = true
spawn.Neutral = true
spawn.Duration = 0
spawn.Transparency = 0.5
spawn.Color = Color3.fromRGB(90, 70, 50)
spawn.Parent = world

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

print("[StarPorch] server ready —", Config.Tagline)
