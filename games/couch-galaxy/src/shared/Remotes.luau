--!strict
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local FOLDER_NAME = "GalaxyRemotes"

local function getFolder(): Folder
	if RunService:IsServer() then
		local folder = ReplicatedStorage:FindFirstChild(FOLDER_NAME)
		if folder and folder:IsA("Folder") then
			return folder
		end
		local created = Instance.new("Folder")
		created.Name = FOLDER_NAME
		created.Parent = ReplicatedStorage
		return created
	end
	local folder = ReplicatedStorage:WaitForChild(FOLDER_NAME, 10)
	assert(folder and folder:IsA("Folder"), "GalaxyRemotes missing")
	return folder
end

local function getRemote(name: string): RemoteEvent
	local folder = getFolder()
	if RunService:IsServer() then
		local existing = folder:FindFirstChild(name)
		if existing and existing:IsA("RemoteEvent") then
			return existing
		end
		local remote = Instance.new("RemoteEvent")
		remote.Name = name
		remote.Parent = folder
		return remote
	end
	local remote = folder:WaitForChild(name, 10)
	assert(remote and remote:IsA("RemoteEvent"), "Remote missing: " .. name)
	return remote
end

return {
	StarCollected = getRemote("StarCollected"),
	EnteredGalaxy = getRemote("EnteredGalaxy"),
	ReturnedHome = getRemote("ReturnedHome"),
	CouchSitChanged = getRemote("CouchSitChanged"),
}
