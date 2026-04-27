import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/next";

export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
  ],
});

export const createRoomAj = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
    characteristics: ["userId"],
  }),
);

export const joinRoomAj = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 20,
    characteristics: ["userId"],
  }),
);

export const profileUpdateAj = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 10,
    characteristics: ["userId"],
  }),
);

export const sendMessageAj = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 30,
    characteristics: ["userId"],
  }),
);

export const authAj = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 10,
  }),
);

export const toggleReactionAj = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 80,
    characteristics: ["userId"],
  }),
);
