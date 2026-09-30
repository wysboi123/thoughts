--!strict
-- One-shot soft welcome toast (session only). Replaces any prior SoftWelcome.

local TweenService = game:GetService("TweenService")

export type SoftWelcomeStyle = {
	AccentColor: Color3?,
	FrameColor: Color3?,
	TitleColor: Color3?,
	BodyColor: Color3?,
}

local SoftWelcome = {}

function SoftWelcome.show(playerGui: PlayerGui, titleText: string, bodyText: string, style: SoftWelcomeStyle?)
	local existing = playerGui:FindFirstChild("SoftWelcome")
	if existing then
		existing:Destroy()
	end

	local accent = (style and style.AccentColor) or Color3.fromRGB(120, 100, 160)
	local frameColor = (style and style.FrameColor) or Color3.fromRGB(28, 24, 40)
	local titleColor = (style and style.TitleColor) or Color3.fromRGB(230, 220, 255)
	local bodyColor = (style and style.BodyColor) or Color3.fromRGB(180, 170, 200)

	local gui = Instance.new("ScreenGui")
	gui.Name = "SoftWelcome"
	gui.ResetOnSpawn = false
	gui.IgnoreGuiInset = true
	gui.Parent = playerGui

	local frame = Instance.new("Frame")
	frame.AnchorPoint = Vector2.new(0.5, 0)
	frame.Position = UDim2.new(0.5, 0, 0, -90)
	frame.Size = UDim2.fromOffset(360, 72)
	frame.BackgroundColor3 = frameColor
	frame.BackgroundTransparency = 0.15
	frame.Parent = gui

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 12)
	corner.Parent = frame

	local stroke = Instance.new("UIStroke")
	stroke.Color = accent
	stroke.Thickness = 1
	stroke.Transparency = 0.55
	stroke.Parent = frame

	local title = Instance.new("TextLabel")
	title.BackgroundTransparency = 1
	title.Position = UDim2.fromOffset(16, 12)
	title.Size = UDim2.new(1, -32, 0, 22)
	title.Font = Enum.Font.GothamMedium
	title.TextSize = 16
	title.TextXAlignment = Enum.TextXAlignment.Left
	title.TextColor3 = titleColor
	title.Text = titleText
	title.Parent = frame

	local body = Instance.new("TextLabel")
	body.BackgroundTransparency = 1
	body.Position = UDim2.fromOffset(16, 36)
	body.Size = UDim2.new(1, -32, 0, 24)
	body.Font = Enum.Font.Gotham
	body.TextSize = 13
	body.TextXAlignment = Enum.TextXAlignment.Left
	body.TextColor3 = bodyColor
	body.Text = bodyText
	body.Parent = frame

	local slideIn = TweenService:Create(
		frame,
		TweenInfo.new(0.45, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		{ Position = UDim2.new(0.5, 0, 0, 28) }
	)
	slideIn:Play()

	task.delay(4.8, function()
		if not frame.Parent then
			return
		end
		local fadeInfo = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
		TweenService:Create(frame, fadeInfo, { BackgroundTransparency = 1 }):Play()
		TweenService:Create(stroke, fadeInfo, { Transparency = 1 }):Play()
		TweenService:Create(title, fadeInfo, { TextTransparency = 1 }):Play()
		TweenService:Create(body, fadeInfo, { TextTransparency = 1 }):Play()
		task.delay(0.55, function()
			gui:Destroy()
		end)
	end)
end

return SoftWelcome
