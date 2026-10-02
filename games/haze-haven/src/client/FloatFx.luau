--!strict
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))
local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))

local FloatFx = {}

function FloatFx.start(localPlayer: Player)
	Remotes.FloatBoost.OnClientEvent:Connect(function()
		local character = localPlayer.Character
		if not character then
			return
		end
		local root = character:FindFirstChild("HumanoidRootPart")
		if not root or not root:IsA("BasePart") then
			return
		end

		local flash = Instance.new("Part")
		flash.Name = "FloatFlash"
		flash.Shape = Enum.PartType.Ball
		flash.Size = Vector3.new(2, 2, 2)
		flash.CFrame = root.CFrame
		flash.Anchored = true
		flash.CanCollide = false
		flash.Material = Enum.Material.Neon
		flash.Color = Config.FloatPad.Color
		flash.Transparency = 0.2
		flash.Parent = Workspace

		local tween = TweenService:Create(
			flash,
			TweenInfo.new(0.55, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
			{ Size = Vector3.new(10, 10, 10), Transparency = 1 }
		)
		tween:Play()
		tween.Completed:Connect(function()
			flash:Destroy()
		end)
	end)
end

return FloatFx
