--!strict
-- Soft session checklist HUD for low-pressure hangout goals.

local TweenService = game:GetService("TweenService")

export type Goal = {
	Id: string,
	Label: string,
}

export type SoftGoalsStyle = {
	AccentColor: Color3?,
	FrameColor: Color3?,
	TitleColor: Color3?,
	RowColor: Color3?,
	OnAllComplete: (() -> ())?,
}

local SoftGoals = {}

function SoftGoals.mount(
	playerGui: PlayerGui,
	titleText: string,
	goals: { Goal },
	style: SoftGoalsStyle?
): ({ [string]: boolean }, (string) -> ())
	local done: { [string]: boolean } = {}
	local labels: { [string]: TextLabel } = {}
	local accent = (style and style.AccentColor) or Color3.fromRGB(100, 85, 140)
	local frameColor = (style and style.FrameColor) or Color3.fromRGB(24, 20, 36)
	local titleColor = (style and style.TitleColor) or Color3.fromRGB(210, 190, 240)
	local rowColor = (style and style.RowColor) or Color3.fromRGB(160, 150, 180)

	local gui = Instance.new("ScreenGui")
	gui.Name = "SoftGoalsHud"
	gui.ResetOnSpawn = false
	gui.IgnoreGuiInset = true
	gui.Parent = playerGui

	local frame = Instance.new("Frame")
	frame.AnchorPoint = Vector2.new(1, 0)
	frame.Position = UDim2.new(1, -24, 0, 28)
	frame.Size = UDim2.fromOffset(220, 28 + #goals * 22)
	frame.BackgroundColor3 = frameColor
	frame.BackgroundTransparency = 0.3
	frame.Parent = gui

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 10)
	corner.Parent = frame

	local stroke = Instance.new("UIStroke")
	stroke.Color = accent
	stroke.Thickness = 1
	stroke.Transparency = 0.6
	stroke.Parent = frame

	local title = Instance.new("TextLabel")
	title.BackgroundTransparency = 1
	title.Position = UDim2.fromOffset(12, 6)
	title.Size = UDim2.new(1, -24, 0, 18)
	title.Font = Enum.Font.GothamMedium
	title.TextSize = 13
	title.TextXAlignment = Enum.TextXAlignment.Left
	title.TextColor3 = titleColor
	title.Text = titleText
	title.Parent = frame

	for i, goal in goals do
		done[goal.Id] = false
		local row = Instance.new("TextLabel")
		row.Name = goal.Id
		row.BackgroundTransparency = 1
		row.Position = UDim2.fromOffset(12, 8 + i * 20)
		row.Size = UDim2.new(1, -24, 0, 18)
		row.Font = Enum.Font.Gotham
		row.TextSize = 12
		row.TextXAlignment = Enum.TextXAlignment.Left
		row.TextColor3 = rowColor
		row.Text = "○  " .. goal.Label
		row.Parent = frame
		labels[goal.Id] = row
	end

	local faded = false

	local function complete(id: string)
		if done[id] then
			return
		end
		done[id] = true
		local row = labels[id]
		if row then
			row.Text = "●  " .. (row.Text:gsub("^[○●]%s*", ""))
			row.TextColor3 = Color3.fromRGB(200, 230, 180)
		end
		stroke.Transparency = 0.25
		TweenService:Create(
			stroke,
			TweenInfo.new(0.45, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
			{ Transparency = 0.6 }
		):Play()
		local all = true
		for _, g in goals do
			if not done[g.Id] then
				all = false
				break
			end
		end
		if all and not faded then
			faded = true
			title.Text = "session soft-complete · stay"
			title.TextColor3 = Color3.fromRGB(180, 230, 200)
			TweenService:Create(
				title,
				TweenInfo.new(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
				{ TextColor3 = Color3.fromRGB(210, 255, 220) }
			):Play()
			if style and style.OnAllComplete then
				style.OnAllComplete()
			end
			task.delay(6, function()
				if not frame.Parent then
					return
				end
				TweenService:Create(
					frame,
					TweenInfo.new(0.8, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
					{ BackgroundTransparency = 0.75 }
				):Play()
				TweenService:Create(
					stroke,
					TweenInfo.new(0.8, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
					{ Transparency = 0.85 }
				):Play()
			end)
		end
	end

	return done, complete
end

return SoftGoals
