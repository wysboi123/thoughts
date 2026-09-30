--!strict
-- Client HUD + pad click placement / upgrade / sell for Thought Defense.

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))
local SoftGoals = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftGoals"))
local SoftWelcome = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftWelcome"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

SoftWelcome.show(
	playerGui,
	Config.GameName,
	"Plant kindness. Protect your Peace Core. Soft goals on the right."
)

local _, completeGoal = SoftGoals.mount(playerGui, "soft session", {
	{ Id = "plantFirst", Label = "Plant one positive thought" },
	{ Id = "clearThought", Label = "Clear one negative thought" },
	{ Id = "surviveWave1", Label = "Survive wave 1" },
	{ Id = "upgradeOnce", Label = "Deepen a thought (upgrade)" },
	{ Id = "clearMind", Label = "Hold quiet through all waves" },
})

Remotes.GoalProgress.OnClientEvent:Connect(function(goalId: string)
	if typeof(goalId) == "string" then
		completeGoal(goalId)
	end
end)

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
toast.Size = UDim2.fromOffset(520, 44)
toast.Position = UDim2.new(0.5, -260, 0, 148)
toast.BackgroundColor3 = Color3.fromRGB(40, 36, 55)
toast.BackgroundTransparency = 0.15
toast.TextColor3 = Color3.fromRGB(240, 230, 255)
toast.Font = Enum.Font.GothamMedium
toast.TextSize = 15
toast.Text = Config.Tagline
toast.TextWrapped = true
toast.Parent = gui
local toastCorner = Instance.new("UICorner")
toastCorner.CornerRadius = UDim.new(0, 8)
toastCorner.Parent = toast

local toastStroke = Instance.new("UIStroke")
toastStroke.Name = "ToastStroke"
toastStroke.Thickness = 1.5
toastStroke.Transparency = 0.45
toastStroke.Color = Color3.fromRGB(160, 170, 210)
toastStroke.Parent = toast

local toastGen = 0
local intermissionToken = 0

local TOAST_TINT = {
	prep = Color3.fromRGB(40, 55, 52),
	intermission = Color3.fromRGB(45, 50, 70),
	wave = Color3.fromRGB(70, 42, 58),
	clear = Color3.fromRGB(42, 58, 52),
	default = Color3.fromRGB(40, 36, 55),
}

local function flash(msg: string, tintKey: string?)
	toastGen += 1
	local gen = toastGen
	toast.Text = msg
	local key = tintKey or "default"
	local tint = TOAST_TINT.default
	if key == "prep" then
		tint = TOAST_TINT.prep
	elseif key == "intermission" then
		tint = TOAST_TINT.intermission
	elseif key == "wave" then
		tint = TOAST_TINT.wave
	elseif key == "clear" then
		tint = TOAST_TINT.clear
	end
	toast.BackgroundColor3 = tint
	toastStroke.Color = if key == "wave"
		then Color3.fromRGB(220, 140, 160)
		elseif key == "intermission" then Color3.fromRGB(140, 170, 230)
		elseif key == "prep" then Color3.fromRGB(130, 200, 180)
		else Color3.fromRGB(160, 170, 210)
	task.delay(0.08, function()
		if gen ~= toastGen then
			return
		end
		toast.BackgroundTransparency = 0.05
		task.wait(0.12)
		if gen == toastGen then
			toast.BackgroundTransparency = 0.15
		end
	end)
end

local restartChip = Instance.new("TextButton")
restartChip.Name = "RestartChip"
restartChip.Size = UDim2.fromOffset(88, 32)
restartChip.Position = UDim2.new(0, 16, 1, -160)
restartChip.BackgroundColor3 = Color3.fromRGB(48, 54, 70)
restartChip.BackgroundTransparency = 0.15
restartChip.TextColor3 = Color3.fromRGB(210, 220, 235)
restartChip.Font = Enum.Font.GothamMedium
restartChip.TextSize = 13
restartChip.Text = "Restart"
restartChip.Parent = gui
local restartChipCorner = Instance.new("UICorner")
restartChipCorner.CornerRadius = UDim.new(0, 8)
restartChipCorner.Parent = restartChip
restartChip.MouseButton1Click:Connect(function()
	local banner = gui:FindFirstChild("GameOverBanner")
	if banner then
		banner:Destroy()
	end
	Remotes.RestartRun:FireServer()
	flash("Fresh mindscape — plant again, then Begin", "prep")
end)

local function waveComposition(waveIndex: number): string
	local recipe = Config.Waves[waveIndex]
	if typeof(recipe) ~= "table" then
		return "mixed thoughts"
	end
	local parts = {}
	for _, group in recipe do
		local kindName = group[1]
		local count = group[2]
		local kind = Config.EnemyKinds[kindName]
		local label = if kind then kind.DisplayName else tostring(kindName)
		table.insert(parts, `{count} {label}`)
	end
	if #parts == 0 then
		return "mixed thoughts"
	end
	return table.concat(parts, " · ")
end

local function stopIntermissionCountdown()
	intermissionToken += 1
end

local function startIntermissionCountdown(nextWave: number)
	stopIntermissionCountdown()
	local token = intermissionToken
	local total = Config.SecondsBetweenWaves
	task.spawn(function()
		for remaining = total, 1, -1 do
			if token ~= intermissionToken then
				return
			end
			if latestState and latestState.phase ~= "intermission" then
				return
			end
			local comp = waveComposition(nextWave)
			flash(
				`Wave {nextWave - 1} clear · next in {remaining}s — {comp} (or Start early)`,
				"intermission"
			)
			task.wait(1)
		end
	end)
end

local lastPhase: string? = nil

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
	local phase = payload.phase
	local phaseChanged = phase ~= lastPhase
	lastPhase = phase
	if not phaseChanged then
		return
	end
	if phase == "prep" then
		stopIntermissionCountdown()
		local comp = waveComposition(1)
		flash(`Plant positive thoughts, then Begin — wave 1: {comp}`, "prep")
	elseif phase == "intermission" then
		local nextWave = payload.nextWave or 2
		startIntermissionCountdown(nextWave)
	elseif phase == "wave" or phase == "won" or phase == "lost" then
		stopIntermissionCountdown()
	end
end)

Remotes.WaveAnnounce.OnClientEvent:Connect(function(wave: number, maxWaves: number)
	stopIntermissionCountdown()
	local comp = waveComposition(wave)
	flash(`Wave {wave}/{maxWaves} incoming — {comp}`, "wave")
	startBtn.Visible = false
end)

Remotes.ThoughtCleared.OnClientEvent:Connect(function(kind: string, reward: number)
	flash(`Cleared {kind} (+{reward} Clarity)`, "clear")
end)

local function flashPeaceCore()
	local world = Workspace:FindFirstChild("ThoughtWorld")
	local decor = world and world:FindFirstChild("Decor")
	local core = decor and decor:FindFirstChild("PeaceCore")
	if not (core and core:IsA("BasePart")) then
		return
	end
	local original = core.Color
	local light = core:FindFirstChildOfClass("PointLight")
	local origBright = if light then light.Brightness else nil
	core.Color = Color3.fromRGB(220, 110, 130)
	if light then
		light.Brightness = (origBright or 2) + 1.4
		light.Color = Color3.fromRGB(255, 140, 160)
	end
	task.delay(0.28, function()
		if core.Parent then
			core.Color = original
		end
		if light and light.Parent then
			light.Brightness = origBright or 2
			light.Color = Color3.fromRGB(160, 240, 230)
		end
	end)
end

Remotes.CalmLeak.OnClientEvent:Connect(function(calmLeft: number, penalty: number)
	flash(`Calm -{penalty} — a thought reached the Peace Core ({calmLeft} left)`, "wave")
	flashPeaceCore()
end)

Remotes.GameOver.OnClientEvent:Connect(function(won: boolean, message: string)
	stopIntermissionCountdown()
	flash(message, if won then "clear" else "wave")
	startBtn.Visible = false
	local banner = Instance.new("Frame")
	banner.Name = "GameOverBanner"
	banner.Size = UDim2.fromOffset(480, 120)
	banner.Position = UDim2.new(0.5, -240, 0.38, 0)
	banner.BackgroundColor3 = if won then Color3.fromRGB(40, 90, 80) else Color3.fromRGB(90, 40, 55)
	banner.Parent = gui
	local bc = Instance.new("UICorner")
	bc.CornerRadius = UDim.new(0, 12)
	bc.Parent = banner
	local titleLabel = Instance.new("TextLabel")
	titleLabel.Size = UDim2.new(1, -24, 0, 40)
	titleLabel.Position = UDim2.fromOffset(12, 12)
	titleLabel.BackgroundTransparency = 1
	titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	titleLabel.Font = Enum.Font.GothamBold
	titleLabel.TextSize = 22
	titleLabel.Text = if won then "Mindscape quiet" else "Overwhelmed"
	titleLabel.Parent = banner
	local restart = Instance.new("TextButton")
	restart.Size = UDim2.fromOffset(160, 40)
	restart.Position = UDim2.new(0.5, -80, 1, -52)
	restart.BackgroundColor3 = Color3.fromRGB(230, 240, 255)
	restart.TextColor3 = Color3.fromRGB(30, 40, 50)
	restart.Font = Enum.Font.GothamBold
	restart.TextSize = 16
	restart.Text = "Try again"
	restart.Parent = banner
	local rc = Instance.new("UICorner")
	rc.CornerRadius = UDim.new(0, 8)
	rc.Parent = restart
	restart.MouseButton1Click:Connect(function()
		banner:Destroy()
		Remotes.RestartRun:FireServer()
		flash("Fresh mindscape — plant again, then Begin", "prep")
	end)
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

-- Soft pad hover cue (client-only SelectionBox; does not fight server pad colors)
local hoverPad: BasePart? = nil
local hoverBox: SelectionBox? = nil
local hoverPulse = 0
local hoverTip: BillboardGui? = nil

local function ensureHoverTip(): BillboardGui
	if hoverTip and hoverTip.Parent then
		return hoverTip
	end
	local tip = Instance.new("BillboardGui")
	tip.Name = "PadHoverTip"
	tip.Size = UDim2.fromOffset(160, 28)
	tip.StudsOffset = Vector3.new(0, 3.2, 0)
	tip.AlwaysOnTop = true
	tip.Enabled = false
	tip.Parent = Workspace
	local label = Instance.new("TextLabel")
	label.Name = "Label"
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundColor3 = Color3.fromRGB(28, 34, 48)
	label.BackgroundTransparency = 0.2
	label.TextColor3 = Color3.fromRGB(230, 240, 255)
	label.Font = Enum.Font.GothamMedium
	label.TextSize = 13
	label.Text = ""
	label.Parent = tip
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 6)
	corner.Parent = label
	hoverTip = tip
	return tip
end

local function findTowerOnPad(padId: number): BasePart?
	local world = Workspace:FindFirstChild("ThoughtWorld")
	local towers = world and world:FindFirstChild("Towers")
	if not towers then
		return nil
	end
	for _, child in towers:GetChildren() do
		if child:IsA("BasePart") and child:GetAttribute("PadId") == padId then
			return child
		end
	end
	return nil
end

local function upgradeHintForPad(pad: BasePart): string?
	local padId = pad:GetAttribute("PadId")
	if typeof(padId) ~= "number" then
		return nil
	end
	if pad:GetAttribute("Occupied") ~= true then
		return "Empty pad · plant here"
	end
	if buildMode == "sell" then
		return "Sell · reclaim Clarity"
	end
	local tower = findTowerOnPad(padId)
	if not tower then
		return "Planted thought"
	end
	local kindName = tower:GetAttribute("Kind")
	local level = tower:GetAttribute("Level")
	if typeof(kindName) ~= "string" or typeof(level) ~= "number" then
		return "Click to deepen"
	end
	local kind = Config.TowerKinds[kindName]
	if not kind then
		return "Click to deepen"
	end
	if level >= (Config.MaxTowerLevel or 3) then
		return `{kind.DisplayName} L{level} · maxed`
	end
	local cost = math.floor(kind.Cost * (Config.UpgradeCostFactor or 0.75) * level)
	return `{kind.DisplayName} L{level} · upgrade {cost}`
end

local function ensureHoverBox(): SelectionBox
	if hoverBox and hoverBox.Parent then
		return hoverBox
	end
	local box = Instance.new("SelectionBox")
	box.Name = "PadHoverCue"
	box.LineThickness = 0.06
	box.SurfaceTransparency = 0.75
	box.Color3 = Color3.fromRGB(180, 230, 200)
	box.SurfaceColor3 = Color3.fromRGB(160, 220, 190)
	box.Adornee = nil
	box.Parent = Workspace
	hoverBox = box
	return box
end

local function clearPadHover()
	if hoverBox then
		hoverBox.Adornee = nil
	end
	if hoverTip then
		hoverTip.Enabled = false
		hoverTip.Adornee = nil
	end
	hoverPad = nil
end

local function setPadHover(pad: BasePart?)
	if pad == hoverPad then
		return
	end
	hoverPad = pad
	local box = ensureHoverBox()
	box.Adornee = pad
	hoverPulse = 0
	local tip = ensureHoverTip()
	if pad then
		tip.Adornee = pad
		tip.Enabled = true
		local label = tip:FindFirstChild("Label")
		if label and label:IsA("TextLabel") then
			label.Text = upgradeHintForPad(pad) or ""
		end
	else
		tip.Enabled = false
		tip.Adornee = nil
	end
	if buildMode == "sell" then
		box.Color3 = Color3.fromRGB(230, 140, 140)
		box.SurfaceColor3 = Color3.fromRGB(210, 120, 120)
	else
		box.Color3 = Color3.fromRGB(180, 230, 200)
		box.SurfaceColor3 = Color3.fromRGB(160, 220, 190)
	end
end

RunService.RenderStepped:Connect(function(dt)
	hoverPulse += dt
	local pad = findPad(mouse.Target)
	-- Force color / tip refresh when mode changes while still on same pad
	if pad and pad == hoverPad and hoverBox then
		if buildMode == "sell" then
			hoverBox.Color3 = Color3.fromRGB(230, 140, 140)
			hoverBox.SurfaceColor3 = Color3.fromRGB(210, 120, 120)
		else
			hoverBox.Color3 = Color3.fromRGB(180, 230, 200)
			hoverBox.SurfaceColor3 = Color3.fromRGB(160, 220, 190)
		end
		local tip = ensureHoverTip()
		local label = tip:FindFirstChild("Label")
		if label and label:IsA("TextLabel") then
			label.Text = upgradeHintForPad(pad) or ""
		end
	end
	setPadHover(pad)
	if hoverBox and hoverPad then
		local pulse = 0.5 + 0.5 * math.sin(hoverPulse * 5)
		hoverBox.LineThickness = 0.045 + 0.035 * pulse
		hoverBox.SurfaceTransparency = 0.82 - 0.12 * pulse
	end
end)

flash("Thought Defense v" .. Config.Version .. " — plant, then Begin · hover pads for upgrade cost", "prep")
refreshButtons()
