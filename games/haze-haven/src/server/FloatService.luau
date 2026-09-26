--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))
local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))

local FloatService = {}

local floatCooldown: { [number]: number } = {}

function FloatService.bindWorld(world: Folder)
	for _, child in world:GetChildren() do
		if child:IsA("BasePart") and child:GetAttribute("IsFloatPad") then
			child.Touched:Connect(function(hit)
				FloatService.onPadTouched(child, hit)
			end)
		end
	end
end

function FloatService.onPadTouched(_pad: BasePart, hit: BasePart)
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

function FloatService.onPlayerRemoving(player: Player)
	floatCooldown[player.UserId] = nil
end

return FloatService
