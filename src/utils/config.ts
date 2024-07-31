export const turnConfig = {
  iceServers: [
    {
      urls: ["stun:bn-turn1.xirsys.com"],
    },
    {
      username:
        "RKl18EscwfU-JDQRBn-ZU8O1eufqSrPDuDLZ0qpLAhBwkGruVH-qx59ODOJo72heAAAAAGap-OpwcmFkZWVwc29zcA==",
      credential: "cb48f3b8-4f18-11ef-b7a0-0242ac140004",
      urls: [
        "turn:bn-turn1.xirsys.com:80?transport=udp",
        "turn:bn-turn1.xirsys.com:3478?transport=udp",
        "turn:bn-turn1.xirsys.com:80?transport=tcp",
        "turn:bn-turn1.xirsys.com:3478?transport=tcp",
        "turns:bn-turn1.xirsys.com:443?transport=tcp",
        "turns:bn-turn1.xirsys.com:5349?transport=tcp",
      ],
    },
  ],
};
