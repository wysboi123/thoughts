--!strict
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local beadCounts: { [number]: number } = {}
local completed: { [number]: boolean } = {}

local function clearBase()
	for _, name in { "Baseplate", "SpawnLocation" } do
		local inst = Workspace:FindFirstChild(name)
		if inst then
			inst:Destroy()
		end
	end
end

local function makePlanet(): Part
	local planet = Instance.new("Part")
	planet.Name = "Planet"
	planet.Shape = Enum.PartType.Ball
	planet.Size = Vector3.new(Config.Planet.Radius * 2, Config.Planet.Radius * 2, Config.Planet.Radius * 2)
	planet.Position = Config.Planet.Center
	planet.Anchored = true
	planet.Color = Config.Planet.Color
	planet.Material = Enum.Material.Slate
	planet.TopSurface = Enum.SurfaceType.Smooth
	planet.BottomSurface = Enum.SurfaceType.Smooth
	planet.Parent = Workspace

	local light = Instance.new("PointLight")
	light.Brightness = 1.2
	light.Range = Config.Planet.Radius * 3
	light.Color = Color3.fromRGB(90, 120, 200)
	light.Parent = planet
	return planet
end

local function surfacePoint(dir: Vector3): Vector3
	return Config.Planet.Center + dir.Unit * (Config.Planet.Radius + Config.Bead.OrbitHeight)
end

local function makeBeads(folder: Folder)
	for i = 1, Config.Bead.Count do
		local theta = (i / Config.Bead.Count) * math.pi * 2
		local phi = 0.6 + (i % 3) * 0.35
		local dir = Vector3.new(
			math.sin(phi) * math.cos(theta),
			math.cos(phi),
			math.sin(phi) * math.sin(theta)
		)
		local bead = Instance.new("Part")
		bead.Name = "OrbitBead" .. i
		bead.Shape = Enum.PartType.Ball
		bead.Size = Vector3.new(2, 2, 2)
		bead.Position = surfacePoint(dir)
		bead.Anchored = true
		bead.CanCollide = false
		bead.Color = Config.Bead.Color
		bead.Material = Enum.Material.Neon
		bead:SetAttribute("IsBead", true)
		bead:SetAttribute("HomePosition", bead.Position)
		bead.Parent = folder

		local pl = Instance.new("PointLight")
		pl.Brightness = 2.5
		pl.Range = 12
		pl.Color = Config.Bead.Color
		pl.Parent = bead
	end
end

local function setCount(player: Player, value: number)
	beadCounts[player.UserId] = value
	Remotes.BeadCollected:FireClient(player, value, Config.TargetBeads)
	if value >= Config.TargetBeads and not completed[player.UserId] then
		completed[player.UserId] = true
		Remotes.OrbitComplete:FireClient(player)
	end
end

local function bindBeads(folder: Folder)
	for _, child in folder:GetChildren() do
		if child:IsA("BasePart") and child:GetAttribute("IsBead") then
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
				local light = child:FindFirstChildOfClass("PointLight")
				if light then
					light.Enabled = false
				end
				setCount(player, (beadCounts[player.UserId] or 0) + Config.Bead.Value)
				task.delay(Config.Bead.RespawnSeconds, function()
					if not child.Parent then
						return
					end
					child:SetAttribute("Collected", false)
					child.Transparency = 0
					child.CanTouch = true
					if light then
						light.Enabled = true
					end
					local home = child:GetAttribute("HomePosition")
					if typeof(home) == "Vector3" then
						child.Position = home
					end
				end)
			end)
		end
	end
end

local function attachPlanetGravity(character: Model)
	local root = character:WaitForChild("HumanoidRootPart", 5)
	local humanoid = character:WaitForChild("Humanoid", 5)
	if not root or not root:IsA("BasePart") or not humanoid or not humanoid:IsA("Humanoid") then
		return
	end

	-- Soft stick-to-planet: continuous force toward center + upright along radial
	local att = Instance.new("Attachment")
	att.Name = "OrbitGravityAtt"
	att.Parent = root

	local force = Instance.new("VectorForce")
	force.Name = "OrbitGravity"
	force.Attachment0 = att
	force.RelativeTo = Enum.ActuatorRelativeTo.World
	force.ApplyAtCenterOfMass = true
	force.Parent = root

	local conn: RBXScriptConnection?
	conn = RunService.Heartbeat:Connect(function()
		if not root.Parent or not force.Parent then
			if conn then
				conn:Disconnect()
			end
			return
		end
		local offset = Config.Planet.Center - root.Position
		local dist = offset.Magnitude
		if dist < 1 then
			return
		end
		local dir = offset.Unit
		-- Approximate mass-scaled pull
		force.Force = dir * (Config.Planet.GravityStrength * 20)
		-- Orient feet toward planet
		local up = -dir
		local look = root.CFrame.LookVector
		local flatLook = (look - up * look:Dot(up))
		if flatLook.Magnitude > 0.05 then
			root.CFrame = CFrame.lookAt(root.Position, root.Position + flatLook.Unit, up)
		end
	end)

	-- Spawn on surface
	local spawnDir = Vector3.new(0, 1, 0.2).Unit
	root.CFrame = CFrame.new(surfacePoint(spawnDir) + spawnDir * 2)
end

clearBase()
makePlanet()

local beadsFolder = Instance.new("Folder")
beadsFolder.Name = "OrbitBeads"
beadsFolder.Parent = Workspace
makeBeads(beadsFolder)
bindBeads(beadsFolder)

Players.PlayerAdded:Connect(function(player)
	beadCounts[player.UserId] = 0
	completed[player.UserId] = false
	player.CharacterAdded:Connect(function(character)
		attachPlanetGravity(character)
		setCount(player, 0)
	end)
end)

Players.PlayerRemoving:Connect(function(player)
	beadCounts[player.UserId] = nil
	completed[player.UserId] = nil
end)

print("[SlowOrbit] server ready —", Config.Tagline)
