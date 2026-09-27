--!strict
-- One-shot soft welcome toast (session only).

local SoftWelcome = {}

function SoftWelcome.show(playerGui: PlayerGui, titleText: string, bodyText: string)
	local gui = Instance.new("ScreenGui")
	gui.Name = "SoftWelcome"
	gui.ResetOnSpawn = false
	gui.IgnoreGuiInset = true
	gui.Parent = playerGui

	local frame = Instance.new("Frame")
	frame.AnchorPoint = Vector2.new(0.5, 0)
	frame.Position = UDim2.new(0.5, 0, 0, -80)
	frame.Size = UDim2.fromOffset(360, 72)
	frame.BackgroundColor3 = Color3.fromRGB(28, 24, 40)
	frame.BackgroundTransparency = 0.15
	frame.Parent = gui

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 12)
	corner.Parent = frame

	local title = Instance.new("TextLabel")
	title.BackgroundTransparency = 1
	title.Position = UDim2.fromOffset(16, 12)
	title.Size = UDim2.new(1, -32, 0, 22)
	title.Font = Enum.Font.GothamMedium
	title.TextSize = 16
	title.TextXAlignment = Enum.TextXAlignment.Left
	title.TextColor3 = Color3.fromRGB(230, 220, 255)
	title.Text = titleText
	title.Parent = frame

	local body = Instance.new("TextLabel")
	body.BackgroundTransparency = 1
	body.Position = UDim2.fromOffset(16, 36)
	body.Size = UDim2.new(1, -32, 0, 24)
	body.Font = Enum.Font.Gotham
	body.TextSize = 13
	body.TextXAlignment = Enum.TextXAlignment.Left
	body.TextColor3 = Color3.fromRGB(180, 170, 200)
	body.Text = bodyText
	body.Parent = frame

	-- Slide in
	task.spawn(function()
		for i = 1, 12 do
			frame.Position = UDim2.new(0.5, 0, 0, -80 + i * 9)
			task.wait(0.02)
		end
		task.wait(4.5)
		for i = 1, 12 do
			frame.BackgroundTransparency = 0.15 + i * 0.07
			title.TextTransparency = i * 0.08
			body.TextTransparency = i * 0.08
			task.wait(0.03)
		end
		gui:Destroy()
	end)
end

return SoftWelcome
