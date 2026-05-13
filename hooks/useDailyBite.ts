import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { library, todayString, seededIndex } from '../lib/seededDate';
import type { Verse } from '../types/selah';

const REFLECTION_QUESTIONS: Record<string, string[]> = {
  settling: [
    "What would it feel like to release this to God today?",
    "What anxiety can you place in His hands right now?",
    "Where do you need God to calm the noise inside you?",
  ],
  grounding: [
    "Where do you need to feel steadied right now?",
    "What foundation are you standing on when everything feels unsteady?",
    "How is God calling you to root yourself in Him today?",
  ],
  tender: [
    "How is God's tenderness showing up in your life?",
    "What part of you needs to receive God's gentleness today?",
    "Where have you been hard on yourself that God is being soft?",
  ],
  reassuring: [
    "What truth do you need to hear most today?",
    "What lie are you believing that God wants to replace with His word?",
    "What would it mean to trust His promises even when you can't feel them?",
  ],
  encouraging: [
    "What would courage look like for you today?",
    "How is God calling you to take the next step even when it's scary?",
    "What would you do today if you truly believed God was with you?",
  ],
  hopeful: [
    "What small thing can you hold onto with hope?",
    "Where is God asking you to believe again?",
    "What would it look like to choose hope as an act of trust in Him?",
  ],
  accompanying: [
    "Where do you need to know you're not alone?",
    "How have you sensed God's presence with you this week?",
    "What would change if you truly believed God is beside you right now?",
  ],
  sheltering: [
    "What are you needing refuge from right now?",
    "What fear would you bring to God if you knew He was a safe place?",
    "How can you run to God as your hiding place today?",
  ],
  affirming: [
    "What would it mean to receive this as true about yourself?",
    "What does God say about you that you struggle to believe?",
    "How would you live differently today if you believed God's words about you?",
  ],
  sustaining: [
    "What is keeping you going, even when it's hard?",
    "Where is God sustaining you in a season you thought you couldn't survive?",
    "What would it mean to lean on God's strength rather than your own today?",
  ],
  renewing: [
    "What needs to be made new in you today?",
    "What old pattern is God inviting you to let go of?",
    "Where do you sense God doing something new that you haven't fully surrendered to?",
  ],
  restoring: [
    "What part of you is waiting to be restored?",
    "What broken area of your life have you stopped believing God can reach?",
    "What would it mean to let God restore what feels beyond repair?",
  ],
  rescuing: [
    "What are you crying out to be saved from?",
    "In what area of your life do you most need God to come through?",
    "What would it feel like to stop trying to rescue yourself and let Him?",
  ],
  uplifting: [
    "What would it look like to let yourself be lifted today?",
    "What is weighing you down that God wants to carry?",
    "How can you invite God's joy into a heavy moment today?",
  ],
  emboldening: [
    "What are you being called to face with courage?",
    "What would you step into today if you took God at His word?",
    "Where is God asking you to be brave when everything in you wants to hide?",
  ],
  guiding: [
    "What decision or path needs God's direction today?",
    "Where have you been relying on your own wisdom instead of seeking His?",
    "What would it look like to truly hand the wheel to God in this season?",
  ],
  transformative: [
    "What ashes in your life are waiting to become beauty?",
    "What hard thing in your life might God be using to make you more like Him?",
    "What would it mean to trust God's process even when you can't see the outcome?",
  ],
  liberating: [
    "What are you ready to be freed from?",
    "What has kept you bound that God is calling you to release?",
    "Where is God inviting you to walk in the freedom He already paid for?",
  ],
  intimate: [
    "How does it feel to be fully known by God?",
    "What part of yourself have you been hiding from God?",
    "What would it mean to come to God with nothing held back?",
  ],
  raw: [
    "What have you been afraid to bring honestly to God?",
    "What would you say to God if you knew you couldn't offend Him?",
    "What truth about where you are have you been softening?",
  ],
  fortifying: [
    "What do you need strength to stand firm in?",
    "Where is your faith being tested and how is God equipping you?",
    "What truth from God can you stand on when your circumstances say otherwise?",
  ],
  'self-soothing': [
    "How can you speak gently to yourself today?",
    "What would it mean to receive God's compassion toward yourself?",
    "How would God speak to you right now if He were sitting beside you?",
  ],
  unburdening: [
    "What burden are you ready to lay down?",
    "What have you been carrying that was never meant to be yours alone?",
    "What would today feel like if you truly gave God the weight you've been holding?",
  ],
  filling: [
    "What hunger in you is waiting to be satisfied?",
    "What are you reaching for that only God can truly give?",
    "What would it mean to let God be enough in a place where you still feel empty?",
  ],
  stilling: [
    "What storm in your life needs to become calm?",
    "Where do you need God to speak 'peace, be still' over your life?",
    "What would quiet with God feel like today?",
  ],
  morning: [
    "What do you want to bring to God at the start of today?",
    "How do you want to begin this day with Him?",
    "What would it mean to give God the first moments of today?",
  ],
  asking: [
    "What do you most need to ask God for right now?",
    "What have you been too afraid or too proud to ask God for?",
    "What would you ask if you truly believed He was listening and He cared?",
  ],
  anchoring: [
    "What truth can anchor you when everything shifts?",
    "Where does your soul rest when the ground beneath you moves?",
    "What does God say that is more permanent than your circumstances?",
  ],
  reaching: [
    "What are you reaching toward that only God can provide?",
    "What longing in you have you been trying to fill apart from Him?",
    "What would surrender look like in the place where you're straining hardest?",
  ],
  knowing: [
    "How does it feel to know that God sees exactly where you are?",
    "What would change if you lived today as someone fully seen and fully loved?",
    "What part of your story are you hoping God hasn't noticed?",
  ],
  'permission-giving': [
    "What have you been holding back from bringing to God?",
    "What are you waiting for permission to feel?",
    "What would it mean to know that God can hold every part of you?",
  ],
  vulnerable: [
    "What fear about the future can you place in God's hands?",
    "What are you most afraid God won't come through on?",
    "What would trusting Him with the unknown actually look like for you today?",
  ],
  validating: [
    "What pain have you been minimising that deserves to be acknowledged?",
    "What would it mean to let God sit with you in this, without rushing you to be okay?",
    "What hurt have you been telling yourself you shouldn't feel?",
  ],
  warm: [
    "Who in your life reflects God's love to you today?",
    "How has God shown up for you through the people around you?",
    "What would it mean to receive God's warmth through someone else today?",
  ],
  welcoming: [
    "What would it mean to come to God exactly as you are?",
    "What version of yourself do you feel you need to fix before coming to Him?",
    "What would it feel like to arrive in God's presence and be welcomed, not fixed?",
  ],
  'perspective-shifting': [
    "What situation looks different when seen from God's view?",
    "What are you seeing through fear that God might be seeing through love?",
    "What would it look like to step back and ask where God is in this?",
  ],
  reviving: [
    "What in you needs to be brought back to life?",
    "Where has weariness taken root that God wants to breathe life into?",
    "What part of your faith feels dry that you're willing to let Him restore?",
  ],
  near: [
    "Where do you most need to feel God's nearness today?",
    "What would it mean to believe that God is closer than the breath in your lungs?",
    "How can you make space to notice God's presence today?",
  ],
  lifting: [
    "What is bowing you down that God wants to lift?",
    "What heaviness have you normalised that God is asking you to release?",
    "What would it look like to let God raise your head today?",
  ],
  claiming: [
    "What would it mean to live today as someone who belongs to God?",
    "What truth about your identity in Him are you struggling to walk in?",
    "How would today be different if you started it knowing you are fully His?",
  ],
};

const FALLBACK_QUESTIONS = [
  "What is God saying to you through this verse today?",
  "How does this truth meet you where you are right now?",
  "What would it look like to carry this verse with you today?",
];

const KEY_DATE = 'selah:dailyBite:date';
const KEY_REFERENCE = 'selah:dailyBite:reference';
const KEY_QUESTION = 'selah:dailyBite:question';

export type DailyBite = {
  verse: Verse;
  question: string;
};

export function useDailyBite(): { bite: DailyBite | null; isLoading: boolean } {
  const [bite, setBite] = useState<DailyBite | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = todayString();
      const [storedDate, storedRef, storedQuestion] = await Promise.all([
        AsyncStorage.getItem(KEY_DATE),
        AsyncStorage.getItem(KEY_REFERENCE),
        AsyncStorage.getItem(KEY_QUESTION),
      ]);

      if (storedDate === today && storedRef && storedQuestion) {
        const verse = library.find(v => v.reference === storedRef) ?? null;
        if (verse) {
          setBite({ verse, question: storedQuestion });
          setIsLoading(false);
          return;
        }
      }

      const idx = seededIndex(today, library.length);
      const verse = library[idx];
      const pool = REFLECTION_QUESTIONS[verse.tone] ?? FALLBACK_QUESTIONS;
      const question = pool[seededIndex(today + '-q', pool.length)];

      await AsyncStorage.multiSet([
        [KEY_DATE, today],
        [KEY_REFERENCE, verse.reference],
        [KEY_QUESTION, question],
      ]);

      setBite({ verse, question });
      setIsLoading(false);
    }

    load();
  }, []);

  return { bite, isLoading };
}
