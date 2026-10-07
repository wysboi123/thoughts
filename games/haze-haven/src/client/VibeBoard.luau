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

local boardSynced = false
local boardLingered = false

local function applyBoardLook()
	local world, board, title, body = findBoard()
	local synced = boardSynced
	local lingered = boardLingered and not synced
	if title then
		if synced then
			title.TextColor3 = Color3.fromRGB(255, 230, 255)
			title.Text = "tonight's vibes · syncing"
		elseif lingered then
			title.TextColor3 = Color3.fromRGB(210, 220, 210)
			title.Text = "tonight's vibes · still here"
		else
			title.TextColor3 = Color3.fromRGB(230, 200, 255)
			title.Text = "tonight's vibes"
		end
	end
	if body then
		if synced then
			body.TextColor3 = Color3.fromRGB(230, 210, 255)
		elseif lingered then
			body.TextColor3 = Color3.fromRGB(190, 205, 195)
		else
			body.TextColor3 = Color3.fromRGB(200, 180, 230)
		end
	end
	if board then
		if synced then
			board.Color = Color3.fromRGB(55, 42, 78)
		elseif lingered then
			board.Color = Color3.fromRGB(38, 40, 48)
		else
			board.Color = Color3.fromRGB(40, 32, 55)
		end
		local light = board:FindFirstChildOfClass("PointLight")
		if not light then
			light = Instance.new("PointLight")
			light.Name = "VibeBoardSyncLight"
			light.Color = Color3.fromRGB(200, 160, 255)
			light.Parent = board
		end
		if synced then
			light.Brightness = 1.8
			light.Range = 16
			light.Color = Color3.fromRGB(200, 160, 255)
		elseif lingered then
			light.Brightness = 1.0
			light.Range = 11
			light.Color = Color3.fromRGB(170, 200, 185)
		else
			light.Brightness = 0.6
			light.Range = 8
			light.Color = Color3.fromRGB(200, 160, 255)
		end
	end
	-- Soft-tint uncollected vibe orbs while company is near (local visual)
	if world then
		local syncColor = Color3.fromRGB(210, 160, 255)
		local lingerColor = Color3.fromRGB(200, 150, 210)
		local baseColor = Color3.fromRGB(220, 120, 200)
		for _, child in world:GetChildren() do
			if child:IsA("BasePart") and child:GetAttribute("IsVibeOrb") and not child:GetAttribute("Collected") then
				child.Color = if synced then syncColor elseif lingered then lingerColor else baseColor
				local orbLight = child:FindFirstChildOfClass("PointLight")
				if orbLight then
					orbLight.Color = child.Color
					orbLight.Brightness = if synced then 2.4 elseif lingered then 2.0 else 1.8
				end
			end
		end
	end
end

function VibeBoard.setSynced(synced: boolean)
	boardSynced = synced
	applyBoardLook()
end

-- Soft stay signal after OnLinger when alone (playtime USP; sync still wins)
function VibeBoard.setLingered(lingered: boolean)
	boardLingered = lingered
	applyBoardLook()
end

return VibeBoard
