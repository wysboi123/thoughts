--!strict
-- Shared bottom-center sit status line for hangout games.

local TweenService = game:GetService("TweenService")

local SoftSit = {}

export type SoftSitHud = {
	set: (seatName: string, displayName: string?) -> (),
	refresh: () -> (),
	gui: ScreenGui,
}

function SoftSit.mount(
	playerGui: PlayerGui,
	opts: {
		EmptyText: string?,
		-- Dynamic empty line (e.g. still-here · seat open after linger)
		EmptyTextFn: (() -> string)?,
		OneText: ((string) -> string)?,
		ManyText: (({ string }) -> string)?,
		Color: Color3?,
	}?
): SoftSitHud
	local options = opts or {}
	local gui = Instance.new("ScreenGui")
	gui.Name = "SoftSitHud"
	gui.ResetOnSpawn = false
	gui.IgnoreGuiInset = true
	gui.Parent = playerGui

	local color = options.Color or Color3.fromRGB(190, 180, 210)

	local label = Instance.new("TextLabel")
	label.BackgroundTransparency = 1
	label.AnchorPoint = Vector2.new(0.5, 1)
	label.Position = UDim2.new(0.5, 0, 1, -100)
	label.Size = UDim2.fromOffset(420, 22)
	label.Font = Enum.Font.Gotham
	label.TextSize = 13
	label.TextColor3 = color
	label.TextTransparency = 1
	label.Text = ""
	label.Parent = gui

	local occupants: { [string]: string } = {}
	local emptyHoldToken = 0

	local function emptyLine(): string
		if options.EmptyTextFn then
			return options.EmptyTextFn()
		end
		return options.EmptyText or ""
	end

	local function fadeEmpty()
		TweenService:Create(
			label,
			TweenInfo.new(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
			{ TextTransparency = 1 }
		):Play()
	end

	local function refresh()
		local names = {}
		for _, n in occupants do
			table.insert(names, n)
		end
		local prevText = label.Text
		local empty = emptyLine()
		local wasEmpty = prevText == "" or prevText == empty or prevText == (options.EmptyText or "")
		if #names == 0 then
			local textChanged = prevText ~= empty
			label.Text = empty
			-- Soft leave OR empty-copy flip (depart/return seat pulse)
			if empty ~= "" and (not wasEmpty or textChanged) then
				emptyHoldToken += 1
				local token = emptyHoldToken
				label.TextTransparency = 0.25
				TweenService:Create(
					label,
					TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
					{ TextTransparency = 0.15 }
				):Play()
				task.delay(2.8, function()
					if token ~= emptyHoldToken then
						return
					end
					local stillEmpty = true
					for _ in occupants do
						stillEmpty = false
						break
					end
					if stillEmpty and label.Parent then
						fadeEmpty()
					end
				end)
			else
				fadeEmpty()
			end
		elseif #names == 1 then
			emptyHoldToken += 1
			local one = options.OneText
			label.Text = if one then one(names[1]) else (names[1] .. " is sitting")
			-- Soft linger/copy pulse when sit line flips (e.g. still-here after OnLinger)
			if wasEmpty or label.Text ~= prevText then
				label.TextTransparency = 0.4
			end
			TweenService:Create(
				label,
				TweenInfo.new(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
				{ TextTransparency = 0 }
			):Play()
		else
			emptyHoldToken += 1
			local many = options.ManyText
			label.Text = if many then many(names) else (table.concat(names, " & ") .. " are sitting")
			if label.Text ~= prevText then
				label.TextTransparency = 0.3
			end
			TweenService:Create(
				label,
				TweenInfo.new(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
				{ TextTransparency = 0 }
			):Play()
		end
	end

	return {
		gui = gui,
		refresh = refresh,
		set = function(seatName: string, displayName: string?)
			if displayName then
				occupants[seatName] = displayName
			else
				occupants[seatName] = nil :: any
			end
			refresh()
		end,
	}
end

return SoftSit
