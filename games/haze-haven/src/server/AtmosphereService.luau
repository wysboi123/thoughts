--!strict
local Lighting = game:GetService("Lighting")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))

local AtmosphereService = {}

function AtmosphereService.start()
	task.spawn(function()
		local t = 0
		local cycle = Config.Atmosphere.DayNightCycleSeconds
		while true do
			t += task.wait(0.1)
			local phase = (math.sin((t / cycle) * math.pi * 2) + 1) / 2 -- 0..1
			local clock = Config.Atmosphere.DayClock
				+ (Config.Atmosphere.NightClock - Config.Atmosphere.DayClock) * phase
			Lighting.ClockTime = clock
			Lighting.FogColor = Config.Atmosphere.DayFog:Lerp(Config.Atmosphere.NightFog, phase)

			local bloom = Lighting:FindFirstChild("HazeBloom")
			if bloom and bloom:IsA("BloomEffect") then
				bloom.Intensity = 0.4 + phase * 0.35
			end

			local pulse = (math.sin(t / Config.Atmosphere.AmbientPulseSeconds * math.pi * 2) + 1) / 2
			Lighting.Brightness = 1.2 + pulse * 0.35

			local world = workspace:FindFirstChild("HazeWorld")
			if world then
				for _, child in world:GetChildren() do
					if child:IsA("BasePart") and string.find(child.Name, "LoftString", 1, true) then
						local light = child:FindFirstChildOfClass("PointLight")
						if light then
							light.Brightness = 0.9 + pulse * 0.5 + math.sin(t + child.Position.X) * 0.15
						end
					elseif child.Name == "LoungeCandle" and child:IsA("BasePart") then
						local light = child:FindFirstChildOfClass("PointLight")
						if light then
							light.Brightness = 1.1 + math.sin(t * 2.4) * 0.35
						end
					end
				end
			end
		end
	end)
end

return AtmosphereService
