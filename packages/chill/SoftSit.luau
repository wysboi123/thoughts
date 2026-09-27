--!strict
-- Shared bottom-center sit status line for hangout games.

local SoftSit = {}

export type SoftSitHud = {
	set: (seatName: string, displayName: string?) -> (),
	gui: ScreenGui,
}

function SoftSit.mount(
	playerGui: PlayerGui,
	opts: {
		EmptyText: string?,
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

	local label = Instance.new("TextLabel")
	label.BackgroundTransparency = 1
	label.AnchorPoint = Vector2.new(0.5, 1)
	label.Position = UDim2.new(0.5, 0, 1, -100)
	label.Size = UDim2.fromOffset(420, 22)
	label.Font = Enum.Font.Gotham
	label.TextSize = 13
	label.TextColor3 = options.Color or Color3.fromRGB(190, 180, 210)
	label.Text = ""
	label.Parent = gui

	local occupants: { [string]: string } = {}

	local function refresh()
		local names = {}
		for _, n in occupants do
			table.insert(names, n)
		end
		if #names == 0 then
			label.Text = options.EmptyText or ""
		elseif #names == 1 then
			local one = options.OneText
			label.Text = if one then one(names[1]) else (names[1] .. " is sitting")
		else
			local many = options.ManyText
			label.Text = if many then many(names) else (table.concat(names, " & ") .. " are sitting")
		end
	end

	return {
		gui = gui,
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
