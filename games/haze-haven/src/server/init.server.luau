--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local orbCounts: { [number]: number } = {}
local floatCooldown: { [number]: number } = {}

local function ensureBaseplateGone()
	local base = Workspace:FindFirstChild("Baseplate")
	if base then
		base:Destroy()
	end
	local spawn = Workspace:FindFirstChild("SpawnLocation")
	if spawn then
		spawn:Destroy()
	end
end

local function makePart(props: {
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
}): Part
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

local function buildWorld()
	ensureBaseplateGone()

	local world = Workspace:FindFirstChild("HazeWorld")
	if not world then
		world = Instance.new("Folder")
		world.Name = "HazeWorld"
		world.Parent = Workspace
	end
	world:ClearAllChildren()

	makePart({
		Name = "LoungePad",
		Size = Config.Lounge.Size,
		Position = Vector3.new(0, 0, 0),
		Color = Config.Lounge.Color,
		Material = Config.Lounge.Material,
		Parent = world,
	})

	-- Soft rim walls so players don't walk into void immediately
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
		makePart({
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
	}

	for i, pos in padPositions do
		local pad = makePart({
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

	local orbPositions = {
		Vector3.new(10, 4, 6),
		Vector3.new(-8, 5, -10),
		Vector3.new(16, 4.5, -6),
		Vector3.new(-14, 5.5, 4),
		Vector3.new(4, 6, -16),
		Vector3.new(-4, 4.5, 14),
		Vector3.new(18, 5, 14),
		Vector3.new(-18, 4, -14),
	}

	for i, pos in orbPositions do
		local orb = makePart({
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

	-- Central mist column (visual only)
	local mist = makePart({
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
end

local function getCount(player: Player): number
	return orbCounts[player.UserId] or 0
end

local function setCount(player: Player, value: number)
	orbCounts[player.UserId] = value
	Remotes.OrbCollected:FireClient(player, value)
end

local function onOrbTouched(orb: BasePart, hit: BasePart)
	if orb:GetAttribute("Collected") then
		return
	end
	local character = hit:FindFirstAncestorOfClass("Model")
	if not character then
		return
	end
	local player = Players:GetPlayerFromCharacter(character)
	if not player then
		return
	end

	orb:SetAttribute("Collected", true)
	orb.Transparency = 1
	orb.CanTouch = false
	local light = orb:FindFirstChildOfClass("PointLight")
	if light then
		light.Enabled = false
	end

	setCount(player, getCount(player) + Config.Orb.Value)

	task.delay(Config.Orb.RespawnSeconds, function()
		if not orb.Parent then
			return
		end
		orb:SetAttribute("Collected", false)
		orb.Transparency = 0
		orb.CanTouch = true
		if light then
			light.Enabled = true
		end
		local home = orb:GetAttribute("HomePosition")
		if typeof(home) == "Vector3" then
			orb.Position = home
		end
	end)
end

local function onFloatPadTouched(pad: BasePart, hit: BasePart)
	local character = hit:FindFirstAncestorOfClass("Model")
	if not character then
		return
	end
	local humanoidRoot = character:FindFirstChild("HumanoidRootPart")
	if not humanoidRoot or not humanoidRoot:IsA("BasePart") then
		return
	end
	local player = Players:GetPlayerFromCharacter(character)
	if not player then
		return
	end

	local now = os.clock()
	local last = floatCooldown[player.UserId] or 0
	if now - last < Config.FloatPad.Cooldown then
		return
	end
	floatCooldown[player.UserId] = now

	humanoidRoot.AssemblyLinearVelocity = Vector3.new(
		humanoidRoot.AssemblyLinearVelocity.X,
		Config.FloatPad.Boost,
		humanoidRoot.AssemblyLinearVelocity.Z
	)
	Remotes.FloatBoost:FireClient(player)
end

local function wireWorld()
	local world = Workspace:WaitForChild("HazeWorld")
	for _, child in world:GetChildren() do
		if child:IsA("BasePart") then
			if child:GetAttribute("IsVibeOrb") then
				child.Touched:Connect(function(hit)
					onOrbTouched(child, hit)
				end)
			elseif child:GetAttribute("IsFloatPad") then
				child.Touched:Connect(function(hit)
					onFloatPadTouched(child, hit)
				end)
			end
		end
	end
end

local function hoverOrbs()
	task.spawn(function()
		local t = 0
		while true do
			t += task.wait(0.03)
			local world = Workspace:FindFirstChild("HazeWorld")
			if not world then
				continue
			end
			for _, child in world:GetChildren() do
				if child:IsA("BasePart") and child:GetAttribute("IsVibeOrb") and not child:GetAttribute("Collected") then
					local home = child:GetAttribute("HomePosition")
					if typeof(home) == "Vector3" then
						local offset = math.sin(t * Config.Orb.HoverSpeed + child.Position.X) * Config.Orb.HoverHeight
						child.Position = home + Vector3.new(0, offset, 0)
						child.CFrame = child.CFrame * CFrame.Angles(0, 0.03, 0)
					end
				end
			end
		end
	end)
end

Players.PlayerAdded:Connect(function(player)
	setCount(player, 0)
	player.CharacterAdded:Connect(function(character)
		local root = character:WaitForChild("HumanoidRootPart", 5)
		if root and root:IsA("BasePart") then
			root.CFrame = CFrame.new(Config.Spawn + Vector3.new(0, 3, 0))
		end
	end)
end)

Players.PlayerRemoving:Connect(function(player)
	orbCounts[player.UserId] = nil
	floatCooldown[player.UserId] = nil
end)

buildWorld()
wireWorld()
hoverOrbs()

print("[HazeHaven] server ready —", Config.Tagline)
