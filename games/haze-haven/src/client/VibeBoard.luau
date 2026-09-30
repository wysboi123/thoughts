--!strict
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))

local VibeBoard = {}

local function findBoard(): (Folder?, BasePart?, TextLabel?, TextLabel?)
	local world = Workspace:FindFirstChild("HazeWorld")
	if not world then
		return nil, nil, nil, nil
	end
	local board = world:FindFirstChild("VibeBoard")
	if not (board and board:IsA("BasePart")) then
		return world :: Folder, nil, nil, nil
	end
	local gui = board:FindFirstChild("VibeBoardGui")
	local title = gui and gui:FindFirstChild("BoardTitle")
	local body = gui and gui:FindFirstChild("BoardBody")
	local titleLabel = if title and title:IsA("TextLabel") then title else nil
	local bodyLabel = if body and body:IsA("TextLabel") then body else nil
	return world :: Folder, board, titleLabel, bodyLabel
end

function VibeBoard.start()
	Remotes.VibeBoard.OnClientEvent:Connect(function(text: string)
		local _, _, _, body = findBoard()
		if body then
			body.Text = text
		end
	end)
end

function VibeBoard.setSynced(synced: boolean)
	local _, board, title, body = findBoard()
	if title then
		title.TextColor3 = if synced then Color3.fromRGB(255, 230, 255) else Color3.fromRGB(230, 200, 255)
		title.Text = if synced then "tonight's vibes · syncing" else "tonight's vibes"
	end
	if body then
		body.TextColor3 = if synced then Color3.fromRGB(230, 210, 255) else Color3.fromRGB(200, 180, 230)
	end
	if board then
		board.Color = if synced then Color3.fromRGB(55, 42, 78) else Color3.fromRGB(40, 32, 55)
	end
end

return VibeBoard
