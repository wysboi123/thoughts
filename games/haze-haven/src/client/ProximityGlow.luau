--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))
local ChillProximity = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("Proximity"))

local ProximityGlow = {}

export type Handle = {
	setBoost: (mult: number) -> (),
}

function ProximityGlow.start(localPlayer: Player): Handle
	return ChillProximity.start(localPlayer, {
		Radius = Config.Proximity.Radius,
		GlowColor = Config.Proximity.GlowColor,
		Brightness = Config.Proximity.Brightness,
		Range = Config.Proximity.Range,
	})
end

return ProximityGlow
