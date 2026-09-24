--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))
local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))

local OrbService = {}

local orbCounts: { [number]: number } = {}

function OrbService.getCount(player: Player): number
	return orbCounts[player.UserId] or 0
end

function OrbService.setCount(player: Player, value: number)
	orbCounts[player.UserId] = value
	player:SetAttribute("VibeCount", value)
	Remotes.OrbCollected:FireClient(player, value)
	Remotes.VibeCountChanged:FireAllClients(player.UserId, value)
end

function OrbService.bindWorld(world: Folder)
	for _, child in world:GetChildren() do
		if child:IsA("BasePart") and child:GetAttribute("IsVibeOrb") then
			child.Touched:Connect(function(hit)
				OrbService.onOrbTouched(child, hit)
			end)
		end
	end
end

function OrbService.onOrbTouched(orb: BasePart, hit: BasePart)
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

	OrbService.setCount(player, OrbService.getCount(player) + Config.Orb.Value)

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

function OrbService.startHover(world: Folder)
	task.spawn(function()
		local t = 0
		while true do
			t += task.wait(0.03)
			if not world.Parent then
				break
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

function OrbService.onPlayerAdded(player: Player)
	OrbService.setCount(player, 0)
end

function OrbService.onPlayerRemoving(player: Player)
	orbCounts[player.UserId] = nil
end

return OrbService
