import Chat from "../models/chatModel";
interface ChatData {
  file_key: string;
  file_name: string;
  file_url: string;
  userId: string;
}
export const createChat = async (data: ChatData) => {
  return await Chat.create(data);
};
