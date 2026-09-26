--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local player = Players.LocalPlayer
local gui = Instance.new("ScreenGui")
gui.Name = "BusHud"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = player:WaitForChild("PlayerGui")

local title = Instance.new("TextLabel")
title.BackgroundTransparency = 1
title.Position = UDim2.new(0, 24, 0, 28)
title.Size = UDim2.new(0, 420, 0, 32)
title.Font = Enum.Font.GothamMedium
title.TextSize = 26
title.TextXAlignment = Enum.TextXAlignment.Left
title.TextColor3 = Color3.fromRGB(220, 230, 210)
title.Text = Config.GameName
title.Parent = gui

local tag = Instance.new("TextLabel")
tag.BackgroundTransparency = 1
tag.Position = UDim2.new(0, 24, 0, 60)
tag.Size = UDim2.new(0, 420, 0, 22)
tag.Font = Enum.Font.Gotham
tag.TextSize = 14
tag.TextXAlignment = Enum.TextXAlignment.Left
tag.TextColor3 = Color3.fromRGB(170, 180, 160)
tag.Text = Config.Tagline
tag.Parent = gui

local busStatus = Instance.new("TextLabel")
busStatus.BackgroundTransparency = 1
busStatus.Position = UDim2.new(0, 24, 0, 86)
busStatus.Size = UDim2.new(0, 360, 0, 18)
busStatus.Font = Enum.Font.Gotham
busStatus.TextSize = 13
busStatus.TextXAlignment = Enum.TextXAlignment.Left
busStatus.TextColor3 = Color3.fromRGB(150, 160, 140)
busStatus.Text = "waiting · no rush"
busStatus.Parent = gui

local counter = Instance.new("TextLabel")
counter.BackgroundColor3 = Color3.fromRGB(30, 32, 28)
counter.BackgroundTransparency = 0.25
counter.Position = UDim2.new(0, 24, 1, -72)
counter.Size = UDim2.new(0, 200, 0, 44)
counter.Font = Enum.Font.GothamMedium
counter.TextSize = 18
counter.TextColor3 = Color3.fromRGB(240, 210, 140)
counter.Text = "Tickets  0"
counter.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 10)
corner.Parent = counter

Remotes.TicketCollected.OnClientEvent:Connect(function(count: number)
	counter.Text = ("Tickets  %d"):format(count)
end)

Remotes.BusArrived.OnClientEvent:Connect(function()
	busStatus.Text = "bus is here · stay if you want"
	busStatus.TextColor3 = Color3.fromRGB(200, 220, 170)
end)

Remotes.BusDeparted.OnClientEvent:Connect(function()
	busStatus.Text = "departed · another will come"
	busStatus.TextColor3 = Color3.fromRGB(150, 160, 140)
	task.delay(3, function()
		if busStatus.Parent then
			busStatus.Text = "waiting · no rush"
		end
	end)
end)

-- Soft proximity glow near other players
local ChillProximity = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("Proximity"))
ChillProximity.start(player, {
	Radius = Config.Proximity.Radius,
	GlowColor = Config.Proximity.GlowColor,
	Brightness = 1.4,
	Range = 10,
})

print("[BusStopForever] client ready")
local SoftGoals = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftGoals"))
local _, complete = SoftGoals.mount(player:WaitForChild("PlayerGui"), "tonight's soft goals", {
	{ Id = "sit", Label = "sit on a bench" },
	{ Id = "ticket", Label = "pick up a ticket" },
	{ Id = "wave", Label = "wave when the bus stops" },
})

Remotes.TicketCollected.OnClientEvent:Connect(function()
	complete("ticket")
end)

local waveBtn = Instance.new("TextButton")
waveBtn.Name = "WaveButton"
waveBtn.AnchorPoint = Vector2.new(0.5, 1)
waveBtn.Position = UDim2.new(0.5, 0, 1, -120)
waveBtn.Size = UDim2.fromOffset(160, 40)
waveBtn.BackgroundColor3 = Color3.fromRGB(50, 70, 55)
waveBtn.Font = Enum.Font.GothamMedium
waveBtn.TextSize = 16
waveBtn.TextColor3 = Color3.fromRGB(220, 240, 210)
waveBtn.Text = "Wave at bus"
waveBtn.Visible = false
waveBtn.Parent = gui
local waveCorner = Instance.new("UICorner")
waveCorner.CornerRadius = UDim.new(0, 10)
waveCorner.Parent = waveBtn

waveBtn.MouseButton1Click:Connect(function()
	Remotes.WaveAtBus:FireServer()
end)

Remotes.BusArrived.OnClientEvent:Connect(function()
	waveBtn.Visible = true
end)

Remotes.BusDeparted.OnClientEvent:Connect(function()
	waveBtn.Visible = false
end)

Remotes.WaveAtBus.OnClientEvent:Connect(function(name: string)
	complete("wave")
	busStatus.Text = name .. " waved · no rush"
	busStatus.TextColor3 = Color3.fromRGB(200, 220, 170)
end)

task.spawn(function()
	while true do
		task.wait(0.5)
		local character = player.Character
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		if humanoid and humanoid.SeatPart then
			complete("sit")
		end
	end
end)

-- Soft night rain (visual only — parts fall and despawn)
if Config.Rain.Enabled then
	task.spawn(function()
		local Workspace = game:GetService("Workspace")
		while true do
			for _ = 1, 6 do
				local drop = Instance.new("Part")
				drop.Name = "RainDrop"
				drop.Size = Vector3.new(0.12, 1.4, 0.12)
				drop.Position = Vector3.new((math.random() - 0.5) * 50, 28, (math.random() - 0.5) * 30)
				drop.Anchored = true
				drop.CanCollide = false
				drop.Material = Enum.Material.Neon
				drop.Color = Color3.fromRGB(160, 180, 200)
				drop.Transparency = 0.35
				drop.Parent = Workspace
				task.spawn(function()
					for _ = 1, 18 do
						if not drop.Parent then
							return
						end
						drop.Position = drop.Position + Vector3.new(0, -1.6, 0.15)
						task.wait(0.03)
					end
					drop:Destroy()
				end)
			end
			task.wait(0.12)
		end
	end)
end
