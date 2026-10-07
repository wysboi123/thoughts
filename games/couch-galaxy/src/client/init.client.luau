--!strict
local Players = game:GetService("Players")
local Lighting = game:GetService("Lighting")
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local gui = Instance.new("ScreenGui")
gui.Name = "GalaxyHud"
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
title.TextColor3 = Color3.fromRGB(230, 220, 255)
title.Text = Config.GameName
title.Parent = gui

local tag = Instance.new("TextLabel")
tag.BackgroundTransparency = 1
tag.Position = UDim2.new(0, 24, 0, 60)
tag.Size = UDim2.new(0, 420, 0, 22)
tag.Font = Enum.Font.Gotham
tag.TextSize = 14
tag.TextXAlignment = Enum.TextXAlignment.Left
tag.TextColor3 = Color3.fromRGB(170, 160, 200)
tag.Text = Config.Tagline .. "  ·  v" .. Config.Version
tag.Parent = gui

local place = Instance.new("TextLabel")
place.BackgroundTransparency = 1
place.Position = UDim2.new(0, 24, 0, 86)
place.Size = UDim2.new(0, 320, 0, 18)
place.Font = Enum.Font.Gotham
place.TextSize = 13
place.TextXAlignment = Enum.TextXAlignment.Left
place.TextColor3 = Color3.fromRGB(140, 130, 170)
place.Text = "two worlds · one couch · climb to the skylight"
place.Parent = gui

local counter = Instance.new("TextLabel")
counter.BackgroundColor3 = Color3.fromRGB(24, 20, 40)
counter.BackgroundTransparency = 0.25
counter.Position = UDim2.new(0, 24, 1, -72)
counter.Size = UDim2.new(0, 200, 0, 44)
counter.Font = Enum.Font.GothamMedium
counter.TextSize = 18
counter.TextColor3 = Color3.fromRGB(255, 230, 170)
counter.Text = "Stars  0"
counter.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 10)
corner.Parent = counter

local inGalaxy = false
local softCompleteDone = false
local softCompleteOptionalOpen = false
local softLingered = false
local proximityHandle: any = nil

local SoftCompany = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftCompany"))
local SoftSit = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftSit"))
local SoftGoals = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftGoals"))
local SoftWelcome = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftWelcome"))
local ChillProximity = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("Proximity"))

local function applyHomeLighting()
	Lighting.ClockTime = 20.5
	Lighting.Brightness = 1.4
	Lighting.Ambient = Color3.fromRGB(70, 55, 90)
	Lighting.OutdoorAmbient = Color3.fromRGB(50, 40, 70)
	Lighting.FogColor = Color3.fromRGB(40, 30, 55)
	Lighting.FogEnd = 220
end

local function applyGalaxyLighting()
	Lighting.ClockTime = 0.5
	Lighting.Brightness = 0.6
	Lighting.Ambient = Color3.fromRGB(30, 35, 70)
	Lighting.OutdoorAmbient = Color3.fromRGB(20, 25, 55)
	Lighting.FogColor = Color3.fromRGB(10, 15, 40)
	Lighting.FogEnd = 400
end

applyHomeLighting()

local function refreshPlace(companyNear: boolean)
	local versionSuffix = "  ·  v" .. Config.Version
	if inGalaxy then
		if companyNear then
			place.Text = "galaxy loft · soft company · two worlds"
		elseif softLingered and softCompleteOptionalOpen then
			place.Text = "still here · loft company still open"
		elseif softLingered then
			place.Text = "still here · loft · stay"
		elseif softCompleteDone and softCompleteOptionalOpen then
			place.Text = "soft-complete · loft company still open"
		elseif softCompleteDone then
			place.Text = "soft-complete · loft · stay"
		else
			place.Text = "galaxy loft · two worlds · beacon home when ready"
		end
		place.TextColor3 = Color3.fromRGB(200, 190, 255)
		tag.Text = Config.Tagline .. versionSuffix
		tag.TextColor3 = Color3.fromRGB(170, 175, 220)
		title.TextColor3 = Color3.fromRGB(210, 215, 255)
	else
		if companyNear then
			place.Text = "couch side · soft company · climb when ready"
		elseif softLingered and softCompleteOptionalOpen then
			place.Text = "still here · couch company still open"
		elseif softLingered then
			place.Text = "still here · couch · stay"
		elseif softCompleteDone and softCompleteOptionalOpen then
			place.Text = "soft-complete · couch company still open"
		elseif softCompleteDone then
			place.Text = "soft-complete · couch · stay"
		else
			place.Text = "two worlds · one couch · climb to the skylight"
		end
		place.TextColor3 = Color3.fromRGB(140, 130, 170)
		tag.Text = Config.Tagline .. versionSuffix
		tag.TextColor3 = Color3.fromRGB(170, 160, 200)
		title.TextColor3 = Color3.fromRGB(230, 220, 255)
	end
end

Remotes.StarCollected.OnClientEvent:Connect(function(count: number)
	counter.Text = ("Stars  %d"):format(count)
	if inGalaxy then
		counter.BackgroundColor3 = Color3.fromRGB(28, 30, 55)
		counter.TextColor3 = Color3.fromRGB(255, 240, 190)
	else
		counter.BackgroundColor3 = Color3.fromRGB(24, 20, 40)
		counter.TextColor3 = Color3.fromRGB(255, 230, 170)
	end
end)

local galaxyWelcomed = false
local homeWelcomed = false
local visitedGalaxy = false
local visitedHomeAfterGalaxy = false
local couchStyle = {
	AccentColor = Color3.fromRGB(140, 120, 200),
	FrameColor = Color3.fromRGB(26, 20, 40),
}

local function paintStarCounter()
	if inGalaxy then
		counter.BackgroundColor3 = Color3.fromRGB(28, 30, 55)
		counter.TextColor3 = Color3.fromRGB(255, 240, 190)
	else
		counter.BackgroundColor3 = Color3.fromRGB(24, 20, 40)
		counter.TextColor3 = Color3.fromRGB(255, 230, 170)
	end
end

local couchCompanyNear = false
local couchSit = SoftSit.mount(playerGui, {
	OneText = function(name)
		if inGalaxy then
			if couchCompanyNear then
				return if softLingered then (name .. " is in the hammock loft · still here · company") else (name .. " is in the hammock loft · company")
			end
			return if softLingered then (name .. " is in the hammock loft · still here") else (name .. " is in the hammock loft")
		end
		if couchCompanyNear then
			return if softLingered then (name .. " is on the couch · still here · company") else (name .. " is on the couch · company")
		end
		return if softLingered then (name .. " is on the couch · still here") else (name .. " is on the couch")
	end,
	ManyText = function(names)
		local joined = table.concat(names, " & ")
		if softLingered then
			return if inGalaxy then (joined .. " are in the hammock loft · still here") else (joined .. " are on the couch · still here")
		end
		return if inGalaxy then (joined .. " are in the hammock loft") else (joined .. " are on the couch")
	end,
	Color = Color3.fromRGB(190, 170, 220),
})
Remotes.CouchSitChanged.OnClientEvent:Connect(function(seatName: string, displayName: string?)
	couchSit.set(seatName, displayName)
end)

Remotes.EnteredGalaxy.OnClientEvent:Connect(function()
	inGalaxy = true
	visitedGalaxy = true
	applyGalaxyLighting()
	refreshPlace(false)
	paintStarCounter()
	couchSit.refresh()
	if not galaxyWelcomed then
		galaxyWelcomed = true
		SoftWelcome.show(playerGui, "galaxy loft", "second world · beacon home when ready", couchStyle)
	end
end)

Remotes.ReturnedHome.OnClientEvent:Connect(function()
	inGalaxy = false
	if visitedGalaxy then
		visitedHomeAfterGalaxy = true
	end
	applyHomeLighting()
	refreshPlace(false)
	paintStarCounter()
	couchSit.refresh()
	if visitedGalaxy and not homeWelcomed then
		homeWelcomed = true
		SoftWelcome.show(playerGui, "couch side", "two worlds · one couch · you made it home", couchStyle)
	end
end)

print("[CouchGalaxy] client ready v" .. Config.Version)

local _, complete = SoftGoals.mount(playerGui, "tonight's soft goals", {
	{ Id = "couch", Label = "sit on the couch" },
	{ Id = "galaxy", Label = "visit the galaxy loft" },
	{ Id = "stars", Label = "collect 3 stars" },
	{ Id = "both", Label = "visit both worlds tonight" },
	{ Id = "company", Label = "soft company nearby", Optional = true },
}, {
	AccentColor = Color3.fromRGB(140, 120, 200),
	FrameColor = Color3.fromRGB(26, 20, 40),
	TitleColor = Color3.fromRGB(220, 205, 255),
	OnAllComplete = function(optionalLeft: number)
		softCompleteDone = true
		softCompleteOptionalOpen = optionalLeft > 0
		refreshPlace(couchCompanyNear)
		local body = if optionalLeft > 0
			then "stay · soft company still open"
			else "two worlds · one couch · stay"
		SoftWelcome.show(playerGui, "soft complete", body, {
			AccentColor = Color3.fromRGB(140, 120, 200),
			FrameColor = Color3.fromRGB(26, 20, 40),
			HoldSeconds = 4.0,
		})
	end,
	OnSessionSealed = function()
		softCompleteOptionalOpen = false
		refreshPlace(couchCompanyNear)
		SoftWelcome.show(playerGui, "company sealed", "two worlds · one couch · stay", {
			AccentColor = Color3.fromRGB(140, 120, 200),
			FrameColor = Color3.fromRGB(26, 20, 40),
			HoldSeconds = 3.2,
		})
	end,
	LingerSeconds = 48,
	OnLinger = function(optionalLeft: number)
		softLingered = true
		softCompleteOptionalOpen = optionalLeft > 0
		refreshPlace(couchCompanyNear)
		couchSit.refresh()
		if proximityHandle and not couchCompanyNear then
			proximityHandle.setBoost(1.12)
		end
		local body: string
		if optionalLeft > 0 then
			body = if inGalaxy then "loft · soft company still open" else "couch · soft company still open"
		else
			body = if inGalaxy then "loft side · two worlds · stay" else "couch side · two worlds · stay"
		end
		SoftWelcome.show(playerGui, "still here", body, {
			AccentColor = Color3.fromRGB(140, 120, 200),
			FrameColor = Color3.fromRGB(26, 20, 40),
			HoldSeconds = 3.4,
		})
	end,
})

local function tryBothWorlds()
	if visitedGalaxy and visitedHomeAfterGalaxy then
		complete("both")
	end
end

Remotes.EnteredGalaxy.OnClientEvent:Connect(function()
	complete("galaxy")
	tryBothWorlds()
end)

Remotes.ReturnedHome.OnClientEvent:Connect(function()
	tryBothWorlds()
end)

Remotes.StarCollected.OnClientEvent:Connect(function(count: number)
	if count >= 3 then
		complete("stars")
	end
end)

Remotes.CouchSitChanged.OnClientEvent:Connect(function(_seatName: string, displayName: string?)
	if displayName == player.DisplayName then
		complete("couch")
	end
end)

task.spawn(function()
	while true do
		task.wait(0.5)
		local character = player.Character
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		if humanoid and humanoid.SeatPart then
			complete("couch")
		end
	end
end)

proximityHandle = ChillProximity.start(player, {
	Radius = Config.Proximity.Radius,
	GlowColor = Config.Proximity.GlowColor,
	Brightness = 1.4,
	Range = 11,
})

local function setLightBoost(partName: string, brightness: number, range: number?)
	local world = Workspace:FindFirstChild("CouchGalaxyWorld")
	if not world then
		return
	end
	local part = world:FindFirstChild(partName, true)
	if part and part:IsA("BasePart") then
		local light = part:FindFirstChildOfClass("PointLight")
		if light then
			light.Brightness = brightness
			if range then
				light.Range = range
			end
		end
	end
end

local couchCompanyWelcomed = false
SoftCompany.mount(playerGui, player, {
	Radius = Config.Proximity.Radius,
	Color = Color3.fromRGB(190, 170, 220),
	AloneTextFn = function()
		if softLingered and softCompleteOptionalOpen then
			return if inGalaxy then "still here · loft company still open" else "still here · couch company still open"
		elseif softLingered then
			return if inGalaxy then "still here · loft is enough" else "still here · couch is enough"
		elseif softCompleteDone and softCompleteOptionalOpen then
			return if inGalaxy then "soft-complete · loft company still open" else "soft-complete · couch company still open"
		elseif softCompleteDone then
			return if inGalaxy then "soft-complete · loft is enough" else "soft-complete · couch is enough"
		end
		return if inGalaxy then "soft company · loft is enough" else "soft company · couch is enough"
	end,
	OneTextFn = function()
		if softLingered then
			return if inGalaxy then "still here · loft side · two worlds" else "still here · couch side"
		end
		return if inGalaxy then "soft company · loft side · two worlds" else "soft company · couch side"
	end,
	ManyText = function(n)
		if softLingered then
			return if inGalaxy
				then ("still here · %d nearby · loft side"):format(n)
				else ("still here · %d nearby · couch side"):format(n)
		end
		return if inGalaxy
			then ("soft company · %d nearby · loft side"):format(n)
			else ("soft company · %d nearby · couch side"):format(n)
	end,
	OnCountChanged = function(n)
		refreshPlace(n >= 1)
		local company = n >= 1
		couchCompanyNear = company
		couchSit.refresh()
		if proximityHandle then
			if company then
				proximityHandle.setBoost(1.25)
			else
				proximityHandle.setBoost(if softLingered then 1.12 else 1)
			end
		end
		if company then
			complete("company")
			softCompleteOptionalOpen = false
		end
		if company and not couchCompanyWelcomed then
			couchCompanyWelcomed = true
			SoftWelcome.show(playerGui, "soft company", if inGalaxy
				then "someone nearby — loft side feels softer"
				else "someone nearby — couch side feels softer", {
				AccentColor = couchStyle.AccentColor,
				FrameColor = couchStyle.FrameColor,
				HoldSeconds = 3.6,
			})
		end
		local world = Workspace:FindFirstChild("CouchGalaxyWorld")
		if inGalaxy and world then
			local hammock = world:FindFirstChild("GalaxyHammockCloth", true)
			if hammock and hammock:IsA("BasePart") then
				hammock.Color = if company then Color3.fromRGB(160, 140, 210) else Color3.fromRGB(120, 100, 180)
			end
			local beacon = world:FindFirstChild("ReturnBeacon", true)
			if beacon and beacon:IsA("BasePart") then
				beacon.Transparency = if company then 0 else 0.05
				local light = beacon:FindFirstChildOfClass("PointLight")
				if light then
					light.Brightness = if company then 2.4 else 1.6
				end
				local beaconGui = beacon:FindFirstChildWhichIsA("SurfaceGui")
				local beaconLabel = beaconGui and beaconGui:FindFirstChildWhichIsA("TextLabel")
				if beaconLabel and beaconLabel:IsA("TextLabel") then
					beaconLabel.Text = if company then "couch side · soft company · come home" else "couch side · come home"
					beaconLabel.TextColor3 = if company then Color3.fromRGB(255, 235, 200) else Color3.fromRGB(255, 220, 180)
				end
			end
			for _, child in world:GetDescendants() do
				if child:IsA("BasePart") and string.find(child.Name, "CloudPad", 1, true) then
					local light = child:FindFirstChildOfClass("PointLight")
					if light then
						light.Brightness = if company then 1.6 else 1.1
						light.Range = if company then 14 else 10
					end
					child.Transparency = if company then 0.25 else 0.35
				end
			end
		elseif not inGalaxy then
			setLightBoost("TableLamp", if company then 1.8 else 1.2)
			setLightBoost("FloorLampGlow", if company then 2.0 else 1.4)
			setLightBoost("NightWindow", if company then 1.5 else 1.0, if company then 18 else 14)
			setLightBoost("SoftScreen", if company then 1.5 else 1.0)
			local portal = world and world:FindFirstChild("SkylightPortal")
			if portal and portal:IsA("BasePart") then
				local pl = portal:FindFirstChildOfClass("PointLight")
				if pl then
					pl.Brightness = if company then 3.6 else 3.0
				end
				local portalGui = portal:FindFirstChildWhichIsA("SurfaceGui")
				local portalLabel = portalGui and portalGui:FindFirstChildWhichIsA("TextLabel")
				if portalLabel and portalLabel:IsA("TextLabel") then
					portalLabel.Text = if company then "galaxy loft · soft company · step through" else "galaxy loft · step through"
					portalLabel.TextColor3 = if company then Color3.fromRGB(245, 230, 255) else Color3.fromRGB(230, 220, 255)
				end
			end
			local worldHome = Workspace:FindFirstChild("CouchGalaxyWorld")
			if worldHome then
				local plaque = worldHome:FindFirstChild("TwoWorldsPlaque")
				if plaque and plaque:IsA("BasePart") then
					plaque.Color = if company then Color3.fromRGB(58, 45, 78) else Color3.fromRGB(42, 34, 58)
					local plaqueGui = plaque:FindFirstChildWhichIsA("SurfaceGui")
					if plaqueGui then
						for _, label in plaqueGui:GetChildren() do
							if label:IsA("TextLabel") and label.TextSize <= 18 then
								label.Text = if company then "one couch\nsoft company" else "one couch\nroof first"
								label.TextColor3 = if company
									then Color3.fromRGB(200, 185, 230)
									else Color3.fromRGB(170, 155, 200)
							end
						end
					end
				end
				local softScreen = worldHome:FindFirstChild("SoftScreen")
				if softScreen and softScreen:IsA("BasePart") then
					softScreen.Color = if company then Color3.fromRGB(90, 70, 140) else Color3.fromRGB(70, 55, 110)
				end
				local rug = worldHome:FindFirstChild("CouchRug")
				if rug and rug:IsA("BasePart") then
					rug.Color = if company then Color3.fromRGB(90, 60, 120) else Color3.fromRGB(70, 45, 95)
				end
				for _, child in worldHome:GetChildren() do
					if child:IsA("BasePart") and string.find(child.Name, "StringLight", 1, true) then
						local light = child:FindFirstChildOfClass("PointLight")
						if light then
							light.Brightness = if company then 1.5 else 1.0
							light.Range = if company then 14 else 10
						end
					end
				end
			end
		end
	end,
})

SoftWelcome.show(playerGui, Config.GameName, "two worlds, one couch. roof first.", {
	AccentColor = couchStyle.AccentColor,
	FrameColor = couchStyle.FrameColor,
	HoldSeconds = 6.2,
})
