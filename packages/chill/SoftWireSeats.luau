--!strict
-- Wire Seat.Occupant → broadcast remote for SoftSit HUDs.

local SoftWireSeats = {}

function SoftWireSeats.wire(seat: Seat, remote: RemoteEvent)
	seat:GetPropertyChangedSignal("Occupant"):Connect(function()
		local humanoid = seat.Occupant
		local sittingPlayer: Player? = nil
		if humanoid then
			local character = humanoid.Parent
			if character and character:IsA("Model") then
				sittingPlayer = game:GetService("Players"):GetPlayerFromCharacter(character)
			end
		end
		local name = if sittingPlayer then sittingPlayer.DisplayName else nil
		remote:FireAllClients(seat.Name, name)
	end)
end

function SoftWireSeats.wireAll(root: Instance, remote: RemoteEvent)
	for _, child in root:GetDescendants() do
		if child:IsA("Seat") then
			SoftWireSeats.wire(child, remote)
		end
	end
end

return SoftWireSeats
