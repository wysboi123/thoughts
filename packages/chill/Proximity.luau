--!strict
-- Soft proximity glow for nearby players (client-side).
-- Glow gently scales with how many friends are nearby.

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
	local crowdBoost = 1

	local function getRoot(character: Model): BasePart?
		local root = character:FindFirstChild("HumanoidRootPart")
		if root and root:IsA("BasePart") then
			return root
		end
		return nil
	end

	local function applyLight(light: PointLight)
		local mult = boost * crowdBoost
		light.Brightness = baseBrightness * mult
		light.Range = baseRange * (0.9 + 0.1 * mult)
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
		local nearCount = 0
		for _, other in Players:GetPlayers() do
			if other ~= localPlayer and other.Character then
				local root = getRoot(other.Character)
				if root then
					local near = (root.Position - myRoot.Position).Magnitude <= config.Radius
					if near then
						nearCount += 1
					end
					setGlow(other.Character, near)
				end
			end
		end
		-- Soft company crowd: 1 → 1.0, 2 → ~1.12, 3+ → ~1.25
		local nextCrowd = 1 + math.clamp(nearCount - 1, 0, 3) * 0.08
		if math.abs(nextCrowd - crowdBoost) > 0.01 then
			crowdBoost = nextCrowd
			for _, light in glowParts do
				applyLight(light)
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
