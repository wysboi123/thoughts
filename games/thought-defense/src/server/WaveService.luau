--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))
local EnemyService = require(script.Parent:WaitForChild("EnemyService"))

local WaveService = {}

local running = false
local currentWave = 0
local onWaveDone: (() -> ())?
local onAllDone: (() -> ())?

function WaveService.setCallbacks(waveDone: () -> (), allDone: () -> ())
	onWaveDone = waveDone
	onAllDone = allDone
end

function WaveService.getWave(): number
	return currentWave
end

function WaveService.isRunning(): boolean
	return running
end

local function spawnGroup(kindName: string, count: number, spacing: number)
	for _ = 1, count do
		if not running then
			return
		end
		EnemyService.spawn(kindName)
		task.wait(spacing)
	end
end

function WaveService.startCampaign()
	if running then
		return
	end
	running = true
	task.spawn(function()
		task.wait(Config.SecondsBeforeFirstWave)
		for waveIndex, recipe in Config.Waves do
			if not running then
				return
			end
			currentWave = waveIndex
			Remotes.WaveAnnounce:FireAllClients(waveIndex, Config.WaveCount)
			-- Spawn groups in parallel within a wave
			local threads = 0
			local done = 0
			for _, group in recipe do
				threads += 1
				task.spawn(function()
					spawnGroup(group[1], group[2], group[3])
					done += 1
				end)
			end
			while done < threads do
				task.wait(0.2)
			end
			-- Wait until lane is clear
			while EnemyService.countAlive() > 0 do
				task.wait(0.25)
			end
			if onWaveDone then
				onWaveDone()
			end
			if waveIndex < Config.WaveCount then
				task.wait(Config.SecondsBetweenWaves)
			end
		end
		running = false
		if onAllDone then
			onAllDone()
		end
	end)
end

function WaveService.stop()
	running = false
end

return WaveService
