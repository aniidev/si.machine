export const fewShotExamples = [
  {
    scenario: "Sourdough story, dormant tie (~2 months silence)",
    screenshotDescription: "Instagram story shows a sourdough loaf with visible crumb. User has not spoken to her in about two months.",
    bad_advice: "Reply to her story and ask how she's been! Show interest in her hobbies.",
    good_advice_json: {
      situation_read: {
        quoted_evidence: ["sourdough", "crumb", "hydration"],
        inferred_emotion: "low-pressure craft pride",
        social_stakes: "low"
      },
      exact_message_to_send: "wait the crumb on this is insane — what hydration are you running?",
      specific_detail_referenced: "crumb",
      predicted_response: {
        likely_reply_text: "haha thank you!! around 78%",
        probability: 0.72,
        next_move: "Ask one follow-up about flour or fermentation, then let it breathe."
      },
      why_not_generic_advice: "\"How have you been\" forces her to acknowledge the silence; the technical crumb question is easier and signals competence in her domain, not generic catch-up.",
      if_no_reply_in_48h: "Do nothing; the story reply was already the calibrated reach-out.",
      channel: "story_reply",
      confidence: 0.82
    }
  },
  {
    scenario: "Match replied 'lol' to user's meme",
    screenshotDescription: "DM thread shows they replied 'lol' to a Succession meme.",
    bad_advice: "Be authentic and ask an open-ended question about their interests.",
    good_advice_json: {
      situation_read: {
        quoted_evidence: ["lol", "Succession", "Roman"],
        inferred_emotion: "playful but low-investment",
        social_stakes: "low"
      },
      exact_message_to_send: "okay but who's your Roman?",
      specific_detail_referenced: "Roman",
      predicted_response: {
        likely_reply_text: "obviously Roman lmao",
        probability: 0.64,
        next_move: "Mirror the joke once, then ask a concrete watch-history question."
      },
      why_not_generic_advice: "\"lol\" is a stage-0 receipt; interview-mode questions are not calibrated to the meme context and would kill the thread.",
      if_no_reply_in_48h: "Let it sit; one meme callback is enough.",
      channel: "dm_existing",
      confidence: 0.76
    }
  },
  {
    scenario: "They told user their dog died",
    screenshotDescription: "DM thread shows the other person saying their dog died.",
    bad_advice: "Send: 'That sounds awful! Sending love ❤️ Let me know if you want to talk!'",
    good_advice_json: {
      situation_read: {
        quoted_evidence: ["my dog died", "with him", "end"],
        inferred_emotion: "grief needing witness",
        social_stakes: "high"
      },
      exact_message_to_send: "oh god — were you with him at the end?",
      specific_detail_referenced: "end",
      predicted_response: {
        likely_reply_text: "yeah, I was there with him",
        probability: 0.58,
        next_move: "Reflect their answer before adding sympathy."
      },
      why_not_generic_advice: "\"Sending love\" forecloses the conversation; this does not dodge the loss and invites a real memory if they want to share.",
      if_no_reply_in_48h: "Do not follow up; grief replies need space.",
      channel: "dm_existing",
      confidence: 0.81
    }
  },
  {
    scenario: "Old college friend, 3 weeks silent",
    screenshotDescription: "DM thread with an old college friend has been quiet for about three weeks.",
    bad_advice: "Just send 'Hey, how have you been?' to reconnect.",
    good_advice_json: {
      situation_read: {
        quoted_evidence: ["Tame Impala", "festival rant", "train"],
        inferred_emotion: "warm dormant tie",
        social_stakes: "medium"
      },
      exact_message_to_send: "random — saw a guy on the train wearing the same Tame Impala shirt and immediately thought of your festival rant",
      specific_detail_referenced: "Tame Impala",
      predicted_response: {
        likely_reply_text: "no way hahaha that rant was justified",
        probability: 0.61,
        next_move: "Trade one memory, then suggest coffee only if momentum appears."
      },
      why_not_generic_advice: "\"How have you been\" confirms drift; a callback bid to Tame Impala ratchets back without making the silence the topic.",
      if_no_reply_in_48h: "Do not apologize or double text; the callback already did its job.",
      channel: "dm_existing",
      confidence: 0.73
    }
  },
  {
    scenario: "User about to send 'wanna hang out sometime?'",
    screenshotDescription: "User is composing a vague hangout invitation.",
    bad_advice: "Suggest meeting up. 'We should hang out sometime!' is a friendly invitation.",
    good_advice_json: {
      situation_read: {
        quoted_evidence: ["wanna hang out sometime", "ramen", "Smith"],
        inferred_emotion: "interest but vague commitment",
        social_stakes: "medium"
      },
      exact_message_to_send: "there's a new ramen spot on Smith — Tuesday 7 or Thursday 7?",
      specific_detail_referenced: "ramen",
      predicted_response: {
        likely_reply_text: "Thursday could work!",
        probability: 0.66,
        next_move: "Confirm the time and keep the plan simple."
      },
      why_not_generic_advice: "Vague invitations land as ostensibly insincere; ramen plus two times makes the bid concrete without pressuring them.",
      if_no_reply_in_48h: "Send no follow-up; wait for a real scheduling response.",
      channel: "dm_existing",
      confidence: 0.79
    }
  }
];
