--!strict
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local ticketCounts: { [number]: number } = {}

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
world.Name = "BusStopWorld"
world.Parent = Workspace

-- Sidewalk + road
part({
	Name = "Sidewalk",
	Size = Vector3.new(40, 1, 20),
	Position = Vector3.new(0, 0, 4),
	Color = Color3.fromRGB(90, 90, 95),
	Material = Enum.Material.Concrete,
	Parent = world,
})
part({
	Name = "Road",
	Size = Vector3.new(80, 1, 18),
	Position = Vector3.new(0, -0.2, -14),
	Color = Color3.fromRGB(40, 40, 45),
	Material = Enum.Material.Asphalt,
	Parent = world,
})

-- Shelter
part({
	Name = "ShelterRoof",
	Size = Vector3.new(18, 0.6, 10),
	Position = Vector3.new(0, 8, 2),
	Color = Color3.fromRGB(55, 60, 70),
	Parent = world,
})
part({
	Name = "ShelterPostL",
	Size = Vector3.new(0.8, 8, 0.8),
	Position = Vector3.new(-8, 4, 2),
	Color = Color3.fromRGB(70, 75, 85),
	Parent = world,
})
part({
	Name = "ShelterPostR",
	Size = Vector3.new(0.8, 8, 0.8),
	Position = Vector3.new(8, 4, 2),
	Color = Color3.fromRGB(70, 75, 85),
	Parent = world,
})
part({
	Name = "ShelterBack",
	Size = Vector3.new(18, 6, 0.4),
	Position = Vector3.new(0, 4, 6.5),
	Color = Color3.fromRGB(60, 65, 75),
	Transparency = 0.35,
	Material = Enum.Material.Glass,
	Parent = world,
})
local shelterGlow = part({
	Name = "ShelterGlow",
	Size = Vector3.new(14, 0.4, 6),
	Position = Vector3.new(0, 7.4, 2),
	Color = Color3.fromRGB(255, 230, 180),
	Material = Enum.Material.Neon,
	CanCollide = false,
	Transparency = 0.45,
	Parent = world,
})
local shelterLight = Instance.new("PointLight")
shelterLight.Brightness = 1.2
shelterLight.Range = 16
shelterLight.Color = Color3.fromRGB(255, 230, 180)
shelterLight.Parent = shelterGlow

-- Benches
for i, x in { -5, 5 } do
	part({
		Name = "Bench" .. i,
		Size = Vector3.new(6, 1, 2),
		Position = Vector3.new(x, 1.2, 3),
		Color = Color3.fromRGB(100, 80, 60),
		Material = Enum.Material.Wood,
		Parent = world,
	})
	local seat = Instance.new("Seat")
	seat.Name = "BenchSeat" .. i
	seat.Size = Vector3.new(4, 0.4, 1.5)
	seat.Position = Vector3.new(x, 1.9, 3)
	seat.Anchored = true
	seat.Color = Color3.fromRGB(120, 95, 70)
	seat.Parent = world
end

-- Soft street lamps
for i, pos in {
	Vector3.new(-14, 5, -2),
	Vector3.new(14, 5, -2),
	Vector3.new(28, 5, -1),
} do
	part({
		Name = "LampPole" .. i,
		Size = Vector3.new(0.5, 10, 0.5),
		Position = pos,
		Color = Color3.fromRGB(50, 52, 58),
		Material = Enum.Material.Metal,
		Parent = world,
	})
	local head = part({
		Name = "LampHead" .. i,
		Size = Vector3.new(2, 1, 2),
		Position = pos + Vector3.new(0, 5.5, 0),
		Color = Color3.fromRGB(255, 230, 170),
		Material = Enum.Material.Neon,
		CanCollide = false,
		Parent = world,
	})
	local light = Instance.new("PointLight")
	light.Brightness = 1.8
	light.Range = 28
	light.Color = Color3.fromRGB(255, 220, 160)
	light.Parent = head
end

-- Sidewalk planters
for i, x in { -16, 16 } do
	part({
		Name = "Planter" .. i,
		Size = Vector3.new(3, 1.2, 3),
		Position = Vector3.new(x, 1.1, 8),
		Color = Color3.fromRGB(70, 65, 60),
		Material = Enum.Material.Concrete,
		Parent = world,
	})
	local green = part({
		Name = "PlanterGreen" .. i,
		Size = Vector3.new(2.4, 2, 2.4),
		Position = Vector3.new(x, 2.6, 8),
		Color = Color3.fromRGB(55, 100, 65),
		Material = Enum.Material.Grass,
		Parent = world,
	})
	green:SetAttribute("HomePosition", green.Position)
end

-- Free newspaper box (decorative)
local news = part({
	Name = "NewsBox",
	Size = Vector3.new(2, 3, 1.5),
	Position = Vector3.new(-10, 2, 8),
	Color = Color3.fromRGB(50, 90, 70),
	Material = Enum.Material.Metal,
	Parent = world,
})
local newsGui = Instance.new("SurfaceGui")
newsGui.Face = Enum.NormalId.Front
newsGui.Parent = news
local newsLabel = Instance.new("TextLabel")
newsLabel.Size = UDim2.fromScale(1, 1)
newsLabel.BackgroundTransparency = 1
newsLabel.Font = Enum.Font.GothamMedium
newsLabel.TextSize = 18
newsLabel.TextWrapped = true
newsLabel.TextColor3 = Color3.fromRGB(220, 240, 210)
newsLabel.Text = "TODAY\n\nstill\nfree"
newsLabel.Parent = newsGui

-- Soft sidewalk puddle (visual only)
local sidewalkPuddle = part({
	Name = "SidewalkPuddle",
	Size = Vector3.new(0.15, 5, 5),
	Position = Vector3.new(4, 0.6, 6),
	Color = Color3.fromRGB(100, 130, 150),
	Material = Enum.Material.Glass,
	Transparency = 0.4,
	CanCollide = false,
	Shape = Enum.PartType.Cylinder,
	Parent = world,
})
sidewalkPuddle.CFrame = CFrame.new(4, 0.6, 6) * CFrame.Angles(0, 0, math.rad(90))
sidewalkPuddle:SetAttribute("IsPuddleGlow", true)

-- Timeless timetable board
local board = part({
	Name = "Timetable",
	Size = Vector3.new(6, 4, 0.4),
	Position = Vector3.new(-12, 4, 5),
	Color = Color3.fromRGB(35, 40, 50),
	Parent = world,
})
local gui = Instance.new("SurfaceGui")
gui.Face = Enum.NormalId.Front
gui.Parent = board
local label = Instance.new("TextLabel")
label.Size = UDim2.fromScale(1, 1)
label.BackgroundTransparency = 1
label.Font = Enum.Font.GothamMedium
label.TextSize = 28
label.TextColor3 = Color3.fromRGB(200, 220, 180)
label.Text = "NEXT BUS\nwhenever\n\nyou're already\non time"
label.Parent = gui

-- Second shelter further down the sidewalk
part({
	Name = "Shelter2Roof",
	Size = Vector3.new(12, 0.5, 8),
	Position = Vector3.new(28, 7, 3),
	Color = Color3.fromRGB(50, 55, 65),
	Parent = world,
})
part({
	Name = "Shelter2PostL",
	Size = Vector3.new(0.6, 7, 0.6),
	Position = Vector3.new(23, 3.5, 3),
	Color = Color3.fromRGB(65, 70, 80),
	Parent = world,
})
part({
	Name = "Shelter2PostR",
	Size = Vector3.new(0.6, 7, 0.6),
	Position = Vector3.new(33, 3.5, 3),
	Color = Color3.fromRGB(65, 70, 80),
	Parent = world,
})
local shelter2Glow = part({
	Name = "Shelter2Glow",
	Size = Vector3.new(9, 0.35, 5),
	Position = Vector3.new(28, 6.5, 3),
	Color = Color3.fromRGB(255, 230, 180),
	Material = Enum.Material.Neon,
	CanCollide = false,
	Transparency = 0.5,
	Parent = world,
})
local shelter2Light = Instance.new("PointLight")
shelter2Light.Brightness = 1.0
shelter2Light.Range = 14
shelter2Light.Color = Color3.fromRGB(255, 230, 180)
shelter2Light.Parent = shelter2Glow
part({
	Name = "BenchFar",
	Size = Vector3.new(5, 1, 2),
	Position = Vector3.new(28, 1.2, 3.5),
	Color = Color3.fromRGB(95, 75, 55),
	Material = Enum.Material.Wood,
	Parent = world,
})
local farSeat = Instance.new("Seat")
farSeat.Name = "BenchSeatFar"
farSeat.Size = Vector3.new(3.5, 0.4, 1.5)
farSeat.Position = Vector3.new(28, 1.9, 3.5)
farSeat.Anchored = true
farSeat.Color = Color3.fromRGB(115, 90, 65)
farSeat.Parent = world

local SoftWireSeats = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftWireSeats"))
SoftWireSeats.wireAll(world, Remotes.BenchSitChanged)

-- Community notepad board (rotating soft messages)
local notepad = part({
	Name = "NotepadBoard",
	Size = Vector3.new(5, 3.5, 0.35),
	Position = Vector3.new(12, 4, 5.5),
	Color = Color3.fromRGB(45, 42, 38),
	Parent = world,
})
local noteGui = Instance.new("SurfaceGui")
noteGui.Face = Enum.NormalId.Front
noteGui.Parent = notepad
local noteTitle = Instance.new("TextLabel")
noteTitle.Size = UDim2.new(1, 0, 0.25, 0)
noteTitle.BackgroundTransparency = 1
noteTitle.Font = Enum.Font.GothamMedium
noteTitle.TextSize = 22
noteTitle.TextColor3 = Color3.fromRGB(230, 210, 170)
noteTitle.Text = "notes from nowhere"
noteTitle.Parent = noteGui
local noteBody = Instance.new("TextLabel")
noteBody.Name = "NoteBody"
noteBody.Position = UDim2.new(0, 0, 0.3, 0)
noteBody.Size = UDim2.new(1, -16, 0.6, 0)
noteBody.BackgroundTransparency = 1
noteBody.Font = Enum.Font.Gotham
noteBody.TextSize = 20
noteBody.TextWrapped = true
noteBody.TextColor3 = Color3.fromRGB(210, 200, 180)
noteBody.Text = Config.Notepad.Messages[1]
noteBody.Parent = noteGui

task.spawn(function()
	local i = 1
	while notepad.Parent do
		task.wait(Config.Notepad.RotateSeconds)
		i = (i % #Config.Notepad.Messages) + 1
		noteBody.Text = Config.Notepad.Messages[i]
	end
end)

local spawn = Instance.new("SpawnLocation")
spawn.Size = Vector3.new(6, 1, 6)
spawn.Position = Config.Spawn
spawn.Anchored = true
spawn.Neutral = true
spawn.Duration = 0
spawn.Transparency = 0.4
spawn.Color = Color3.fromRGB(80, 100, 90)
spawn.Parent = world

-- Soft lamp
local lamp = part({
	Name = "Lamp",
	Size = Vector3.new(1, 10, 1),
	Position = Vector3.new(12, 5, 0),
	Color = Color3.fromRGB(50, 50, 55),
	Parent = world,
})
local bulb = part({
	Name = "LampBulb",
	Size = Vector3.new(2, 2, 2),
	Position = Vector3.new(12, 10.5, 0),
	Color = Color3.fromRGB(255, 230, 180),
	Material = Enum.Material.Neon,
	Shape = Enum.PartType.Ball,
	CanCollide = false,
	Parent = world,
})
local lampLight = Instance.new("PointLight")
lampLight.Brightness = 2
lampLight.Range = 28
lampLight.Color = Color3.fromRGB(255, 230, 180)
lampLight.Parent = bulb

-- Tickets
for i = 1, Config.Ticket.Count do
	local angle = (i / Config.Ticket.Count) * math.pi * 2
	local pos = Vector3.new(math.cos(angle) * 10, 3.5, 2 + math.sin(angle) * 4)
	local ticket = part({
		Name = "Ticket" .. i,
		Size = Vector3.new(1.2, 0.15, 2),
		Position = pos,
		Color = Config.Ticket.Color,
		Material = Enum.Material.Neon,
		CanCollide = false,
		Parent = world,
	})
	ticket:SetAttribute("IsTicket", true)
	ticket:SetAttribute("HomePosition", pos)
	local tLight = Instance.new("PointLight")
	tLight.Brightness = 1.5
	tLight.Range = 8
	tLight.Color = Config.Ticket.Color
	tLight.Parent = ticket
end

-- Bus model (simple box) — loops forever
local bus = part({
	Name = "ForeverBus",
	Size = Vector3.new(18, 8, 8),
	Position = Vector3.new(-50, 4, -14),
	Color = Config.Bus.Color,
	Material = Enum.Material.SmoothPlastic,
	Parent = world,
})
local windshield = part({
	Name = "BusGlass",
	Size = Vector3.new(0.4, 4, 6),
	Position = Vector3.new(-41, 5, -14),
	Color = Color3.fromRGB(150, 200, 220),
	Material = Enum.Material.Glass,
	Transparency = 0.4,
	Parent = world,
})
local headlight = part({
	Name = "Headlight",
	Size = Vector3.new(1, 1, 6),
	Position = Vector3.new(-41.2, 2.5, -14),
	Color = Config.Bus.Headlight,
	Material = Enum.Material.Neon,
	CanCollide = false,
	Parent = world,
})
local hl = Instance.new("PointLight")
hl.Brightness = 3
hl.Range = 30
hl.Color = Config.Bus.Headlight
hl.Parent = headlight

local function setBusX(x: number)
	bus.Position = Vector3.new(x, 4, -14)
	windshield.Position = Vector3.new(x + 9, 5, -14)
	headlight.Position = Vector3.new(x + 8.8, 2.5, -14)
end

task.spawn(function()
	while true do
		-- Approach from left
		setBusX(-55)
		local arrive = TweenService:Create(
			bus,
			TweenInfo.new(6, Enum.EasingStyle.Sine, Enum.EasingDirection.Out),
			{ Position = Vector3.new(-6, 4, -14) }
		)
		-- Sync glass/lights via stepped updates
		local conn: RBXScriptConnection?
		conn = game:GetService("RunService").Heartbeat:Connect(function()
			local x = bus.Position.X
			windshield.Position = Vector3.new(x + 9, 5, -14)
			headlight.Position = Vector3.new(x + 8.8, 2.5, -14)
		end)
		arrive:Play()
		arrive.Completed:Wait()
		bus:SetAttribute("Present", true)
		Remotes.BusArrived:FireAllClients()
		task.wait(Config.Bus.DwellSeconds)
		bus:SetAttribute("Present", false)
		Remotes.BusDeparted:FireAllClients()
		local depart = TweenService:Create(
			bus,
			TweenInfo.new(6, Enum.EasingStyle.Sine, Enum.EasingDirection.In),
			{ Position = Vector3.new(55, 4, -14) }
		)
		depart:Play()
		depart.Completed:Wait()
		if conn then
			conn:Disconnect()
		end
		task.wait(Config.Bus.ArriveSeconds)
	end
end)

for _, child in world:GetChildren() do
	if child:IsA("BasePart") and child:GetAttribute("IsTicket") then
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
			ticketCounts[player.UserId] = (ticketCounts[player.UserId] or 0) + 1
			Remotes.TicketCollected:FireClient(player, ticketCounts[player.UserId])
			task.delay(Config.Ticket.RespawnSeconds, function()
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

Players.PlayerAdded:Connect(function(player)
	ticketCounts[player.UserId] = 0
	player.CharacterAdded:Connect(function(character)
		local root = character:WaitForChild("HumanoidRootPart", 5)
		if root and root:IsA("BasePart") then
			root.CFrame = CFrame.new(Config.Spawn + Vector3.new(0, 3, 0))
		end
	end)
end)

Players.PlayerRemoving:Connect(function(player)
	ticketCounts[player.UserId] = nil
end)

-- Soft sidewalk puddle shimmer + lamp flicker + timetable pulse
task.spawn(function()
	local t = 0
	while world.Parent do
		t += task.wait(0.05)
		local puddle = world:FindFirstChild("SidewalkPuddle")
		if puddle and puddle:IsA("BasePart") then
			puddle.Transparency = 0.35 + math.sin(t * 1.2) * 0.1
		end
		for _, child in world:GetChildren() do
			if child:IsA("BasePart") and string.find(child.Name, "LampHead", 1, true) then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 1.5 + math.sin(t * 1.4 + child.Position.X) * 0.35
				end
			elseif child.Name == "LampBulb" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 1.8 + math.sin(t * 1.35) * 0.4
				end
			elseif child.Name == "ShelterBack" and child:IsA("BasePart") then
				child.Transparency = 0.3 + math.sin(t * 0.7) * 0.08
			elseif child.Name == "Timetable" and child:IsA("BasePart") then
				child.Color = Color3.fromRGB(35, 40, 50):Lerp(Color3.fromRGB(45, 55, 65), (math.sin(t * 0.8) + 1) / 2)
			elseif child.Name == "NewsBox" and child:IsA("BasePart") then
				child.Color = Color3.fromRGB(50, 90, 70):Lerp(Color3.fromRGB(65, 110, 85), (math.sin(t * 0.8) + 1) / 2)
			elseif child.Name == "ShelterGlow" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 1.0 + math.sin(t * 1.1) * 0.35
				end
				child.Transparency = 0.4 + math.sin(t * 1.1) * 0.08
			elseif child.Name == "Shelter2Glow" and child:IsA("BasePart") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 0.9 + math.sin(t * 1.05 + 1) * 0.3
				end
				child.Transparency = 0.45 + math.sin(t * 1.05 + 1) * 0.08
			elseif child:IsA("BasePart") and child:GetAttribute("IsTicket") and not child:GetAttribute("Collected") then
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = 1.5 + math.sin(t * 2.0 + child.Position.X) * 0.45
				end
			elseif string.find(child.Name, "PlanterGreen", 1, true) and child:IsA("BasePart") then
				local home = child:GetAttribute("HomePosition")
				if typeof(home) == "Vector3" then
					child.Position = home + Vector3.new(0, math.sin(t * 0.9 + home.X) * 0.1, 0)
				end
			end
		end
	end
end)

-- Soft wave at the bus — no boarding, just a friendly gesture
local waveCooldown: { [number]: number } = {}
bus:SetAttribute("Present", false)

Remotes.WaveAtBus.OnServerEvent:Connect(function(player: Player)
	if not bus:GetAttribute("Present") then
		return
	end
	local now = os.clock()
	local last = waveCooldown[player.UserId] or 0
	if now - last < 2 then
		return
	end
	waveCooldown[player.UserId] = now
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	if root and root:IsA("BasePart") then
		local start = root.CFrame
		task.spawn(function()
			for i = 1, 6 do
				if not root.Parent then
					return
				end
				root.CFrame = start * CFrame.Angles(0, math.sin(i) * 0.5, 0)
				task.wait(0.1)
			end
			if root.Parent then
				root.CFrame = start
			end
		end)
	end
	Remotes.WaveAtBus:FireAllClients(player.DisplayName)
end)

print("[BusStopForever] server ready —", Config.Tagline)
