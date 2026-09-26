--!strict
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))

local VibeBoard = {}

function VibeBoard.start()
	Remotes.VibeBoard.OnClientEvent:Connect(function(text: string)
		local world = Workspace:FindFirstChild("HazeWorld")
		local board = world and world:FindFirstChild("VibeBoard")
		local gui = board and board:FindFirstChild("VibeBoardGui")
		local body = gui and gui:FindFirstChild("BoardBody")
		if body and body:IsA("TextLabel") then
			body.Text = text
		end
	end)
end

return VibeBoard
