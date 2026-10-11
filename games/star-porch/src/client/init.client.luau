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
local porchCompanyNear = false
local halfToast = false
local fullToast = false
local softCompleteDone = false
local softCompleteOptionalOpen = false
local softLingered = false
local proximityHandle: any = nil
local softCompanyHandle: any = nil
local sitDepartPulseUntil = 0.0
local sitReturnPulseUntil = 0.0
local placeWarmKind: string? = nil -- "depart" | "return"
local placeWarmToken = 0
local porchSit = SoftSit.mount(playerGui, {
	EmptyTextFn = function()
		if os.clock() < sitReturnPulseUntil then
			return if softLingered then "still here · rocker open · company again" else "rocker open · company again"
		elseif os.clock() < sitDepartPulseUntil then
			return if softLingered then "still here · rocker open · they drifted" else "rocker open · they drifted"
		elseif softLingered then
			return "still here · rocker open"
		elseif softCompleteDone then
			return "soft-complete · rocker open"
		end
		return ""
	end,
	OneText = function(name)
		if porchCompanyNear then
			return if softLingered then (name .. " is on the porch · still here · company") else (name .. " is on the porch · company")
		end
		return if softLingered then (name .. " is on the porch · still here") else (name .. " is on the porch")
	end,
	ManyText = function(names)
		local joined = table.concat(names, " & ")
		return if softLingered then (joined .. " are on the porch · still here") else (joined .. " are on the porch")
	end,
	Color = Color3.fromRGB(180, 200, 170),
})
Remotes.SitChanged.OnClientEvent:Connect(function(seatName: string, displayName: string?)
	porchSit.set(seatName, displayName)
end)

Remotes.FireflyCollected.OnClientEvent:Connect(function(count: number)
	counter.Text = ("Fireflies  %d"):format(count)
end)

local function refreshPorchSoftHint()
	if not hint.Parent or fullToast then
		return
	end
	if porchCompanyNear then
		return
	end
	if placeWarmKind == "return" then
		hint.Text = "company again · jar remembers · stay"
		hint.TextColor3 = Color3.fromRGB(155, 190, 150)
		return
	elseif placeWarmKind == "depart" then
		hint.Text = "they drifted · jar remembers · stay"
		hint.TextColor3 = Color3.fromRGB(145, 170, 140)
		return
	end
	if softLingered and softCompleteOptionalOpen then
		hint.Text = "still here · share the porch still open"
		hint.TextColor3 = Color3.fromRGB(145, 175, 140)
	elseif softLingered and not halfToast then
		hint.Text = "still here · jar remembers · stay"
		hint.TextColor3 = Color3.fromRGB(140, 165, 135)
	elseif softCompleteDone and softCompleteOptionalOpen then
		hint.Text = "soft-complete · share the porch still open"
		hint.TextColor3 = Color3.fromRGB(140, 170, 135)
	elseif softCompleteDone and not halfToast then
		hint.Text = "soft-complete · jar remembers · stay"
		hint.TextColor3 = Color3.fromRGB(135, 160, 130)
	end
end

local _, complete, nudgeOptional = SoftGoals.mount(playerGui, "tonight's soft goals", {
	{ Id = "sit", Label = "sit on the porch" },
	{ Id = "swing", Label = "try the porch swing" },
	{ Id = "flies", Label = "collect 4 fireflies" },
	{ Id = "jar", Label = "watch the jar fill" },
	{ Id = "company", Label = "share the porch", Optional = true },
}, {
	AccentColor = Color3.fromRGB(140, 180, 120),
	FrameColor = Color3.fromRGB(22, 28, 20),
	TitleColor = Color3.fromRGB(200, 230, 180),
	RowColor = Color3.fromRGB(150, 170, 140),
	OnAllComplete = function(optionalLeft: number)
		softCompleteDone = true
		softCompleteOptionalOpen = optionalLeft > 0
		refreshPorchSoftHint()
		local body = if optionalLeft > 0
			then "stay · share the porch still open"
			else "the jar remembers · stay"
		SoftWelcome.show(playerGui, "soft complete", body, {
			AccentColor = Color3.fromRGB(140, 180, 120),
			FrameColor = Color3.fromRGB(22, 28, 20),
			HoldSeconds = 4.0,
		})
	end,
	OnSessionSealed = function()
		softCompleteOptionalOpen = false
		refreshPorchSoftHint()
		SoftWelcome.show(playerGui, "porch shared", "the jar remembers · stay", {
			AccentColor = Color3.fromRGB(140, 180, 120),
			FrameColor = Color3.fromRGB(22, 28, 20),
			HoldSeconds = 3.2,
		})
	end,
	LingerSeconds = 48,
	OnLinger = function(optionalLeft: number)
		softLingered = true
		softCompleteOptionalOpen = optionalLeft > 0
		refreshPorchSoftHint()
		porchSit.refresh()
		if softCompanyHandle then
			softCompanyHandle.refresh()
		end
		if proximityHandle and not porchCompanyNear then
			proximityHandle.setBoost(1.12)
		end
		if jarMeter and jarMeter.Parent and not porchCompanyNear then
			jarMeter.TextColor3 = Color3.fromRGB(165, 200, 155)
		end
		local body = if optionalLeft > 0
			then "jar glow · share the porch still open"
			else "jar glow · fireflies drift · stay"
		SoftWelcome.show(playerGui, "still on the porch", body, {
			AccentColor = Color3.fromRGB(140, 180, 120),
			FrameColor = Color3.fromRGB(22, 28, 20),
			HoldSeconds = 3.4,
		})
	end,
})

Remotes.FireflyCollected.OnClientEvent:Connect(function(count: number)
	if count >= 4 then
		complete("flies")
	end
end)

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

proximityHandle = ChillProximity.start(player, {
	Radius = Config.Proximity.Radius,
	GlowColor = Config.Proximity.GlowColor,
	Brightness = 1.3,
	Range = 10,
})

SoftWelcome.show(playerGui, Config.GameName, "fireflies drift back. the jar remembers.", {
	AccentColor = porchStyle.AccentColor,
	FrameColor = porchStyle.FrameColor,
	TitleColor = porchStyle.TitleColor,
	BodyColor = porchStyle.BodyColor,
	HoldSeconds = 6.2,
})

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
local porchDepartWelcomed = false
local porchReturnWelcomed = false
softCompanyHandle = SoftCompany.mount(playerGui, player, {
	Radius = Config.Proximity.Radius,
	Color = Color3.fromRGB(180, 200, 170),
	AloneTextFn = function()
		if softLingered and softCompleteOptionalOpen then
			return "still here · share the porch still open"
		elseif softLingered then
			return "still here · jar waits"
		elseif softCompleteDone and softCompleteOptionalOpen then
			return "soft-complete · share the porch still open"
		elseif softCompleteDone then
			return "soft-complete · jar waits"
		end
		return "soft company · jar waits"
	end,
	DepartTextFn = function()
		if softLingered then
			return "still here · they drifted · jar waits"
		elseif softCompleteDone then
			return "soft-complete · they drifted · jar waits"
		end
		return "they drifted · jar waits"
	end,
	AfterDepartTextFn = function()
		if softLingered then
			return "still here · they were near · jar remembers"
		elseif softCompleteDone then
			return "soft-complete · they were near · jar waits"
		end
		return "they were near · jar waits"
	end,
	ReturnTextFn = function()
		if softLingered then
			return "still here · company again · jar glow"
		elseif softCompleteDone then
			return "soft-complete · company again"
		end
		return "company again · jar glow"
	end,
	AfterReturnTextFn = function()
		if softLingered then
			return "still here · jar glow · stay soft"
		elseif softCompleteDone then
			return "soft-complete · jar glow · stay"
		end
		return "jar glow · stay soft"
	end,
	OneTextFn = function()
		return if softLingered then "still here · porch feels warmer" else "soft company · porch feels warmer"
	end,
	ManyText = function(n)
		return if softLingered
			then ("still here · %d nearby · jar glow"):format(n)
			else ("soft company · %d nearby · jar glow"):format(n)
	end,
	OnDeparted = function()
		if softLingered or softCompleteDone then
			nudgeOptional("depart")
		end
		sitDepartPulseUntil = os.clock() + 4
		sitReturnPulseUntil = 0
		porchSit.refresh()
		placeWarmToken += 1
		local token = placeWarmToken
		placeWarmKind = "depart"
		refreshPorchSoftHint()
		if jarMeter and jarMeter.Parent then
			jarMeter.TextColor3 = Color3.fromRGB(160, 190, 150)
		end
		do
			local world = Workspace:FindFirstChild("StarPorchWorld")
			if world then
				for _, child in world:GetChildren() do
					if child:IsA("BasePart") and string.find(child.Name, "StringLight", 1, true) then
						local sLight = child:FindFirstChildOfClass("PointLight")
						if sLight then
							sLight.Color = Color3.fromRGB(230, 215, 160)
						end
					end
				end
			end
		end
		task.delay(4.0, function()
			if token ~= placeWarmToken then
				return
			end
			placeWarmKind = nil
			if not porchCompanyNear then
				refreshPorchSoftHint()
				if jarMeter and jarMeter.Parent then
					jarMeter.TextColor3 = if softLingered
						then Color3.fromRGB(165, 200, 155)
						else Color3.fromRGB(150, 180, 140)
				end
				local world = Workspace:FindFirstChild("StarPorchWorld")
				if world then
					for _, child in world:GetChildren() do
						if child:IsA("BasePart") and string.find(child.Name, "StringLight", 1, true) then
							local sLight = child:FindFirstChildOfClass("PointLight")
							if sLight then
								sLight.Color = Color3.fromRGB(255, 220, 150)
							end
						end
					end
				end
			end
		end)
		if porchDepartWelcomed or not (softLingered or softCompleteDone) then
			return
		end
		porchDepartWelcomed = true
		SoftWelcome.show(playerGui, "they drifted", "jar remembers · stay", {
			AccentColor = porchStyle.AccentColor,
			FrameColor = porchStyle.FrameColor,
			HoldSeconds = 2.8,
		})
	end,
	OnReturned = function()
		sitReturnPulseUntil = os.clock() + 4
		sitDepartPulseUntil = 0
		porchSit.refresh()
		placeWarmToken += 1
		local token = placeWarmToken
		placeWarmKind = "return"
		refreshPorchSoftHint()
		if jarMeter and jarMeter.Parent then
			jarMeter.TextColor3 = Color3.fromRGB(190, 240, 170)
		end
		do
			local world = Workspace:FindFirstChild("StarPorchWorld")
			if world then
				for _, child in world:GetChildren() do
					if child:IsA("BasePart") and string.find(child.Name, "StringLight", 1, true) then
						local sLight = child:FindFirstChildOfClass("PointLight")
						if sLight then
							sLight.Color = Color3.fromRGB(255, 245, 200)
						end
					end
				end
			end
		end
		task.delay(4.0, function()
			if token ~= placeWarmToken then
				return
			end
			placeWarmKind = nil
			if porchCompanyNear then
				if hint and hint.Parent and not fullToast then
					hint.Text = "company near · jar + lights feel warmer"
					hint.TextColor3 = Color3.fromRGB(160, 190, 150)
				end
				if jarMeter and jarMeter.Parent then
					jarMeter.TextColor3 = Color3.fromRGB(200, 255, 170)
				end
				local world = Workspace:FindFirstChild("StarPorchWorld")
				if world then
					for _, child in world:GetChildren() do
						if child:IsA("BasePart") and string.find(child.Name, "StringLight", 1, true) then
							local sLight = child:FindFirstChildOfClass("PointLight")
							if sLight then
								sLight.Color = Color3.fromRGB(255, 235, 180)
							end
						end
					end
				end
			else
				refreshPorchSoftHint()
			end
		end)
		if porchReturnWelcomed or not (softLingered or softCompleteDone) then
			return
		end
		porchReturnWelcomed = true
		nudgeOptional()
		SoftWelcome.show(playerGui, "company again", "jar remembers · still here", {
			AccentColor = porchStyle.AccentColor,
			FrameColor = porchStyle.FrameColor,
			HoldSeconds = 2.8,
		})
	end,
	OnCountChanged = function(n)
		porchCompanyNear = n >= 1
		porchSit.refresh()
		if proximityHandle then
			if n >= 1 then
				proximityHandle.setBoost(1.25)
			else
				proximityHandle.setBoost(if softLingered then 1.12 else 1)
			end
		end
		local light = findJarLight()
		if light then
			if n >= 1 then
				light.Brightness = math.max(light.Brightness, 2.2)
				light.Range = math.max(light.Range, 14)
			end
		end
		if jarMeter and jarMeter.Parent then
			if n >= 1 then
				jarMeter.TextColor3 = Color3.fromRGB(200, 255, 170)
			elseif softLingered then
				jarMeter.TextColor3 = Color3.fromRGB(165, 200, 155)
			else
				jarMeter.TextColor3 = Color3.fromRGB(150, 180, 140)
			end
		end
		if hint and hint.Parent and not fullToast then
			if n >= 1 then
				hint.Text = "company near · jar + lights feel warmer"
				hint.TextColor3 = Color3.fromRGB(160, 190, 150)
			else
				refreshPorchSoftHint()
			end
		end
		local world = Workspace:FindFirstChild("StarPorchWorld")
		local jar = world and world:FindFirstChild("FireflyJar")
		local jarGui = jar and jar:FindFirstChild("JarFillGui")
		local jarLabel = jarGui and jarGui:FindFirstChild("JarFillLabel")
		if jarLabel and jarLabel:IsA("TextLabel") then
			if n >= 1 then
				jarLabel.TextColor3 = Color3.fromRGB(230, 255, 200)
			elseif softLingered then
				jarLabel.TextColor3 = Color3.fromRGB(200, 230, 185)
			else
				jarLabel.TextColor3 = Color3.fromRGB(210, 255, 180)
			end
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
			for _, child in world:GetChildren() do
				if child:IsA("BasePart") and string.find(child.Name, "StringLight", 1, true) then
					local sLight = child:FindFirstChildOfClass("PointLight")
					if sLight then
						-- soft client nudge; server loop owns base pulse + company
						sLight.Color = if n >= 1 then Color3.fromRGB(255, 235, 180) else Color3.fromRGB(255, 220, 150)
					end
				end
			end
		end
		if n >= 1 then
			complete("company")
			softCompleteOptionalOpen = false
			refreshPorchSoftHint()
		end
		if n >= 1 and not porchCompanyWelcomed then
			porchCompanyWelcomed = true
			SoftWelcome.show(playerGui, "porch company", "someone nearby — jar feels warmer", {
				AccentColor = porchStyle.AccentColor,
				FrameColor = porchStyle.FrameColor,
				TitleColor = porchStyle.TitleColor,
				BodyColor = porchStyle.BodyColor,
				HoldSeconds = 3.6,
			})
		end
	end,
})

print("[StarPorch] client ready v" .. Config.Version)
