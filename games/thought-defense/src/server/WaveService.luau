--!strict
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))
local EnemyService = require(script.Parent:WaitForChild("EnemyService"))

local WaveService = {}

local campaignActive = false
local waveInProgress = false
local currentWave = 0
local waitingForStart = false
local startRequested = false
local onWaveDone: (() -> ())?
local onAllDone: (() -> ())?
local onIntermission: ((nextWave: number) -> ())?

function WaveService.setCallbacks(
	waveDone: () -> (),
	allDone: () -> (),
	intermission: ((nextWave: number) -> ())?
)
	onWaveDone = waveDone
	onAllDone = allDone
	onIntermission = intermission
end

function WaveService.getWave(): number
	return currentWave
end

function WaveService.isWaveInProgress(): boolean
	return waveInProgress
end

function WaveService.isWaitingForStart(): boolean
	return waitingForStart
end

function WaveService.requestStart()
	if waitingForStart then
		startRequested = true
	end
end

local function spawnGroup(kindName: string, count: number, spacing: number)
	for _ = 1, count do
		if not campaignActive then
			return
		end
		EnemyService.spawn(kindName)
		task.wait(spacing)
	end
end

local function waitForPlayerStart(timeoutSeconds: number?)
	waitingForStart = true
	startRequested = false
	local deadline = if timeoutSeconds then os.clock() + timeoutSeconds else nil
	while campaignActive and not startRequested do
		if deadline and os.clock() >= deadline then
			break
		end
		task.wait(0.1)
	end
	waitingForStart = false
	startRequested = false
end

function WaveService.startCampaign()
	if campaignActive then
		return
	end
	campaignActive = true
	task.spawn(function()
		for waveIndex, recipe in Config.Waves do
			if not campaignActive then
				return
			end
			if onIntermission then
				onIntermission(waveIndex)
			end
			-- First wave: wait forever until Begin. Later waves: timeout then auto.
			if waveIndex == 1 then
				waitForPlayerStart(nil)
			else
				waitForPlayerStart(Config.SecondsBetweenWaves)
			end
			if not campaignActive then
				return
			end

			currentWave = waveIndex
			waveInProgress = true
			Remotes.WaveAnnounce:FireAllClients(waveIndex, Config.WaveCount)

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
			while EnemyService.countAlive() > 0 do
				if not campaignActive then
					waveInProgress = false
					return
				end
				task.wait(0.25)
			end
			waveInProgress = false
			if onWaveDone then
				onWaveDone()
			end
		end
		campaignActive = false
		if onAllDone then
			onAllDone()
		end
	end)
end

function WaveService.stop()
	campaignActive = false
	waveInProgress = false
	waitingForStart = false
	startRequested = true -- unblock waiters
	currentWave = 0
end

return WaveService
