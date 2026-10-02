--!strict
-- Soft company HUD: shows when nearby players are close (co-play signal).

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

export type SoftCompanyConfig = {
	Radius: number,
	Color: Color3?,
	AloneText: string?,
	AloneTextFn: (() -> string)?,
	OneText: string?,
	OneTextFn: (() -> string)?,
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

	local color = config.Color or Color3.fromRGB(180, 170, 200)

	local label = Instance.new("TextLabel")
	label.BackgroundTransparency = 1
	label.AnchorPoint = Vector2.new(0, 1)
	label.Position = UDim2.new(0, 24, 1, -28)
	label.Size = UDim2.fromOffset(320, 20)
	label.Font = Enum.Font.Gotham
	label.TextSize = 12
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.TextColor3 = color
	label.TextTransparency = 0.35
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

	local function pulseArrive()
		label.TextTransparency = 0
		label.TextColor3 = color:Lerp(Color3.new(1, 1, 1), 0.35)
		TweenService:Create(
			label,
			TweenInfo.new(0.55, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
			{ TextTransparency = 0, TextColor3 = color }
		):Play()
	end

	local function pulseLeave()
		TweenService:Create(
			label,
			TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
			{ TextTransparency = 0.45, TextColor3 = color }
		):Play()
	end

	local function setCount(n: number)
		if n == lastCount then
			return
		end
		local prev = lastCount
		lastCount = n
		local function aloneLine(): string
			if config.AloneTextFn then
				return config.AloneTextFn()
			end
			return config.AloneText or ""
		end
		local function oneLine(): string
			if config.OneTextFn then
				return config.OneTextFn()
			end
			return config.OneText or "soft company · 1 nearby"
		end

		if n <= 0 then
			local alone = aloneLine()
			label.Text = alone
			if alone == "" then
				label.TextTransparency = 1
			elseif prev > 0 then
				pulseLeave()
			else
				label.TextTransparency = 0.45
			end
		elseif n == 1 then
			label.Text = oneLine()
			if prev <= 0 then
				pulseArrive()
			end
		else
			local many = config.ManyText
			label.Text = if many then many(n) else ("soft company · %d nearby"):format(n)
			if prev <= 0 or n > prev then
				pulseArrive()
			end
		end
		if config.OnCountChanged then
			config.OnCountChanged(n)
		end
	end

	-- Refresh copy when zone flips without count change (e.g. Couch two worlds)
	local refreshAccum = 0
	RunService.Heartbeat:Connect(function(dt)
		refreshAccum += dt
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
		if count ~= lastCount then
			setCount(count)
		elseif refreshAccum >= 0.75 and (config.OneTextFn or config.AloneTextFn or config.ManyText) then
			refreshAccum = 0
			-- soft refresh label text without re-firing OnCountChanged
			if count <= 0 then
				label.Text = if config.AloneTextFn then config.AloneTextFn() else (config.AloneText or "")
			elseif count == 1 then
				label.Text = if config.OneTextFn then config.OneTextFn() else (config.OneText or "soft company · 1 nearby")
			else
				local many = config.ManyText
				label.Text = if many then many(count) else ("soft company · %d nearby"):format(count)
			end
		end
	end)

	return gui
end

return SoftCompany
