--!strict
local Players = game:GetService("Players")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local Hud = require(script:WaitForChild("Hud"))
local EmoteWheel = require(script:WaitForChild("EmoteWheel"))
local ProximityGlow = require(script:WaitForChild("ProximityGlow"))
local FloatFx = require(script:WaitForChild("FloatFx"))
local AmbientAudio = require(script:WaitForChild("AmbientAudio"))
local VibeBoard = require(script:WaitForChild("VibeBoard"))

Hud.mount(playerGui)
EmoteWheel.mount(playerGui)
ProximityGlow.start(player)
FloatFx.start(player)
AmbientAudio.start()
VibeBoard.start()

print("[HazeHaven] client ready")
