--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))

local WorldBuilder = require(script:WaitForChild("WorldBuilder"))
local GravityService = require(script:WaitForChild("GravityService"))
local BeadService = require(script:WaitForChild("BeadService"))

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))

local _planet, moonlet, beadsFolder = WorldBuilder.build()
BeadService.bind(beadsFolder)
GravityService.bindPlayers(moonlet)

Players.PlayerAdded:Connect(function(player)
	BeadService.onPlayerAdded(player)
	player.CharacterAdded:Connect(function()
		BeadService.setCount(player, 0)
	end)
end)

Players.PlayerRemoving:Connect(BeadService.onPlayerRemoving)

for _, player in Players:GetPlayers() do
	BeadService.onPlayerAdded(player)
end

local _ = Remotes.BeadCollected

print(("[SlowOrbit] server ready v%s — %s"):format(Config.Version, Config.Tagline))
