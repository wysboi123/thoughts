--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))
local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))

local WorldBuilder = require(script:WaitForChild("WorldBuilder"))
local OrbService = require(script:WaitForChild("OrbService"))
local FloatService = require(script:WaitForChild("FloatService"))
local EmoteService = require(script:WaitForChild("EmoteService"))
local NameplateService = require(script:WaitForChild("NameplateService"))
local AtmosphereService = require(script:WaitForChild("AtmosphereService"))

local world = WorldBuilder.build(Workspace)
OrbService.bindWorld(world)
FloatService.bindWorld(world)
OrbService.startHover(world)
EmoteService.start()
NameplateService.start()
AtmosphereService.start()

Players.PlayerAdded:Connect(function(player)
	OrbService.onPlayerAdded(player)
	player.CharacterAdded:Connect(function(character)
		local root = character:WaitForChild("HumanoidRootPart", 5)
		if root and root:IsA("BasePart") then
			root.CFrame = CFrame.new(Config.Spawn + Vector3.new(0, 3, 0))
		end
	end)
end)

Players.PlayerRemoving:Connect(function(player)
	OrbService.onPlayerRemoving(player)
	FloatService.onPlayerRemoving(player)
	EmoteService.onPlayerRemoving(player)
end)

for _, player in Players:GetPlayers() do
	OrbService.onPlayerAdded(player)
end

-- Touch remotes so folder exists before clients finish loading
local _ = Remotes.OrbCollected

print(("[HazeHaven] server ready v%s — %s"):format(Config.Version, Config.Tagline))
