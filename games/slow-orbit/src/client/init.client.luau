--!strict
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")
local TweenService = game:GetService("TweenService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local player = Players.LocalPlayer
local camera = Workspace.CurrentCamera

local gui = Instance.new("ScreenGui")
gui.Name = "OrbitHud"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = player:WaitForChild("PlayerGui")

local title = Instance.new("TextLabel")
title.BackgroundTransparency = 1
title.Position = UDim2.new(0, 24, 0, 28)
title.Size = UDim2.new(0, 400, 0, 32)
title.Font = Enum.Font.GothamMedium
title.TextSize = 26
title.TextXAlignment = Enum.TextXAlignment.Left
title.TextColor3 = Color3.fromRGB(200, 220, 255)
title.Text = Config.GameName
title.Parent = gui

local tag = Instance.new("TextLabel")
tag.BackgroundTransparency = 1
tag.Position = UDim2.new(0, 24, 0, 60)
tag.Size = UDim2.new(0, 420, 0, 22)
tag.Font = Enum.Font.Gotham
tag.TextSize = 14
tag.TextXAlignment = Enum.TextXAlignment.Left
tag.TextColor3 = Color3.fromRGB(150, 170, 210)
tag.Text = Config.Tagline .. "  ·  v" .. Config.Version
tag.Parent = gui

local counter = Instance.new("TextLabel")
counter.BackgroundColor3 = Color3.fromRGB(16, 20, 36)
counter.BackgroundTransparency = 0.25
counter.Position = UDim2.new(0, 24, 1, -72)
counter.Size = UDim2.new(0, 220, 0, 44)
counter.Font = Enum.Font.GothamMedium
counter.TextSize = 18
counter.TextColor3 = Color3.fromRGB(180, 220, 255)
counter.Text = "Beads  0 / " .. Config.TargetBeads
counter.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 10)
corner.Parent = counter

local status = Instance.new("TextLabel")
status.BackgroundTransparency = 1
status.AnchorPoint = Vector2.new(0.5, 0)
status.Position = UDim2.new(0.5, 0, 0.12, 0)
status.Size = UDim2.new(0, 400, 0, 28)
status.Font = Enum.Font.GothamMedium
status.TextSize = 20
status.TextColor3 = Color3.fromRGB(180, 230, 255)
status.TextTransparency = 1
status.Text = ""
status.Parent = gui

local hint = Instance.new("TextLabel")
hint.BackgroundTransparency = 1
hint.Position = UDim2.new(0, 24, 1, -100)
hint.Size = UDim2.new(0, 360, 0, 20)
hint.Font = Enum.Font.Gotham
hint.TextSize = 12
hint.TextXAlignment = Enum.TextXAlignment.Left
hint.TextColor3 = Color3.fromRGB(130, 150, 190)
hint.Text = "RMB / drag to orbit · scroll zoom · violet beads on moonlet"
hint.Parent = gui

Remotes.BeadCollected.OnClientEvent:Connect(function(count: number, target: number)
	counter.Text = ("Beads  %d / %d"):format(count, target)
end)

Remotes.OrbitComplete.OnClientEvent:Connect(function()
	status.Text = "orbit complete — stay as long as you want"
	status.TextTransparency = 0
	task.delay(4, function()
		if status.Parent then
			status.TextTransparency = 0.3
		end
	end)
end)

Remotes.BeadTrailBurst.OnClientEvent:Connect(function(position: Vector3, color: Color3)
	local burst = Instance.new("Part")
	burst.Name = "BeadBurst"
	burst.Shape = Enum.PartType.Ball
	burst.Size = Vector3.new(1.2, 1.2, 1.2)
	burst.Position = position
	burst.Anchored = true
	burst.CanCollide = false
	burst.Material = Enum.Material.Neon
	burst.Color = color
	burst.Parent = Workspace

	local light = Instance.new("PointLight")
	light.Brightness = 4
	light.Range = 16
	light.Color = color
	light.Parent = burst

	local tween = TweenService:Create(
		burst,
		TweenInfo.new(0.55, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		{ Size = Vector3.new(8, 8, 8), Transparency = 1 }
	)
	tween:Play()
	tween.Completed:Connect(function()
		burst:Destroy()
	end)
end)

-- Camera: smooth radial-up stick + yaw + zoom
local yaw = 0
local distance = Config.Camera.Distance
local smoothedUp = Vector3.new(0, 1, 0)
local dragging = false
local lastTouch: Vector2? = nil

UserInputService.InputBegan:Connect(function(input, processed)
	if processed then
		return
	end
	if input.UserInputType == Enum.UserInputType.MouseButton2 then
		dragging = true
	elseif input.UserInputType == Enum.UserInputType.Touch then
		dragging = true
		lastTouch = Vector2.new(input.Position.X, input.Position.Y)
	end
end)

UserInputService.InputEnded:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton2 or input.UserInputType == Enum.UserInputType.Touch then
		dragging = false
		lastTouch = nil
	end
end)

UserInputService.InputChanged:Connect(function(input, processed)
	if processed then
		return
	end
	if input.UserInputType == Enum.UserInputType.MouseWheel then
		distance = math.clamp(
			distance - input.Position.Z * 2,
			Config.Camera.MinDistance,
			Config.Camera.MaxDistance
		)
	elseif dragging and input.UserInputType == Enum.UserInputType.Touch then
		local pos = Vector2.new(input.Position.X, input.Position.Y)
		if lastTouch then
			local delta = pos - lastTouch
			yaw -= delta.X * Config.Camera.TouchYawSensitivity
		end
		lastTouch = pos
	end
end)

local function bindCamera(character: Model)
	local root = character:WaitForChild("HumanoidRootPart", 5)
	if not root or not root:IsA("BasePart") then
		return
	end

	camera.CameraType = Enum.CameraType.Scriptable
	smoothedUp = Vector3.new(0, 1, 0)
	yaw = 0
	distance = Config.Camera.Distance

	local conn: RBXScriptConnection?
	conn = RunService.RenderStepped:Connect(function(dt)
		if not root.Parent then
			if conn then
				conn:Disconnect()
			end
			camera.CameraType = Enum.CameraType.Custom
			return
		end

		if dragging and UserInputService:IsMouseButtonPressed(Enum.UserInputType.MouseButton2) then
			local mouseDelta = UserInputService:GetMouseDelta()
			yaw -= mouseDelta.X * Config.Camera.YawSensitivity
		end

		local upAttr = root:GetAttribute("OrbitUp")
		local targetUp = if typeof(upAttr) == "Vector3" and upAttr.Magnitude > 0.1 then upAttr.Unit else Vector3.new(0, 1, 0)
		-- Smooth up so planet↔moonlet handoff doesn't snap the camera
		smoothedUp = smoothedUp:Lerp(targetUp, math.clamp(Config.Camera.UpLerp + dt * 0.5, 0, 1)).Unit
		local up = smoothedUp

		local look = root.CFrame.LookVector
		local flat = look - up * look:Dot(up)
		if flat.Magnitude < 0.05 then
			flat = up:Cross(Vector3.new(1, 0, 0))
			if flat.Magnitude < 0.05 then
				flat = up:Cross(Vector3.new(0, 0, 1))
			end
		end
		flat = (CFrame.fromAxisAngle(up, yaw) * flat.Unit)

		local desired = CFrame.lookAt(
			root.Position - flat * distance + up * Config.Camera.Height,
			root.Position + up * Config.Camera.LookAhead,
			up
		)
		local alpha = math.clamp(1 - math.exp(-Config.Camera.Lerp * 60 * dt), 0, 1)
		camera.CFrame = camera.CFrame:Lerp(desired, alpha)
	end)
end

player.CharacterAdded:Connect(bindCamera)
if player.Character then
	bindCamera(player.Character)
end

print("[SlowOrbit] client ready v" .. Config.Version)

local SoftGoals = require(ReplicatedStorage:WaitForChild("Chill"):WaitForChild("SoftGoals"))
local _, complete = SoftGoals.mount(player:WaitForChild("PlayerGui"), "tonight's soft goals", {
	{ Id = "beads", Label = "collect 5 beads" },
	{ Id = "moon", Label = "visit the moonlet" },
	{ Id = "orbit", Label = "soft-complete an orbit" },
})

Remotes.BeadCollected.OnClientEvent:Connect(function(count: number, _target: number)
	if count >= 5 then
		complete("beads")
	end
end)

Remotes.OrbitComplete.OnClientEvent:Connect(function()
	complete("orbit")
end)

task.spawn(function()
	while true do
		task.wait(0.4)
		local character = player.Character
		local root = character and character:FindFirstChild("HumanoidRootPart")
		if root and root:IsA("BasePart") then
			local body = root:GetAttribute("OrbitBody")
			if body == "Moonlet" then
				complete("moon")
			end
		end
	end
end)
