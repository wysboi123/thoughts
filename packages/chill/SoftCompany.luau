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
	-- Brief copy when nearby count drops to 0 (co-play leave → soft stay)
	DepartTextFn: (() -> string)?,
	-- Soft bridge after DepartTextFn hold (playtime memory before AloneText)
	AfterDepartTextFn: (() -> string)?,
	-- Brief copy when company returns after a depart this session
	ReturnTextFn: (() -> string)?,
	-- Soft bridge after ReturnTextFn hold before One/Many settle
	AfterReturnTextFn: (() -> string)?,
	OneText: string?,
	OneTextFn: (() -> string)?,
	ManyText: ((number) -> string)?,
	OnCountChanged: ((number) -> ())?,
	-- Fires when nearby count drops from >0 to 0 (after DepartTextFn applied)
	OnDeparted: (() -> ())?,
	-- Fires when nearby count rises from 0 after a prior depart this session
	OnReturned: (() -> ())?,
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
	local departHoldUntil = 0.0
	local returnHoldUntil = 0.0
	local everDeparted = false

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
			local departed = prev > 0
			if departed then
				everDeparted = true
			end
			local depart = if departed and config.DepartTextFn then config.DepartTextFn() else nil
			if depart and depart ~= "" then
				label.Text = depart
				pulseLeave()
				departHoldUntil = os.clock() + 3.8
				task.delay(3.8, function()
					if lastCount > 0 or not label.Parent then
						return
					end
					if os.clock() < departHoldUntil - 0.05 then
						return
					end
					local after = if config.AfterDepartTextFn then config.AfterDepartTextFn() else nil
					if after and after ~= "" then
						label.Text = after
						label.TextTransparency = 0.35
						departHoldUntil = os.clock() + 3.5
						task.delay(3.5, function()
							if lastCount > 0 or not label.Parent then
								return
							end
							if os.clock() < departHoldUntil - 0.05 then
								return
							end
							local alone = aloneLine()
							label.Text = alone
							if alone == "" then
								label.TextTransparency = 1
							else
								label.TextTransparency = 0.45
							end
						end)
					else
						local alone = aloneLine()
						label.Text = alone
						if alone == "" then
							label.TextTransparency = 1
						else
							label.TextTransparency = 0.45
						end
					end
				end)
			else
				local alone = aloneLine()
				label.Text = alone
				if alone == "" then
					label.TextTransparency = 1
				elseif departed then
					pulseLeave()
				else
					label.TextTransparency = 0.45
				end
			end
			if departed and config.OnDeparted then
				config.OnDeparted()
			end
		else
			departHoldUntil = 0
			-- prev == -1 is first init (not a return); prev == 0 after depart is return
			local returned = prev == 0 and everDeparted
			local ret = if returned and config.ReturnTextFn then config.ReturnTextFn() else nil
			if ret and ret ~= "" then
				label.Text = ret
				pulseArrive()
				returnHoldUntil = os.clock() + 3.2
				task.delay(3.2, function()
					if lastCount <= 0 or not label.Parent then
						return
					end
					if os.clock() < returnHoldUntil - 0.05 then
						return
					end
					local after = if config.AfterReturnTextFn then config.AfterReturnTextFn() else nil
					if after and after ~= "" then
						label.Text = after
						label.TextTransparency = 0.1
						returnHoldUntil = os.clock() + 2.8
						task.delay(2.8, function()
							if lastCount <= 0 or not label.Parent then
								return
							end
							if os.clock() < returnHoldUntil - 0.05 then
								return
							end
							applyCopy(lastCount)
						end)
					else
						applyCopy(lastCount)
					end
				end)
			elseif n == 1 then
				returnHoldUntil = 0
				label.Text = oneLine()
				if prev <= 0 then
					pulseArrive()
				elseif prev > 1 then
					pulseLeave()
				end
			else
				returnHoldUntil = 0
				label.Text = manyLine(n)
				if prev <= 0 or n > prev then
					pulseArrive()
				elseif n < prev then
					pulseLeave()
				end
			end
			if returned and config.OnReturned then
				config.OnReturned()
			end
		end
		if config.OnCountChanged then
			config.OnCountChanged(n)
		end
	end

	local function refresh()
		if os.clock() < departHoldUntil or os.clock() < returnHoldUntil then
			return
		end
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
			if os.clock() < departHoldUntil or os.clock() < returnHoldUntil then
				return
			end
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
