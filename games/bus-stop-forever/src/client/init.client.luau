--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local gui = Instance.new("ScreenGui")
gui.Name = "BusHud"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = playerGui

local title = Instance.new("TextLabel")
title.BackgroundTransparency = 1
title.Position = UDim2.new(0, 24, 0, 28)
title.Size = UDim2.new(0, 420, 0, 32)
title.Font = Enum.Font.GothamMedium
title.TextSize = 26
title.TextXAlignment = Enum.TextXAlignment.Left
title.TextColor3 = Color3.fromRGB(220, 230, 210)
title.Text = Config.GameName
title.Parent = gui

local tag = Instance.new("TextLabel")
tag.BackgroundTransparency = 1
tag.Position = UDim2.new(0, 24, 0, 60)
tag.Size = UDim2.new(0, 420, 0, 22)
tag.Font = Enum.Font.Gotham
tag.TextSize = 14
tag.TextXAlignment = Enum.TextXAlignment.Left
tag.TextColor3 = Color3.fromRGB(170, 180, 160)
tag.Text = Config.Tagline .. "  ·  v" .. Config.Version
tag.Parent = gui

local busStatus = Instance.new("TextLabel")
busStatus.BackgroundTransparency = 1
busStatus.Position = UDim2.new(0, 24, 0, 86)
busStatus.Size = UDim2.new(0, 360, 0, 18)
busStatus.Font = Enum.Font.Gotham
busStatus.TextSize = 13
busStatus.TextXAlignment = Enum.TextXAlignment.Left
busStatus.TextColor3 = Color3.fromRGB(150, 160, 140)
busStatus.Text = "waiting · no rush"
busStatus.Parent = gui

local counter = Instance.new("TextLabel")
counter.BackgroundColor3 = Color3.fromRGB(30, 32, 28)
counter.BackgroundTransparency = 0.25
counter.Position = UDim2.new(0, 24, 1, -72)
counter.Size = UDim2.new(0, 200, 0, 44)
counter.Font = Enum.Font.GothamMedium
counter.TextSize = 18
counter.TextColor3 = Color3.fromRGB(240, 210, 140)
counter.Text = "Tickets  0"
counter.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 10)
corner.Parent = counter

-- Waiting-together status machine (survives wave/depart races)
local phase = "waiting" -- waiting | arrived | departed | waved
local nearbyCount = 0
local seatedLocal = false
local lastWaveName: string? = nil
local softCompleteDone = false
local softCompleteOptionalOpen = false
local softLingered = false
local softCompanyHandle: any = nil

local function refreshStatus()
	if phase == "arrived" then
		busStatus.Text = "bus is here · stay if you want"
		busStatus.TextColor3 = Color3.fromRGB(200, 220, 170)
	elseif phase == "departed" then
		busStatus.Text = "departed · another will come"
		busStatus.TextColor3 = Color3.fromRGB(150, 160, 140)
	elseif phase == "waved" then
		busStatus.Text = (lastWaveName or "someone") .. " waved · no rush"
		busStatus.TextColor3 = Color3.fromRGB(200, 220, 170)
	elseif nearbyCount >= 1 then
		busStatus.Text = ("waiting together · %d near · no rush"):format(nearbyCount)
		busStatus.TextColor3 = Color3.fromRGB(180, 200, 160)
	elseif softLingered and softCompleteOptionalOpen then
		busStatus.Text = "still waiting · together still open"
		busStatus.TextColor3 = Color3.fromRGB(175, 195, 160)
	elseif softLingered then
		busStatus.Text = "still waiting · stay · no rush"
		busStatus.TextColor3 = Color3.fromRGB(165, 180, 155)
	elseif softCompleteDone and softCompleteOptionalOpen then
		busStatus.Text = "soft-complete · waiting together still open"
		busStatus.TextColor3 = Color3.fromRGB(170, 190, 155)
	elseif softCompleteDone then
		busStatus.Text = "soft-complete · stay · no rush"
		busStatus.TextColor3 = Color3.fromRGB(160, 175, 150)
	else
		busStatus.Text = "waiting · no rush"
		busStatus.TextColor3 = Color3.fromRGB(150, 160, 140)
	end
end

Remotes.TicketCollected.OnClientEvent:Connect(function(count: number)
	counter.Text = ("Tickets  %d"):format(count)
end)

Remotes.BusArrived.OnClientEvent:Connect(function()
	phase = "arrived"
	refreshStatus()
end)

Remotes.BusDeparted.OnClientEvent:Connect(function()
	phase = "departed"
	refreshStatus()
	task.delay(3, function()
		if phase == "departed" then
			phase = "waiting"
			refreshStatus()
		end
	end)
end)

local ChillProximity = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("Proximity"))
local proximity = ChillProximity.start(player, {
	Radius = Config.Proximity.Radius,
	GlowColor = Config.Proximity.GlowColor,
	Brightness = 1.4,
	Range = 10,
})

print("[BusStopForever] client ready")

local SoftWelcome = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftWelcome"))
local SoftCompany = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftCompany"))
local SoftGoals = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftGoals"))
local busStyle = {
	AccentColor = Color3.fromRGB(120, 160, 110),
	FrameColor = Color3.fromRGB(24, 28, 22),
	TitleColor = Color3.fromRGB(220, 235, 210),
	BodyColor = Color3.fromRGB(170, 185, 160),
}
SoftWelcome.show(playerGui, Config.GameName, "the bus will come. you don't have to. wait together.", {
	AccentColor = busStyle.AccentColor,
	FrameColor = busStyle.FrameColor,
	TitleColor = busStyle.TitleColor,
	BodyColor = busStyle.BodyColor,
	HoldSeconds = 6.2,
})

local _, complete, nudgeOptional = SoftGoals.mount(playerGui, "tonight's soft goals", {
	{ Id = "sit", Label = "sit on a bench" },
	{ Id = "ticket", Label = "pick up a ticket" },
	{ Id = "wave", Label = "wave when the bus stops" },
	{ Id = "together", Label = "wait together on a bench", Optional = true },
}, {
	AccentColor = Color3.fromRGB(120, 160, 110),
	FrameColor = Color3.fromRGB(24, 28, 22),
	TitleColor = Color3.fromRGB(210, 230, 190),
	RowColor = Color3.fromRGB(150, 165, 145),
	OnAllComplete = function(optionalLeft: number)
		softCompleteDone = true
		softCompleteOptionalOpen = optionalLeft > 0
		local body = if optionalLeft > 0
			then "stay · waiting together still open"
			else "the next bus can wait · stay"
		SoftWelcome.show(playerGui, "soft complete", body, {
			AccentColor = busStyle.AccentColor,
			FrameColor = busStyle.FrameColor,
			HoldSeconds = 4.0,
		})
		refreshStatus()
	end,
	OnSessionSealed = function()
		softCompleteOptionalOpen = false
		SoftWelcome.show(playerGui, "waiting together sealed", "the next bus can wait · stay", {
			AccentColor = busStyle.AccentColor,
			FrameColor = busStyle.FrameColor,
			HoldSeconds = 3.2,
		})
		refreshStatus()
	end,
	LingerSeconds = 48,
	OnLinger = function(optionalLeft: number)
		softLingered = true
		softCompleteOptionalOpen = optionalLeft > 0
		benchSit.refresh()
		if softCompanyHandle then
			softCompanyHandle.refresh()
		end
		if nearbyCount < 1 then
			proximity.setBoost(1.12)
		end
		tintTimetable(nearbyCount >= 1)
		local world = Workspace:FindFirstChild("BusStopWorld")
		local notepad = world and world:FindFirstChild("NotepadBoard")
		if notepad and notepad:IsA("BasePart") and nearbyCount < 1 then
			notepad.Color = Color3.fromRGB(48, 48, 40)
		end
		if world and nearbyCount < 1 then
			for _, child in world:GetChildren() do
				if child:IsA("Seat") and string.find(child.Name, "BenchSeat", 1, true) then
					child.Color = Color3.fromRGB(120, 98, 72)
				end
			end
		end
		local body = if optionalLeft > 0
			then "another bus will come · waiting together still open"
			else "another bus will come · stay"
		SoftWelcome.show(playerGui, "still waiting", body, {
			AccentColor = busStyle.AccentColor,
			FrameColor = busStyle.FrameColor,
			HoldSeconds = 3.4,
		})
		refreshStatus()
	end,
})

local function tryTogetherGoal()
	if nearbyCount >= 1 and seatedLocal then
		complete("together")
		softCompleteOptionalOpen = false
		refreshStatus()
	end
end

local Workspace = game:GetService("Workspace")
local placeWarmKind: string? = nil -- "depart" | "return"
local placeWarmToken = 0

local function tintTimetable(company: boolean)
	local world = Workspace:FindFirstChild("BusStopWorld")
	local board = world and world:FindFirstChild("Timetable")
	local gui = board and board:FindFirstChildWhichIsA("SurfaceGui")
	local body = gui and gui:FindFirstChild("TimetableBody")
	if body and body:IsA("TextLabel") then
		if company then
			body.TextColor3 = Color3.fromRGB(230, 245, 200)
		elseif placeWarmKind == "return" then
			body.TextColor3 = Color3.fromRGB(220, 240, 195)
		elseif placeWarmKind == "depart" or softLingered then
			-- Soft stay warmth after OnLinger / depart pulse (playtime)
			body.TextColor3 = Color3.fromRGB(210, 228, 185)
		else
			body.TextColor3 = Color3.fromRGB(200, 220, 180)
		end
	end
	local news = world and world:FindFirstChild("NewsBox")
	local newsGui = news and news:FindFirstChildWhichIsA("SurfaceGui")
	local newsLabel = newsGui and newsGui:FindFirstChildWhichIsA("TextLabel")
	if newsLabel and newsLabel:IsA("TextLabel") then
		if company then
			newsLabel.Text = "TODAY\n\nstill\ntogether"
		elseif placeWarmKind == "return" then
			newsLabel.Text = "TODAY\n\ncompany\nagain"
		elseif placeWarmKind == "depart" then
			newsLabel.Text = "TODAY\n\nthey\ndrifted"
		elseif softLingered then
			newsLabel.Text = "TODAY\n\nstill\nhere"
		else
			newsLabel.Text = "TODAY\n\nstill\nfree"
		end
	end
	local notepad = world and world:FindFirstChild("NotepadBoard")
	if notepad and notepad:IsA("BasePart") then
		if company then
			notepad.Color = Color3.fromRGB(52, 55, 42)
		elseif placeWarmKind == "return" then
			notepad.Color = Color3.fromRGB(50, 54, 42)
		elseif placeWarmKind == "depart" or softLingered then
			notepad.Color = Color3.fromRGB(48, 48, 40)
		else
			notepad.Color = Color3.fromRGB(45, 42, 38)
		end
	end
end

local function pulseBusPlaceWarmth(kind: "depart" | "return")
	placeWarmToken += 1
	local token = placeWarmToken
	placeWarmKind = kind
	tintTimetable(kind == "return")
	task.delay(4.0, function()
		if token ~= placeWarmToken then
			return
		end
		placeWarmKind = nil
		tintTimetable(nearbyCount >= 1)
	end)
end

local waveBtn = Instance.new("TextButton")
waveBtn.Name = "WaveButton"
waveBtn.AnchorPoint = Vector2.new(0.5, 1)
waveBtn.Position = UDim2.new(0.5, 0, 1, -120)
waveBtn.Size = UDim2.fromOffset(160, 40)
waveBtn.BackgroundColor3 = Color3.fromRGB(50, 70, 55)
waveBtn.Font = Enum.Font.GothamMedium
waveBtn.TextSize = 16
waveBtn.TextColor3 = Color3.fromRGB(220, 240, 210)
waveBtn.Text = "Wave at bus"
waveBtn.Visible = false
waveBtn.Parent = gui
local waveCorner = Instance.new("UICorner")
waveCorner.CornerRadius = UDim.new(0, 10)
waveCorner.Parent = waveBtn

waveBtn.MouseButton1Click:Connect(function()
	Remotes.WaveAtBus:FireServer()
end)

Remotes.BusArrived.OnClientEvent:Connect(function()
	waveBtn.Visible = true
end)

Remotes.BusDeparted.OnClientEvent:Connect(function()
	waveBtn.Visible = false
end)

Remotes.WaveAtBus.OnClientEvent:Connect(function(name: string)
	complete("wave")
	lastWaveName = name
	phase = "waved"
	refreshStatus()
	task.delay(4, function()
		if phase == "waved" then
			phase = if waveBtn.Visible then "arrived" else "waiting"
			refreshStatus()
		end
	end)
end)

Remotes.TicketCollected.OnClientEvent:Connect(function()
	complete("ticket")
end)

local SoftSit = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftSit"))
local sitDepartPulseUntil = 0.0
local sitReturnPulseUntil = 0.0
local benchSit = SoftSit.mount(playerGui, {
	EmptyText = "",
	EmptyTextFn = function()
		if os.clock() < sitReturnPulseUntil then
			return if softLingered then "still here · bench open · company again" else "bench open · company again"
		elseif os.clock() < sitDepartPulseUntil then
			return if softLingered then "still here · bench open · they drifted" else "bench open · they drifted"
		elseif softLingered then
			return "still here · bench open"
		elseif softCompleteDone then
			return "soft-complete · bench open"
		end
		return ""
	end,
	OneText = function(name)
		if nearbyCount >= 1 then
			return if softLingered then (name .. " is waiting together · still here") else (name .. " is waiting together")
		end
		return if softLingered then (name .. " is waiting · still here") else (name .. " is waiting")
	end,
	ManyText = function(names)
		local joined = table.concat(names, " & ")
		return if softLingered then (joined .. " are waiting together · still here") else (joined .. " are waiting together")
	end,
	Color = Color3.fromRGB(190, 200, 170),
})
Remotes.BenchSitChanged.OnClientEvent:Connect(function(seatName: string, displayName: string?)
	benchSit.set(seatName, displayName)
	if displayName == player.DisplayName then
		complete("sit")
		seatedLocal = true
		tryTogetherGoal()
	elseif displayName == nil then
		-- occupant left this seat; re-check local seat below
	end
end)

local companyWelcomed = false
local busDepartWelcomed = false
local busReturnWelcomed = false
softCompanyHandle = SoftCompany.mount(playerGui, player, {
	Radius = Config.Proximity.Radius,
	Color = Color3.fromRGB(190, 200, 170),
	AloneTextFn = function()
		if softLingered and softCompleteOptionalOpen then
			return "still here · waiting together still open"
		elseif softLingered then
			return "still here · alone is fine"
		elseif softCompleteDone and softCompleteOptionalOpen then
			return "soft-complete · waiting together still open"
		elseif softCompleteDone then
			return "soft-complete · alone is fine"
		elseif phase == "arrived" then
			return "soft company · bus is here · alone is fine"
		elseif phase == "departed" then
			return "soft company · another will come"
		end
		return "soft company · alone is fine"
	end,
	DepartTextFn = function()
		if softLingered then
			return "still here · they drifted · wait continues"
		elseif softCompleteDone then
			return "soft-complete · they drifted · stay"
		elseif phase == "arrived" then
			return "they drifted · bus is here · stay"
		end
		return "they drifted · another bus will come"
	end,
	AfterDepartTextFn = function()
		if softLingered then
			return "still here · they were near · wait continues"
		elseif softCompleteDone then
			return "soft-complete · they were near · stay"
		elseif phase == "arrived" then
			return "they were near · bus is here · stay"
		end
		return "they were near · another bus will come"
	end,
	ReturnTextFn = function()
		if softLingered then
			return "still here · company again · wait together"
		elseif softCompleteDone then
			return "soft-complete · company again"
		elseif phase == "arrived" then
			return "company again · bus is here"
		end
		return "company again · wait together"
	end,
	AfterReturnTextFn = function()
		if softLingered then
			return "still here · wait together · stay soft"
		elseif softCompleteDone then
			return "soft-complete · wait together · stay"
		elseif phase == "arrived" then
			return "bus is here · wait together · stay"
		end
		return "wait together · stay soft"
	end,
	OneTextFn = function()
		if softLingered then
			if phase == "arrived" then
				return "still here · bus is here · waiting together"
			end
			return "still here · waiting together"
		elseif phase == "arrived" then
			return "soft company · bus is here · waiting together"
		end
		return "soft company · waiting together"
	end,
	ManyText = function(n)
		if softLingered then
			if phase == "arrived" then
				return ("still here · %d nearby · bus is here"):format(n)
			end
			return ("still here · %d nearby · wait together"):format(n)
		elseif phase == "arrived" then
			return ("soft company · %d nearby · bus is here"):format(n)
		end
		return ("soft company · %d nearby · wait together"):format(n)
	end,
	OnDeparted = function()
		if softLingered or softCompleteDone then
			nudgeOptional("depart")
		end
		sitDepartPulseUntil = os.clock() + 4
		sitReturnPulseUntil = 0
		benchSit.refresh()
		pulseBusPlaceWarmth("depart")
		if busDepartWelcomed or not (softLingered or softCompleteDone) then
			return
		end
		busDepartWelcomed = true
		SoftWelcome.show(playerGui, "they drifted", "wait continues · stay", {
			AccentColor = busStyle.AccentColor,
			FrameColor = busStyle.FrameColor,
			HoldSeconds = 2.8,
		})
	end,
	OnReturned = function()
		sitReturnPulseUntil = os.clock() + 4
		sitDepartPulseUntil = 0
		benchSit.refresh()
		pulseBusPlaceWarmth("return")
		if busReturnWelcomed or not (softLingered or softCompleteDone) then
			return
		end
		busReturnWelcomed = true
		nudgeOptional()
		SoftWelcome.show(playerGui, "company again", "waiting together · still here", {
			AccentColor = busStyle.AccentColor,
			FrameColor = busStyle.FrameColor,
			HoldSeconds = 2.8,
		})
	end,
	OnCountChanged = function(n)
		nearbyCount = n
		if phase == "waiting" or softLingered or softCompleteDone then
			refreshStatus()
		end
		if n >= 1 then
			proximity.setBoost(1.25)
		else
			proximity.setBoost(if softLingered then 1.12 else 1)
		end
		tintTimetable(n >= 1)
		if counter and counter.Parent then
			counter.BackgroundColor3 = if n >= 1 then Color3.fromRGB(40, 48, 36) else Color3.fromRGB(30, 32, 28)
			counter.TextColor3 = if n >= 1 then Color3.fromRGB(255, 230, 160) else Color3.fromRGB(240, 210, 140)
		end
		if waveBtn.Parent then
			waveBtn.BackgroundColor3 = if n >= 1 then Color3.fromRGB(70, 95, 70) else Color3.fromRGB(50, 70, 55)
			if n >= 1 then
				waveBtn.Text = "Wave together"
			elseif softLingered then
				waveBtn.Text = "Wave · still waiting"
			else
				waveBtn.Text = "Wave at bus"
			end
		end
		local world = Workspace:FindFirstChild("BusStopWorld")
		-- notepad color owned by tintTimetable (incl. place-warmth pulse)
		if world then
			for _, child in world:GetChildren() do
				if child:IsA("Seat") and string.find(child.Name, "BenchSeat", 1, true) then
					if n >= 1 then
						child.Color = Color3.fromRGB(130, 105, 75)
					elseif placeWarmKind == "return" then
						child.Color = Color3.fromRGB(125, 102, 74)
					elseif softLingered or placeWarmKind == "depart" then
						child.Color = Color3.fromRGB(120, 98, 72)
					else
						child.Color = Color3.fromRGB(115, 90, 65)
					end
				end
			end
		end
		benchSit.refresh()
		if n >= 1 and not companyWelcomed then
			companyWelcomed = true
			SoftWelcome.show(playerGui, "waiting together", "someone nearby — the timetable knows", {
				AccentColor = busStyle.AccentColor,
				FrameColor = busStyle.FrameColor,
				TitleColor = busStyle.TitleColor,
				BodyColor = busStyle.BodyColor,
				HoldSeconds = 3.6,
			})
		end
		tryTogetherGoal()
	end,
})

task.spawn(function()
	while true do
		task.wait(0.5)
		local character = player.Character
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		local onSeat = humanoid and humanoid.SeatPart ~= nil
		seatedLocal = onSeat == true
		if seatedLocal then
			complete("sit")
			tryTogetherGoal()
		end
	end
end)

-- Soft night rain (visual only — denser alone, softer when waiting together)
if Config.Rain.Enabled then
	task.spawn(function()
		local Workspace = game:GetService("Workspace")
		while true do
			local drops = if nearbyCount >= 1 then 3 else 6
			local waitBetween = if nearbyCount >= 1 then 0.2 else 0.12
			for _ = 1, drops do
				local drop = Instance.new("Part")
				drop.Name = "RainDrop"
				drop.Size = Vector3.new(0.12, 1.4, 0.12)
				drop.Position = Vector3.new((math.random() - 0.5) * 50, 28, (math.random() - 0.5) * 30)
				drop.Anchored = true
				drop.CanCollide = false
				drop.Material = Enum.Material.Neon
				drop.Color = Color3.fromRGB(160, 180, 200)
				drop.Transparency = if nearbyCount >= 1 then 0.5 else 0.35
				drop.Parent = Workspace
				task.spawn(function()
					for _ = 1, 18 do
						if not drop.Parent then
							return
						end
						drop.Position = drop.Position + Vector3.new(0, -1.6, 0.15)
						task.wait(0.03)
					end
					drop:Destroy()
				end)
			end
			task.wait(waitBetween)
		end
	end)
end
