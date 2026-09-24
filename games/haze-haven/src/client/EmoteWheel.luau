--!strict
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Remotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Remotes"))
local Emotes = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Emotes"))

local EmoteWheel = {}

function EmoteWheel.mount(playerGui: PlayerGui)
	local gui = Instance.new("ScreenGui")
	gui.Name = "HazeEmoteWheel"
	gui.ResetOnSpawn = false
	gui.IgnoreGuiInset = true
	gui.Parent = playerGui

	local bar = Instance.new("Frame")
	bar.Name = "EmoteBar"
	bar.AnchorPoint = Vector2.new(0.5, 1)
	bar.Position = UDim2.new(0.5, 0, 1, -28)
	bar.Size = UDim2.fromOffset(280, 52)
	bar.BackgroundColor3 = Color3.fromRGB(28, 22, 40)
	bar.BackgroundTransparency = 0.2
	bar.Parent = gui

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 12)
	corner.Parent = bar

	local layout = Instance.new("UIListLayout")
	layout.FillDirection = Enum.FillDirection.Horizontal
	layout.HorizontalAlignment = Enum.HorizontalAlignment.Center
	layout.VerticalAlignment = Enum.VerticalAlignment.Center
	layout.Padding = UDim.new(0, 8)
	layout.Parent = bar

	local pad = Instance.new("UIPadding")
	pad.PaddingLeft = UDim.new(0, 10)
	pad.PaddingRight = UDim.new(0, 10)
	pad.Parent = bar

	local function request(id: string)
		Remotes.EmoteRequest:FireServer(id)
	end

	for _, emote in Emotes.List do
		local btn = Instance.new("TextButton")
		btn.Name = emote.Id
		btn.Size = UDim2.fromOffset(80, 36)
		btn.BackgroundColor3 = Color3.fromRGB(55, 42, 78)
		btn.BackgroundTransparency = 0.1
		btn.Font = Enum.Font.GothamMedium
		btn.TextSize = 14
		btn.TextColor3 = Color3.fromRGB(230, 215, 255)
		btn.Text = emote.Label
		btn.AutoButtonColor = true
		btn.Parent = bar

		local btnCorner = Instance.new("UICorner")
		btnCorner.CornerRadius = UDim.new(0, 8)
		btnCorner.Parent = btn

		btn.MouseButton1Click:Connect(function()
			request(emote.Id)
		end)
	end

	local hint = Instance.new("TextLabel")
	hint.BackgroundTransparency = 1
	hint.AnchorPoint = Vector2.new(0.5, 1)
	hint.Position = UDim2.new(0.5, 0, 1, -84)
	hint.Size = UDim2.fromOffset(260, 18)
	hint.Font = Enum.Font.Gotham
	hint.TextSize = 12
	hint.TextColor3 = Color3.fromRGB(160, 150, 180)
	hint.Text = "1 Wave · 2 Sit · 3 Float"
	hint.Parent = gui

	UserInputService.InputBegan:Connect(function(input, processed)
		if processed then
			return
		end
		for _, emote in Emotes.List do
			if input.KeyCode == emote.Key then
				request(emote.Id)
				return
			end
		end
	end)

	Remotes.EmotePlayed.OnClientEvent:Connect(function(_userId: number, emoteId: string)
		hint.Text = ("~ %s ~"):format(emoteId)
		task.delay(1.4, function()
			if hint.Parent then
				hint.Text = "1 Wave · 2 Sit · 3 Float"
			end
		end)
	end)
end

return EmoteWheel
