--!strict
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))
local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))

local GravityService = {}

local function nearestBody(position: Vector3, moonCenter: Vector3): (Vector3, number, number)
	local toPlanet = Config.Planet.Center - position
	local toMoon = moonCenter - position
	local planetDist = toPlanet.Magnitude
	local moonDist = toMoon.Magnitude

	if moonDist <= Config.Moonlet.GravityRadius and moonDist < planetDist * 0.85 then
		return moonCenter, Config.Moonlet.Radius, Config.Moonlet.GravityStrength
	end
	return Config.Planet.Center, Config.Planet.Radius, Config.Planet.GravityStrength
end

function GravityService.attach(character: Model, moonlet: Part)
	local root = character:WaitForChild("HumanoidRootPart", 5)
	local humanoid = character:WaitForChild("Humanoid", 5)
	if not root or not root:IsA("BasePart") or not humanoid or not humanoid:IsA("Humanoid") then
		return
	end

	humanoid.AutoRotate = false

	local att = Instance.new("Attachment")
	att.Name = "OrbitGravityAtt"
	att.Parent = root

	local force = Instance.new("VectorForce")
	force.Name = "OrbitGravity"
	force.Attachment0 = att
	force.RelativeTo = Enum.ActuatorRelativeTo.World
	force.ApplyAtCenterOfMass = true
	force.Parent = root

	-- Expose radial up for client camera
	root:SetAttribute("OrbitUp", Vector3.new(0, 1, 0))

	local moonCenterAttr = moonlet:GetAttribute("Center")
	local moonCenter = if typeof(moonCenterAttr) == "Vector3" then moonCenterAttr else moonlet.Position

	local conn: RBXScriptConnection?
	conn = RunService.Heartbeat:Connect(function()
		if not root.Parent or not force.Parent then
			if conn then
				conn:Disconnect()
			end
			return
		end

		local center, _radius, strength = nearestBody(root.Position, moonCenter)
		local offset = center - root.Position
		if offset.Magnitude < 1 then
			return
		end
		local dir = offset.Unit
		force.Force = dir * (strength * 20)

		local up = -dir
		root:SetAttribute("OrbitUp", up)

		local look = root.CFrame.LookVector
		local flatLook = look - up * look:Dot(up)
		if flatLook.Magnitude > 0.05 then
			root.CFrame = CFrame.lookAt(root.Position, root.Position + flatLook.Unit, up)
		else
			local right = up:Cross(Vector3.new(0, 1, 0))
			if right.Magnitude < 0.05 then
				right = up:Cross(Vector3.new(1, 0, 0))
			end
			root.CFrame = CFrame.fromMatrix(root.Position, right.Unit, up)
		end
	end)

	-- Spawn on main planet surface
	local spawnDir = Vector3.new(0, 1, 0.2).Unit
	local spawnPos = Config.Planet.Center + spawnDir * (Config.Planet.Radius + Config.Bead.OrbitHeight + 2)
	root.CFrame = CFrame.new(spawnPos)
end

function GravityService.bindPlayers(moonlet: Part)
	local function onPlayer(player: Player)
		player.CharacterAdded:Connect(function(character)
			GravityService.attach(character, moonlet)
		end)
		if player.Character then
			GravityService.attach(player.Character, moonlet)
		end
	end

	Players.PlayerAdded:Connect(onPlayer)
	for _, player in Players:GetPlayers() do
		onPlayer(player)
	end
end

return GravityService
