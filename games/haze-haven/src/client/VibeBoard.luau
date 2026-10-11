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
local pulseToken = 0
local pulseKind: string? = nil -- "depart" | "return" | nil

local function applyBoardLook()
	local world, board, title, body = findBoard()
	local synced = boardSynced
	local pulse = pulseKind
	local lingered = boardLingered and not synced and pulse == nil
	if title then
		if synced then
			title.TextColor3 = Color3.fromRGB(255, 230, 255)
			title.Text = "tonight's vibes · syncing"
		elseif pulse == "return" then
			title.TextColor3 = Color3.fromRGB(230, 245, 230)
			title.Text = "tonight's vibes · company again"
		elseif pulse == "depart" then
			title.TextColor3 = Color3.fromRGB(200, 210, 205)
			title.Text = "tonight's vibes · they drifted"
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
		elseif pulse == "return" then
			body.TextColor3 = Color3.fromRGB(210, 230, 210)
		elseif pulse == "depart" or lingered then
			body.TextColor3 = Color3.fromRGB(190, 205, 195)
		else
			body.TextColor3 = Color3.fromRGB(200, 180, 230)
		end
	end
	if board then
		if synced then
			board.Color = Color3.fromRGB(55, 42, 78)
		elseif pulse == "return" then
			board.Color = Color3.fromRGB(42, 48, 50)
		elseif pulse == "depart" or lingered then
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
		elseif pulse == "return" then
			light.Brightness = 1.35
			light.Range = 13
			light.Color = Color3.fromRGB(180, 220, 195)
		elseif pulse == "depart" or lingered then
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
		local returnColor = Color3.fromRGB(190, 210, 180)
		local lingerColor = Color3.fromRGB(200, 150, 210)
		local baseColor = Color3.fromRGB(220, 120, 200)
		for _, child in world:GetChildren() do
			if child:IsA("BasePart") and child:GetAttribute("IsVibeOrb") and not child:GetAttribute("Collected") then
				child.Color = if synced
					then syncColor
					elseif pulse == "return" then returnColor
					elseif pulse == "depart" or lingered then lingerColor
					else baseColor
				local orbLight = child:FindFirstChildOfClass("PointLight")
				if orbLight then
					orbLight.Color = child.Color
					orbLight.Brightness = if synced then 2.4 elseif pulse == "return" then 2.2 elseif pulse == "depart" or lingered then 2.0 else 1.8
				end
			end
		end
	end
end

function VibeBoard.setSynced(synced: boolean)
	boardSynced = synced
	if synced then
		pulseKind = nil
	end
	applyBoardLook()
end

-- Soft stay signal after OnLinger when alone (playtime USP; sync still wins)
function VibeBoard.setLingered(lingered: boolean)
	boardLingered = lingered
	applyBoardLook()
end

local function pulseWelcomeAndHammock(kind: "depart" | "return", token: number)
	local world = Workspace:FindFirstChild("HazeWorld")
	if not world then
		return
	end
	local sign = world:FindFirstChild("WelcomeSign")
	local welcomeGui = sign and sign:FindFirstChildWhichIsA("SurfaceGui")
	local welcomeBody = welcomeGui and welcomeGui:FindFirstChild("WelcomeBody")
	local prevSignText: string? = nil
	local prevSignColor: Color3? = nil
	if welcomeBody and welcomeBody:IsA("TextLabel") then
		prevSignText = welcomeBody.Text
		prevSignColor = welcomeBody.TextColor3
		welcomeBody.Text = if kind == "return"
			then "company again · vibes stay soft"
			else "they drifted · vibes stay soft"
		welcomeBody.TextColor3 = if kind == "return"
			then Color3.fromRGB(210, 230, 210)
			else Color3.fromRGB(190, 200, 195)
	end
	local hammock = world:FindFirstChild("HammockCloth")
	local prevHammock: Color3? = nil
	if hammock and hammock:IsA("BasePart") then
		prevHammock = hammock.Color
		hammock.Color = if kind == "return"
			then Color3.fromRGB(170, 150, 190)
			else Color3.fromRGB(150, 130, 170)
	end
	task.delay(4.0, function()
		if token ~= pulseToken then
			return
		end
		-- Server AtmosphereService resumes vibeSynced colors; only restore if still alone
		if boardSynced then
			return
		end
		if welcomeBody and welcomeBody:IsA("TextLabel") and prevSignText then
			welcomeBody.Text = prevSignText
			if prevSignColor then
				welcomeBody.TextColor3 = prevSignColor
			end
		end
		if hammock and hammock:IsA("BasePart") and prevHammock then
			hammock.Color = prevHammock
		end
	end)
end

-- Brief place-warmth pulse when company leaves / returns (sync still wins)
function VibeBoard.pulseCompany(kind: "depart" | "return")
	if boardSynced then
		return
	end
	pulseToken += 1
	local token = pulseToken
	pulseKind = kind
	applyBoardLook()
	pulseWelcomeAndHammock(kind, token)
	task.delay(4.0, function()
		if token ~= pulseToken then
			return
		end
		pulseKind = nil
		applyBoardLook()
	end)
end

return VibeBoard
