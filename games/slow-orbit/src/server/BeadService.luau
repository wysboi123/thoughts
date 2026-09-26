--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))
local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))

local BeadService = {}

local beadCounts: { [number]: number } = {}
local completed: { [number]: boolean } = {}

function BeadService.getCount(player: Player): number
	return beadCounts[player.UserId] or 0
end

function BeadService.setCount(player: Player, value: number)
	beadCounts[player.UserId] = value
	Remotes.BeadCollected:FireClient(player, value, Config.TargetBeads)
	if value >= Config.TargetBeads and not completed[player.UserId] then
		completed[player.UserId] = true
		Remotes.OrbitComplete:FireClient(player)
	end
end

function BeadService.bind(folder: Folder)
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
				local trail = child:FindFirstChildOfClass("Trail")
				if trail then
					trail.Enabled = false
				end

				local pos = child.Position
				BeadService.setCount(player, BeadService.getCount(player) + Config.Bead.Value)
				Remotes.BeadTrailBurst:FireAllClients(pos, child.Color)

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
					if trail then
						trail.Enabled = true
					end
					local home = child:GetAttribute("HomePosition")
					if typeof(home) == "Vector3" then
						child.Position = home
					end
				end)
			end)
		end
	end

	-- Gentle bead drift along surface tangent for trail visibility
	task.spawn(function()
		local t = 0
		while folder.Parent do
			t += task.wait(0.03)
			for _, child in folder:GetChildren() do
				if child:IsA("BasePart") and child:GetAttribute("IsBead") and not child:GetAttribute("Collected") then
					local home = child:GetAttribute("HomePosition")
					local center = child:GetAttribute("BodyCenter")
					if typeof(home) == "Vector3" and typeof(center) == "Vector3" then
						local radial = (home - center).Unit
						local tangent = radial:Cross(Vector3.new(0, 1, 0))
						if tangent.Magnitude < 0.1 then
							tangent = radial:Cross(Vector3.new(1, 0, 0))
						end
						tangent = tangent.Unit
						local wobble = math.sin(t * 1.2 + child.Position.X) * 0.8
						child.Position = home + tangent * wobble
					end
				end
			end
		end
	end)
end

function BeadService.onPlayerAdded(player: Player)
	completed[player.UserId] = false
	BeadService.setCount(player, 0)
end

function BeadService.onPlayerRemoving(player: Player)
	beadCounts[player.UserId] = nil
	completed[player.UserId] = nil
end

return BeadService
