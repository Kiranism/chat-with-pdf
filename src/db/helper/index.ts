import Chat from "../models/chatModel";
export interface ChatData {
  file_key: string;
  file_name: string;
  file_url: string;
  userId: string;
  _id?: string | undefined;
}
export const createChat = async (data: ChatData) => {
  return await Chat.create(data);
};
