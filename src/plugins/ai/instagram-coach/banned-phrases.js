export const BANNED_PATTERNS = [
  /\bbe (yourself|authentic|genuine)\b/i,
  /\bask (about )?(their|her|his) (interests|hobbies|day)\b/i,
  /\bfind common ground\b/i,
  /\bopen[- ]ended question\b/i,
  /\bactive listening\b/i,
  /\bbuild rapport\b/i,
  /\bbreak the ice\b/i,
  /\bsmall talk\b/i,
  /\bput yourself out there\b/i,
  /\bshow genuine interest\b/i,
  /\bjust be confident\b/i,
  /\bit (depends|varies)\b/i,
  /\beveryone is different\b/i,
  /\btrust your gut\b/i,
  /\btake it slow\b/i,
  /\breach out\b/i,
  /\bsay hi\b/i,
  /\bhow have you been\b/i,
  /\bwhat do you do for fun\b/i,
  /\bsending love\b/i,
  /\bthinking of you\b/i,
  /\blet me know if you (need anything|want to talk)\b/i,
  /\bsomething like\b/i,
  /\bplaceholder|\[name\]|\[topic\]|\[their name\]/i,
  /\breply warmly\b/i,
  /\bsend (a )?(friendly|nice|kind) message\b/i,
  /\bleave (a )?(thoughtful|nice|kind) comment\b/i,
  /\bstart (a )?conversation\b/i,
  /\bengage with (their|her|his) (story|post|content)\b/i,
  /\bcompliment (their|her|his)\b/i,
  /\bmake a connection\b/i
];

export function checkBannedPhrases(text) {
  for (const pattern of BANNED_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}
