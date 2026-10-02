--!strict
-- Positive-thought towers: Affirmation / Gratitude / Humor (+ levels).

local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local EnemyService = require(script.Parent:WaitForChild("EnemyService"))

export type TowerRecord = {
	kind: string,
	pad: BasePart,
	model: BasePart,
	level: number,
	spent: number,
	lastFire: number,
}

local TowerService = {}

local towersFolder: Folder
local towers: { TowerRecord } = {}
local byPadId: { [number]: TowerRecord } = {}

function TowerService.init(folder: Folder)
	towersFolder = folder
end

function TowerService.list(): { TowerRecord }
	return towers
end

function TowerService.getByPadId(padId: number): TowerRecord?
	return byPadId[padId]
end

function TowerService.statsFor(kindName: string, level: number): {
	Damage: number,
	Range: number,
	FireRate: number,
	SlowFactor: number,
	SplashRadius: number,
	Color: Color3,
	DisplayName: string,
}?
	local kind = Config.TowerKinds[kindName]
	if not kind then
		return nil
	end
	local mult = 1 + (level - 1) * 0.35
	return {
		Damage = kind.Damage * mult,
		Range = kind.Range * (1 + (level - 1) * 0.08),
		FireRate = kind.FireRate * (1 + (level - 1) * 0.12),
		SlowFactor = if kind.SlowFactor < 1
			then math.max(0.35, kind.SlowFactor - (level - 1) * 0.05)
			else 1,
		SplashRadius = kind.SplashRadius * (1 + (level - 1) * 0.1),
		Color = kind.Color,
		DisplayName = kind.DisplayName,
	}
end

function TowerService.upgradeCost(kindName: string, currentLevel: number): number?
	local kind = Config.TowerKinds[kindName]
	if not kind then
		return nil
	end
	if currentLevel >= Config.MaxTowerLevel then
		return nil
	end
	return math.floor(kind.Cost * Config.UpgradeCostFactor * currentLevel)
end

local function makeProjectile(from: Vector3, to: Vector3, color: Color3)
	local bolt = Instance.new("Part")
	bolt.Name = "KindBolt"
	bolt.Size = Vector3.new(0.5, 0.5, 0.5)
	bolt.Shape = Enum.PartType.Ball
	bolt.Color = color
	bolt.Material = Enum.Material.Neon
	bolt.Anchored = true
	bolt.CanCollide = false
	bolt.Position = from
	bolt.Parent = towersFolder
	local light = Instance.new("PointLight")
	light.Color = color
	light.Brightness = 1.5
	light.Range = 8
	light.Parent = bolt

	task.spawn(function()
		local t = 0
		local duration = 0.18
		while t < duration and bolt.Parent do
			t += task.wait()
			local alpha = math.clamp(t / duration, 0, 1)
			bolt.Position = from:Lerp(to, alpha)
		end
		if bolt.Parent then
			bolt:Destroy()
		end
	end)
end

local function popModel(model: BasePart, baseSize: Vector3)
	task.spawn(function()
		local start = os.clock()
		local duration = 0.22
		while model.Parent and os.clock() - start < duration do
			local alpha = (os.clock() - start) / duration
			local bump = 1 + math.sin(alpha * math.pi) * 0.14
			model.Size = baseSize * bump
			task.wait()
		end
		if model.Parent then
			model.Size = baseSize
		end
	end)
end

local function refreshVisual(rec: TowerRecord)
	local stats = TowerService.statsFor(rec.kind, rec.level)
	if not stats then
		return
	end
	rec.model.Size = Vector3.new(3.2, 4.2 + rec.level * 0.8, 3.2)
	rec.model.Position = rec.pad.Position + Vector3.new(0, 2.2 + rec.level * 0.4, 0)
	local crown = rec.model:FindFirstChild("Glow")
	if crown and crown:IsA("BasePart") then
		crown.Size = Vector3.new(1.8, 1.8, 1.8) + Vector3.new(0.3, 0.3, 0.3) * rec.level
		crown.Position = rec.model.Position + Vector3.new(0, 2.6 + rec.level * 0.35, 0)
		local light = crown:FindFirstChildOfClass("PointLight")
		if light then
			light.Range = stats.Range
			light.Brightness = 1.2 + rec.level * 0.25
		end
	end
	local ring = rec.model:FindFirstChild("RangeHint")
	if ring and ring:IsA("BasePart") then
		ring.Size = Vector3.new(0.2, stats.Range * 2, stats.Range * 2)
		ring.Position = rec.pad.Position + Vector3.new(0, 0.4, 0)
	end
	local gui = rec.model:FindFirstChildOfClass("BillboardGui")
	if gui then
		local label = gui:FindFirstChildOfClass("TextLabel")
		if label then
			label.Text = `{stats.DisplayName} L{rec.level}`
		end
	end
	rec.model:SetAttribute("Level", rec.level)
end

function TowerService.tryPlace(kindName: string, pad: BasePart): (boolean, string?)
	local kind = Config.TowerKinds[kindName]
	if not kind then
		return false, "Unknown positive thought"
	end
	if pad:GetAttribute("Occupied") == true then
		return false, "Pad already holds a thought"
	end

	local padId = pad:GetAttribute("PadId")
	if typeof(padId) ~= "number" then
		return false, "Bad pad"
	end

	local tower = Instance.new("Part")
	tower.Name = kind.DisplayName
	tower.Size = Vector3.new(3.2, 5, 3.2)
	tower.Color = kind.Color
	tower.Material = Enum.Material.SmoothPlastic
	tower.Anchored = true
	tower.CanCollide = false
	tower.Position = pad.Position + Vector3.new(0, 2.8, 0)
	tower.Parent = towersFolder
	tower:SetAttribute("Kind", kindName)
	tower:SetAttribute("PadId", padId)
	tower:SetAttribute("Level", 1)

	local crown = Instance.new("Part")
	crown.Name = "Glow"
	crown.Shape = Enum.PartType.Ball
	crown.Size = Vector3.new(2.2, 2.2, 2.2)
	crown.Color = kind.Color
	crown.Material = Enum.Material.Neon
	crown.Anchored = true
	crown.CanCollide = false
	crown.Position = tower.Position + Vector3.new(0, 3.2, 0)
	crown.Parent = tower

	local light = Instance.new("PointLight")
	light.Color = kind.Color
	light.Brightness = 1.4
	light.Range = kind.Range
	light.Parent = crown

	local gui = Instance.new("BillboardGui")
	gui.Size = UDim2.fromOffset(130, 28)
	gui.StudsOffset = Vector3.new(0, 4.5, 0)
	gui.AlwaysOnTop = true
	gui.Parent = tower
	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Text = `{kind.DisplayName} L1`
	label.TextColor3 = Color3.fromRGB(255, 255, 255)
	label.TextScaled = true
	label.Font = Enum.Font.GothamBold
	label.Parent = gui

	local ring = Instance.new("Part")
	ring.Name = "RangeHint"
	ring.Shape = Enum.PartType.Cylinder
	ring.Size = Vector3.new(0.2, kind.Range * 2, kind.Range * 2)
	ring.Orientation = Vector3.new(0, 0, 90)
	ring.Color = kind.Color
	ring.Material = Enum.Material.ForceField
	ring.Transparency = 0.85
	ring.Anchored = true
	ring.CanCollide = false
	ring.Position = pad.Position + Vector3.new(0, 0.4, 0)
	ring.Parent = tower

	pad:SetAttribute("Occupied", true)
	pad.Color = kind.Color:Lerp(Color3.fromRGB(40, 40, 50), 0.35)

	local rec: TowerRecord = {
		kind = kindName,
		pad = pad,
		model = tower,
		level = 1,
		spent = kind.Cost,
		lastFire = 0,
	}
	table.insert(towers, rec)
	byPadId[padId] = rec
	popModel(tower, tower.Size)
	return true, nil
end

function TowerService.tryUpgrade(padId: number): (boolean, number?, string?)
	local rec = byPadId[padId]
	if not rec then
		return false, nil, "No tower here"
	end
	local cost = TowerService.upgradeCost(rec.kind, rec.level)
	if not cost then
		return false, nil, "Already fully grown"
	end
	rec.level += 1
	rec.spent += cost
	refreshVisual(rec)
	popModel(rec.model, rec.model.Size)
	return true, cost, nil
end

function TowerService.trySell(padId: number): (boolean, number?, string?)
	local rec = byPadId[padId]
	if not rec then
		return false, nil, "No tower here"
	end
	local refund = math.floor(rec.spent * Config.SellRefundFactor)
	rec.model:Destroy()
	rec.pad:SetAttribute("Occupied", false)
	rec.pad.Color = Color3.fromRGB(180, 210, 190)
	byPadId[padId] = nil
	for i, t in towers do
		if t == rec then
			table.remove(towers, i)
			break
		end
	end
	return true, refund, nil
end

function TowerService.clearAll()
	for padId, rec in byPadId do
		if rec.model.Parent then
			rec.model:Destroy()
		end
		rec.pad:SetAttribute("Occupied", false)
		rec.pad.Color = Color3.fromRGB(180, 210, 190)
	end
	table.clear(byPadId)
	table.clear(towers)
end

function TowerService.start()
	RunService.Heartbeat:Connect(function()
		local now = os.clock()
		local enemies = EnemyService.getActive()
		for _, tower in towers do
			local stats = TowerService.statsFor(tower.kind, tower.level)
			if not stats then
				continue
			end
			local interval = 1 / stats.FireRate
			if now - tower.lastFire < interval then
				continue
			end

			local origin = tower.model.Position
			local best: any = nil
			local bestDist = stats.Range
			for _, enemy in enemies do
				local d = (enemy.model.Position - origin).Magnitude
				if d <= bestDist then
					bestDist = d
					best = enemy
				end
			end
			if not best then
				continue
			end

			tower.lastFire = now
			makeProjectile(origin + Vector3.new(0, 2, 0), best.model.Position, stats.Color)

			if stats.SlowFactor < 1 then
				EnemyService.applySlow(best.id, stats.SlowFactor, 1.4)
			end

			if stats.SplashRadius > 0 then
				for _, enemy in enemies do
					local d = (enemy.model.Position - best.model.Position).Magnitude
					if d <= stats.SplashRadius then
						EnemyService.damage(enemy.id, stats.Damage)
					end
				end
			else
				EnemyService.damage(best.id, stats.Damage)
			end
		end
	end)
end

return TowerService
