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
						child.Color = Color3.fromRGB(255, 200, 140):Lerp(Color3.fromRGB(255, 230, 180), (math.sin(t * 2.4) + 1) / 2 * 0.5)
					elseif child:IsA("BasePart") and string.find(child.Name, "FloatPad", 1, true) then
						local light = child:FindFirstChildOfClass("PointLight")
						if light then
							light.Brightness = 1.7 + pulse * 0.5 + math.sin(t + child.Position.X) * 0.2
						end
					elseif child:IsA("BasePart") and string.find(child.Name, "Mist", 1, true) then
						local base = if child.Name == "LoftMist" then 0.65 else 0.55
						child.Transparency = base + math.sin(t * 0.45 + child.Position.X * 0.05) * 0.08
					elseif child.Name == "WelcomeSign" and child:IsA("BasePart") then
						child.Color = Color3.fromRGB(48, 38, 62):Lerp(Color3.fromRGB(62, 48, 78), pulse)
					elseif child.Name == "VibeBoard" and child:IsA("BasePart") then
						child.Color = Color3.fromRGB(40, 32, 55):Lerp(Color3.fromRGB(55, 42, 72), pulse)
					elseif child.Name == "LoungeRug" and child:IsA("BasePart") then
						child.Color = Color3.fromRGB(90, 60, 110):Lerp(Color3.fromRGB(110, 75, 130), pulse * 0.6)
					elseif child.Name == "LoungeTable" and child:IsA("BasePart") then
						child.Color = Color3.fromRGB(70, 55, 85):Lerp(Color3.fromRGB(90, 70, 105), pulse * 0.55)
					elseif child:IsA("BasePart") and string.find(child.Name, "LoftPlant", 1, true) then
						local home = child:GetAttribute("HomePosition")
						if typeof(home) == "Vector3" then
							child.Position = home + Vector3.new(0, math.sin(t * 0.8 + home.X) * 0.1, 0)
						end
					elseif child.Name == "HammockCloth" and child:IsA("BasePart") then
						local home = child:GetAttribute("HomePosition")
						if typeof(home) == "Vector3" then
							child.Position = home + Vector3.new(0, math.sin(t * 0.95) * 0.12, 0)
						end
					elseif child.Name == "HammockSeat" and child:IsA("BasePart") then
						local home = child:GetAttribute("HomePosition")
						if typeof(home) == "Vector3" then
							child.Position = home + Vector3.new(0, math.sin(t * 0.95) * 0.12, 0)
						end
					end
				end
			end
		end
	end)
end

return AtmosphereService
