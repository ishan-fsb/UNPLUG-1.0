
import React, { useEffect, useState, type ReactNode } from "react";
import "./App.css";

type Goal = { id: number; title: string; done: boolean };
type Quest = { id: number; title: string; detail: string; xp: number; done: boolean };
type Mood = { date: string; mood: string; note: string };
type Skill = "Mind" | "Body" | "Creativity" | "Discipline";
type Language = "en" | "ta" | "ml" | "hi" | "ar";

const load = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(`unplug-${key}`);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
};

const initialQuests: Quest[] = [
  { id: 1, title: "Touch grass. Literally.", detail: "Spend 15 minutes outside without scrolling.", xp: 30, done: false },
  { id: 2, title: "Read a real page", detail: "Read a book or magazine for 10 minutes.", xp: 20, done: false },
  { id: 3, title: "Move your body", detail: "Stretch, walk, skate, dance or train for 15 minutes.", xp: 30, done: false },
  { id: 4, title: "Create something", detail: "Draw, write, build or make something offline.", xp: 40, done: false },
  { id: 5, title: "Human connection", detail: "Have a proper conversation with someone.", xp: 25, done: false },
];

const navItems = [
  ["Home", "⌂"], ["My Goals", "◎"], ["Focus Space", "◷"], ["Detox Island", "🏝️"],
  ["Challenges", "⚡"], ["Skill Tree", "✳"], ["Study Planner", "▤"],
  ["Mood Check", "☀"], ["Distraction Lab", "⌁"], ["Rewards", "◇"],
  ["Mind Reset", "♡"], ["My Progress", "↗"], ["Future Self", "✉"], ["Settings", "⚙"],
];

const themes = [
  { id: "ocean", name: "Ocean Focus", colors: "🌊" },
  { id: "earth", name: "Warm Earth", colors: "🌿" },
  { id: "night", name: "Night Shift", colors: "🌙" },
  { id: "contrast", name: "Maximum Clarity", colors: "◐" },
];

const today = () => new Date().toISOString().slice(0, 10);

const translations: Record<Exclude<Language, "en">, Record<string, string>> = {
  ta: {
    "Home":"முகப்பு","My Goals":"எனது இலக்குகள்","Focus Space":"கவன நேரம்","Detox Island":"டிடாக்ஸ் தீவு",
    "Challenges":"சவால்கள்","Skill Tree":"திறன் மரம்","Study Planner":"படிப்பு திட்டம்","Mood Check":"மனநிலை",
    "Distraction Lab":"கவனச்சிதறல் ஆய்வு","Rewards":"வெகுமதிகள்","Mind Reset":"மன ஓய்வு",
    "My Progress":"எனது முன்னேற்றம்","Future Self":"எதிர்கால நான்","Settings":"அமைப்புகள்",
    "YOUR SPACE":"உங்கள் இடம்","YOUR DIGITAL WELLNESS HQ":"உங்கள் டிஜிட்டல் நல மையம்",
    "YOUR LIFE. YOUR RULES.":"உங்கள் வாழ்க்கை. உங்கள் விதிகள்.","Language":"மொழி",
    "Less scrolling.":"குறைவாக ஸ்க்ரோல் செய்யுங்கள்.","More living.":"வாழ்க்கையை அதிகம் அனுபவியுங்கள்.",
    "Your attention is your superpower. Spend it on things that actually matter.":"உங்கள் கவனம் உங்கள் பலம். முக்கியமானவற்றில் அதைப் பயன்படுத்துங்கள்.",
    "Enter focus mode":"கவன முறைக்குச் செல்லுங்கள்","THE WORLD IS WAITING":"உலகம் காத்திருக்கிறது",
    "RECLAIM YOUR DAY":"உங்கள் நாளை மீட்டெடுங்கள்","Total XP":"மொத்த XP","Focus sessions":"கவன அமர்வுகள்",
    "Time focused":"கவனித்த நேரம்","Goals completed":"முடித்த இலக்குகள்","Today's mission":"இன்றைய பணி",
    "Make today count.":"இன்றைய நாளை பயனுள்ளதாக மாற்றுங்கள்.","See all goals →":"அனைத்து இலக்குகளையும் காண்க →",
    "Your island is growing":"உங்கள் தீவு வளர்கிறது","Every offline action builds your world.":"ஒவ்வொரு ஆஃப்லைன் செயல்பாடும் உங்கள் உலகை வளர்க்கிறது.",
    "Visit island →":"தீவுக்குச் செல்லுங்கள் →","Your next move":"உங்கள் அடுத்த செயல்","Pick one. Start now.":"ஒன்றைத் தேர்ந்தெடுத்து இப்போதே தொடங்குங்கள்.",
    "Focus sprint":"கவனப் பயிற்சி","Lock in for 25 minutes":"25 நிமிடங்கள் கவனம் செலுத்துங்கள்",
    "Take a challenge":"சவாலை ஏற்கவும்","Earn XP in real life":"நிஜ வாழ்க்கையில் XP பெறுங்கள்",
    "Check your mood":"உங்கள் மனநிலையைப் பாருங்கள்","See how you're doing":"நீங்கள் எப்படி உணர்கிறீர்கள் என்று பாருங்கள்",
    "Make your goals visible.":"உங்கள் இலக்குகளைத் தெளிவாகப் பாருங்கள்.","Make your progress undeniable.":"உங்கள் முன்னேற்றத்தை உறுதிப்படுத்துங்கள்.",
    "Add a new goal":"புதிய இலக்கைச் சேர்க்கவும்","Add goal +":"இலக்கைச் சேர்க்கவும் +",
    "Your goal list":"உங்கள் இலக்குகள் பட்டியல்","Complete a goal to earn 10 XP.":"ஒரு இலக்கை முடித்து 10 XP பெறுங்கள்.",
    "What do you want to get done?":"நீங்கள் எதை முடிக்க விரும்புகிறீர்கள்?",
    "One task. One timer.":"ஒரு பணி. ஒரு நேரக் கணிப்பான்.","No negotiating with distractions.":"கவனச்சிதறல்களுடன் சமரசம் வேண்டாம்.",
    "The focus chamber":"கவன அறை","Choose your sprint length and get into it.":"நேரத்தைத் தேர்ந்தெடுத்து தொடங்குங்கள்.",
    "Pause session":"அமர்வை இடைநிறுத்து","Start again":"மீண்டும் தொடங்கு","Start focusing →":"கவனம் செலுத்தத் தொடங்கு →",
    "Reset":"மீட்டமை","You did it.":"நீங்கள் சாதித்துவிட்டீர்கள்.","SESSION COMPLETE":"அமர்வு முடிந்தது",
    "YOU'RE LOCKED IN":"நீங்கள் முழுக் கவனத்தில் உள்ளீர்கள்","READY WHEN YOU ARE":"நீங்கள் தயாரானதும் தொடங்கலாம்",
    "This little world grows when you spend more time in the real one.":"நிஜ உலகில் அதிக நேரம் செலவிட்டால் இந்தச் சிறிய உலகம் வளரும்.",
    "How to grow your island":"உங்கள் தீவை வளர்ப்பது எப்படி","Real-world actions. Real-world wins.":"நிஜச் செயல்கள். நிஜ வெற்றிகள்.",
    "Explore offline quests →":"ஆஃப்லைன் பணிகளைப் பாருங்கள் →","Seven days. Seven small wins.":"ஏழு நாட்கள். ஏழு சிறிய வெற்றிகள்.",
    "7 days to take":"உங்கள் நேரத்தை மீட்டெடுக்க","your time back.":"7 நாட்கள்.",
    "Complete each daily mission to earn XP and build momentum.":"ஒவ்வொரு நாள் பணியையும் முடித்து XP பெறுங்கள்.",
    "Completed ✓":"முடிந்தது ✓","Complete":"முடிக்கவும்",
    "Mind":"மனம்","Body":"உடல்","Creativity":"படைப்பாற்றல்","Discipline":"ஒழுக்கம்",
    "Your skill philosophy":"உங்கள் திறன் கொள்கை","Add a study task":"படிப்பு பணியைச் சேர்க்கவும்",
    "Your study plan":"உங்கள் படிப்பு திட்டம்","Add task +":"பணியைச் சேர்க்கவும் +",
    "How are you feeling?":"நீங்கள் எப்படி உணர்கிறீர்கள்?","A quick check-in. No judgement, ever.":"சிறிய மனநிலை பதிவு. எந்தத் தீர்ப்பும் இல்லை.",
    "Anything on your mind? (optional)":"மனதில் ஏதேனும் உள்ளதா? (விருப்பம்)",
    "Save check-in +5 XP":"பதிவைச் சேமி +5 XP","Recent check-ins":"சமீபத்திய பதிவுகள்",
    "Catch a distraction":"கவனச்சிதறலைப் பதிவு செய்யுங்கள்","Log it":"பதிவு செய்","Your distraction radar":"உங்கள் கவனச்சிதறல் கண்காணிப்பு",
    "YOUR XP BALANCE":"உங்கள் XP இருப்பு","Redeem reward":"வெகுமதியைப் பெறுங்கள்","Claimed ✓":"பெறப்பட்டது ✓",
    "Not enough XP":"போதுமான XP இல்லை","The 60-second reset":"60 விநாடி ஓய்வு","Clear your head":"மனதைத் தெளிவாக்குங்கள்",
    "Your level journey":"உங்கள் நிலைப் பயணம்","Your activity snapshot":"உங்கள் செயல்பாட்டு சுருக்கம்",
    "A message from present you":"இன்றைய உங்களிடமிருந்து ஒரு செய்தி","DEAR FUTURE ME,":"எதிர்கால என்னே,",
    "Colour themes":"நிறத் தோற்றங்கள்","Choose a theme that feels comfortable to look at.":"உங்களுக்கு வசதியான தோற்றத்தைத் தேர்ந்தெடுக்கவும்.",
    "Your data":"உங்கள் தரவு","Reset all my data":"எனது எல்லா தரவையும் மீட்டமை",
    "Made by HACKERZZ":"HACKERZZ உருவாக்கியது","Build better habits. Create better futures.":"சிறந்த பழக்கங்கள். சிறந்த எதிர்காலம்.",
    "Disconnect from distractions. Reconnect with your dreams.":"கவனச்சிதறலிலிருந்து விலகுங்கள். உங்கள் கனவுகளுடன் மீண்டும் இணையுங்கள்."
  },
  ml: {
    "Home":"ഹോം","My Goals":"എന്റെ ലക്ഷ്യങ്ങൾ","Focus Space":"ശ്രദ്ധാകേന്ദ്രം","Detox Island":"ഡിറ്റോക്സ് ദ്വീപ്",
    "Challenges":"വെല്ലുവിളികൾ","Skill Tree":"കഴിവുകളുടെ വൃക്ഷം","Study Planner":"പഠന ആസൂത്രണം","Mood Check":"മനോഭാവം",
    "Distraction Lab":"ശ്രദ്ധതിരിച്ചുവിടൽ ലാബ്","Rewards":"പ്രതിഫലങ്ങൾ","Mind Reset":"മനസ്സിന് ഇടവേള",
    "My Progress":"എന്റെ പുരോഗതി","Future Self":"ഭാവിയിലെ ഞാൻ","Settings":"ക്രമീകരണങ്ങൾ",
    "YOUR SPACE":"നിങ്ങളുടെ ഇടം","YOUR DIGITAL WELLNESS HQ":"നിങ്ങളുടെ ഡിജിറ്റൽ ക്ഷേമ കേന്ദ്രം",
    "YOUR LIFE. YOUR RULES.":"നിങ്ങളുടെ ജീവിതം. നിങ്ങളുടെ നിയമങ്ങൾ.","Language":"ഭാഷ",
    "Less scrolling.":"സ്ക്രോളിംഗ് കുറയ്ക്കൂ.","More living.":"ജീവിതം കൂടുതൽ ആസ്വദിക്കൂ.",
    "Your attention is your superpower. Spend it on things that actually matter.":"നിങ്ങളുടെ ശ്രദ്ധയാണ് നിങ്ങളുടെ ശക്തി. പ്രധാനപ്പെട്ട കാര്യങ്ങൾക്കായി അത് ഉപയോഗിക്കൂ.",
    "Enter focus mode":"ഫോക്കസ് മോഡിലേക്ക് പോകൂ","THE WORLD IS WAITING":"ലോകം കാത്തിരിക്കുന്നു",
    "RECLAIM YOUR DAY":"നിങ്ങളുടെ ദിവസം തിരിച്ചുപിടിക്കൂ","Total XP":"ആകെ XP","Focus sessions":"ഫോക്കസ് സെഷനുകൾ",
    "Time focused":"ശ്രദ്ധിച്ച സമയം","Goals completed":"പൂർത്തിയാക്കിയ ലക്ഷ്യങ്ങൾ","Today's mission":"ഇന്നത്തെ ദൗത്യം",
    "Make today count.":"ഇന്നത്തെ ദിവസം പ്രയോജനകരമാക്കൂ.","See all goals →":"എല്ലാ ലക്ഷ്യങ്ങളും കാണൂ →",
    "Your island is growing":"നിങ്ങളുടെ ദ്വീപ് വളരുന്നു","Every offline action builds your world.":"ഓരോ ഓഫ്‌ലൈൻ പ്രവർത്തനവും നിങ്ങളുടെ ലോകം വളർത്തുന്നു.",
    "Visit island →":"ദ്വീപ് സന്ദർശിക്കൂ →","Your next move":"അടുത്ത നീക്കം","Pick one. Start now.":"ഒന്ന് തിരഞ്ഞെടുക്കൂ. ഇപ്പോൾ തുടങ്ങൂ.",
    "Focus sprint":"ഫോക്കസ് സ്പ്രിന്റ്","Lock in for 25 minutes":"25 മിനിറ്റ് ശ്രദ്ധ കേന്ദ്രീകരിക്കൂ",
    "Take a challenge":"ഒരു വെല്ലുവിളി ഏറ്റെടുക്കൂ","Earn XP in real life":"യഥാർത്ഥ ജീവിതത്തിൽ XP നേടൂ",
    "Check your mood":"മനോഭാവം പരിശോധിക്കൂ","See how you're doing":"നിങ്ങൾക്ക് എങ്ങനെയെന്ന് നോക്കൂ",
    "Make your goals visible.":"ലക്ഷ്യങ്ങൾ വ്യക്തമായി കാണൂ.","Make your progress undeniable.":"പുരോഗതി തെളിയിക്കൂ.",
    "Add a new goal":"പുതിയ ലക്ഷ്യം ചേർക്കൂ","Add goal +":"ലക്ഷ്യം ചേർക്കൂ +","Your goal list":"നിങ്ങളുടെ ലക്ഷ്യങ്ങൾ",
    "Complete a goal to earn 10 XP.":"ഒരു ലക്ഷ്യം പൂർത്തിയാക്കി 10 XP നേടൂ.",
    "What do you want to get done?":"എന്താണ് പൂർത്തിയാക്കേണ്ടത്?",
    "One task. One timer.":"ഒരു ജോലി. ഒരു ടൈമർ.","No negotiating with distractions.":"ശ്രദ്ധതിരിച്ചുവിടലുകളോട് വിട്ടുവീഴ്ച വേണ്ട.",
    "The focus chamber":"ഫോക്കസ് മുറി","Choose your sprint length and get into it.":"സമയം തിരഞ്ഞെടുത്ത് തുടങ്ങൂ.",
    "Pause session":"സെഷൻ നിർത്തൂ","Start again":"വീണ്ടും തുടങ്ങൂ","Start focusing →":"ശ്രദ്ധ തുടങ്ങൂ →","Reset":"റീസെറ്റ്",
    "You did it.":"നിങ്ങൾ ചെയ്തു!","SESSION COMPLETE":"സെഷൻ പൂർത്തിയായി","YOU'RE LOCKED IN":"നിങ്ങൾ പൂർണ്ണ ശ്രദ്ധയിലാണ്",
    "READY WHEN YOU ARE":"നിങ്ങൾ തയ്യാറാകുമ്പോൾ തുടങ്ങാം",
    "This little world grows when you spend more time in the real one.":"യഥാർത്ഥ ലോകത്തിൽ കൂടുതൽ സമയം ചെലവഴിക്കുമ്പോൾ ഈ ചെറിയ ലോകം വളരും.",
    "How to grow your island":"ദ്വീപ് എങ്ങനെ വളർത്താം","Real-world actions. Real-world wins.":"യഥാർത്ഥ പ്രവർത്തനങ്ങൾ. യഥാർത്ഥ വിജയങ്ങൾ.",
    "Explore offline quests →":"ഓഫ്‌ലൈൻ ദൗത്യങ്ങൾ കാണൂ →","Seven days. Seven small wins.":"ഏഴ് ദിവസം. ഏഴ് ചെറിയ വിജയങ്ങൾ.",
    "Complete each daily mission to earn XP and build momentum.":"ദിവസേനയുള്ള ദൗത്യം പൂർത്തിയാക്കി XP നേടൂ.",
    "Completed ✓":"പൂർത്തിയായി ✓","Complete":"പൂർത്തിയാക്കൂ",
    "Mind":"മനസ്സ്","Body":"ശരീരം","Creativity":"സൃഷ്ടിപരത","Discipline":"അച്ചടക്കം",
    "Your skill philosophy":"നിങ്ങളുടെ കഴിവുകളുടെ തത്വം","Add a study task":"പഠന ജോലി ചേർക്കൂ","Your study plan":"നിങ്ങളുടെ പഠന പദ്ധതി",
    "Add task +":"ജോലി ചേർക്കൂ +","How are you feeling?":"നിങ്ങൾക്ക് എങ്ങനെ തോന്നുന്നു?",
    "A quick check-in. No judgement, ever.":"ഒരു ചെറിയ പരിശോധന. വിധികളില്ല.",
    "Anything on your mind? (optional)":"മനസ്സിലുള്ളത് എന്തെങ്കിലും? (ഐച്ഛികം)",
    "Save check-in +5 XP":"സേവ് ചെയ്യൂ +5 XP","Recent check-ins":"സമീപകാല രേഖകൾ",
    "Catch a distraction":"ശ്രദ്ധതിരിച്ചുവിടൽ രേഖപ്പെടുത്തൂ","Log it":"രേഖപ്പെടുത്തൂ","Your distraction radar":"നിങ്ങളുടെ ശ്രദ്ധ നിരീക്ഷണം",
    "YOUR XP BALANCE":"നിങ്ങളുടെ XP ബാലൻസ്","Redeem reward":"പ്രതിഫലം നേടൂ","Claimed ✓":"നേടി ✓",
    "Not enough XP":"മതിയായ XP ഇല്ല","The 60-second reset":"60 സെക്കൻഡ് ഇടവേള","Clear your head":"മനസ്സ് ശാന്തമാക്കൂ",
    "Your level journey":"നിങ്ങളുടെ ലെവൽ യാത്ര","Your activity snapshot":"പ്രവർത്തന സംഗ്രഹം",
    "A message from present you":"ഇപ്പോഴത്തെ നിങ്ങളിൽ നിന്ന് ഒരു സന്ദേശം","DEAR FUTURE ME,":"പ്രിയ ഭാവിയിലെ ഞാനേ,",
    "Colour themes":"നിറ തീമുകൾ","Choose a theme that feels comfortable to look at.":"കാണാൻ സുഖകരമായ തീം തിരഞ്ഞെടുക്കൂ.",
    "Your data":"നിങ്ങളുടെ ഡാറ്റ","Reset all my data":"എന്റെ ഡാറ്റ മുഴുവൻ റീസെറ്റ് ചെയ്യൂ",
    "Made by HACKERZZ":"HACKERZZ നിർമ്മിച്ചത്","Build better habits. Create better futures.":"നല്ല ശീലങ്ങൾ വളർത്തൂ. നല്ല ഭാവി സൃഷ്ടിക്കൂ.",
    "Disconnect from distractions. Reconnect with your dreams.":"ശ്രദ്ധതിരിച്ചുവിടലുകളിൽ നിന്ന് മാറൂ. സ്വപ്നങ്ങളുമായി വീണ്ടും ബന്ധപ്പെടൂ."
  },
  hi: {
    "Home":"होम","My Goals":"मेरे लक्ष्य","Focus Space":"फोकस स्पेस","Detox Island":"डिटॉक्स द्वीप",
    "Challenges":"चुनौतियाँ","Skill Tree":"कौशल वृक्ष","Study Planner":"पढ़ाई की योजना","Mood Check":"मूड चेक",
    "Distraction Lab":"ध्यान भटकाव लैब","Rewards":"इनाम","Mind Reset":"मन को विराम",
    "My Progress":"मेरी प्रगति","Future Self":"भविष्य का मैं","Settings":"सेटिंग्स",
    "YOUR SPACE":"आपकी जगह","YOUR DIGITAL WELLNESS HQ":"आपका डिजिटल वेलनेस केंद्र",
    "YOUR LIFE. YOUR RULES.":"आपकी ज़िंदगी। आपके नियम।","Language":"भाषा",
    "Less scrolling.":"कम स्क्रॉलिंग।","More living.":"ज़िंदगी को और जियो।",
    "Your attention is your superpower. Spend it on things that actually matter.":"आपका ध्यान आपकी ताकत है। इसे उन चीज़ों पर लगाएँ जो सच में मायने रखती हैं।",
    "Enter focus mode":"फोकस मोड में जाएँ","THE WORLD IS WAITING":"दुनिया इंतज़ार कर रही है",
    "RECLAIM YOUR DAY":"अपना दिन वापस पाएँ","Total XP":"कुल XP","Focus sessions":"फोकस सेशन",
    "Time focused":"ध्यान का समय","Goals completed":"पूरे किए लक्ष्य","Today's mission":"आज का मिशन",
    "Make today count.":"आज के दिन को खास बनाएँ।","See all goals →":"सभी लक्ष्य देखें →",
    "Your island is growing":"आपका द्वीप बढ़ रहा है","Every offline action builds your world.":"हर ऑफलाइन काम आपकी दुनिया बनाता है।",
    "Visit island →":"द्वीप पर जाएँ →","Your next move":"आपका अगला कदम","Pick one. Start now.":"एक चुनें। अभी शुरू करें।",
    "Focus sprint":"फोकस स्प्रिंट","Lock in for 25 minutes":"25 मिनट तक पूरा ध्यान दें",
    "Take a challenge":"चुनौती लें","Earn XP in real life":"असली ज़िंदगी में XP कमाएँ",
    "Check your mood":"अपना मूड देखें","See how you're doing":"देखें आप कैसा महसूस कर रहे हैं",
    "Make your goals visible.":"अपने लक्ष्य साफ़ रखें।","Make your progress undeniable.":"अपनी प्रगति दिखाएँ।",
    "Add a new goal":"नया लक्ष्य जोड़ें","Add goal +":"लक्ष्य जोड़ें +","Your goal list":"आपके लक्ष्य",
    "Complete a goal to earn 10 XP.":"एक लक्ष्य पूरा करके 10 XP पाएँ।",
    "What do you want to get done?":"आप क्या पूरा करना चाहते हैं?",
    "One task. One timer.":"एक काम। एक टाइमर।","No negotiating with distractions.":"ध्यान भटकाने वाली चीज़ों से समझौता नहीं।",
    "The focus chamber":"फोकस कक्ष","Choose your sprint length and get into it.":"समय चुनें और शुरू हो जाएँ।",
    "Pause session":"सेशन रोकें","Start again":"फिर शुरू करें","Start focusing →":"फोकस शुरू करें →","Reset":"रीसेट",
    "You did it.":"आपने कर दिखाया।","SESSION COMPLETE":"सेशन पूरा हुआ","YOU'RE LOCKED IN":"आपका पूरा ध्यान लगा है",
    "READY WHEN YOU ARE":"जब तैयार हों, शुरू करें",
    "This little world grows when you spend more time in the real one.":"जब आप असली दुनिया में समय बिताते हैं, यह छोटी दुनिया बढ़ती है।",
    "How to grow your island":"अपने द्वीप को कैसे बढ़ाएँ","Real-world actions. Real-world wins.":"असली काम। असली जीत।",
    "Explore offline quests →":"ऑफलाइन मिशन देखें →","Seven days. Seven small wins.":"सात दिन। सात छोटी जीत।",
    "Complete each daily mission to earn XP and build momentum.":"XP पाने और आगे बढ़ने के लिए रोज़ का मिशन पूरा करें।",
    "Completed ✓":"पूरा हुआ ✓","Complete":"पूरा करें",
    "Mind":"मन","Body":"शरीर","Creativity":"रचनात्मकता","Discipline":"अनुशासन",
    "Your skill philosophy":"आपके कौशल का सिद्धांत","Add a study task":"पढ़ाई का काम जोड़ें","Your study plan":"आपकी पढ़ाई की योजना",
    "Add task +":"काम जोड़ें +","How are you feeling?":"आप कैसा महसूस कर रहे हैं?",
    "A quick check-in. No judgement, ever.":"एक छोटा चेक-इन। कोई निर्णय नहीं।",
    "Anything on your mind? (optional)":"मन में कुछ है? (ज़रूरी नहीं)",
    "Save check-in +5 XP":"चेक-इन सेव करें +5 XP","Recent check-ins":"हाल के चेक-इन",
    "Catch a distraction":"ध्यान भटकने को दर्ज करें","Log it":"दर्ज करें","Your distraction radar":"आपका ध्यान भटकाव रडार",
    "YOUR XP BALANCE":"आपका XP बैलेंस","Redeem reward":"इनाम लें","Claimed ✓":"ले लिया ✓",
    "Not enough XP":"पर्याप्त XP नहीं","The 60-second reset":"60 सेकंड का रीसेट","Clear your head":"मन हल्का करें",
    "Your level journey":"आपका लेवल सफर","Your activity snapshot":"आपकी गतिविधि का सार",
    "A message from present you":"आज के आप का भविष्य के आप को संदेश","DEAR FUTURE ME,":"प्रिय भविष्य के मैं,",
    "Colour themes":"रंग थीम","Choose a theme that feels comfortable to look at.":"ऐसी थीम चुनें जो देखने में आरामदायक हो।",
    "Your data":"आपका डेटा","Reset all my data":"मेरा सारा डेटा रीसेट करें",
    "Made by HACKERZZ":"HACKERZZ द्वारा बनाया गया","Build better habits. Create better futures.":"बेहतर आदतें बनाएँ। बेहतर भविष्य बनाएँ।",
    "Disconnect from distractions. Reconnect with your dreams.":"ध्यान भटकाने वाली चीज़ों से दूर हों। अपने सपनों से फिर जुड़ें।"
  },
  ar: {
    "Home":"الرئيسية","My Goals":"أهدافي","Focus Space":"مساحة التركيز","Detox Island":"جزيرة التخلص الرقمي",
    "Challenges":"التحديات","Skill Tree":"شجرة المهارات","Study Planner":"مخطط الدراسة","Mood Check":"فحص المزاج",
    "Distraction Lab":"مختبر المشتتات","Rewards":"المكافآت","Mind Reset":"استراحة ذهنية",
    "My Progress":"تقدمي","Future Self":"ذاتي المستقبلية","Settings":"الإعدادات",
    "YOUR SPACE":"مساحتك","YOUR DIGITAL WELLNESS HQ":"مركز رفاهيتك الرقمية",
    "YOUR LIFE. YOUR RULES.":"حياتك. قواعدك.","Language":"اللغة",
    "Less scrolling.":"تصفح أقل.","More living.":"عِش أكثر.",
    "Your attention is your superpower. Spend it on things that actually matter.":"انتباهك هو قوتك الخارقة. استخدمه فيما يستحق حقًا.",
    "Enter focus mode":"ادخل وضع التركيز","THE WORLD IS WAITING":"العالم بانتظارك",
    "RECLAIM YOUR DAY":"استعد يومك","Total XP":"إجمالي XP","Focus sessions":"جلسات التركيز",
    "Time focused":"وقت التركيز","Goals completed":"الأهداف المكتملة","Today's mission":"مهمة اليوم",
    "Make today count.":"اجعل يومك ذا قيمة.","See all goals →":"عرض كل الأهداف →",
    "Your island is growing":"جزيرتك تنمو","Every offline action builds your world.":"كل نشاط بعيدًا عن الشاشة يبني عالمك.",
    "Visit island →":"زر الجزيرة →","Your next move":"خطوتك التالية","Pick one. Start now.":"اختر واحدة. ابدأ الآن.",
    "Focus sprint":"دفعة تركيز","Lock in for 25 minutes":"ركز لمدة 25 دقيقة",
    "Take a challenge":"ابدأ تحديًا","Earn XP in real life":"اكسب XP في الحياة الواقعية",
    "Check your mood":"تحقق من مزاجك","See how you're doing":"اطمئن على حالك",
    "Make your goals visible.":"اجعل أهدافك واضحة.","Make your progress undeniable.":"اجعل تقدمك ملموسًا.",
    "Add a new goal":"أضف هدفًا جديدًا","Add goal +":"أضف هدفًا +","Your goal list":"قائمة أهدافك",
    "Complete a goal to earn 10 XP.":"أكمل هدفًا لتحصل على 10 XP.",
    "What do you want to get done?":"ما الذي تريد إنجازه؟",
    "One task. One timer.":"مهمة واحدة. مؤقت واحد.","No negotiating with distractions.":"لا تساوم المشتتات.",
    "The focus chamber":"غرفة التركيز","Choose your sprint length and get into it.":"اختر مدة التركيز وابدأ.",
    "Pause session":"إيقاف مؤقت","Start again":"ابدأ مجددًا","Start focusing →":"ابدأ التركيز →","Reset":"إعادة ضبط",
    "You did it.":"لقد أنجزت ذلك.","SESSION COMPLETE":"اكتملت الجلسة","YOU'RE LOCKED IN":"أنت في قمة التركيز",
    "READY WHEN YOU ARE":"ابدأ عندما تكون مستعدًا",
    "This little world grows when you spend more time in the real one.":"ينمو هذا العالم الصغير عندما تقضي وقتًا أطول في العالم الحقيقي.",
    "How to grow your island":"كيف تطور جزيرتك","Real-world actions. Real-world wins.":"أفعال حقيقية. إنجازات حقيقية.",
    "Explore offline quests →":"استكشف المهام دون اتصال →","Seven days. Seven small wins.":"سبعة أيام. سبعة إنجازات صغيرة.",
    "Complete each daily mission to earn XP and build momentum.":"أكمل المهمة اليومية لتحصل على XP وتواصل التقدم.",
    "Completed ✓":"مكتمل ✓","Complete":"إكمال",
    "Mind":"العقل","Body":"الجسم","Creativity":"الإبداع","Discipline":"الانضباط",
    "Your skill philosophy":"فلسفتك في تطوير المهارات","Add a study task":"أضف مهمة دراسية","Your study plan":"خطتك الدراسية",
    "Add task +":"أضف مهمة +","How are you feeling?":"كيف تشعر؟",
    "A quick check-in. No judgement, ever.":"تفقّد سريع. بلا أحكام أبدًا.",
    "Anything on your mind? (optional)":"هل هناك ما يشغل بالك؟ (اختياري)",
    "Save check-in +5 XP":"احفظ الحالة +5 XP","Recent check-ins":"آخر تسجيلات الحالة",
    "Catch a distraction":"سجّل مشتتًا","Log it":"تسجيل","Your distraction radar":"مؤشر المشتتات",
    "YOUR XP BALANCE":"رصيد XP الخاص بك","Redeem reward":"استبدل المكافأة","Claimed ✓":"تم الاستلام ✓",
    "Not enough XP":"XP غير كافٍ","The 60-second reset":"استراحة 60 ثانية","Clear your head":"صفِّ ذهنك",
    "Your level journey":"رحلتك عبر المستويات","Your activity snapshot":"ملخص نشاطك",
    "A message from present you":"رسالة من نفسك الحالية","DEAR FUTURE ME,":"إلى نفسي في المستقبل،",
    "Colour themes":"ألوان الواجهة","Choose a theme that feels comfortable to look at.":"اختر مظهرًا مريحًا لعينيك.",
    "Your data":"بياناتك","Reset all my data":"إعادة ضبط كل بياناتي",
    "Made by HACKERZZ":"صنعه فريق HACKERZZ","Build better habits. Create better futures.":"ابنِ عادات أفضل. اصنع مستقبلًا أفضل.",
    "Disconnect from distractions. Reconnect with your dreams.":"ابتعد عن المشتتات. عُد إلى أحلامك."
  }
};

const translateText = (value: string, language: Language): string => {
  if (language === "en") return value;
  return translations[language][value.trim()] ?? value;
};

const translateTree = (node: ReactNode, language: Language): ReactNode => {
  if (typeof node === "string") {
    const trimmed = node.trim();
    if (!trimmed) return node;
    const translated = translateText(trimmed, language);
    const start = node.match(/^\s*/)?.[0] ?? "";
    const end = node.match(/\s*$/)?.[0] ?? "";
    return `${start}${translated}${end}`;
  }

  if (Array.isArray(node)) {
    return node.map((child) => translateTree(child, language));
  }

  if (React.isValidElement(node)) {
    return React.cloneElement(
      node,
      undefined,
      React.Children.map(
        (node.props as { children?: ReactNode }).children,
        (child) => translateTree(child, language)
      )
    );
  }

  return node;
};

export default function App() {
  const [page, setPage] = useState("Home");
  const [theme, setTheme] = useState(() => load("theme", "ocean"));
  const [language, setLanguage] = useState<Language>(() => load("language", "en"));
  const t = (value: string) => translateText(value, language);

  const [goals, setGoals] = useState<Goal[]>(() =>
    load("goals", [
      { id: 1, title: "Finish my most important task", done: false },
      { id: 2, title: "Spend 30 minutes learning something", done: false },
      { id: 3, title: "Take a proper screen break", done: false },
    ])
  );

  const [goalInput, setGoalInput] = useState("");
  const [points, setPoints] = useState(() => load("points", 0));
  const [sessions, setSessions] = useState(() => load("sessions", 0));
  const [minutes, setMinutes] = useState(() => load("minutes", 0));

  const [distractions, setDistractions] = useState<string[]>(() => load("distractions", []));
  const [distractionInput, setDistractionInput] = useState("");
  const [distractionReason, setDistractionReason] = useState("Boredom");

  const [quests] = useState<Quest[]>(() => load("quests", initialQuests));
  const [moods, setMoods] = useState<Mood[]>(() => load("moods", []));
  const [moodNote, setMoodNote] = useState("");
  const [selectedMood, setSelectedMood] = useState("😊");

  const [claimed, setClaimed] = useState<string[]>(() => load("claimed", []));
  const [letter, setLetter] = useState(() => load("letter", ""));
  const [studyTasks, setStudyTasks] = useState<string[]>(() => load("studyTasks", []));
  const [studyInput, setStudyInput] = useState("");
  const [studyDate, setStudyDate] = useState(today());
  const [reflection, setReflection] = useState("");

  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);

  const [challengeDay, setChallengeDay] = useState(() => load("challengeDay", 1));
  const [challengeDone, setChallengeDone] = useState<string[]>(() => load("challengeDone", []));
  const [islandLevel] = useState(1);

  useEffect(() => {
    const data: Record<string, unknown> = {
      theme, language, goals, points, sessions, minutes, distractions, quests, moods,
      claimed, letter, studyTasks, challengeDay, challengeDone, islandLevel,
    };

    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(`unplug-${key}`, JSON.stringify(value));
    });

    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [
    theme, language, goals, points, sessions, minutes, distractions, quests, moods,
    claimed, letter, studyTasks, challengeDay, challengeDone, islandLevel,
  ]);

  useEffect(() => {
    if (!timerRunning) return;

    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setTimerRunning(false);
          setTimerDone(true);
          setPoints((p) => p + 25);
          setSessions((s) => s + 1);
          setMinutes((m) => m + duration);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timerRunning, duration]);

  const completedGoals = goals.filter((g) => g.done).length;
  const completedQuests = quests.filter((q) => q.done).length;
  const level = Math.floor(points / 100) + 1;
  const progress = points % 100;

  const addPoints = (amount: number) => setPoints((p) => p + amount);

  const addGoal = () => {
    if (!goalInput.trim()) return;
    setGoals((g) => [...g, { id: Date.now(), title: goalInput.trim(), done: false }]);
    setGoalInput("");
  };

  const toggleGoal = (id: number) => {
    setGoals((items) =>
      items.map((g) => {
        if (g.id !== id) return g;
        if (!g.done) addPoints(10);
        return { ...g, done: !g.done };
      })
    );
  };

  const startTimer = () => {
    if (remaining === 0 || timerDone) {
      setRemaining(duration * 60);
      setTimerDone(false);
    }
    setTimerRunning(true);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerDone(false);
    setRemaining(duration * 60);
  };

  const changeDuration = (value: number) => {
    setDuration(value);
    setRemaining(value * 60);
    setTimerRunning(false);
    setTimerDone(false);
  };

  const logDistraction = () => {
    if (!distractionInput.trim()) return;
    setDistractions((d) => [
      `${distractionInput.trim()} — ${distractionReason}`,
      ...d,
    ]);
    setDistractionInput("");
  };

  const logMood = () => {
    setMoods((m) => [
      ...m,
      { date: today(), mood: selectedMood, note: moodNote },
    ]);
    setMoodNote("");
    addPoints(5);
  };

  const addStudyTask = () => {
    if (!studyInput.trim()) return;
    setStudyTasks((t) => [...t, `${studyDate} | ${studyInput.trim()}`]);
    setStudyInput("");
  };

  const claimReward = (name: string, cost: number) => {
    if (points < cost || claimed.includes(name)) return;
    setPoints((p) => p - cost);
    setClaimed((c) => [...c, name]);
  };

  const finishChallenge = (id: string, xp: number) => {
    if (challengeDone.includes(id)) return;
    setChallengeDone((d) => [...d, id]);
    addPoints(xp);
    setChallengeDay((d) => Math.min(7, d + 1));
  };

  const time = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(
    remaining % 60
  ).padStart(2, "0")}`;

  const Stat = ({
    icon,
    value,
    label,
  }: {
    icon: string;
    value: string | number;
    label: string;
  }) => (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <strong>{value}</strong>
      <span>{t(label)}</span>
    </div>
  );

  const Panel = ({
    title,
    subtitle,
    children,
    className = "",
  }: {
    title: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;
  }) => (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          <h2>{t(title)}</h2>
          {subtitle && <p>{t(subtitle)}</p>}
        </div>
      </div>
      {children}
    </section>
  );

  return translateTree((
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">U.</div>
          <div>
            <strong>UNPLUG</strong>
            <small>YOUR LIFE. YOUR RULES.</small>
          </div>
        </div>

        <div className="side-label">YOUR SPACE</div>

        <nav className="side-nav">
          {navItems.map(([name, icon]) => (
            <button
              key={name}
              className={page === name ? "nav-item active" : "nav-item"}
              onClick={() => setPage(name)}
            >
              <span>{icon}</span>
              {t(name)}
              {name === "Challenges" && <i>NEW</i>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-level">
            <span>LEVEL {level}</span>
            <strong>{points} XP</strong>
          </div>
          <div className="xp-track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>Small steps. Big main-character energy.</p>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">YOUR DIGITAL WELLNESS HQ</span>
            <h1>{t(page)}</h1>
          </div>
          <div className="topbar-right">
            <span className="level-pill">✦ LEVEL {level}</span>
            <span className="points-pill">⚡ {points} XP</span>
            <label className="language-control">
              <span>{t("Language")}</span>
              <select
                aria-label="Select language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                style={{
                  padding: "8px 10px",
                  borderRadius: "10px",
                  border: "1px solid var(--border, #ccc)",
                  background: "var(--panel, #fff)",
                  color: "inherit",
                  font: "inherit",
                }}
              >
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="ml">മലയാളം</option>
                <option value="hi">हिन्दी</option>
                <option value="ar">العربية</option>
              </select>
            </label>
          </div>
        </header>

        <div className="content">
          {page === "Home" && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <span className="hero-tag">THE WORLD IS WAITING</span>
                  <h2>
                    Less scrolling.
                    <br />
                    <em>More living.</em>
                  </h2>
                  <p>
                    Your attention is your superpower. Spend it on things that
                    actually matter.
                  </p>
                  <button className="primary-btn" onClick={() => setPage("Focus Space")}>
                    Enter focus mode <span>↗</span>
                  </button>
                </div>

                <div className="hero-art">
                  <div className="sun" />
                  <div className="island island-one" />
                  <div className="island island-two" />
                  <div className="hero-orbit">✦</div>
                  <span className="hero-art-label">RECLAIM YOUR DAY</span>
                </div>
              </section>

              <div className="stats-grid">
                <Stat icon="⚡" value={points} label="Total XP" />
                <Stat icon="◷" value={sessions} label="Focus sessions" />
                <Stat icon="⌛" value={`${minutes}m`} label="Time focused" />
                <Stat icon="◎" value={`${completedGoals}/${goals.length}`} label="Goals completed" />
              </div>

              <div className="dashboard-grid">
                <Panel title="Today's mission" subtitle="Make today count.">
                  <div className="goal-list">
                    {goals.slice(0, 4).map((g) => (
                      <label className="goal-row" key={g.id}>
                        <input
                          type="checkbox"
                          checked={g.done}
                          onChange={() => toggleGoal(g.id)}
                        />
                        <span className={g.done ? "done" : ""}>{g.title}</span>
                      </label>
                    ))}
                  </div>
                  <button className="text-btn" onClick={() => setPage("My Goals")}>
                    See all goals →
                  </button>
                </Panel>

                <Panel
                  title="Your island is growing"
                  subtitle="Every offline action builds your world."
                >
                  <div className="island-preview">
                    <div className="island-sun">☀</div>
                    <div className="island-ground">
                      <span>🌴</span>
                      <span>🏡</span>
                      <span>🌳</span>
                      <span>🌼</span>
                    </div>
                  </div>
                  <div className="inline-between">
                    <strong>Island level {islandLevel}</strong>
                    <button className="text-btn" onClick={() => setPage("Detox Island")}>
                      Visit island →
                    </button>
                  </div>
                </Panel>
              </div>

              <Panel title="Your next move" subtitle="Pick one. Start now.">
                <div className="quick-actions">
                  <button onClick={() => setPage("Focus Space")}>
                    ◷ <b>Focus sprint</b>
                    <small>Lock in for 25 minutes</small>
                  </button>
                  <button onClick={() => setPage("Challenges")}>
                    ⚡ <b>Take a challenge</b>
                    <small>Earn XP in real life</small>
                  </button>
                  <button onClick={() => setPage("Mood Check")}>
                    ☀ <b>Check your mood</b>
                    <small>See how you're doing</small>
                  </button>
                </div>
              </Panel>

              <div className="quote-strip">
                “You don't need more time. You need fewer distractions.”
                <span>— THE UNPLUG RULE</span>
              </div>
            </>
          )}

          {page === "My Goals" && (
            <>
              <div className="page-intro">
                <p>
                  Make your goals visible.
                  <br />
                  Make your progress undeniable.
                </p>
              </div>

              <Panel
                title="Add a new goal"
                subtitle="One clear target beats ten vague wishes."
              >
                <div className="form-row">
                  <input
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addGoal()}
                    placeholder="What do you want to get done?"
                  />
                  <button className="primary-btn" onClick={addGoal}>
                    Add goal +
                  </button>
                </div>
              </Panel>

              <Panel title="Your goal list" subtitle="Complete a goal to earn 10 XP.">
                <div className="goal-list">
                  {goals.map((g) => (
                    <div className="goal-row goal-edit" key={g.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={g.done}
                          onChange={() => toggleGoal(g.id)}
                        />
                        <span className={g.done ? "done" : ""}>{g.title}</span>
                      </label>
                      <button
                        className="icon-btn"
                        aria-label="Delete goal"
                        onClick={() => setGoals((a) => a.filter((x) => x.id !== g.id))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {goals.length === 0 && (
                  <p className="empty">Your next chapter starts with one goal.</p>
                )}
              </Panel>
            </>
          )}

          {page === "Focus Space" && (
            <>
              <div className="page-intro">
                <p>
                  One task. One timer.
                  <br />
                  No negotiating with distractions.
                </p>
              </div>

              <Panel
                title="The focus chamber"
                subtitle="Choose your sprint length and get into it."
                className="focus-panel"
              >
                <div className="timer-wrap">
                  <div className="timer-ring">
                    <div>
                      <strong>{time}</strong>
                      <span>
                        {timerDone
                          ? "SESSION COMPLETE"
                          : timerRunning
                            ? "YOU'RE LOCKED IN"
                            : "READY WHEN YOU ARE"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="duration-options">
                  {[15, 25, 45, 60].map((n) => (
                    <button
                      key={n}
                      className={duration === n ? "selected" : ""}
                      onClick={() => changeDuration(n)}
                    >
                      {n} min
                    </button>
                  ))}
                </div>

                <div className="timer-actions">
                  <button
                    className="primary-btn"
                    onClick={timerRunning ? () => setTimerRunning(false) : startTimer}
                  >
                    {timerRunning
                      ? "Pause session"
                      : timerDone
                        ? "Start again"
                        : "Start focusing →"}
                  </button>
                  <button className="secondary-btn" onClick={resetTimer}>
                    Reset
                  </button>
                </div>

                {timerDone && (
                  <p className="success-note">
                    You did it.
                    <br />
                    +25 XP. Go enjoy a screen-free break.
                  </p>
                )}
              </Panel>

              <div className="tip-card">
                ✦
                <div>
                  <b>FOCUS TIP</b>
                  <p>
                    Put your phone in another room. Make distractions harder to
                    reach than your goals.
                  </p>
                </div>
              </div>
            </>
          )}

          {page === "Detox Island" && (
            <>
              <div className="page-intro">
                <p>
                  This little world grows when you spend more time in the real one.
                </p>
              </div>

              <Panel
                title={`Welcome to island level ${islandLevel}`}
                subtitle="Your offline life is building something beautiful."
              >
                <div className="big-island">
                  <div className="big-island-sun">☀</div>
                  <div className="cloud cloud-a">☁</div>
                  <div className="cloud cloud-b">☁</div>
                  <div className="big-island-land">
                    <div className="island-water">〰 〰 〰 〰 〰</div>
                    <div className="island-decor">🌴　🌳　🏡　🌲　🌴</div>
                    <div className="island-decor flowers">🌼　🌷　🌿　🌻</div>
                  </div>
                  <div className="island-caption">A LITTLE MORE LIFE, EVERY DAY.</div>
                </div>

                <div className="inline-between">
                  <span>Island growth</span>
                  <b>Level {islandLevel} / 10</b>
                </div>
                <div className="xp-track large">
                  <span style={{ width: `${islandLevel * 10}%` }} />
                </div>
                <p className="muted">
                  Complete offline quests to grow your island.
                  <br />
                  Your progress is saved on this device.
                </p>
              </Panel>

              <Panel
                title="How to grow your island"
                subtitle="Real-world actions. Real-world wins."
              >
                <button className="primary-btn" onClick={() => setPage("Challenges")}>
                  Explore offline quests →
                </button>
              </Panel>
            </>
          )}

          {page === "Challenges" && (
            <>
              <div className="page-intro">
                <p>
                  Seven days. Seven small wins.
                  <br />
                  A better relationship with your screen.
                </p>
              </div>

              <div className="challenge-banner">
                <span>THE UNPLUG RESET</span>
                <h2>
                  7 days to take
                  <br />
                  your time back.
                </h2>
                <p>
                  Complete each daily mission to earn XP and build momentum.
                </p>
                <div className="challenge-progress">
                  <span style={{ width: `${(challengeDone.length / 7) * 100}%` }} />
                </div>
                <b>{challengeDone.length} / 7 days completed</b>
              </div>

              <div className="challenge-list">
                {[
                  { t: "Day 1 — Notice your habits", d: "Track when and why you reach for your phone.", x: 20 },
                  { t: "Day 2 — First 30 minutes offline", d: "Start your morning without checking your phone.", x: 25 },
                  { t: "Day 3 — A real break", d: "Take a 20-minute break without a screen.", x: 25 },
                  { t: "Day 4 — Move more", d: "Do 20 minutes of movement you enjoy.", x: 30 },
                  { t: "Day 5 — Create, don't consume", d: "Make something instead of watching something.", x: 30 },
                  { t: "Day 6 — Connect in real life", d: "Spend quality time with someone.", x: 35 },
                  { t: "Day 7 — Your personal reset", d: "Plan one screen habit you want to change.", x: 50 },
                ].map((c, i) => (
                  <div className="challenge-row" key={i}>
                    <div className="challenge-number">{i + 1}</div>
                    <div className="challenge-info">
                      <b>{c.t}</b>
                      <p>{c.d}</p>
                      <small>+{c.x} XP</small>
                    </div>
                    <button
                      className={challengeDone.includes(String(i)) ? "completed-btn" : "secondary-btn"}
                      disabled={challengeDone.includes(String(i))}
                      onClick={() => finishChallenge(String(i), c.x)}
                    >
                      {challengeDone.includes(String(i)) ? "Completed ✓" : "Complete"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {page === "Skill Tree" && (
            <>
              <div className="page-intro">
                <p>Level up the parts of life that matter outside a screen.</p>
              </div>

              <div className="skill-grid">
                {([
                  { name: "Mind", icon: "🧠", desc: "Learning, reading and curiosity", xp: points },
                  { name: "Body", icon: "💪", desc: "Movement, rest and energy", xp: completedQuests * 20 },
                  {
                    name: "Creativity",
                    icon: "🎨",
                    desc: "Making, drawing and building",
                    xp: quests.filter((q) => q.done && q.title.includes("Create")).length * 40,
                  },
                  { name: "Discipline", icon: "🎯", desc: "Consistency and focused effort", xp: sessions * 25 },
                ] as { name: Skill; icon: string; desc: string; xp: number }[]).map((s) => (
                  <div className="skill-card" key={s.name}>
                    <span className="skill-icon">{s.icon}</span>
                    <span className="skill-label">SKILL PATH</span>
                    <h2>{s.name}</h2>
                    <p>{s.desc}</p>
                    <div className="skill-level">LEVEL {Math.floor(s.xp / 100) + 1}</div>
                    <div className="xp-track">
                      <span style={{ width: `${s.xp % 100}%` }} />
                    </div>
                    <small>{s.xp} XP earned</small>
                  </div>
                ))}
              </div>

              <Panel title="Your skill philosophy">
                <p className="muted">
                  You don't level up by tapping a button.
                  <br />
                  You level up by doing the thing. Use offline quests, focus
                  sessions and goals to build your real-life skills.
                </p>
              </Panel>
            </>
          )}

          {page === "Study Planner" && (
            <>
              <div className="page-intro">
                <p>
                  Turn the “I have so much to do” panic into a plan you can
                  actually follow.
                </p>
              </div>

              <Panel
                title="Add a study task"
                subtitle="Choose a date and write one clear task."
              >
                <div className="form-row">
                  <input
                    type="date"
                    value={studyDate}
                    onChange={(e) => setStudyDate(e.target.value)}
                  />
                  <input
                    value={studyInput}
                    onChange={(e) => setStudyInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addStudyTask()}
                    placeholder="e.g. Revise biology chapter 3"
                  />
                  <button className="primary-btn" onClick={addStudyTask}>
                    Add task +
                  </button>
                </div>
              </Panel>

              <Panel
                title="Your study plan"
                subtitle="Keep it realistic. Progress beats perfection."
              >
                <div className="goal-list">
                  {studyTasks.map((task, i) => (
                    <div className="goal-row goal-edit" key={`${task}-${i}`}>
                      <span>{task}</span>
                      <button
                        className="icon-btn"
                        onClick={() => setStudyTasks((t) => t.filter((_, n) => n !== i))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {studyTasks.length === 0 && (
                  <p className="empty">
                    No study tasks yet.
                    <br />
                    Add one small step above.
                  </p>
                )}
              </Panel>

              <div className="tip-card">
                ✦
                <div>
                  <b>THE 25–5 RULE</b>
                  <p>
                    Try 25 minutes of focused study, then take a 5-minute
                    screen-free break.
                  </p>
                </div>
              </div>
            </>
          )}

          {page === "Mood Check" && (
            <>
              <div className="page-intro">
                <p>
                  Your mood matters. Your productivity isn't your whole
                  personality.
                </p>
              </div>

              <Panel
                title="How are you feeling?"
                subtitle="A quick check-in. No judgement, ever."
              >
                <div className="mood-options">
                  {["😄", "😊", "😐", "😔", "😣"].map((m) => (
                    <button
                      key={m}
                      className={selectedMood === m ? "mood-selected" : ""}
                      onClick={() => setSelectedMood(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <label className="field-label">
                  Anything on your mind? (optional)
                  <textarea
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                    placeholder="A few words about today..."
                    rows={3}
                  />
                </label>

                <button className="primary-btn" onClick={logMood}>
                  Save check-in +5 XP
                </button>
              </Panel>

              <Panel
                title="Recent check-ins"
                subtitle="Look for patterns, not perfection."
              >
                {moods.length ? (
                  moods.slice(-7).reverse().map((m, i) => (
                    <div className="mood-history" key={i}>
                      <span>{m.mood}</span>
                      <div>
                        <b>{m.date}</b>
                        <p>{m.note || "No note added"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty">Your check-in history will show up here.</p>
                )}
              </Panel>
            </>
          )}

          {page === "Distraction Lab" && (
            <>
              <div className="page-intro">
                <p>
                  Don't beat yourself up about distractions. Study them.
                  Outsmart them.
                </p>
              </div>

              <Panel
                title="Catch a distraction"
                subtitle="What pulled you away from what mattered?"
              >
                <div className="form-row">
                  <input
                    value={distractionInput}
                    onChange={(e) => setDistractionInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && logDistraction()}
                    placeholder="e.g. Random video rabbit hole"
                  />
                  <select
                    value={distractionReason}
                    onChange={(e) => setDistractionReason(e.target.value)}
                  >
                    <option>Boredom</option>
                    <option>Notifications</option>
                    <option>Stress</option>
                    <option>Habit</option>
                    <option>FOMO</option>
                    <option>Other</option>
                  </select>
                  <button className="primary-btn" onClick={logDistraction}>
                    Log it
                  </button>
                </div>
              </Panel>

              <Panel
                title="Your distraction radar"
                subtitle="Awareness is the first step to changing a habit."
              >
                {distractions.length ? (
                  distractions.map((d, i) => (
                    <div className="distraction-row" key={i}>
                      <span>⌁</span>
                      {d}
                    </div>
                  ))
                ) : (
                  <p className="empty">
                    No distractions logged.
                    <br />
                    Keep noticing what steals your attention.
                  </p>
                )}
              </Panel>

              <Panel title="Try this">
                <p className="muted">
                  When you notice a distraction, pause and ask: “What was I
                  looking for?” Maybe it was rest, connection, excitement or
                  escape. Find a healthier way to meet that need.
                </p>
              </Panel>
            </>
          )}

          {page === "Rewards" && (
            <>
              <div className="page-intro">
                <p>
                  You've earned your XP.
                  <br />
                  Redeem it for little reminders that you're making progress.
                </p>
              </div>

              <div className="reward-balance">
                <span>YOUR XP BALANCE</span>
                <strong>⚡ {points}</strong>
              </div>

              <div className="reward-grid">
                {[
                  { name: "Focus Champion", cost: 50, icon: "🏆", desc: "Your first focus milestone." },
                  { name: "Offline Explorer", cost: 100, icon: "🧭", desc: "A badge for choosing the real world." },
                  { name: "Consistency Club", cost: 150, icon: "🔥", desc: "A reminder to keep showing up." },
                  { name: "Mindful Master", cost: 250, icon: "🧘", desc: "You made space for yourself." },
                ].map((r) => (
                  <div className="reward-card" key={r.name}>
                    <span>{r.icon}</span>
                    <h3>{r.name}</h3>
                    <p>{r.desc}</p>
                    <b>{r.cost} XP</b>
                    <button
                      className="secondary-btn"
                      disabled={claimed.includes(r.name) || points < r.cost}
                      onClick={() => claimReward(r.name, r.cost)}
                    >
                      {claimed.includes(r.name)
                        ? "Claimed ✓"
                        : points < r.cost
                          ? "Not enough XP"
                          : "Redeem reward"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {page === "Mind Reset" && (
            <>
              <div className="page-intro">
                <p>Pause. Breathe. You are allowed to take a moment.</p>
              </div>

              <Panel
                title="The 60-second reset"
                subtitle="Follow the circle. Let your shoulders drop."
              >
                <div className="breathing-area">
                  <div className="breath-circle">
                    <span>BREATHE</span>
                  </div>
                </div>
                <p className="muted centered">
                  Breathe in for 4 seconds · Hold for 4 · Breathe out for 4
                </p>
              </Panel>

              <Panel
                title="Clear your head"
                subtitle="Write it down. Get it out of your brain."
              >
                <textarea
                  className="reflection-area"
                  rows={5}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What's taking up space in your mind right now?"
                />
                <p className="muted">
                  This reflection stays in this session and is not sent anywhere.
                </p>
              </Panel>
            </>
          )}

          {page === "My Progress" && (
            <>
              <div className="page-intro">
                <p>
                  Look how far you've come.
                  <br />
                  Every small action counts.
                </p>
              </div>

              <div className="stats-grid">
                <Stat icon="⚡" value={points} label="XP balance" />
                <Stat icon="◷" value={sessions} label="Focus sessions" />
                <Stat icon="⌛" value={`${minutes}m`} label="Focus minutes" />
                <Stat icon="🌱" value={completedQuests} label="Offline quests" />
              </div>

              <Panel
                title="Your level journey"
                subtitle="Earn XP to unlock your next level."
              >
                <div className="level-display">
                  <strong>LEVEL {level}</strong>
                  <span>{progress} / 100 XP to next level</span>
                </div>
                <div className="xp-track large">
                  <span style={{ width: `${progress}%` }} />
                </div>
              </Panel>

              <Panel title="Your activity snapshot">
                <div className="progress-list">
                  <div>
                    <span>Goals completed</span>
                    <b>{completedGoals} / {goals.length}</b>
                  </div>
                  <div>
                    <span>Challenges completed</span>
                    <b>{challengeDone.length} / 7</b>
                  </div>
                  <div>
                    <span>Offline quests completed</span>
                    <b>{completedQuests} / {quests.length}</b>
                  </div>
                  <div>
                    <span>Mood check-ins</span>
                    <b>{moods.length}</b>
                  </div>
                  <div>
                    <span>Distractions noticed</span>
                    <b>{distractions.length}</b>
                  </div>
                </div>
              </Panel>
            </>
          )}

          {page === "Future Self" && (
            <>
              <div className="page-intro">
                <p>
                  Write to the person you're becoming.
                  <br />
                  Give them something worth reading.
                </p>
              </div>

              <Panel
                title="A message from present you"
                subtitle="What do you hope your future self remembers?"
              >
                <div className="letter-paper">
                  <span>DEAR FUTURE ME,</span>
                  <textarea
                    value={letter}
                    onChange={(e) => setLetter(e.target.value)}
                    placeholder="I hope you remember that..."
                    rows={10}
                  />
                  <small>Saved automatically on this device.</small>
                </div>
              </Panel>

              <div className="tip-card">
                ✦
                <div>
                  <b>A LITTLE REMINDER</b>
                  <p>
                    You don't have to have everything figured out.
                    <br />
                    Just keep taking the next good step.
                  </p>
                </div>
              </div>
            </>
          )}

          {page === "Settings" && (
            <>
              <div className="page-intro">
                <p>Make UNPLUG feel like your space.</p>
              </div>

              <Panel
                title="Colour themes"
                subtitle="Choose a theme that feels comfortable to look at."
              >
                <div className="theme-grid">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      className={`theme-option ${theme === t.id ? "theme-active" : ""}`}
                      onClick={() => setTheme(t.id)}
                    >
                      <span>{t.colors}</span>
                      <b>{t.name}</b>
                      {theme === t.id && <small>Selected ✓</small>}
                    </button>
                  ))}
                </div>
                <p className="muted">
                  Maximum Clarity uses stronger contrast and reduces decorative
                  animation.
                  <br />
                  Colour is never the only way information is shown.
                </p>
              </Panel>

              <Panel title="Your data">
                <p className="muted">
                  Your goals, XP, theme and activity are stored in this browser
                  using local storage. They do not automatically sync across
                  devices.
                </p>
                <button
                  className="danger-btn"
                  onClick={() => {
                    if (
                      window.confirm(
                        "This will erase your UNPLUG progress on this device. Are you sure?"
                      )
                    ) {
                      Object.keys(localStorage)
                        .filter((k) => k.startsWith("unplug-"))
                        .forEach((k) => localStorage.removeItem(k));
                      window.location.reload();
                    }
                  }}
                >
                  Reset all my data
                </button>
              </Panel>

              <Panel title="Made by HACKERZZ">
                <p className="muted">
                  Build better habits. Create better futures.
                </p>
                <div className="creator-grid">
                  {["ISHAN FSB", "VAISHNAV VINOD", "ABHAY AJITH", "ISAAC"].map(
                    (n, i) => (
                      <div className="creator" key={n}>
                        <span>0{i + 1}</span>
                        <b>{n}</b>
                      </div>
                    )
                  )}
                </div>
              </Panel>
            </>
          )}

          <footer className="footer">
            <div className="footer-brand">
              UNPLUG<span>.</span>
            </div>
            <p>Disconnect from distractions. Reconnect with your dreams.</p>
            <small>
              BUILT BY HACKERZZ · BUILD BETTER HABITS. CREATE BETTER FUTURES.
            </small>
          </footer>
        </div>
      </main>
    </div>
  ), language);
}
