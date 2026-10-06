--!strict
-- Soft session checklist HUD for low-pressure hangout goals.

local TweenService = game:GetService("TweenService")

export type Goal = {
	Id: string,
	Label: string,
	-- Optional goals do not block OnAllComplete / soft-complete (solo-friendly)
	Optional: boolean?,
}

export type SoftGoalsStyle = {
	AccentColor: Color3?,
	FrameColor: Color3?,
	TitleColor: Color3?,
	RowColor: Color3?,
	-- optionalLeft = incomplete Optional goals at soft-complete time
	OnAllComplete: ((optionalLeft: number) -> ())?,
	-- fires when a late Optional goal seals the session after soft-complete
	OnSessionSealed: (() -> ())?,
	-- soft linger after soft-complete (playtime stay nudge); default 48s
	-- OnLinger receives optionalLeft at fire time (company goals still open)
	LingerSeconds: number?,
	OnLinger: ((optionalLeft: number) -> ())?,
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
	local goalById: { [string]: Goal } = {}
	local accent = (style and style.AccentColor) or Color3.fromRGB(100, 85, 140)
	local frameColor = (style and style.FrameColor) or Color3.fromRGB(24, 20, 36)
	local titleColor = (style and style.TitleColor) or Color3.fromRGB(210, 190, 240)
	local rowColor = (style and style.RowColor) or Color3.fromRGB(160, 150, 180)
	local optionalRowColor = rowColor:Lerp(Color3.fromRGB(90, 90, 100), 0.35)

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
		goalById[goal.Id] = goal
		local row = Instance.new("TextLabel")
		row.Name = goal.Id
		row.BackgroundTransparency = 1
		row.Position = UDim2.fromOffset(12, 8 + i * 20)
		row.Size = UDim2.new(1, -24, 0, 18)
		row.Font = Enum.Font.Gotham
		row.TextSize = 12
		row.TextXAlignment = Enum.TextXAlignment.Left
		row.TextColor3 = if goal.Optional then optionalRowColor else rowColor
		local prefix = if goal.Optional then "◦  " else "○  "
		row.Text = prefix .. goal.Label
		row.Parent = frame
		labels[goal.Id] = row
	end

	local softComplete = false
	local faded = false
	local sealed = false
	local lingered = false

	local function countOptionalLeft(): number
		local left = 0
		for _, g in goals do
			if g.Optional and not done[g.Id] then
				left += 1
			end
		end
		return left
	end

	local function requiredAllDone(): boolean
		for _, g in goals do
			if not done[g.Id] and not g.Optional then
				return false
			end
		end
		return true
	end

	local function sealSession()
		if sealed then
			return
		end
		sealed = true
		title.Text = "session soft-complete · stay"
		title.TextColor3 = Color3.fromRGB(180, 230, 200)
		TweenService:Create(
			title,
			TweenInfo.new(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
			{ TextColor3 = Color3.fromRGB(210, 255, 220) }
		):Play()
		if style and style.OnSessionSealed then
			style.OnSessionSealed()
		end
	end

	local function complete(id: string)
		if done[id] then
			return
		end
		done[id] = true
		local row = labels[id]
		local goal = goalById[id]
		local wasOptional = goal ~= nil and goal.Optional == true
		if row then
			local labelText = if goal then goal.Label else (row.Text:gsub("^[○●◦]%s*", ""))
			row.Text = "●  " .. labelText
			row.TextColor3 = Color3.fromRGB(200, 230, 180)
		end
		stroke.Transparency = 0.25
		TweenService:Create(
			stroke,
			TweenInfo.new(0.45, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
			{ Transparency = 0.6 }
		):Play()

		-- Late optional company after soft-complete → seal the session
		if softComplete and wasOptional and countOptionalLeft() == 0 then
			sealSession()
		end

		if requiredAllDone() and not softComplete then
			softComplete = true
			local optionalLeft = countOptionalLeft()
			if optionalLeft > 0 then
				title.Text = "soft-complete · company still open"
			else
				title.Text = "session soft-complete · stay"
				sealed = true
			end
			title.TextColor3 = Color3.fromRGB(180, 230, 200)
			TweenService:Create(
				title,
				TweenInfo.new(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
				{ TextColor3 = Color3.fromRGB(210, 255, 220) }
			):Play()
			if style and style.OnAllComplete then
				style.OnAllComplete(optionalLeft)
			end
			-- Soft linger nudge (playtime stay) — once per session after soft-complete
			local lingerSec = (style and style.LingerSeconds) or 48
			if style and style.OnLinger and lingerSec > 0 then
				task.delay(lingerSec, function()
					if not frame.Parent or lingered then
						return
					end
					lingered = true
					local left = countOptionalLeft()
					title.Text = if left > 0 then "still here · company open" else "still here · soft"
					title.TextColor3 = Color3.fromRGB(190, 220, 200)
					stroke.Transparency = 0.3
					TweenService:Create(
						title,
						TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
						{ TextColor3 = Color3.fromRGB(210, 240, 220) }
					):Play()
					TweenService:Create(
						stroke,
						TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
						{ Transparency = 0.65 }
					):Play()
					style.OnLinger(left)
				end)
			end
			-- Fade lightly while company goals remain; heavier when fully sealed
			local fadeDelay = if optionalLeft > 0 then 10 else 6
			task.delay(fadeDelay, function()
				if not frame.Parent or faded then
					return
				end
				faded = true
				local stillOpen = countOptionalLeft() > 0
				local frameFade = if stillOpen then 0.55 else 0.75
				local strokeFade = if stillOpen then 0.7 else 0.85
				TweenService:Create(
					frame,
					TweenInfo.new(0.8, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
					{ BackgroundTransparency = frameFade }
				):Play()
				TweenService:Create(
					stroke,
					TweenInfo.new(0.8, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
					{ Transparency = strokeFade }
				):Play()
			end)
		end
	end

	return done, complete
end

return SoftGoals
