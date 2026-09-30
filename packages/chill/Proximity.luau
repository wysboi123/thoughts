--!strict
-- Soft proximity glow for nearby players (client-side).

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

export type ProximityConfig = {
	Radius: number,
	GlowColor: Color3,
	Brightness: number?,
	Range: number?,
}

export type ProximityHandle = {
	setBoost: (mult: number) -> (),
}

local Proximity = {}

function Proximity.start(localPlayer: Player, config: ProximityConfig): ProximityHandle
	local glowParts: { [Model]: PointLight } = {}
	local baseBrightness = config.Brightness or 1.4
	local baseRange = config.Range or 10
	local boost = 1

	local function getRoot(character: Model): BasePart?
		local root = character:FindFirstChild("HumanoidRootPart")
		if root and root:IsA("BasePart") then
			return root
		end
		return nil
	end

	local function applyLight(light: PointLight)
		light.Brightness = baseBrightness * boost
		light.Range = baseRange * (0.9 + 0.1 * boost)
	end

	local function setGlow(character: Model, enabled: boolean)
		local root = getRoot(character)
		if not root then
			return
		end
		local existing = glowParts[character]
		if enabled then
			if not existing then
				local light = Instance.new("PointLight")
				light.Name = "ChillProximityGlow"
				light.Color = config.GlowColor
				light.Parent = root
				glowParts[character] = light
				applyLight(light)
			else
				applyLight(existing)
			end
		elseif existing then
			existing:Destroy()
			glowParts[character] = nil
		end
	end

	RunService.Heartbeat:Connect(function()
		local myChar = localPlayer.Character
		local myRoot = myChar and getRoot(myChar)
		if not myRoot then
			return
		end
		for _, other in Players:GetPlayers() do
			if other ~= localPlayer and other.Character then
				local root = getRoot(other.Character)
				if root then
					local near = (root.Position - myRoot.Position).Magnitude <= config.Radius
					setGlow(other.Character, near)
				end
			end
		end
	end)

	Players.PlayerRemoving:Connect(function(player)
		if player.Character then
			setGlow(player.Character, false)
		end
	end)

	return {
		setBoost = function(mult: number)
			boost = math.max(0.5, mult)
			for _, light in glowParts do
				applyLight(light)
			end
		end,
	}
end

return Proximity
