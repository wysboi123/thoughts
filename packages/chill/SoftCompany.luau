--!strict
-- Soft company HUD: shows when nearby players are close (co-play signal).

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

export type SoftCompanyConfig = {
	Radius: number,
	Color: Color3?,
	AloneText: string?,
	OneText: string?,
	ManyText: ((number) -> string)?,
	OnCountChanged: ((number) -> ())?,
}

local SoftCompany = {}

function SoftCompany.mount(playerGui: PlayerGui, localPlayer: Player, config: SoftCompanyConfig)
	local gui = Instance.new("ScreenGui")
	gui.Name = "SoftCompanyHud"
	gui.ResetOnSpawn = false
	gui.IgnoreGuiInset = true
	gui.Parent = playerGui

	local label = Instance.new("TextLabel")
	label.BackgroundTransparency = 1
	label.AnchorPoint = Vector2.new(0, 1)
	label.Position = UDim2.new(0, 24, 1, -28)
	label.Size = UDim2.fromOffset(280, 20)
	label.Font = Enum.Font.Gotham
	label.TextSize = 12
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.TextColor3 = config.Color or Color3.fromRGB(180, 170, 200)
	label.Text = ""
	label.Parent = gui

	local lastCount = -1

	local function getRoot(character: Model): BasePart?
		local root = character:FindFirstChild("HumanoidRootPart")
		if root and root:IsA("BasePart") then
			return root
		end
		return nil
	end

	local function setCount(n: number)
		if n == lastCount then
			return
		end
		lastCount = n
		if n <= 0 then
			label.Text = config.AloneText or ""
		elseif n == 1 then
			label.Text = config.OneText or "soft company · 1 nearby"
		else
			local many = config.ManyText
			label.Text = if many then many(n) else ("soft company · %d nearby"):format(n)
		end
		if config.OnCountChanged then
			config.OnCountChanged(n)
		end
	end

	RunService.Heartbeat:Connect(function()
		local myChar = localPlayer.Character
		local myRoot = myChar and getRoot(myChar)
		if not myRoot then
			setCount(0)
			return
		end
		local count = 0
		for _, other in Players:GetPlayers() do
			if other ~= localPlayer and other.Character then
				local root = getRoot(other.Character)
				if root and (root.Position - myRoot.Position).Magnitude <= config.Radius then
					count += 1
				end
			end
		end
		setCount(count)
	end)

	return gui
end

return SoftCompany
