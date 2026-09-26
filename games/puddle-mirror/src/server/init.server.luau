--!strict
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local dewCounts: { [number]: number } = {}
local puddleCooldown: { [number]: number } = {}
local unlockedRooms: { [string]: boolean } = {}

local function clearBase()
	for _, name in { "Baseplate", "SpawnLocation" } do
		local inst = Workspace:FindFirstChild(name)
		if inst then
			inst:Destroy()
		end
	end
end

local function makePart(props: {
	Name: string,
	Size: Vector3,
	Position: Vector3,
	Color: Color3,
	Material: Enum.Material?,
	Transparency: number?,
	CanCollide: boolean?,
	Shape: Enum.PartType?,
	Parent: Instance,
}): Part
	local p = Instance.new("Part")
	p.Name = props.Name
	p.Size = props.Size
	p.Position = props.Position
	p.Color = props.Color
	p.Material = props.Material or Enum.Material.SmoothPlastic
	p.Anchored = true
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

clearBase()
local world = Instance.new("Folder")
world.Name = "PuddleWorld"
world.Parent = Workspace

-- Mirror plaza floor
makePart({
	Name = "Plaza",
	Size = Vector3.new(64, 1, 64),
	Position = Vector3.new(0, 0, 0),
	Color = Color3.fromRGB(70, 90, 100),
	Material = Enum.Material.Glass,
	Transparency = 0.25,
	Parent = world,
})

local spawn = Instance.new("SpawnLocation")
spawn.Size = Vector3.new(6, 1, 6)
spawn.Position = Config.Spawn
spawn.Anchored = true
spawn.Neutral = true
spawn.Duration = 0
spawn.Transparency = 0.4
spawn.Color = Color3.fromRGB(120, 160, 180)
spawn.Parent = world

-- Secret nooks around the plaza (blocked by forcefield doors until unlocked)
local rooms = {
	{
		Id = "NorthNook",
		DoorPos = Vector3.new(0, 4, -28),
		RoomPos = Vector3.new(0, 2, -38),
		PuddlePos = Vector3.new(0, 1.05, -12),
	},
	{
		Id = "EastNook",
		DoorPos = Vector3.new(28, 4, 0),
		RoomPos = Vector3.new(38, 2, 0),
		PuddlePos = Vector3.new(12, 1.05, 0),
	},
	{
		Id = "WestNook",
		DoorPos = Vector3.new(-28, 4, 0),
		RoomPos = Vector3.new(-38, 2, 0),
		PuddlePos = Vector3.new(-12, 1.05, 0),
	},
}

local doors: { [string]: BasePart } = {}

for _, room in rooms do
	local door = makePart({
		Name = room.Id .. "Door",
		Size = Vector3.new(10, 8, 1),
		Position = room.DoorPos,
		Color = Color3.fromRGB(80, 120, 140),
		Material = Enum.Material.ForceField,
		Transparency = 0.3,
		Parent = world,
	})
	door:SetAttribute("RoomId", room.Id)
	doors[room.Id] = door

	makePart({
		Name = room.Id .. "Floor",
		Size = Vector3.new(14, 1, 14),
		Position = room.RoomPos,
		Color = Color3.fromRGB(55, 70, 80),
		Material = Enum.Material.Concrete,
		Parent = world,
	})

	local seat = Instance.new("Seat")
	seat.Name = room.Id .. "Seat"
	seat.Size = Vector3.new(2, 0.5, 2)
	seat.Position = room.RoomPos + Vector3.new(0, 1.2, 0)
	seat.Anchored = true
	seat.Color = Color3.fromRGB(100, 140, 160)
	seat.Parent = world

	local puddle = makePart({
		Name = room.Id .. "Puddle",
		Size = Vector3.new(7, 0.2, 7),
		Position = room.PuddlePos,
		Color = Config.Puddle.Color,
		Material = Enum.Material.Neon,
		CanCollide = false,
		Transparency = 0.2,
		Shape = Enum.PartType.Cylinder,
		Parent = world,
	})
	-- Cylinder default axis is Y; rotate flat
	puddle.Size = Vector3.new(0.25, 7, 7)
	puddle.CFrame = CFrame.new(room.PuddlePos) * CFrame.Angles(0, 0, math.rad(90))
	puddle:SetAttribute("IsPuddle", true)
	puddle:SetAttribute("RoomId", room.Id)

	local light = Instance.new("PointLight")
	light.Brightness = 1.5
	light.Range = 14
	light.Color = Config.Puddle.Color
	light.Parent = puddle
end

for i = 1, Config.Dew.Count do
	local angle = (i / Config.Dew.Count) * math.pi * 2
	local pos = Vector3.new(math.cos(angle) * 18, 3, math.sin(angle) * 18)
	local dew = makePart({
		Name = "Dew" .. i,
		Size = Vector3.new(1.6, 1.6, 1.6),
		Position = pos,
		Color = Config.Dew.Color,
		Material = Enum.Material.Neon,
		Shape = Enum.PartType.Ball,
		CanCollide = false,
		Parent = world,
	})
	dew:SetAttribute("IsDew", true)
	dew:SetAttribute("HomePosition", pos)
	local a0 = Instance.new("Attachment")
	a0.Position = Vector3.new(0, 0.3, 0)
	a0.Parent = dew
	local a1 = Instance.new("Attachment")
	a1.Position = Vector3.new(0, -0.3, 0)
	a1.Parent = dew
	local trail = Instance.new("Trail")
	trail.Attachment0 = a0
	trail.Attachment1 = a1
	trail.Lifetime = Config.Dew.TrailLifetime
	trail.FaceCamera = true
	trail.Color = ColorSequence.new(Config.Dew.Color, Color3.fromRGB(80, 120, 140))
	trail.Transparency = NumberSequence.new(0.2, 1)
	trail.LightEmission = 0.6
	trail.Parent = dew
	local light = Instance.new("PointLight")
	light.Brightness = 2
	light.Range = 10
	light.Color = Config.Dew.Color
	light.Parent = dew
end

-- Deep mirror room (locked until all three nooks open)
local deep = Config.DeepRoom
local deepDoor = makePart({
	Name = deep.Id .. "Door",
	Size = Vector3.new(10, 8, 1),
	Position = deep.DoorPos,
	Color = Color3.fromRGB(60, 100, 130),
	Material = Enum.Material.ForceField,
	Transparency = 0.2,
	Parent = world,
})
doors[deep.Id] = deepDoor
makePart({
	Name = deep.Id .. "Floor",
	Size = Vector3.new(16, 1, 16),
	Position = deep.RoomPos,
	Color = Color3.fromRGB(40, 55, 70),
	Material = Enum.Material.Marble,
	Parent = world,
})
local deepSeat = Instance.new("Seat")
deepSeat.Name = deep.Id .. "Seat"
deepSeat.Size = Vector3.new(2, 0.5, 2)
deepSeat.Position = deep.RoomPos + Vector3.new(0, 1.2, 0)
deepSeat.Anchored = true
deepSeat.Color = Color3.fromRGB(120, 180, 200)
deepSeat.Parent = world
local deepMist = makePart({
	Name = deep.Id .. "Mist",
	Size = Vector3.new(12, 10, 12),
	Position = deep.RoomPos + Vector3.new(0, 6, 0),
	Color = Color3.fromRGB(120, 160, 180),
	Material = Enum.Material.ForceField,
	CanCollide = false,
	Transparency = 0.7,
	Parent = world,
})
deepMist.CastShadow = false

local function unlockRoom(roomId: string, player: Player)
	if unlockedRooms[roomId] then
		return
	end
	unlockedRooms[roomId] = true
	local door = doors[roomId]
	if door then
		local tween = TweenService:Create(
			door,
			TweenInfo.new(1.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
			{ Transparency = 1, CanCollide = false }
		)
		tween:Play()
		task.delay(1.3, function()
			if door.Parent then
				door.CanCollide = false
			end
		end)
	end
	Remotes.RoomUnlocked:FireClient(player, roomId)

	-- Deep room opens when all three main nooks are unlocked
	local mainDone = unlockedRooms["NorthNook"] and unlockedRooms["EastNook"] and unlockedRooms["WestNook"]
	if mainDone and not unlockedRooms[Config.DeepRoom.Id] then
		unlockRoom(Config.DeepRoom.Id, player)
	end
end

local function onPuddle(puddle: BasePart, hit: BasePart)
	local character = hit:FindFirstAncestorOfClass("Model")
	local player = character and Players:GetPlayerFromCharacter(character)
	if not player then
		return
	end
	local now = os.clock()
	local last = puddleCooldown[player.UserId] or 0
	if now - last < Config.Puddle.RippleCooldown then
		return
	end
	puddleCooldown[player.UserId] = now

	Remotes.Ripple:FireAllClients(puddle.Position, Config.Puddle.Color)

	local roomId = puddle:GetAttribute("RoomId")
	if typeof(roomId) == "string" then
		unlockRoom(roomId, player)
	end
end

for _, child in world:GetChildren() do
	if child:IsA("BasePart") then
		if child:GetAttribute("IsPuddle") then
			child.Touched:Connect(function(hit)
				onPuddle(child, hit)
			end)
		elseif child:GetAttribute("IsDew") then
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
				dewCounts[player.UserId] = (dewCounts[player.UserId] or 0) + 1
				Remotes.DewCollected:FireClient(player, dewCounts[player.UserId])
				task.delay(Config.Dew.RespawnSeconds, function()
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

Players.PlayerAdded:Connect(function(player)
	dewCounts[player.UserId] = 0
	player.CharacterAdded:Connect(function(character)
		local root = character:WaitForChild("HumanoidRootPart", 5)
		if root and root:IsA("BasePart") then
			root.CFrame = CFrame.new(Config.Spawn + Vector3.new(0, 3, 0))
		end
	end)
end)

Players.PlayerRemoving:Connect(function(player)
	dewCounts[player.UserId] = nil
	puddleCooldown[player.UserId] = nil
end)

print("[PuddleMirror] server ready —", Config.Tagline)
