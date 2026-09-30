--!strict
-- Client HUD + pad click placement / upgrade / sell for Thought Defense.

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local selectedKind = "Affirmation"
local buildMode = "plant"
local latestState: any = nil

local gui = Instance.new("ScreenGui")
gui.Name = "ThoughtDefenseHud"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = playerGui

local top = Instance.new("Frame")
top.Name = "TopBar"
top.Size = UDim2.new(1, 0, 0, 64)
top.BackgroundColor3 = Color3.fromRGB(30, 34, 48)
top.BackgroundTransparency = 0.25
top.BorderSizePixel = 0
top.Parent = gui

local title = Instance.new("TextLabel")
title.Size = UDim2.new(0.35, 0, 1, 0)
title.Position = UDim2.fromOffset(16, 0)
title.BackgroundTransparency = 1
title.Font = Enum.Font.GothamBold
title.TextSize = 22
title.TextXAlignment = Enum.TextXAlignment.Left
title.TextColor3 = Color3.fromRGB(230, 240, 255)
title.Text = Config.GameName .. "  v" .. Config.Version
title.Parent = top

local stats = Instance.new("TextLabel")
stats.Name = "Stats"
stats.Size = UDim2.new(0.6, -24, 1, 0)
stats.Position = UDim2.new(0.38, 0, 0, 0)
stats.BackgroundTransparency = 1
stats.Font = Enum.Font.GothamMedium
stats.TextSize = 17
stats.TextXAlignment = Enum.TextXAlignment.Right
stats.TextColor3 = Color3.fromRGB(210, 230, 220)
stats.Text = "Calm — · Clarity — · Wave —"
stats.Parent = top

local blurb = Instance.new("TextLabel")
blurb.Name = "Blurb"
blurb.Size = UDim2.fromOffset(420, 28)
blurb.Position = UDim2.new(0.5, -210, 0, 70)
blurb.BackgroundTransparency = 1
blurb.Font = Enum.Font.Gotham
blurb.TextSize = 14
blurb.TextColor3 = Color3.fromRGB(190, 200, 220)
blurb.Text = Config.TowerKinds.Affirmation.Blurb
blurb.Parent = gui

local startBtn = Instance.new("TextButton")
startBtn.Name = "StartWave"
startBtn.Size = UDim2.fromOffset(180, 44)
startBtn.Position = UDim2.new(0.5, -90, 0, 100)
startBtn.BackgroundColor3 = Color3.fromRGB(90, 170, 150)
startBtn.TextColor3 = Color3.fromRGB(20, 30, 28)
startBtn.Font = Enum.Font.GothamBold
startBtn.TextSize = 18
startBtn.Text = "Begin wave 1"
startBtn.Visible = true
startBtn.Parent = gui
local startCorner = Instance.new("UICorner")
startCorner.CornerRadius = UDim.new(0, 10)
startCorner.Parent = startBtn
startBtn.MouseButton1Click:Connect(function()
	Remotes.StartWave:FireServer()
end)

local tray = Instance.new("Frame")
tray.Name = "TowerTray"
tray.Size = UDim2.fromOffset(480, 118)
tray.Position = UDim2.new(0.5, -240, 1, -138)
tray.BackgroundColor3 = Color3.fromRGB(28, 32, 44)
tray.BackgroundTransparency = 0.15
tray.BorderSizePixel = 0
tray.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 12)
corner.Parent = tray

local trayTitle = Instance.new("TextLabel")
trayTitle.Size = UDim2.new(1, -16, 0, 24)
trayTitle.Position = UDim2.fromOffset(8, 6)
trayTitle.BackgroundTransparency = 1
trayTitle.Font = Enum.Font.Gotham
trayTitle.TextSize = 13
trayTitle.TextXAlignment = Enum.TextXAlignment.Left
trayTitle.TextColor3 = Color3.fromRGB(180, 190, 210)
trayTitle.Text = "Plant on empty pad · click planted pad to upgrade · Sell mode returns Clarity"
trayTitle.Parent = tray

local row = Instance.new("Frame")
row.Name = "ButtonRow"
row.Size = UDim2.new(1, -16, 0, 64)
row.Position = UDim2.fromOffset(8, 36)
row.BackgroundTransparency = 1
row.Parent = tray

local layout = Instance.new("UIListLayout")
layout.FillDirection = Enum.FillDirection.Horizontal
layout.Padding = UDim.new(0, 8)
layout.HorizontalAlignment = Enum.HorizontalAlignment.Center
layout.Parent = row

local buttons: { [string]: TextButton } = {}

local function refreshButtons()
	for name, btn in buttons do
		if name == "Sell" then
			local selected = buildMode == "sell"
			btn.BackgroundColor3 = if selected
				then Color3.fromRGB(200, 110, 110)
				else Color3.fromRGB(120, 70, 75)
			continue
		end
		local kind = Config.TowerKinds[name]
		local selected = buildMode == "plant" and name == selectedKind
		btn.BackgroundColor3 = if selected then kind.Color else kind.Color:Lerp(Color3.fromRGB(20, 20, 30), 0.45)
		local afford = latestState and latestState.clarity >= kind.Cost
		btn.TextTransparency = if afford == false then 0.35 else 0
	end
	local kind = Config.TowerKinds[selectedKind]
	if kind and buildMode == "plant" then
		blurb.Text = kind.Blurb .. "  ·  click existing pad to deepen (upgrade)"
	elseif buildMode == "sell" then
		blurb.Text = "Sell mode — click a planted thought to release it (50% Clarity back)"
	end
end

for kindName, kind in Config.TowerKinds do
	local btn = Instance.new("TextButton")
	btn.Name = kindName
	btn.Size = UDim2.fromOffset(100, 64)
	btn.BackgroundColor3 = kind.Color
	btn.TextColor3 = Color3.fromRGB(20, 24, 32)
	btn.Font = Enum.Font.GothamBold
	btn.TextSize = 12
	btn.Text = `{kind.DisplayName}\n{kind.Cost}`
	btn.AutoButtonColor = true
	btn.Parent = row
	local c = Instance.new("UICorner")
	c.CornerRadius = UDim.new(0, 8)
	c.Parent = btn
	btn.MouseButton1Click:Connect(function()
		selectedKind = kindName
		buildMode = "plant"
		Remotes.SelectTowerKind:FireServer(kindName)
		refreshButtons()
	end)
	buttons[kindName] = btn
end

local sellBtn = Instance.new("TextButton")
sellBtn.Name = "Sell"
sellBtn.Size = UDim2.fromOffset(72, 64)
sellBtn.BackgroundColor3 = Color3.fromRGB(120, 70, 75)
sellBtn.TextColor3 = Color3.fromRGB(255, 230, 230)
sellBtn.Font = Enum.Font.GothamBold
sellBtn.TextSize = 13
sellBtn.Text = "Sell"
sellBtn.Parent = row
local sellCorner = Instance.new("UICorner")
sellCorner.CornerRadius = UDim.new(0, 8)
sellCorner.Parent = sellBtn
sellBtn.MouseButton1Click:Connect(function()
	buildMode = "sell"
	Remotes.SelectTowerKind:FireServer("Sell")
	refreshButtons()
end)
buttons.Sell = sellBtn

local toast = Instance.new("TextLabel")
toast.Name = "Toast"
toast.Size = UDim2.fromOffset(440, 36)
toast.Position = UDim2.new(0.5, -220, 0, 152)
toast.BackgroundColor3 = Color3.fromRGB(40, 36, 55)
toast.BackgroundTransparency = 0.2
toast.TextColor3 = Color3.fromRGB(240, 230, 255)
toast.Font = Enum.Font.GothamMedium
toast.TextSize = 15
toast.Text = Config.Tagline
toast.Parent = gui
local toastCorner = Instance.new("UICorner")
toastCorner.CornerRadius = UDim.new(0, 8)
toastCorner.Parent = toast

local function flash(msg: string)
	toast.Text = msg
end

local function updateStartButton()
	if not latestState then
		return
	end
	local phase = latestState.phase
	if phase == "prep" then
		startBtn.Visible = true
		startBtn.Text = "Begin wave 1"
		startBtn.BackgroundColor3 = Color3.fromRGB(90, 170, 150)
	elseif phase == "intermission" then
		startBtn.Visible = true
		startBtn.Text = `Start wave {latestState.nextWave or "?"}`
		startBtn.BackgroundColor3 = Color3.fromRGB(120, 160, 200)
	else
		startBtn.Visible = false
	end
end

Remotes.StateChanged.OnClientEvent:Connect(function(payload)
	latestState = payload
	if typeof(payload.selectedKind) == "string" then
		selectedKind = payload.selectedKind
	end
	if typeof(payload.buildMode) == "string" then
		buildMode = payload.buildMode
	end
	stats.Text = string.format(
		"Calm %d   ·   Clarity %d   ·   Wave %d/%d",
		payload.calm or 0,
		payload.clarity or 0,
		payload.wave or 0,
		payload.maxWaves or Config.WaveCount
	)
	refreshButtons()
	updateStartButton()
	if payload.phase == "prep" then
		flash("Plant a few positive thoughts, then press Begin.")
	elseif payload.phase == "intermission" then
		flash(`Wave clear. Prep for wave {payload.nextWave} — or wait for auto-start.`)
	end
end)

Remotes.WaveAnnounce.OnClientEvent:Connect(function(wave: number, maxWaves: number)
	flash(`Wave {wave}/{maxWaves} — negative thoughts incoming`)
	startBtn.Visible = false
end)

Remotes.ThoughtCleared.OnClientEvent:Connect(function(kind: string, reward: number)
	flash(`Cleared {kind} (+{reward} Clarity)`)
end)

Remotes.GameOver.OnClientEvent:Connect(function(won: boolean, message: string)
	flash(message)
	startBtn.Visible = false
	local banner = Instance.new("TextLabel")
	banner.Size = UDim2.fromOffset(480, 72)
	banner.Position = UDim2.new(0.5, -240, 0.4, 0)
	banner.BackgroundColor3 = if won then Color3.fromRGB(40, 90, 80) else Color3.fromRGB(90, 40, 55)
	banner.TextColor3 = Color3.fromRGB(255, 255, 255)
	banner.Font = Enum.Font.GothamBold
	banner.TextSize = 22
	banner.Text = if won then "Mindscape quiet" else "Overwhelmed"
	banner.Parent = gui
	local bc = Instance.new("UICorner")
	bc.CornerRadius = UDim.new(0, 12)
	bc.Parent = banner
end)

local function findPad(target: Instance?): BasePart?
	local current: Instance? = target
	while current and current ~= Workspace do
		if current:IsA("BasePart") and current:GetAttribute("PadId") ~= nil then
			return current
		end
		if current.Parent and current.Parent:IsA("BasePart") and current.Parent:GetAttribute("PadId") ~= nil then
			return current.Parent :: BasePart
		end
		-- Clicking the tower model itself
		if current:IsA("BasePart") and current:GetAttribute("PadId") ~= nil then
			return nil
		end
		local padAttr = current:GetAttribute("PadId")
		if current:IsA("BasePart") and typeof(padAttr) == "number" and current:GetAttribute("Kind") ~= nil then
			local world = Workspace:FindFirstChild("ThoughtWorld")
			local pads = world and world:FindFirstChild("Pads")
			if pads then
				local pad = pads:FindFirstChild("Pad" .. padAttr)
				if pad and pad:IsA("BasePart") then
					return pad
				end
			end
		end
		current = current.Parent
	end
	return nil
end

local function handlePadClick(pad: BasePart)
	local padId = pad:GetAttribute("PadId")
	if typeof(padId) ~= "number" then
		return
	end
	if buildMode == "sell" then
		Remotes.SellTower:FireServer(padId)
		return
	end
	Remotes.PlaceTower:FireServer(padId)
end

local mouse = player:GetMouse()
mouse.Button1Down:Connect(function()
	local pad = findPad(mouse.Target)
	if pad then
		handlePadClick(pad)
	end
end)

UserInputService.TouchTap:Connect(function(positions, processed)
	if processed then
		return
	end
	local cam = Workspace.CurrentCamera
	if not cam or #positions == 0 then
		return
	end
	local pos = positions[1]
	local ray = cam:ViewportPointToRay(pos.X, pos.Y)
	local params = RaycastParams.new()
	params.FilterType = Enum.RaycastFilterType.Exclude
	params.FilterDescendantsInstances = { player.Character }
	local result = Workspace:Raycast(ray.Origin, ray.Direction * 400, params)
	if not result then
		return
	end
	local pad = findPad(result.Instance)
	if pad then
		handlePadClick(pad)
	end
end)

flash("Thought Defense v" .. Config.Version .. " — plant, then Begin")
refreshButtons()
