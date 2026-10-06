--!strict
local Chill = game:GetService("ReplicatedStorage"):WaitForChild("Chill")
local RemoteFolder = require(Chill:WaitForChild("RemoteFolder"))

local FOLDER = "ThoughtDefenseRemotes"

local Remotes = {
	StateChanged = RemoteFolder.event(FOLDER, "StateChanged"),
	PlaceTower = RemoteFolder.event(FOLDER, "PlaceTower"),
	UpgradeTower = RemoteFolder.event(FOLDER, "UpgradeTower"),
	SellTower = RemoteFolder.event(FOLDER, "SellTower"),
	SelectTowerKind = RemoteFolder.event(FOLDER, "SelectTowerKind"),
	StartWave = RemoteFolder.event(FOLDER, "StartWave"),
	RestartRun = RemoteFolder.event(FOLDER, "RestartRun"),
	GoalProgress = RemoteFolder.event(FOLDER, "GoalProgress"),
	WaveAnnounce = RemoteFolder.event(FOLDER, "WaveAnnounce"),
	ThoughtCleared = RemoteFolder.event(FOLDER, "ThoughtCleared"),
	CalmLeak = RemoteFolder.event(FOLDER, "CalmLeak"),
	GameOver = RemoteFolder.event(FOLDER, "GameOver"),
}

return Remotes
