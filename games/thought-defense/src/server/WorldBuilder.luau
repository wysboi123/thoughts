--!strict
-- Builds the soft mindscape into Studio Workspace folders (Path, Pads, Decor, Peace Core).

local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local PartFactory = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("PartFactory"))

local WorldBuilder = {}

local function ensureFolder(parent: Instance, name: string): Folder
	local existing = parent:FindFirstChild(name)
	if existing and existing:IsA("Folder") then
		return existing
	end
	if existing then
		existing:Destroy()
	end
	local folder = Instance.new("Folder")
	folder.Name = name
	folder.Parent = parent
	return folder
end

function WorldBuilder.build(): {
	world: Folder,
	pathFolder: Folder,
	padsFolder: Folder,
	towersFolder: Folder,
	enemiesFolder: Folder,
	core: BasePart,
	waypoints: { Vector3 },
	pads: { BasePart },
}
	PartFactory.clearDefaults(Workspace)

	local world = ensureFolder(Workspace, "ThoughtWorld")
	local pathFolder = ensureFolder(world, "Path")
	local padsFolder = ensureFolder(world, "Pads")
	local towersFolder = ensureFolder(world, "Towers")
	local enemiesFolder = ensureFolder(world, "Enemies")
	local decor = ensureFolder(world, "Decor")

	-- Clear prior runtime builds (keep empty Studio folders from project.json)
	for _, folder in { pathFolder, padsFolder, towersFolder, enemiesFolder, decor } do
		for _, child in folder:GetChildren() do
			child:Destroy()
		end
	end

	-- Soft ground plane (mindscape)
	PartFactory.make({
		Name = "MindFloor",
		Size = Vector3.new(120, 1, 100),
		Position = Vector3.new(0, 0, 0),
		Color = Color3.fromRGB(210, 215, 230),
		Material = Enum.Material.SmoothPlastic,
		Parent = decor,
	})

	-- Soft sky islands / decor blobs
	for i, pos in {
		Vector3.new(-50, 14, -30),
		Vector3.new(48, 18, 22),
		Vector3.new(-8, 22, 40),
	} do
		local cloud = PartFactory.make({
			Name = "SoftCloud" .. i,
			Size = Vector3.new(16, 5, 12),
			Position = pos,
			Color = Color3.fromRGB(230, 235, 250),
			Material = Enum.Material.SmoothPlastic,
			CanCollide = false,
			Transparency = 0.25,
			Parent = decor,
		})
		cloud.CastShadow = false
	end

	local points = Config.Path.Points
	local waypoints: { Vector3 } = table.clone(points)

	-- Path segments between waypoints (length along local -Z from lookAt)
	for i = 1, #points - 1 do
		local a = points[i]
		local b = points[i + 1]
		local mid = (a + b) / 2
		local flat = Vector3.new(b.X - a.X, 0, b.Z - a.Z)
		local length = math.max(flat.Magnitude, 1)
		local seg = PartFactory.make({
			Name = "PathSeg" .. i,
			Size = Vector3.new(Config.Path.Width, 0.6, length + 0.4),
			Position = mid,
			Color = Config.Path.Color,
			Material = Enum.Material.SmoothPlastic,
			Parent = pathFolder,
		})
		if flat.Magnitude > 0.01 then
			seg.CFrame = CFrame.lookAt(mid, mid + flat)
		end
		-- Soft edge rails — clarify the lane without clutter
		local halfW = Config.Path.Width * 0.5 + 0.35
		for side = -1, 1, 2 do
			local rail = PartFactory.make({
				Name = "PathRail" .. i .. (if side < 0 then "L" else "R"),
				Size = Vector3.new(0.35, 0.45, length + 0.2),
				Position = mid,
				Color = Color3.fromRGB(145, 160, 195),
				Material = Enum.Material.SmoothPlastic,
				CanCollide = false,
				Transparency = 0.35,
				Parent = pathFolder,
			})
			if flat.Magnitude > 0.01 then
				local look = CFrame.lookAt(mid, mid + flat)
				rail.CFrame = look * CFrame.new(side * halfW, 0.15, 0)
			end
		end
	end
	-- Waypoint discs for readability
	for i, p in points do
		local disc = PartFactory.make({
			Name = "Waypoint" .. i,
			Size = Vector3.new(0.35, Config.Path.Width * 0.85, Config.Path.Width * 0.85),
			Position = p,
			Color = Color3.fromRGB(150, 165, 200),
			Material = Enum.Material.SmoothPlastic,
			Shape = Enum.PartType.Cylinder,
			Parent = pathFolder,
		})
		disc.Orientation = Vector3.new(0, 0, 90)
	end

	-- Entrance marker
	local entrance = PartFactory.make({
		Name = "MindEntrance",
		Size = Vector3.new(8, 6, 1.2),
		Position = points[1] + Vector3.new(0, 3, 0),
		Color = Color3.fromRGB(100, 80, 130),
		Material = Enum.Material.Neon,
		CanCollide = false,
		Transparency = 0.35,
		Parent = decor,
	})
	local entranceLight = Instance.new("PointLight")
	entranceLight.Color = Color3.fromRGB(140, 100, 180)
	entranceLight.Brightness = 1.2
	entranceLight.Range = 18
	entranceLight.Parent = entrance

	local billboard = Instance.new("BillboardGui")
	billboard.Size = UDim2.fromOffset(160, 40)
	billboard.StudsOffset = Vector3.new(0, 4, 0)
	billboard.AlwaysOnTop = true
	billboard.Parent = entrance
	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Text = "noise enters here"
	label.TextColor3 = Color3.fromRGB(230, 220, 255)
	label.TextScaled = true
	label.Font = Enum.Font.GothamMedium
	label.Parent = billboard

	-- Peace Core (leak target)
	local corePos = points[#points]
	local core = PartFactory.make({
		Name = "PeaceCore",
		Size = Vector3.new(7, 7, 7),
		Position = corePos + Vector3.new(0, 3, 0),
		Color = Color3.fromRGB(160, 230, 220),
		Material = Enum.Material.Neon,
		Shape = Enum.PartType.Ball,
		CanCollide = false,
		Parent = decor,
	})
	local coreLight = Instance.new("PointLight")
	coreLight.Color = Color3.fromRGB(160, 240, 230)
	coreLight.Brightness = 2
	coreLight.Range = 24
	coreLight.Parent = core

	-- Soft halo ring under the core (readability + calm glow)
	local halo = PartFactory.make({
		Name = "PeaceHalo",
		Size = Vector3.new(0.4, 14, 14),
		Position = corePos + Vector3.new(0, 0.4, 0),
		Color = Color3.fromRGB(140, 220, 210),
		Material = Enum.Material.Neon,
		Shape = Enum.PartType.Cylinder,
		CanCollide = false,
		Transparency = 0.55,
		Parent = decor,
	})
	halo.Orientation = Vector3.new(0, 0, 90)
	halo.CastShadow = false

	local coreGui = Instance.new("BillboardGui")
	coreGui.Size = UDim2.fromOffset(140, 36)
	coreGui.StudsOffset = Vector3.new(0, 5, 0)
	coreGui.AlwaysOnTop = true
	coreGui.Parent = core
	local coreLabel = Instance.new("TextLabel")
	coreLabel.Size = UDim2.fromScale(1, 1)
	coreLabel.BackgroundTransparency = 1
	coreLabel.Text = "Peace Core"
	coreLabel.TextColor3 = Color3.fromRGB(220, 255, 250)
	coreLabel.TextScaled = true
	coreLabel.Font = Enum.Font.GothamBold
	coreLabel.Parent = coreGui

	-- Soft pulse on core + halo
	task.spawn(function()
		local t = 0
		while core.Parent do
			t += task.wait(0.05)
			coreLight.Brightness = 1.6 + math.sin(t * 1.4) * 0.5
			core.Transparency = 0.05 + math.sin(t * 0.9) * 0.05
			if halo.Parent then
				halo.Transparency = 0.5 + math.sin(t * 1.1) * 0.12
			end
		end
	end)

	-- Build pads
	local pads: { BasePart } = {}
	for i, pos in Config.Pads do
		local pad = PartFactory.make({
			Name = "Pad" .. i,
			Size = Vector3.new(5, 0.5, 5),
			Position = pos,
			Color = Color3.fromRGB(180, 210, 190),
			Material = Enum.Material.SmoothPlastic,
			Parent = padsFolder,
		})
		pad:SetAttribute("PadId", i)
		pad:SetAttribute("Occupied", false)
		local ring = PartFactory.make({
			Name = "PadRing",
			Size = Vector3.new(5.6, 0.2, 5.6),
			Position = pos + Vector3.new(0, 0.2, 0),
			Color = Color3.fromRGB(140, 200, 170),
			Material = Enum.Material.Neon,
			CanCollide = false,
			Transparency = 0.55,
			Parent = pad,
		})
		ring.Anchored = true
		table.insert(pads, pad)
	end

	-- Soft idle breath on empty pad rings (stops looking “dead” before plant)
	task.spawn(function()
		local t = 0
		while padsFolder.Parent do
			t += task.wait(0.08)
			local wave = 0.5 + 0.5 * math.sin(t * 1.35)
			for _, pad in pads do
				local ring = pad:FindFirstChild("PadRing")
				if ring and ring:IsA("BasePart") then
					if pad:GetAttribute("Occupied") == true then
						ring.Transparency = 0.72
					else
						ring.Transparency = 0.42 + wave * 0.22
					end
				end
			end
		end
	end)

	-- Spawn for the player (observer / gardener of thoughts)
	local spawn = Instance.new("SpawnLocation")
	spawn.Name = "PlayerSpawn"
	spawn.Size = Vector3.new(6, 1, 6)
	spawn.Position = Config.Spawn
	spawn.Anchored = true
	spawn.Neutral = true
	spawn.Duration = 0
	spawn.Color = Color3.fromRGB(150, 190, 180)
	spawn.Material = Enum.Material.SmoothPlastic
	spawn.Parent = decor

	return {
		world = world,
		pathFolder = pathFolder,
		padsFolder = padsFolder,
		towersFolder = towersFolder,
		enemiesFolder = enemiesFolder,
		core = core,
		waypoints = waypoints,
		pads = pads,
	}
end

return WorldBuilder
