--!strict
-- Soft session checklist HUD for low-pressure hangout goals.

export type Goal = {
	Id: string,
	Label: string,
}

local SoftGoals = {}

function SoftGoals.mount(playerGui: PlayerGui, titleText: string, goals: { Goal }): ({ [string]: boolean }, (string) -> ())
	local done: { [string]: boolean } = {}
	local labels: { [string]: TextLabel } = {}

	local gui = Instance.new("ScreenGui")
	gui.Name = "SoftGoalsHud"
	gui.ResetOnSpawn = false
	gui.IgnoreGuiInset = true
	gui.Parent = playerGui

	local frame = Instance.new("Frame")
	frame.AnchorPoint = Vector2.new(1, 0)
	frame.Position = UDim2.new(1, -24, 0, 28)
	frame.Size = UDim2.fromOffset(220, 28 + #goals * 22)
	frame.BackgroundColor3 = Color3.fromRGB(24, 20, 36)
	frame.BackgroundTransparency = 0.3
	frame.Parent = gui

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 10)
	corner.Parent = frame

	local title = Instance.new("TextLabel")
	title.BackgroundTransparency = 1
	title.Position = UDim2.fromOffset(12, 6)
	title.Size = UDim2.new(1, -24, 0, 18)
	title.Font = Enum.Font.GothamMedium
	title.TextSize = 13
	title.TextXAlignment = Enum.TextXAlignment.Left
	title.TextColor3 = Color3.fromRGB(210, 190, 240)
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
		row.TextColor3 = Color3.fromRGB(160, 150, 180)
		row.Text = "○  " .. goal.Label
		row.Parent = frame
		labels[goal.Id] = row
	end

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
		local all = true
		for _, g in goals do
			if not done[g.Id] then
				all = false
				break
			end
		end
		if all then
			title.Text = "session soft-complete · stay"
			title.TextColor3 = Color3.fromRGB(180, 230, 200)
		end
	end

	return done, complete
end

return SoftGoals
