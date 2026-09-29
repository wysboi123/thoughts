--!strict
local Chill = game:GetService("ReplicatedStorage"):WaitForChild("Chill")
local RemoteFolder = require(Chill:WaitForChild("RemoteFolder"))

local FOLDER = "ThoughtDefenseRemotes"

local Remotes = {
	StateChanged = RemoteFolder.event(FOLDER, "StateChanged"),
	PlaceTower = RemoteFolder.event(FOLDER, "PlaceTower"),
	SelectTowerKind = RemoteFolder.event(FOLDER, "SelectTowerKind"),
	WaveAnnounce = RemoteFolder.event(FOLDER, "WaveAnnounce"),
	ThoughtCleared = RemoteFolder.event(FOLDER, "ThoughtCleared"),
	GameOver = RemoteFolder.event(FOLDER, "GameOver"),
}

return Remotes
