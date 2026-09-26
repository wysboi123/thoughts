--!strict
-- Create or wait for a RemoteEvent folder (server creates, client waits).

local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local RemoteFolder = {}

function RemoteFolder.get(folderName: string): Folder
	if RunService:IsServer() then
		local folder = ReplicatedStorage:FindFirstChild(folderName)
		if folder and folder:IsA("Folder") then
			return folder
		end
		local created = Instance.new("Folder")
		created.Name = folderName
		created.Parent = ReplicatedStorage
		return created
	end
	local folder = ReplicatedStorage:WaitForChild(folderName, 10)
	assert(folder and folder:IsA("Folder"), folderName .. " missing")
	return folder
end

function RemoteFolder.event(folderName: string, eventName: string): RemoteEvent
	local folder = RemoteFolder.get(folderName)
	if RunService:IsServer() then
		local existing = folder:FindFirstChild(eventName)
		if existing and existing:IsA("RemoteEvent") then
			return existing
		end
		local remote = Instance.new("RemoteEvent")
		remote.Name = eventName
		remote.Parent = folder
		return remote
	end
	local remote = folder:WaitForChild(eventName, 10)
	assert(remote and remote:IsA("RemoteEvent"), "Remote missing: " .. eventName)
	return remote
end

return RemoteFolder
