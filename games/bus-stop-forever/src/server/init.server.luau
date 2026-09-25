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
		Remotes.BusArrived:FireAllClients()
		task.wait(Config.Bus.DwellSeconds)
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

print("[BusStopForever] server ready —", Config.Tagline)
