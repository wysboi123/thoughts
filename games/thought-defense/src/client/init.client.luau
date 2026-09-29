--!strict
-- Client HUD + pad click placement for Thought Defense.

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
title.Size = UDim2.new(0.4, 0, 1, 0)
title.Position = UDim2.fromOffset(16, 0)
title.BackgroundTransparency = 1
title.Font = Enum.Font.GothamBold
title.TextSize = 22
title.TextXAlignment = Enum.TextXAlignment.Left
title.TextColor3 = Color3.fromRGB(230, 240, 255)
title.Text = Config.GameName
title.Parent = top

local stats = Instance.new("TextLabel")
stats.Name = "Stats"
stats.Size = UDim2.new(0.55, -24, 1, 0)
stats.Position = UDim2.new(0.45, 0, 0, 0)
stats.BackgroundTransparency = 1
stats.Font = Enum.Font.GothamMedium
stats.TextSize = 18
stats.TextXAlignment = Enum.TextXAlignment.Right
stats.TextColor3 = Color3.fromRGB(210, 230, 220)
stats.Text = "Calm — · Clarity — · Wave —"
stats.Parent = top

local tray = Instance.new("Frame")
tray.Name = "TowerTray"
tray.Size = UDim2.fromOffset(360, 110)
tray.Position = UDim2.new(0.5, -180, 1, -130)
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
trayTitle.TextSize = 14
trayTitle.TextXAlignment = Enum.TextXAlignment.Left
trayTitle.TextColor3 = Color3.fromRGB(180, 190, 210)
trayTitle.Text = "Positive thoughts — click a pad to plant"
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
		local kind = Config.TowerKinds[name]
		local selected = name == selectedKind
		btn.BackgroundColor3 = if selected then kind.Color else kind.Color:Lerp(Color3.fromRGB(20, 20, 30), 0.45)
		local afford = latestState and latestState.clarity >= kind.Cost
		btn.TextTransparency = if afford == false then 0.35 else 0
	end
end

for kindName, kind in Config.TowerKinds do
	local btn = Instance.new("TextButton")
	btn.Name = kindName
	btn.Size = UDim2.fromOffset(108, 64)
	btn.BackgroundColor3 = kind.Color
	btn.TextColor3 = Color3.fromRGB(20, 24, 32)
	btn.Font = Enum.Font.GothamBold
	btn.TextSize = 13
	btn.Text = `{kind.DisplayName}\n{kind.Cost} Clarity`
	btn.AutoButtonColor = true
	btn.Parent = row
	local c = Instance.new("UICorner")
	c.CornerRadius = UDim.new(0, 8)
	c.Parent = btn
	btn.MouseButton1Click:Connect(function()
		selectedKind = kindName
		Remotes.SelectTowerKind:FireServer(kindName)
		refreshButtons()
	end)
	buttons[kindName] = btn
end

local toast = Instance.new("TextLabel")
toast.Name = "Toast"
toast.Size = UDim2.fromOffset(420, 40)
toast.Position = UDim2.new(0.5, -210, 0, 80)
toast.BackgroundColor3 = Color3.fromRGB(40, 36, 55)
toast.BackgroundTransparency = 0.2
toast.TextColor3 = Color3.fromRGB(240, 230, 255)
toast.Font = Enum.Font.GothamMedium
toast.TextSize = 16
toast.Text = Config.Tagline
toast.Parent = gui
local toastCorner = Instance.new("UICorner")
toastCorner.CornerRadius = UDim.new(0, 8)
toastCorner.Parent = toast

local function flash(msg: string)
	toast.Text = msg
end

Remotes.StateChanged.OnClientEvent:Connect(function(payload)
	latestState = payload
	if typeof(payload.selectedKind) == "string" then
		selectedKind = payload.selectedKind
	end
	stats.Text = string.format(
		"Calm %d   ·   Clarity %d   ·   Wave %d/%d",
		payload.calm or 0,
		payload.clarity or 0,
		payload.wave or 0,
		payload.maxWaves or Config.WaveCount
	)
	refreshButtons()
	if payload.phase == "prep" then
		flash("Plant kindness on the soft pads — first wave soon.")
	end
end)

Remotes.WaveAnnounce.OnClientEvent:Connect(function(wave: number, maxWaves: number)
	flash(`Wave {wave}/{maxWaves} — negative thoughts incoming`)
end)

Remotes.ThoughtCleared.OnClientEvent:Connect(function(kind: string, reward: number)
	flash(`Cleared {kind} (+{reward} Clarity)`)
end)

Remotes.GameOver.OnClientEvent:Connect(function(won: boolean, message: string)
	flash(message)
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
		-- PadRing is child of pad
		if current.Parent and current.Parent:IsA("BasePart") and current.Parent:GetAttribute("PadId") ~= nil then
			return current.Parent :: BasePart
		end
		current = current.Parent
	end
	return nil
end

local mouse = player:GetMouse()
mouse.Button1Down:Connect(function()
	local pad = findPad(mouse.Target)
	if not pad then
		return
	end
	local padId = pad:GetAttribute("PadId")
	if typeof(padId) ~= "number" then
		return
	end
	Remotes.PlaceTower:FireServer(padId)
end)

-- Touch support: tap near pads via ray
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
		local padId = pad:GetAttribute("PadId")
		if typeof(padId) == "number" then
			Remotes.PlaceTower:FireServer(padId)
		end
	end
end)

flash("Thought Defense v" .. Config.Version .. " — plant positive thoughts on pads")
