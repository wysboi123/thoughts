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

export type SoftCompanyHud = {
	gui: ScreenGui,
	-- Immediate copy refresh (e.g. after OnLinger still-here flip); soft linger pulse
	refresh: () -> (),
}

local SoftCompany = {}

function SoftCompany.mount(playerGui: PlayerGui, localPlayer: Player, config: SoftCompanyConfig): SoftCompanyHud
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

	local function manyLine(n: number): string
		local many = config.ManyText
		return if many then many(n) else ("soft company · %d nearby"):format(n)
	end

	local function applyCopy(n: number)
		if n <= 0 then
			label.Text = aloneLine()
		elseif n == 1 then
			label.Text = oneLine()
		else
			label.Text = manyLine(n)
		end
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

	local function pulseLinger()
		-- Soft stay signal when copy flips to still-here without count change
		label.TextTransparency = 0.15
		label.TextColor3 = color:Lerp(Color3.new(1, 1, 1), 0.22)
		local targetTransparency = if lastCount <= 0 and label.Text == "" then 1 elseif lastCount <= 0 then 0.45 else 0
		TweenService:Create(
			label,
			TweenInfo.new(0.65, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
			{ TextTransparency = targetTransparency, TextColor3 = color }
		):Play()
	end

	local function setCount(n: number)
		if n == lastCount then
			return
		end
		local prev = lastCount
		lastCount = n

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
			elseif prev > 1 then
				pulseLeave()
			end
		else
			label.Text = manyLine(n)
			if prev <= 0 or n > prev then
				pulseArrive()
			elseif n < prev then
				pulseLeave()
			end
		end
		if config.OnCountChanged then
			config.OnCountChanged(n)
		end
	end

	local function refresh()
		local n = if lastCount < 0 then 0 else lastCount
		local prev = label.Text
		applyCopy(n)
		if label.Text ~= prev then
			pulseLinger()
		elseif n > 0 or label.Text ~= "" then
			pulseLinger()
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
			applyCopy(count)
		end
	end)

	return {
		gui = gui,
		refresh = refresh,
	}
end

return SoftCompany
