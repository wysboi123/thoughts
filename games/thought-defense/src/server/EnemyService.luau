--!strict
-- Negative thoughts walk the path toward the Peace Core.

local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))

export type EnemyRecord = {
	id: number,
	kind: string,
	model: BasePart,
	health: number,
	maxHealth: number,
	speed: number,
	slowFactor: number,
	waypointIndex: number,
	alive: boolean,
}

local EnemyService = {}

local nextId = 0
local active: { [number]: EnemyRecord } = {}
local enemiesFolder: Folder
local waypoints: { Vector3 }
local onLeak: ((EnemyRecord) -> ())?
local onCleared: ((EnemyRecord) -> ())?

local function pickFlavor(kind: any): string?
	local lines = kind.Flavor
	if typeof(lines) ~= "table" or #lines == 0 then
		return nil
	end
	return lines[math.random(1, #lines)]
end

local function healthBar(part: BasePart, flavor: string?): Frame
	local gui = Instance.new("BillboardGui")
	gui.Name = "HealthBar"
	gui.Size = UDim2.fromOffset(110, 36)
	gui.StudsOffset = Vector3.new(0, 2.8, 0)
	gui.AlwaysOnTop = true
	gui.Parent = part

	local nameLabel = Instance.new("TextLabel")
	nameLabel.Name = "KindLabel"
	nameLabel.Size = UDim2.new(1, 0, 0, 14)
	nameLabel.Position = UDim2.fromOffset(0, 0)
	nameLabel.BackgroundTransparency = 1
	nameLabel.TextColor3 = Color3.fromRGB(230, 210, 240)
	nameLabel.TextScaled = true
	nameLabel.Font = Enum.Font.GothamMedium
	nameLabel.Parent = gui

	local flavorLabel = Instance.new("TextLabel")
	flavorLabel.Name = "FlavorLabel"
	flavorLabel.Size = UDim2.new(1, 0, 0, 12)
	flavorLabel.Position = UDim2.fromOffset(0, 13)
	flavorLabel.BackgroundTransparency = 1
	flavorLabel.TextColor3 = Color3.fromRGB(190, 175, 205)
	flavorLabel.TextScaled = true
	flavorLabel.Font = Enum.Font.Gotham
	flavorLabel.Text = flavor or ""
	flavorLabel.Visible = flavor ~= nil and flavor ~= ""
	flavorLabel.Parent = gui

	local bg = Instance.new("Frame")
	bg.Size = UDim2.new(1, -20, 0, 8)
	bg.Position = UDim2.fromOffset(10, 26)
	bg.BackgroundColor3 = Color3.fromRGB(40, 30, 45)
	bg.BorderSizePixel = 0
	bg.Parent = gui

	local fill = Instance.new("Frame")
	fill.Name = "Fill"
	fill.Size = UDim2.fromScale(1, 1)
	fill.BackgroundColor3 = Color3.fromRGB(200, 90, 120)
	fill.BorderSizePixel = 0
	fill.Parent = bg

	return fill
end

function EnemyService.init(folder: Folder, pathPoints: { Vector3 })
	enemiesFolder = folder
	waypoints = pathPoints
end

function EnemyService.setCallbacks(leakCb: (EnemyRecord) -> (), clearedCb: (EnemyRecord) -> ())
	onLeak = leakCb
	onCleared = clearedCb
end

function EnemyService.getActive(): { EnemyRecord }
	local list = {}
	for _, rec in active do
		if rec.alive then
			table.insert(list, rec)
		end
	end
	return list
end

function EnemyService.countAlive(): number
	local n = 0
	for _, rec in active do
		if rec.alive then
			n += 1
		end
	end
	return n
end

function EnemyService.clearAll()
	for id, rec in active do
		rec.alive = false
		if rec.model.Parent then
			rec.model:Destroy()
		end
		active[id] = nil
	end
end

function EnemyService.spawn(kindName: string): EnemyRecord?
	local kind = Config.EnemyKinds[kindName]
	if not kind then
		warn("[ThoughtDefense] unknown enemy kind", kindName)
		return nil
	end
	nextId += 1
	local id = nextId
	local start = waypoints[1]
	local part = Instance.new("Part")
	part.Name = kind.DisplayName .. "_" .. id
	part.Size = kind.Size
	part.Color = kind.Color
	part.Material = Enum.Material.SmoothPlastic
	part.Anchored = true
	part.CanCollide = false
	part.Position = start + Vector3.new(0, kind.Size.Y / 2, 0)
	part.Parent = enemiesFolder
	part:SetAttribute("EnemyId", id)
	part:SetAttribute("Kind", kindName)

	local fill = healthBar(part, pickFlavor(kind))
	local gui = part:FindFirstChild("HealthBar")
	if gui and gui:IsA("BillboardGui") then
		local label = gui:FindFirstChild("KindLabel")
		if label and label:IsA("TextLabel") then
			label.Text = kind.DisplayName
		end
	end

	local rec: EnemyRecord = {
		id = id,
		kind = kindName,
		model = part,
		health = kind.Health,
		maxHealth = kind.Health,
		speed = kind.Speed,
		slowFactor = 1,
		waypointIndex = 2,
		alive = true,
	}
	active[id] = rec

	-- Keep fill reference via attribute updates
	part:SetAttribute("HpRatio", 1)
	part:GetAttributeChangedSignal("HpRatio"):Connect(function()
		local ratio = part:GetAttribute("HpRatio")
		if typeof(ratio) == "number" and fill.Parent then
			fill.Size = UDim2.fromScale(math.clamp(ratio, 0, 1), 1)
		end
	end)

	return rec
end

function EnemyService.applySlow(id: number, factor: number, duration: number)
	local rec = active[id]
	if not rec or not rec.alive then
		return
	end
	rec.slowFactor = math.min(rec.slowFactor, factor)
	task.delay(duration, function()
		local still = active[id]
		if still and still.alive then
			still.slowFactor = 1
		end
	end)
end

function EnemyService.damage(id: number, amount: number): boolean
	local rec = active[id]
	if not rec or not rec.alive then
		return false
	end
	rec.health -= amount
	rec.model:SetAttribute("HpRatio", rec.health / rec.maxHealth)
	if rec.health <= 0 then
		rec.alive = false
		if onCleared then
			onCleared(rec)
		end
		rec.model:Destroy()
		active[id] = nil
		return true
	end
	return false
end

function EnemyService.start()
	RunService.Heartbeat:Connect(function(dt)
		for id, rec in active do
			if not rec.alive then
				continue
			end
			local targetIndex = rec.waypointIndex
			if targetIndex > #waypoints then
				rec.alive = false
				if onLeak then
					onLeak(rec)
				end
				rec.model:Destroy()
				active[id] = nil
				continue
			end
			local target = waypoints[targetIndex]
			local pos = rec.model.Position
			local flatTarget = Vector3.new(target.X, pos.Y, target.Z)
			local delta = flatTarget - pos
			local dist = delta.Magnitude
			local step = rec.speed * rec.slowFactor * dt
			if dist <= step then
				rec.model.Position = flatTarget
				rec.waypointIndex += 1
			else
				rec.model.Position = pos + delta.Unit * step
			end
		end
	end)
end

return EnemyService
