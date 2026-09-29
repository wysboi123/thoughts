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
	phase = "prep", -- prep | wave | won | lost
	selectedKind = "Affirmation",
}

local function broadcast()
	Remotes.StateChanged:FireAllClients({
		calm = state.calm,
		clarity = state.clarity,
		wave = state.wave,
		maxWaves = Config.WaveCount,
		phase = state.phase,
		selectedKind = state.selectedKind,
		towers = Config.TowerKinds,
	})
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
	Remotes.GameOver:FireAllClients(true, "Quiet held. You cleared the mindscape.")
	broadcast()
end

EnemyService.setCallbacks(function(rec)
	state.calm = math.max(0, state.calm - Config.LeakPenalty)
	broadcast()
	if state.calm <= 0 then
		fail()
	end
end, function(rec)
	local kind = Config.EnemyKinds[rec.kind]
	local reward = if kind then kind.ClarityReward else 5
	state.clarity += reward
	Remotes.ThoughtCleared:FireAllClients(rec.kind, reward)
	broadcast()
end)

WaveService.setCallbacks(function()
	-- wave cleared
	broadcast()
end, function()
	if state.calm > 0 then
		win()
	end
end)

EnemyService.start()
TowerService.start()

Remotes.SelectTowerKind.OnServerEvent:Connect(function(player: Player, kindName: unknown)
	if typeof(kindName) ~= "string" then
		return
	end
	if not Config.TowerKinds[kindName] then
		return
	end
	state.selectedKind = kindName
	broadcast()
end)

Remotes.PlaceTower.OnServerEvent:Connect(function(player: Player, padId: unknown)
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

-- Kick off campaign once someone is in
task.spawn(function()
	while #Players:GetPlayers() == 0 do
		task.wait(0.5)
	end
	state.phase = "wave"
	broadcast()
	WaveService.startCampaign()
	-- Keep wave number in sync
	task.spawn(function()
		while state.phase == "wave" do
			state.wave = WaveService.getWave()
			broadcast()
			task.wait(1)
		end
	end)
end)

print("[ThoughtDefense]", Config.Version, "—", Config.Tagline)
