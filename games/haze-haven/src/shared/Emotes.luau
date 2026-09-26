--!strict
-- Soft emote catalog. No catalog AnimationIds required — server drives visible pose FX.

export type EmoteId = "wave" | "sit" | "float"

local Emotes = {
	List = {
		{ Id = "wave" :: EmoteId, Label = "Wave", Key = Enum.KeyCode.One },
		{ Id = "sit" :: EmoteId, Label = "Sit", Key = Enum.KeyCode.Two },
		{ Id = "float" :: EmoteId, Label = "Float", Key = Enum.KeyCode.Three },
	} :: { { Id: EmoteId, Label: string, Key: Enum.KeyCode } },
}

function Emotes.IsValid(id: string): boolean
	return id == "wave" or id == "sit" or id == "float"
end

return Emotes
