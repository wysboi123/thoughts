--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))
local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))
local Emotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Emotes"))

local EmoteService = {}

local cooldown: { [number]: number } = {}
local tempSeats: { [number]: Seat } = {}

local function clearTempSeat(userId: number)
	local seat = tempSeats[userId]
	if seat then
		seat:Destroy()
		tempSeats[userId] = nil
	end
end

local function findNearestSeat(position: Vector3): Seat?
	local world = Workspace:FindFirstChild("HazeWorld")
	if not world then
		return nil
	end
	local best: Seat? = nil
	local bestDist = 12
	for _, child in world:GetChildren() do
		if child:IsA("Seat") and child.Occupant == nil then
			local dist = (child.Position - position).Magnitude
			if dist < bestDist then
				bestDist = dist
				best = child
			end
		end
	end
	return best
end

local function playWave(character: Model)
	local root = character:FindFirstChild("HumanoidRootPart")
	if not root or not root:IsA("BasePart") then
		return
	end
	local start = root.CFrame
	task.spawn(function()
		for i = 1, 8 do
			if not root.Parent then
				return
			end
			local yaw = math.sin(i * 0.8) * 0.45
			root.CFrame = start * CFrame.Angles(0, yaw, 0)
			task.wait(0.12)
		end
		if root.Parent then
			root.CFrame = start
		end
	end)
end

local function playFloat(character: Model)
	local root = character:FindFirstChild("HumanoidRootPart")
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not root or not root:IsA("BasePart") or not humanoid then
		return
	end
	humanoid.PlatformStand = false
	root.AssemblyLinearVelocity = Vector3.new(0, Config.Emote.FloatBoost, 0)
	local att = Instance.new("Attachment")
	att.Name = "HazeFloatAtt"
	att.Parent = root
	local linear = Instance.new("LinearVelocity")
	linear.Name = "HazeFloatVel"
	linear.Attachment0 = att
	linear.MaxForce = 20000
	linear.VectorVelocity = Vector3.new(0, 2.5, 0)
	linear.RelativeTo = Enum.ActuatorRelativeTo.World
	linear.Parent = root
	task.delay(Config.Emote.FloatDuration, function()
		if linear.Parent then
			linear:Destroy()
		end
		if att.Parent then
			att:Destroy()
		end
	end)
end

local function playSit(player: Player, character: Model)
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	local root = character:FindFirstChild("HumanoidRootPart")
	if not humanoid or not root or not root:IsA("BasePart") then
		return
	end

	local nearby = findNearestSeat(root.Position)
	if nearby then
		nearby:Sit(humanoid)
		return
	end

	clearTempSeat(player.UserId)
	local seat = Instance.new("Seat")
	seat.Name = "TempSit"
	seat.Size = Vector3.new(2, 0.4, 2)
	seat.CFrame = root.CFrame * CFrame.new(0, -2.5, 0)
	seat.Anchored = true
	seat.CanCollide = false
	seat.Transparency = 1
	seat.Parent = Workspace
	tempSeats[player.UserId] = seat
	seat:Sit(humanoid)
	task.delay(8, function()
		if tempSeats[player.UserId] == seat then
			clearTempSeat(player.UserId)
		end
	end)
end

function EmoteService.start()
	Remotes.EmoteRequest.OnServerEvent:Connect(function(player: Player, emoteId: unknown)
		if typeof(emoteId) ~= "string" or not Emotes.IsValid(emoteId) then
			return
		end
		local now = os.clock()
		local last = cooldown[player.UserId] or 0
		if now - last < Config.Emote.Cooldown then
			return
		end
		cooldown[player.UserId] = now

		local character = player.Character
		if not character then
			return
		end

		if emoteId == "wave" then
			playWave(character)
		elseif emoteId == "sit" then
			playSit(player, character)
		elseif emoteId == "float" then
			playFloat(character)
		end

		Remotes.EmotePlayed:FireAllClients(player.UserId, emoteId)
	end)
end

function EmoteService.onPlayerRemoving(player: Player)
	cooldown[player.UserId] = nil
	clearTempSeat(player.UserId)
end

return EmoteService
