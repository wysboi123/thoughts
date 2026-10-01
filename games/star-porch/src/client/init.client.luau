--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))
local SoftGoals = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftGoals"))
local ChillProximity = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("Proximity"))
local SoftWelcome = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftWelcome"))
local SoftCompany = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftCompany"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local gui = Instance.new("ScreenGui")
gui.Name = "StarPorchHud"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = playerGui

local title = Instance.new("TextLabel")
title.BackgroundTransparency = 1
title.Position = UDim2.new(0, 24, 0, 28)
title.Size = UDim2.new(0, 400, 0, 32)
title.Font = Enum.Font.GothamMedium
title.TextSize = 26
title.TextXAlignment = Enum.TextXAlignment.Left
title.TextColor3 = Color3.fromRGB(210, 230, 190)
title.Text = Config.GameName
title.Parent = gui

local tag = Instance.new("TextLabel")
tag.BackgroundTransparency = 1
tag.Position = UDim2.new(0, 24, 0, 60)
tag.Size = UDim2.new(0, 420, 0, 22)
tag.Font = Enum.Font.Gotham
tag.TextSize = 14
tag.TextXAlignment = Enum.TextXAlignment.Left
tag.TextColor3 = Color3.fromRGB(160, 180, 150)
tag.Text = Config.Tagline .. "  ·  v" .. Config.Version
tag.Parent = gui

local hint = Instance.new("TextLabel")
hint.BackgroundTransparency = 1
hint.Position = UDim2.new(0, 24, 0, 86)
hint.Size = UDim2.new(0, 420, 0, 18)
hint.Font = Enum.Font.Gotham
hint.TextSize = 12
hint.TextXAlignment = Enum.TextXAlignment.Left
hint.TextColor3 = Color3.fromRGB(130, 150, 120)
hint.Text = "rockers + swing · jar fills as fireflies return"
hint.Parent = gui

local counter = Instance.new("TextLabel")
counter.BackgroundColor3 = Color3.fromRGB(20, 28, 22)
counter.BackgroundTransparency = 0.25
counter.Position = UDim2.new(0, 24, 1, -72)
counter.Size = UDim2.new(0, 220, 0, 44)
counter.Font = Enum.Font.GothamMedium
counter.TextSize = 18
counter.TextColor3 = Color3.fromRGB(200, 255, 170)
counter.Text = "Fireflies  0"
counter.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 10)
corner.Parent = counter

local jarMeter = Instance.new("TextLabel")
jarMeter.BackgroundTransparency = 1
jarMeter.Position = UDim2.new(0, 24, 1, -100)
jarMeter.Size = UDim2.new(0, 220, 0, 18)
jarMeter.Font = Enum.Font.Gotham
jarMeter.TextSize = 12
jarMeter.TextXAlignment = Enum.TextXAlignment.Left
jarMeter.TextColor3 = Color3.fromRGB(150, 180, 140)
jarMeter.Text = "Jar · 0/" .. tostring(Config.JarFillCap)
jarMeter.Parent = gui

local SoftSit = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftSit"))
local porchSit = SoftSit.mount(playerGui, {
	OneText = function(name)
		return name .. " is on the porch"
	end,
	ManyText = function(names)
		return table.concat(names, " & ") .. " are on the porch"
	end,
	Color = Color3.fromRGB(180, 200, 170),
})
Remotes.SitChanged.OnClientEvent:Connect(function(seatName: string, displayName: string?)
	porchSit.set(seatName, displayName)
end)

Remotes.FireflyCollected.OnClientEvent:Connect(function(count: number)
	counter.Text = ("Fireflies  %d"):format(count)
end)

local _, complete = SoftGoals.mount(playerGui, "tonight's soft goals", {
	{ Id = "sit", Label = "sit on the porch" },
	{ Id = "swing", Label = "try the porch swing" },
	{ Id = "flies", Label = "collect 4 fireflies" },
	{ Id = "jar", Label = "watch the jar fill" },
})

Remotes.FireflyCollected.OnClientEvent:Connect(function(count: number)
	if count >= 4 then
		complete("flies")
	end
end)

local halfToast = false
local fullToast = false
local porchStyle = {
	AccentColor = Color3.fromRGB(140, 180, 120),
	FrameColor = Color3.fromRGB(22, 28, 20),
	TitleColor = Color3.fromRGB(210, 235, 190),
	BodyColor = Color3.fromRGB(160, 180, 150),
}

Remotes.JarFillChanged.OnClientEvent:Connect(function(session: number, cap: number)
	jarMeter.Text = ("Jar · %d/%d"):format(session, cap)
	local fill = if cap > 0 then session / cap else 0
	counter.BackgroundColor3 = Color3.fromRGB(20, 28, 22):Lerp(Color3.fromRGB(40, 55, 35), math.clamp(fill, 0, 1) * 0.7)
	if fill >= 0.5 and not halfToast then
		halfToast = true
		complete("jar")
		SoftWelcome.show(playerGui, "jar glow", "half full — the jar remembers", porchStyle)
		hint.Text = "jar half full · fireflies keep drifting back"
	end
	if fill >= 1 and not fullToast then
		fullToast = true
		complete("jar")
		SoftWelcome.show(playerGui, "jar full", "soft glow · stay on the porch", porchStyle)
		hint.Text = "jar full · the porch remembers tonight"
	elseif fill > 0 and fill < 0.5 then
		hint.Text = ("jar remembers · %d caught tonight"):format(session)
		complete("jar")
	end
end)

Remotes.SitChanged.OnClientEvent:Connect(function(seatName: string, displayName: string?)
	if displayName ~= player.DisplayName then
		return
	end
	complete("sit")
	if seatName == "PorchSwing" then
		complete("swing")
	end
end)

task.spawn(function()
	while true do
		task.wait(0.5)
		local character = player.Character
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		if humanoid and humanoid.SeatPart then
			complete("sit")
			if humanoid.SeatPart.Name == "PorchSwing" then
				complete("swing")
			end
		end
	end
end)

ChillProximity.start(player, {
	Radius = Config.Proximity.Radius,
	GlowColor = Config.Proximity.GlowColor,
	Brightness = 1.3,
	Range = 10,
})

SoftWelcome.show(playerGui, Config.GameName, "fireflies drift back. the jar remembers.", porchStyle)

local function findJarLight(): PointLight?
	local world = Workspace:FindFirstChild("StarPorchWorld")
	if not world then
		return nil
	end
	local glow = world:FindFirstChild("JarGlow")
	if glow and glow:IsA("BasePart") then
		local light = glow:FindFirstChildOfClass("PointLight")
		return light
	end
	return nil
end

local porchCompanyWelcomed = false
SoftCompany.mount(playerGui, player, {
	Radius = Config.Proximity.Radius,
	Color = Color3.fromRGB(180, 200, 170),
	AloneText = "soft company · jar waits",
	OneText = "soft company · porch feels warmer",
	ManyText = function(n)
		return ("soft company · %d nearby · jar glow"):format(n)
	end,
	OnCountChanged = function(n)
		local light = findJarLight()
		if light then
			if n >= 1 then
				light.Brightness = math.max(light.Brightness, 2.2)
				light.Range = math.max(light.Range, 14)
			end
		end
		if jarMeter and jarMeter.Parent then
			jarMeter.TextColor3 = if n >= 1 then Color3.fromRGB(200, 255, 170) else Color3.fromRGB(150, 180, 140)
		end
		local world = Workspace:FindFirstChild("StarPorchWorld")
		local jar = world and world:FindFirstChild("FireflyJar")
		local jarGui = jar and jar:FindFirstChild("JarFillGui")
		local jarLabel = jarGui and jarGui:FindFirstChild("JarFillLabel")
		if jarLabel and jarLabel:IsA("TextLabel") then
			jarLabel.TextColor3 = if n >= 1 then Color3.fromRGB(230, 255, 200) else Color3.fromRGB(210, 255, 180)
		end
		if world then
			local fire = world:FindFirstChild("FirePitGlow")
			if fire and fire:IsA("BasePart") then
				local fireLight = fire:FindFirstChildOfClass("PointLight")
				if fireLight then
					fireLight.Brightness = if n >= 1 then 2.2 else 1.6
					fireLight.Range = if n >= 1 then 22 else 18
				end
				fire.Transparency = if n >= 1 then 0.15 else 0.25
			end
			local mug = world:FindFirstChild("WarmMug")
			if mug and mug:IsA("BasePart") then
				local mugLight = mug:FindFirstChildOfClass("PointLight")
				if mugLight then
					mugLight.Brightness = if n >= 1 then 1.0 else 0.6
				end
			end
			local path = world:FindFirstChild("YardPathGlow")
			if path and path:IsA("BasePart") then
				local pathLight = path:FindFirstChildOfClass("PointLight")
				if pathLight then
					pathLight.Brightness = if n >= 1 then 1.3 else 0.85
				end
			end
		end
		if n >= 1 and not porchCompanyWelcomed then
			porchCompanyWelcomed = true
			SoftWelcome.show(playerGui, "porch company", "someone nearby — jar feels warmer", porchStyle)
		end
	end,
})

print("[StarPorch] client ready v" .. Config.Version)
