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
tag.Text = Config.Tagline
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
ChillProximity.start(player, {
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
SoftWelcome.show(playerGui, Config.GameName, "the bus will come. you don't have to. wait together.", busStyle)

local _, complete = SoftGoals.mount(playerGui, "tonight's soft goals", {
	{ Id = "sit", Label = "sit on a bench" },
	{ Id = "ticket", Label = "pick up a ticket" },
	{ Id = "wave", Label = "wave when the bus stops" },
	{ Id = "together", Label = "wait together on a bench" },
})

local function tryTogetherGoal()
	if nearbyCount >= 1 and seatedLocal then
		complete("together")
	end
end

local Workspace = game:GetService("Workspace")
local function tintTimetable(company: boolean)
	local world = Workspace:FindFirstChild("BusStopWorld")
	local board = world and world:FindFirstChild("Timetable")
	local gui = board and board:FindFirstChildWhichIsA("SurfaceGui")
	local body = gui and gui:FindFirstChild("TimetableBody")
	if body and body:IsA("TextLabel") then
		body.TextColor3 = if company then Color3.fromRGB(230, 245, 200) else Color3.fromRGB(200, 220, 180)
	end
	local news = world and world:FindFirstChild("NewsBox")
	local newsGui = news and news:FindFirstChildWhichIsA("SurfaceGui")
	local newsLabel = newsGui and newsGui:FindFirstChildWhichIsA("TextLabel")
	if newsLabel and newsLabel:IsA("TextLabel") then
		newsLabel.Text = if company then "TODAY\n\nstill\ntogether" else "TODAY\n\nstill\nfree"
	end
end

local companyWelcomed = false
SoftCompany.mount(playerGui, player, {
	Radius = Config.Proximity.Radius,
	Color = Color3.fromRGB(190, 200, 170),
	AloneText = "soft company · alone is fine",
	OneText = "soft company · waiting together",
	ManyText = function(n)
		return ("soft company · %d nearby · wait together"):format(n)
	end,
	OnCountChanged = function(n)
		nearbyCount = n
		if phase == "waiting" then
			refreshStatus()
		end
		tintTimetable(n >= 1)
		if counter and counter.Parent then
			counter.BackgroundColor3 = if n >= 1 then Color3.fromRGB(40, 48, 36) else Color3.fromRGB(30, 32, 28)
		end
		if n >= 1 and not companyWelcomed then
			companyWelcomed = true
			SoftWelcome.show(playerGui, "waiting together", "someone nearby — the timetable knows", busStyle)
		end
		tryTogetherGoal()
	end,
})

Remotes.TicketCollected.OnClientEvent:Connect(function()
	complete("ticket")
end)

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

local SoftSit = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftSit"))
local benchSit = SoftSit.mount(playerGui, {
	OneText = function(name)
		return name .. " is waiting"
	end,
	ManyText = function(names)
		return table.concat(names, " & ") .. " are waiting"
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
