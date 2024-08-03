export type ChatUser = {
  _id: string;
  email: string;
  username: string;
};

export type ChatRoom = {
  _id: string;
  userOne: ChatUser;
  userTwo: ChatUser;
  userOneId: string;
  userTwoId: string;
};
