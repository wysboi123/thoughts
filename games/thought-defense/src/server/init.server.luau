--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local WorldBuilder = require(script:WaitForChild("WorldBuilder"))
local EnemyService = require(script:WaitForChild("EnemyService"))
local TowerService = require(script:WaitForChild("TowerService"))
local WaveService = require(script:WaitForChild("WaveService"))

local world = WorldBuilder.build()
EnemyService.init(world.enemiesFolder, world.waypoints)
TowerService.init(world.towersFolder)

local state = {
	calm = Config.StartingCalm,
	clarity = Config.StartingClarity,
	wave = 0,
	nextWave = 1,
	phase = "prep", -- prep | intermission | wave | won | lost
	selectedKind = "Affirmation",
	buildMode = "plant", -- plant | sell
}

local goalsDone: { [string]: boolean } = {}
local campaignWatch: thread? = nil

local function broadcast()
	Remotes.StateChanged:FireAllClients({
		calm = state.calm,
		clarity = state.clarity,
		wave = state.wave,
		nextWave = state.nextWave,
		maxWaves = Config.WaveCount,
		phase = state.phase,
		selectedKind = state.selectedKind,
		buildMode = state.buildMode,
		towers = Config.TowerKinds,
		maxTowerLevel = Config.MaxTowerLevel,
		upgradeCostFactor = Config.UpgradeCostFactor,
		sellRefundFactor = Config.SellRefundFactor,
	})
end

local function markGoal(id: string)
	if goalsDone[id] then
		return
	end
	goalsDone[id] = true
	Remotes.GoalProgress:FireAllClients(id)
end

local function fail()
	if state.phase == "lost" or state.phase == "won" then
		return
	end
	state.phase = "lost"
	WaveService.stop()
	Remotes.GameOver:FireAllClients(false, "The noise reached your Peace Core. Try a gentler layout.")
	broadcast()
end

local function win()
	if state.phase == "lost" or state.phase == "won" then
		return
	end
	state.phase = "won"
	markGoal("clearMind")
	Remotes.GameOver:FireAllClients(true, "Quiet held. You cleared the mindscape.")
	broadcast()
end

local function startCampaignWatch()
	if campaignWatch then
		task.cancel(campaignWatch)
		campaignWatch = nil
	end
	campaignWatch = task.spawn(function()
		while state.phase ~= "won" and state.phase ~= "lost" do
			if WaveService.isWaveInProgress() then
				state.phase = "wave"
				state.wave = WaveService.getWave()
				if state.wave >= 1 then
					markGoal("surviveWave1")
				end
			end
			broadcast()
			task.wait(0.75)
		end
	end)
end

local function resetRun()
	WaveService.stop()
	EnemyService.clearAll()
	TowerService.clearAll()
	table.clear(goalsDone)
	state.calm = Config.StartingCalm
	state.clarity = Config.StartingClarity
	state.wave = 0
	state.nextWave = 1
	state.phase = "prep"
	state.selectedKind = "Affirmation"
	state.buildMode = "plant"
	broadcast()
	-- Brief pause so WaveService.stop unblocks, then new campaign
	task.delay(0.35, function()
		if state.phase ~= "prep" then
			return
		end
		WaveService.startCampaign()
		startCampaignWatch()
	end)
end

EnemyService.setCallbacks(function(_rec)
	state.calm = math.max(0, state.calm - Config.LeakPenalty)
	Remotes.CalmLeak:FireAllClients(state.calm, Config.LeakPenalty)
	broadcast()
	if state.calm <= 0 then
		fail()
	end
end, function(rec)
	local kind = Config.EnemyKinds[rec.kind]
	local reward = if kind then kind.ClarityReward else 5
	state.clarity += reward
	Remotes.ThoughtCleared:FireAllClients(rec.kind, reward)
	markGoal("clearThought")
	broadcast()
end)

WaveService.setCallbacks(function()
	if WaveService.getWave() >= 1 then
		markGoal("surviveWave1")
	end
	broadcast()
end, function()
	if state.calm > 0 then
		win()
	end
end, function(nextWave: number)
	state.nextWave = nextWave
	state.wave = math.max(0, nextWave - 1)
	state.phase = if nextWave == 1 then "prep" else "intermission"
	broadcast()
end)

EnemyService.start()
TowerService.start()

Remotes.SelectTowerKind.OnServerEvent:Connect(function(_player: Player, kindName: unknown)
	if typeof(kindName) ~= "string" then
		return
	end
	if kindName == "Sell" then
		state.buildMode = "sell"
		broadcast()
		return
	end
	if not Config.TowerKinds[kindName] then
		return
	end
	state.buildMode = "plant"
	state.selectedKind = kindName
	broadcast()
end)

Remotes.StartWave.OnServerEvent:Connect(function(_player: Player)
	if state.phase == "lost" or state.phase == "won" then
		return
	end
	if state.phase ~= "prep" and state.phase ~= "intermission" then
		return
	end
	state.phase = "wave"
	broadcast()
	WaveService.requestStart()
end)

Remotes.RestartRun.OnServerEvent:Connect(function(_player: Player)
	if state.phase ~= "won" and state.phase ~= "lost" and state.phase ~= "prep" then
		-- Allow restart mid-run only from prep, or always for playtest friendliness
		-- Mid-wave restart is OK for solo TD
	end
	resetRun()
end)

Remotes.PlaceTower.OnServerEvent:Connect(function(_player: Player, padId: unknown)
	if state.phase == "lost" or state.phase == "won" then
		return
	end
	if typeof(padId) ~= "number" then
		return
	end
	local pad = world.pads[padId]
	if not pad then
		return
	end

	-- Occupied pad: upgrade in plant mode (button chrome still pending A/B/C vote)
	if pad:GetAttribute("Occupied") == true then
		local cost = nil
		local rec = TowerService.getByPadId(padId)
		if rec then
			cost = TowerService.upgradeCost(rec.kind, rec.level)
		end
		if not cost or state.clarity < cost then
			return
		end
		local ok, spent = TowerService.tryUpgrade(padId)
		if ok and spent then
			state.clarity -= spent
			markGoal("upgradeOnce")
			broadcast()
		end
		return
	end

	if state.buildMode ~= "plant" then
		return
	end
	local kind = Config.TowerKinds[state.selectedKind]
	if not kind then
		return
	end
	if state.clarity < kind.Cost then
		return
	end
	local ok = TowerService.tryPlace(state.selectedKind, pad)
	if ok then
		state.clarity -= kind.Cost
		markGoal("plantFirst")
		broadcast()
	end
end)

Remotes.UpgradeTower.OnServerEvent:Connect(function(_player: Player, padId: unknown)
	if state.phase == "lost" or state.phase == "won" then
		return
	end
	if typeof(padId) ~= "number" then
		return
	end
	local rec = TowerService.getByPadId(padId)
	if not rec then
		return
	end
	local cost = TowerService.upgradeCost(rec.kind, rec.level)
	if not cost or state.clarity < cost then
		return
	end
	local ok, spent = TowerService.tryUpgrade(padId)
	if ok and spent then
		state.clarity -= spent
		markGoal("upgradeOnce")
		broadcast()
	end
end)

Remotes.SellTower.OnServerEvent:Connect(function(_player: Player, padId: unknown)
	if state.phase == "lost" or state.phase == "won" then
		return
	end
	if typeof(padId) ~= "number" then
		return
	end
	local ok, refund = TowerService.trySell(padId)
	if ok and refund then
		state.clarity += refund
		broadcast()
	end
end)

Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function(character)
		local root = character:WaitForChild("HumanoidRootPart", 5)
		if root and root:IsA("BasePart") then
			root.CFrame = CFrame.new(Config.Spawn + Vector3.new(0, 3, 0))
		end
	end)
	task.defer(broadcast)
end)

task.spawn(function()
	while #Players:GetPlayers() == 0 do
		task.wait(0.5)
	end
	state.phase = "prep"
	broadcast()
	WaveService.startCampaign()
	startCampaignWatch()
end)

print("[ThoughtDefense]", Config.Version, "—", Config.Tagline)
