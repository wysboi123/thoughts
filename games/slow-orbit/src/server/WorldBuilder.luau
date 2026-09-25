--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))

local WorldBuilder = {}

local function clearBase()
	for _, name in { "Baseplate", "SpawnLocation" } do
		local inst = Workspace:FindFirstChild(name)
		if inst then
			inst:Destroy()
		end
	end
end

local function makeSphere(name: string, radius: number, position: Vector3, color: Color3): Part
	local part = Instance.new("Part")
	part.Name = name
	part.Shape = Enum.PartType.Ball
	part.Size = Vector3.new(radius * 2, radius * 2, radius * 2)
	part.Position = position
	part.Anchored = true
	part.Color = color
	part.Material = Enum.Material.Slate
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	part.Parent = Workspace
	return part
end

local function attachTrail(part: BasePart, color: Color3, trailEnd: Color3?)
	local a0 = Instance.new("Attachment")
	a0.Name = "TrailA0"
	a0.Position = Vector3.new(0, 0.4, 0)
	a0.Parent = part
	local a1 = Instance.new("Attachment")
	a1.Name = "TrailA1"
	a1.Position = Vector3.new(0, -0.4, 0)
	a1.Parent = part

	local endColor = trailEnd or Config.Bead.TrailEnd
	local trail = Instance.new("Trail")
	trail.Name = "BeadTrail"
	trail.Attachment0 = a0
	trail.Attachment1 = a1
	trail.Lifetime = Config.Bead.TrailLifetime
	trail.MinLength = 0.1
	trail.FaceCamera = true
	trail.Color = ColorSequence.new(color, endColor)
	trail.Transparency = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 0.15),
		NumberSequenceKeypoint.new(1, 1),
	})
	trail.WidthScale = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 1),
		NumberSequenceKeypoint.new(1, 0.1),
	})
	trail.LightEmission = 0.7
	trail.Parent = part
end

function WorldBuilder.surfacePoint(center: Vector3, radius: number, dir: Vector3, height: number): Vector3
	return center + dir.Unit * (radius + height)
end

function WorldBuilder.build(): (Part, Part, Folder)
	clearBase()

	local planet = makeSphere("Planet", Config.Planet.Radius, Config.Planet.Center, Config.Planet.Color)
	local planetLight = Instance.new("PointLight")
	planetLight.Brightness = 1.2
	planetLight.Range = Config.Planet.Radius * 3
	planetLight.Color = Color3.fromRGB(90, 120, 200)
	planetLight.Parent = planet

	local moonCenter = Config.Planet.Center + Config.Moonlet.Offset
	local moonlet = makeSphere("Moonlet", Config.Moonlet.Radius, moonCenter, Config.Moonlet.Color)
	moonlet:SetAttribute("IsMoonlet", true)
	moonlet:SetAttribute("Center", moonCenter)
	local moonLight = Instance.new("PointLight")
	moonLight.Brightness = 2
	moonLight.Range = Config.Moonlet.Radius * 4
	moonLight.Color = Color3.fromRGB(180, 160, 255)
	moonLight.Parent = moonlet

	-- Soft tether ribbon (visual only)
	local tether = Instance.new("Part")
	tether.Name = "OrbitTether"
	tether.Anchored = true
	tether.CanCollide = false
	tether.Material = Enum.Material.ForceField
	tether.Color = Color3.fromRGB(100, 120, 200)
	tether.Transparency = 0.7
	local mid = (Config.Planet.Center + moonCenter) / 2
	local dist = (moonCenter - Config.Planet.Center).Magnitude
	tether.Size = Vector3.new(0.6, 0.6, dist)
	tether.CFrame = CFrame.lookAt(mid, moonCenter)
	tether.Parent = Workspace

	local beadsFolder = Instance.new("Folder")
	beadsFolder.Name = "OrbitBeads"
	beadsFolder.Parent = Workspace

	local function spawnBeadRing(
		count: number,
		center: Vector3,
		radius: number,
		color: Color3,
		trailEnd: Color3,
		namePrefix: string
	)
		for i = 1, count do
			local theta = (i / count) * math.pi * 2
			local phi = 0.55 + (i % 4) * 0.28
			local dir = Vector3.new(
				math.sin(phi) * math.cos(theta),
				math.cos(phi),
				math.sin(phi) * math.sin(theta)
			)
			local pos = WorldBuilder.surfacePoint(center, radius, dir, Config.Bead.OrbitHeight)
			local bead = Instance.new("Part")
			bead.Name = namePrefix .. i
			bead.Shape = Enum.PartType.Ball
			bead.Size = Vector3.new(2, 2, 2)
			bead.Position = pos
			bead.Anchored = true
			bead.CanCollide = false
			bead.Color = color
			bead.Material = Enum.Material.Neon
			bead:SetAttribute("IsBead", true)
			bead:SetAttribute("HomePosition", pos)
			bead:SetAttribute("BodyCenter", center)
			bead.Parent = beadsFolder
			attachTrail(bead, color, trailEnd)

			local pl = Instance.new("PointLight")
			pl.Brightness = 2.5
			pl.Range = 12
			pl.Color = color
			pl.Parent = bead
		end
	end

	spawnBeadRing(
		Config.Bead.Count,
		Config.Planet.Center,
		Config.Planet.Radius,
		Config.Bead.Color,
		Config.Bead.TrailEnd,
		"OrbitBead"
	)
	spawnBeadRing(
		Config.Bead.MoonletCount,
		moonCenter,
		Config.Moonlet.Radius,
		Config.Bead.MoonletColor,
		Config.Bead.MoonletTrailEnd,
		"MoonBead"
	)

	-- Slow spin the moonlet beads' parent feel: rotate moonlet visually
	task.spawn(function()
		while moonlet.Parent do
			moonlet.CFrame = moonlet.CFrame * CFrame.Angles(0, 0.004, 0.001)
			task.wait(0.03)
		end
	end)

	return planet, moonlet, beadsFolder
end

return WorldBuilder
