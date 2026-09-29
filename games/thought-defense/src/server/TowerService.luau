--!strict
-- Positive-thought towers: Affirmation / Gratitude / Humor.

local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local EnemyService = require(script.Parent:WaitForChild("EnemyService"))

export type TowerRecord = {
	kind: string,
	pad: BasePart,
	model: BasePart,
	lastFire: number,
}

local TowerService = {}

local towersFolder: Folder
local towers: { TowerRecord } = {}

function TowerService.init(folder: Folder)
	towersFolder = folder
end

function TowerService.list(): { TowerRecord }
	return towers
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

function TowerService.tryPlace(kindName: string, pad: BasePart): (boolean, string?)
	local kind = Config.TowerKinds[kindName]
	if not kind then
		return false, "Unknown positive thought"
	end
	if pad:GetAttribute("Occupied") == true then
		return false, "Pad already holds a thought"
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
	gui.Size = UDim2.fromOffset(120, 28)
	gui.StudsOffset = Vector3.new(0, 4.5, 0)
	gui.AlwaysOnTop = true
	gui.Parent = tower
	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Text = kind.DisplayName
	label.TextColor3 = Color3.fromRGB(255, 255, 255)
	label.TextScaled = true
	label.Font = Enum.Font.GothamBold
	label.Parent = gui

	-- Range ring (visual only)
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

	table.insert(towers, {
		kind = kindName,
		pad = pad,
		model = tower,
		lastFire = 0,
	})
	return true, nil
end

function TowerService.start()
	RunService.Heartbeat:Connect(function()
		local now = os.clock()
		local enemies = EnemyService.getActive()
		for _, tower in towers do
			local kind = Config.TowerKinds[tower.kind]
			if not kind then
				continue
			end
			local interval = 1 / kind.FireRate
			if now - tower.lastFire < interval then
				continue
			end

			local origin = tower.model.Position
			local best: any = nil
			local bestDist = kind.Range
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
			makeProjectile(origin + Vector3.new(0, 2, 0), best.model.Position, kind.Color)

			if kind.SlowFactor < 1 then
				EnemyService.applySlow(best.id, kind.SlowFactor, 1.4)
			end

			if kind.SplashRadius > 0 then
				for _, enemy in enemies do
					local d = (enemy.model.Position - best.model.Position).Magnitude
					if d <= kind.SplashRadius then
						EnemyService.damage(enemy.id, kind.Damage)
					end
				end
			else
				EnemyService.damage(best.id, kind.Damage)
			end
		end
	end)
end

return TowerService
