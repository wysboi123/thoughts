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
			local vibeSynced = workspace:GetAttribute("HazeVibeSynced") == true
			local syncBoost = if vibeSynced then 0.45 else 0
			if world then
				for _, child in world:GetChildren() do
					if child:IsA("BasePart") and string.find(child.Name, "LoftString", 1, true) then
						local light = child:FindFirstChildOfClass("PointLight")
						if light then
							light.Brightness = 0.9 + pulse * 0.5 + math.sin(t + child.Position.X) * 0.15 + syncBoost * 0.25
						end
						local warm = (math.sin(t + child.Position.X) + 1) / 2
						child.Color = Color3.fromRGB(255, 210, 160):Lerp(Color3.fromRGB(255, 235, 200), warm * 0.55)
					elseif child.Name == "LoungeCandle" and child:IsA("BasePart") then
						local light = child:FindFirstChildOfClass("PointLight")
						if light then
							light.Brightness = 1.1 + math.sin(t * 2.4) * 0.35 + syncBoost
						end
						child.Color = Color3.fromRGB(255, 200, 140):Lerp(Color3.fromRGB(255, 230, 180), (math.sin(t * 2.4) + 1) / 2 * 0.5)
					elseif child:IsA("BasePart") and string.find(child.Name, "FloatPad", 1, true) then
						local light = child:FindFirstChildOfClass("PointLight")
						if light then
							light.Brightness = 1.7 + pulse * 0.5 + math.sin(t + child.Position.X) * 0.2 + syncBoost * 0.35
							if vibeSynced then
								light.Color = Color3.fromRGB(160, 220, 255)
							else
								light.Color = Color3.fromRGB(120, 210, 220)
							end
						end
					elseif child:IsA("BasePart") and string.find(child.Name, "Mist", 1, true) then
						local base = if child.Name == "LoftMist" then 0.65 else 0.55
						local mistSoft = if vibeSynced then 0.06 else 0
						child.Transparency = base + mistSoft + math.sin(t * 0.45 + child.Position.X * 0.05) * 0.08
					elseif child.Name == "WelcomeSign" and child:IsA("BasePart") then
						local signA = if vibeSynced then Color3.fromRGB(58, 45, 78) else Color3.fromRGB(48, 38, 62)
						local signB = if vibeSynced then Color3.fromRGB(78, 58, 98) else Color3.fromRGB(62, 48, 78)
						child.Color = signA:Lerp(signB, pulse)
						local welcomeGui = child:FindFirstChildWhichIsA("SurfaceGui")
						local welcomeBody = welcomeGui and welcomeGui:FindFirstChild("WelcomeBody")
						if welcomeBody and welcomeBody:IsA("TextLabel") then
							welcomeBody.Text = if vibeSynced
								then "vibes sync when friends are near"
								else Config.Tagline
							welcomeBody.TextColor3 = if vibeSynced
								then Color3.fromRGB(230, 200, 255)
								else Color3.fromRGB(190, 170, 220)
						end
					elseif child.Name == "HammockCloth" and child:IsA("BasePart") then
						local home = child:GetAttribute("HomePosition")
						if typeof(home) == "Vector3" then
							child.Position = home + Vector3.new(0, math.sin(t * 0.95) * 0.12, 0)
						end
						child.Color = if vibeSynced
							then Color3.fromRGB(180, 140, 210)
							else Color3.fromRGB(160, 120, 180)
					elseif child.Name == "VibeBoard" and child:IsA("BasePart") then
						local syncLight = child:FindFirstChild("VibeBoardSyncLight")
						local synced = syncLight and syncLight:IsA("PointLight") and syncLight.Brightness > 1.2
						local baseA = if synced then Color3.fromRGB(55, 42, 78) else Color3.fromRGB(40, 32, 55)
						local baseB = if synced then Color3.fromRGB(70, 52, 95) else Color3.fromRGB(55, 42, 72)
						child.Color = baseA:Lerp(baseB, pulse)
					elseif child.Name == "LoungeRug" and child:IsA("BasePart") then
						local rugA = if vibeSynced then Color3.fromRGB(110, 75, 135) else Color3.fromRGB(90, 60, 110)
						local rugB = if vibeSynced then Color3.fromRGB(130, 90, 155) else Color3.fromRGB(110, 75, 130)
						child.Color = rugA:Lerp(rugB, pulse * 0.6)
					elseif child.Name == "LoungeTable" and child:IsA("BasePart") then
						local tableA = if vibeSynced then Color3.fromRGB(85, 65, 105) else Color3.fromRGB(70, 55, 85)
						local tableB = if vibeSynced then Color3.fromRGB(105, 80, 125) else Color3.fromRGB(90, 70, 105)
						child.Color = tableA:Lerp(tableB, pulse * 0.55)
					elseif child:IsA("BasePart") and string.find(child.Name, "LoftPlant", 1, true) then
						local home = child:GetAttribute("HomePosition")
						if typeof(home) == "Vector3" then
							child.Position = home + Vector3.new(0, math.sin(t * 0.8 + home.X) * 0.1, 0)
						end
						child.Color = if vibeSynced
							then Color3.fromRGB(110, 160, 120)
							else Color3.fromRGB(90, 140, 100)
					elseif child.Name == "HammockSeat" and child:IsA("BasePart") then
						local home = child:GetAttribute("HomePosition")
						if typeof(home) == "Vector3" then
							child.Position = home + Vector3.new(0, math.sin(t * 0.95) * 0.12, 0)
						end
						if vibeSynced then
							child.Color = Color3.fromRGB(200, 160, 220)
						else
							child.Color = Color3.fromRGB(180, 140, 200)
						end
					end
				end
			end
		end
	end)
end

return AtmosphereService
