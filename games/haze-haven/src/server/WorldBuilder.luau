--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))

export type PartProps = {
	Name: string,
	Size: Vector3,
	Position: Vector3,
	Color: Color3,
	Material: Enum.Material?,
	Anchored: boolean?,
	CanCollide: boolean?,
	Shape: Enum.PartType?,
	Transparency: number?,
	Parent: Instance,
}

local WorldBuilder = {}

function WorldBuilder.makePart(props: PartProps): Part
	local part = Instance.new("Part")
	part.Name = props.Name
	part.Size = props.Size
	part.Position = props.Position
	part.Color = props.Color
	part.Material = props.Material or Enum.Material.SmoothPlastic
	part.Anchored = if props.Anchored == nil then true else props.Anchored
	part.CanCollide = if props.CanCollide == nil then true else props.CanCollide
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	if props.Shape then
		part.Shape = props.Shape
	end
	if props.Transparency then
		part.Transparency = props.Transparency
	end
	part.Parent = props.Parent
	return part
end

local function clearDefaultBase(workspace: Workspace)
	local base = workspace:FindFirstChild("Baseplate")
	if base then
		base:Destroy()
	end
	local spawn = workspace:FindFirstChild("SpawnLocation")
	if spawn then
		spawn:Destroy()
	end
end

local function addSeat(parent: Instance, name: string, position: Vector3, facing: Vector3?)
	local cushion = WorldBuilder.makePart({
		Name = name .. "_Cushion",
		Size = Vector3.new(4, 0.6, 4),
		Position = position,
		Color = Config.Sit.CushionColor,
		Material = Enum.Material.Fabric,
		Parent = parent,
	})

	local seat = Instance.new("Seat")
	seat.Name = name
	seat.Size = Vector3.new(2, 0.4, 2)
	seat.Position = position + Vector3.new(0, 0.5, 0)
	seat.Anchored = true
	seat.CanCollide = true
	seat.Color = Config.Sit.SeatColor
	seat.Material = Enum.Material.SmoothPlastic
	seat.TopSurface = Enum.SurfaceType.Smooth
	seat.BottomSurface = Enum.SurfaceType.Smooth
	if facing then
		seat.CFrame = CFrame.lookAt(seat.Position, seat.Position + facing)
	end
	seat.Parent = parent

	local light = Instance.new("PointLight")
	light.Brightness = 0.8
	light.Range = 8
	light.Color = Config.Sit.SeatColor
	light.Parent = cushion
end

function WorldBuilder.build(workspace: Workspace): Folder
	clearDefaultBase(workspace)

	local world = workspace:FindFirstChild("HazeWorld")
	if not world then
		world = Instance.new("Folder")
		world.Name = "HazeWorld"
		world.Parent = workspace
	end
	assert(world:IsA("Folder"))
	world:ClearAllChildren()

	WorldBuilder.makePart({
		Name = "LoungePad",
		Size = Config.Lounge.Size,
		Position = Vector3.new(0, 0, 0),
		Color = Config.Lounge.Color,
		Material = Config.Lounge.Material,
		Parent = world,
	})

	local rimY = 3
	local rimThickness = 2
	local half = Config.Lounge.Size.X / 2
	local rims = {
		{ Vector3.new(Config.Lounge.Size.X + rimThickness, 6, rimThickness), Vector3.new(0, rimY, half) },
		{ Vector3.new(Config.Lounge.Size.X + rimThickness, 6, rimThickness), Vector3.new(0, rimY, -half) },
		{ Vector3.new(rimThickness, 6, Config.Lounge.Size.Z), Vector3.new(half, rimY, 0) },
		{ Vector3.new(rimThickness, 6, Config.Lounge.Size.Z), Vector3.new(-half, rimY, 0) },
	}
	for i, rim in rims do
		WorldBuilder.makePart({
			Name = "Rim" .. i,
			Size = rim[1],
			Position = rim[2],
			Color = Color3.fromRGB(48, 40, 62),
			Transparency = 0.35,
			Parent = world,
		})
	end

	local spawn = Instance.new("SpawnLocation")
	spawn.Name = "HazeSpawn"
	spawn.Size = Vector3.new(8, 1, 8)
	spawn.Position = Config.Spawn
	spawn.Anchored = true
	spawn.CanCollide = true
	spawn.Neutral = true
	spawn.Duration = 0
	spawn.Color = Color3.fromRGB(90, 70, 120)
	spawn.Material = Enum.Material.Neon
	spawn.Parent = world

	local padPositions = {
		Vector3.new(14, 1.5, 10),
		Vector3.new(-12, 1.5, -8),
		Vector3.new(8, 1.5, -14),
		Vector3.new(-16, 1.5, 12),
		Vector3.new(0, 1.5, 18),
		Vector3.new(0, 12, -22),
	}
	for i, pos in padPositions do
		local pad = WorldBuilder.makePart({
			Name = "FloatPad" .. i,
			Size = Vector3.new(6, 1, 6),
			Position = pos,
			Color = Config.FloatPad.Color,
			Material = Enum.Material.Neon,
			Parent = world,
		})
		pad:SetAttribute("IsFloatPad", true)
		local light = Instance.new("PointLight")
		light.Brightness = 2
		light.Range = 16
		light.Color = Config.FloatPad.Color
		light.Parent = pad
	end

	local loftPos = Config.Loft.Position
	WorldBuilder.makePart({
		Name = "LoftPad",
		Size = Config.Loft.Size,
		Position = loftPos,
		Color = Config.Loft.Color,
		Material = Enum.Material.SmoothPlastic,
		Parent = world,
	})

	local ramp = WorldBuilder.makePart({
		Name = "LoftRamp",
		Size = Vector3.new(10, 1.2, Config.Loft.RampLength),
		Position = Vector3.new(0, loftPos.Y / 2, loftPos.Z / 2 - 4),
		Color = Color3.fromRGB(70, 60, 88),
		Parent = world,
	})
	local rise = loftPos.Y - 1
	local run = Config.Loft.RampLength
	local angle = math.atan2(rise, run)
	ramp.CFrame = CFrame.new(ramp.Position) * CFrame.Angles(-angle, 0, 0)

	local loftHalf = Config.Loft.Size.X / 2
	for i, offset in { loftHalf - 1, -(loftHalf - 1) } do
		WorldBuilder.makePart({
			Name = "LoftRail" .. i,
			Size = Vector3.new(1, 3, Config.Loft.Size.Z),
			Position = loftPos + Vector3.new(offset, 2, 0),
			Color = Color3.fromRGB(48, 40, 62),
			Transparency = 0.4,
			Parent = world,
		})
	end

	addSeat(world, "SitLoungeA", Vector3.new(10, 1.2, 8), Vector3.new(-1, 0, -0.3))
	addSeat(world, "SitLoungeB", Vector3.new(-10, 1.2, 6), Vector3.new(1, 0, -0.2))
	addSeat(world, "SitLoungeC", Vector3.new(6, 1.2, -10), Vector3.new(0, 0, 1))
	addSeat(world, "SitLoftA", loftPos + Vector3.new(6, 1.1, 4), Vector3.new(-0.5, 0, -1))
	addSeat(world, "SitLoftB", loftPos + Vector3.new(-6, 1.1, 2), Vector3.new(0.5, 0, -1))
	addSeat(world, "SitLoftC", loftPos + Vector3.new(0, 1.1, -6), Vector3.new(0, 0, 1))

	local orbPositions = {
		Vector3.new(10, 4, 6),
		Vector3.new(-8, 5, -10),
		Vector3.new(16, 4.5, -6),
		Vector3.new(-14, 5.5, 4),
		Vector3.new(4, 6, -16),
		Vector3.new(-4, 4.5, 14),
		Vector3.new(18, 5, 14),
		Vector3.new(-18, 4, -14),
		loftPos + Vector3.new(8, 3, 0),
		loftPos + Vector3.new(-8, 3.5, -4),
		loftPos + Vector3.new(0, 4, 8),
		loftPos + Vector3.new(4, 3, -8),
	}
	for i, pos in orbPositions do
		local orb = WorldBuilder.makePart({
			Name = "VibeOrb" .. i,
			Size = Vector3.new(2.2, 2.2, 2.2),
			Position = pos,
			Color = Config.Orb.Color,
			Material = Enum.Material.Neon,
			Shape = Enum.PartType.Ball,
			CanCollide = false,
			Parent = world,
		})
		orb:SetAttribute("IsVibeOrb", true)
		orb:SetAttribute("HomePosition", pos)
		local light = Instance.new("PointLight")
		light.Brightness = 3
		light.Range = 14
		light.Color = Config.Orb.Color
		light.Parent = orb
	end

	local mist = WorldBuilder.makePart({
		Name = "MistColumn",
		Size = Vector3.new(10, 28, 10),
		Position = Vector3.new(0, 16, 0),
		Color = Color3.fromRGB(160, 130, 200),
		Material = Enum.Material.ForceField,
		CanCollide = false,
		Transparency = 0.55,
		Parent = world,
	})
	mist.CastShadow = false

	local loftMist = WorldBuilder.makePart({
		Name = "LoftMist",
		Size = Vector3.new(16, 8, 16),
		Position = loftPos + Vector3.new(0, 8, 0),
		Color = Color3.fromRGB(140, 120, 190),
		Material = Enum.Material.ForceField,
		CanCollide = false,
		Transparency = 0.65,
		Parent = world,
	})
	loftMist.CastShadow = false

	-- Loft hammock (two posts + soft seat)
	local hammockY = loftPos.Y + 2.2
	WorldBuilder.makePart({
		Name = "HammockPostL",
		Size = Vector3.new(0.6, 5, 0.6),
		Position = loftPos + Vector3.new(-8, 3.5, 8),
		Color = Color3.fromRGB(70, 55, 45),
		Material = Enum.Material.Wood,
		Parent = world,
	})
	WorldBuilder.makePart({
		Name = "HammockPostR",
		Size = Vector3.new(0.6, 5, 0.6),
		Position = loftPos + Vector3.new(8, 3.5, 8),
		Color = Color3.fromRGB(70, 55, 45),
		Material = Enum.Material.Wood,
		Parent = world,
	})
	WorldBuilder.makePart({
		Name = "HammockCloth",
		Size = Vector3.new(14, 0.35, 4),
		Position = Vector3.new(loftPos.X, hammockY, loftPos.Z + 8),
		Color = Color3.fromRGB(160, 120, 180),
		Material = Enum.Material.Fabric,
		Parent = world,
	})
	local hammockSeat = Instance.new("Seat")
	hammockSeat.Name = "HammockSeat"
	hammockSeat.Size = Vector3.new(4, 0.4, 2)
	hammockSeat.Position = Vector3.new(loftPos.X, hammockY + 0.5, loftPos.Z + 8)
	hammockSeat.Anchored = true
	hammockSeat.Color = Color3.fromRGB(180, 140, 200)
	hammockSeat.Material = Enum.Material.Fabric
	hammockSeat.Parent = world

	-- Soft vibe board (SurfaceGui filled by client from VibeBoard remote)
	local vibeBoard = WorldBuilder.makePart({
		Name = "VibeBoard",
		Size = Vector3.new(10, 6, 0.4),
		Position = Vector3.new(0, 6, 22),
		Color = Color3.fromRGB(40, 32, 55),
		Parent = world,
	})
	local boardGui = Instance.new("SurfaceGui")
	boardGui.Name = "VibeBoardGui"
	boardGui.Face = Enum.NormalId.Front
	boardGui.Parent = vibeBoard
	local boardTitle = Instance.new("TextLabel")
	boardTitle.Size = UDim2.new(1, 0, 0.2, 0)
	boardTitle.BackgroundTransparency = 1
	boardTitle.Font = Enum.Font.GothamMedium
	boardTitle.TextSize = 28
	boardTitle.TextColor3 = Color3.fromRGB(230, 200, 255)
	boardTitle.Text = "tonight's vibes"
	boardTitle.Parent = boardGui
	local boardBody = Instance.new("TextLabel")
	boardBody.Name = "BoardBody"
	boardBody.Position = UDim2.new(0, 0, 0.22, 0)
	boardBody.Size = UDim2.new(1, -20, 0.7, 0)
	boardBody.BackgroundTransparency = 1
	boardBody.Font = Enum.Font.Gotham
	boardBody.TextSize = 22
	boardBody.TextYAlignment = Enum.TextYAlignment.Top
	boardBody.TextColor3 = Color3.fromRGB(200, 180, 230)
	boardBody.Text = "collect orbs · soft ranks only"
	boardBody.Parent = boardGui

	return world
end

return WorldBuilder
